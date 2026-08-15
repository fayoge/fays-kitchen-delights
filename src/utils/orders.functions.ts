import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { CARRIER_VALUES } from "@/lib/shipping";

const STATUSES = [
  "paid",
  "processing",
  "fulfilled",
  "shipped",
  "completed",
  "cancelled",
  "refunded",
] as const;
export type OrderStatus = (typeof STATUSES)[number];

const isUuid = (id: string) => /^[0-9a-fA-F-]{36}$/.test(id);


export const isAdminUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    return { isAdmin: Boolean(data) };
  });

export const listOrders = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) return { error: error.message };
    return { orders: data };
  });

export const getOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => {
    if (!/^[0-9a-fA-F-]{36}$/.test(data.id)) throw new Error("Invalid order id");
    return data;
  })
  .handler(async ({ data, context }) => {
    const { data: order, error } = await context.supabase
      .from("orders")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) return { error: error.message };
    if (!order) return { error: "Order not found" };
    return { order };
  });

export const updateOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; status: OrderStatus }) => {
    if (!/^[0-9a-fA-F-]{36}$/.test(data.id)) throw new Error("Invalid order id");
    if (!STATUSES.includes(data.status)) throw new Error("Invalid status");
    return data;
  })
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("orders")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) return { error: error.message };
    return { ok: true };
  });

export const updateOrderShipping = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; carrier: string; trackingNumber: string; markShipped?: boolean }) => {
    if (!isUuid(data.id)) throw new Error("Invalid order id");
    const carrier = data.carrier.trim();
    const trackingNumber = data.trackingNumber.trim();
    if (carrier && !CARRIER_VALUES.includes(carrier)) throw new Error("Invalid carrier");
    if (trackingNumber.length > 60 || /[^A-Za-z0-9-]/.test(trackingNumber))
      throw new Error("Invalid tracking number");
    return { id: data.id, carrier, trackingNumber, markShipped: Boolean(data.markShipped) };
  })
  .handler(async ({ data, context }) => {
    const patch = {
      carrier: data.carrier || null,
      tracking_number: data.trackingNumber || null,
      ...(data.markShipped
        ? { status: "shipped" as const, shipped_at: new Date().toISOString() }
        : {}),
    };
    const { error } = await context.supabase.from("orders").update(patch).eq("id", data.id);

    if (error) return { error: error.message };
    return { ok: true };
  });

export const markOrderComplete = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => {
    if (!isUuid(data.id)) throw new Error("Invalid order id");
    return data;
  })
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("orders")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", data.id);
    if (error) return { error: error.message };
    return { ok: true };
  });

export const sendShippingNotification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => {
    if (!isUuid(data.id)) throw new Error("Invalid order id");
    return data;
  })
  .handler(async ({ data, context }) => {
    const { data: order, error } = await context.supabase
      .from("orders")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) return { error: error.message };
    if (!order) return { error: "Order not found" };
    if (!order.customer_email) return { error: "This order has no customer email." };

    const items = (Array.isArray(order.items) ? order.items : []) as Array<{
      description?: string;
      quantity?: number;
    }>;

    try {
      const { sendShippingEmail } = await import("@/lib/shipping-email.server");
      await sendShippingEmail({
        to: order.customer_email,
        orderNumber: order.order_number,
        customerName: order.customer_name,
        carrier: order.carrier,
        trackingNumber: order.tracking_number,
        items: items.map((i) => ({
          description: String(i.description ?? "Item"),
          quantity: Number(i.quantity ?? 1),
        })),
      });
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Could not send the email." };
    }

    const patch: Record<string, unknown> = { shipping_notified_at: new Date().toISOString() };
    if (order.status !== "completed") {
      patch["status"] = "shipped";
      if (!order.shipped_at) patch["shipped_at"] = new Date().toISOString();
    }
    await context.supabase.from("orders").update(patch).eq("id", data.id);

    return { ok: true };
  });
