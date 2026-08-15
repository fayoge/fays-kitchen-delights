import { type StripeEnv, createStripeClient } from "./stripe.server";

export interface OrderItemRecord {
  description: string;
  quantity: number;
  unitAmount: number;
  amountTotal: number;
  priceId: string | null;
  productId: string | null;
}

function centsToMoney(amount: number, currency: string) {
  return (amount / 100).toLocaleString("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  });
}

/**
 * Creates (or re-uses) the order row for a completed Stripe Checkout Session.
 * Idempotent: the unique constraint on stripe_session_id means a replayed
 * webhook can never create a second order.
 */
export async function recordOrderFromSession(sessionId: string, env: StripeEnv) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const stripe = createStripeClient(env);

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["line_items.data.price.product", "payment_intent"],
  });

  if (session.payment_status === "unpaid") {
    return { skipped: "payment not settled yet" as const };
  }

  const existing = await supabaseAdmin
    .from("orders")
    .select("id, order_number, notified_at")
    .eq("stripe_session_id", session.id)
    .maybeSingle();

  if (existing.data) {
    return { orderNumber: existing.data.order_number, duplicate: true as const };
  }

  const items: OrderItemRecord[] = (session.line_items?.data ?? []).map((li) => {
    const price = li.price;
    const product = price?.product;
    return {
      description: li.description ?? "Item",
      quantity: li.quantity ?? 1,
      unitAmount: price?.unit_amount ?? 0,
      amountTotal: li.amount_total ?? 0,
      priceId: price?.lookup_key ?? price?.id ?? null,
      productId: typeof product === "string" ? product : (product?.id ?? null),
    };
  });

  const paymentIntent = session.payment_intent;
  const paymentIntentId =
    typeof paymentIntent === "string" ? paymentIntent : (paymentIntent?.id ?? null);

  const shipping =
    (
      session as unknown as {
        collected_information?: {
          shipping_details?: {
            name?: string | null;
            address?: Record<string, string | null>;
          };
        };
      }
    ).collected_information?.shipping_details ?? null;

  const currency = session.currency ?? "usd";

  const { data, error } = await supabaseAdmin
    .from("orders")
    .insert({
      stripe_session_id: session.id,
      stripe_payment_intent_id: paymentIntentId,
      stripe_customer_id:
        typeof session.customer === "string" ? session.customer : (session.customer?.id ?? null),
      customer_name: session.customer_details?.name ?? shipping?.name ?? null,
      customer_email: session.customer_details?.email ?? null,
      customer_phone: session.customer_details?.phone ?? null,
      items,
      subtotal: session.amount_subtotal ?? 0,
      shipping_amount: session.total_details?.amount_shipping ?? 0,
      tax_amount: session.total_details?.amount_tax ?? 0,
      total: session.amount_total ?? 0,
      currency,
      payment_status: session.payment_status ?? "paid",
      status: "paid",
      shipping_address: shipping ? (shipping as unknown as Record<string, unknown>) : null,
      environment: env,
    })
    .select("id, order_number")
    .single();

  // Unique-violation => a concurrent delivery of the same event won the race.
  if (error) {
    if (error.code === "23505") return { duplicate: true as const };
    throw new Error(error.message);
  }

  // Make sure Stripe emails the buyer a receipt for this payment.
  if (paymentIntentId && session.customer_details?.email) {
    try {
      await stripe.paymentIntents.update(paymentIntentId, {
        receipt_email: session.customer_details.email,
      });
    } catch (e) {
      console.error("Could not set receipt_email on payment intent", e);
    }
  }

  await notifyNewOrder({
    orderNumber: data.order_number,
    customer: session.customer_details?.name ?? "Customer",
    email: session.customer_details?.email ?? "unknown",
    items,
    total: centsToMoney(session.amount_total ?? 0, currency),
    paymentStatus: session.payment_status ?? "paid",
  });

  return { orderNumber: data.order_number, created: true as const };
}

/**
 * New-order notification. Email delivery requires a verified sending domain to
 * be configured for the project; until then this logs the notification so the
 * order is still visible in the server logs and the admin Orders page.
 */
async function notifyNewOrder(payload: {
  orderNumber: string;
  customer: string;
  email: string;
  items: OrderItemRecord[];
  total: string;
  paymentStatus: string;
}) {
  const body = [
    "NEW ORDER",
    "",
    `Order number: ${payload.orderNumber}`,
    `Customer: ${payload.customer}`,
    `Customer email: ${payload.email}`,
    `Items: ${payload.items.map((i) => `${i.description} x${i.quantity}`).join(", ")}`,
    `Total: ${payload.total}`,
    `Payment status: ${payload.paymentStatus}`,
  ].join("\n");

  console.log(`[FaysKitchen order notification]\n${body}`);
}
