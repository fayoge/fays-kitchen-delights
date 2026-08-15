import { createFileRoute } from "@tanstack/react-router";

import { type StripeEnv, verifyWebhook } from "@/lib/stripe.server";
import { recordOrderFromSession } from "@/lib/orders.server";

async function handleWebhook(request: Request, env: StripeEnv) {
  const event = await verifyWebhook(request, env);
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  // Idempotency guard: insert the event id first; a replay hits the PK and stops here.
  const seen = await supabaseAdmin
    .from("stripe_webhook_events")
    .insert({ id: event.id, type: event.type });
  if (seen.error) {
    if (seen.error.code === "23505") {
      console.log("Duplicate Stripe event ignored:", event.id);
      return;
    }
    throw new Error(seen.error.message);
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      if (session.payment_status !== "unpaid") {
        await recordOrderFromSession(session.id, env);
      }
      break;
    }
    case "checkout.session.async_payment_succeeded":
      await recordOrderFromSession(event.data.object.id, env);
      break;
    case "checkout.session.async_payment_failed":
      console.log("Delayed payment failed for session", event.data.object.id);
      break;
    case "charge.refunded": {
      const paymentIntentId = event.data.object.payment_intent;
      if (paymentIntentId) {
        await supabaseAdmin
          .from("orders")
          .update({ status: "refunded", payment_status: "refunded" })
          .eq("stripe_payment_intent_id", paymentIntentId);
      }
      break;
    }
    default:
      console.log("Unhandled Stripe event:", event.type);
  }
}

export const Route = createFileRoute("/api/public/payments/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawEnv = new URL(request.url).searchParams.get("env");
        if (rawEnv !== "sandbox" && rawEnv !== "live") {
          console.error("Webhook received with invalid env parameter:", rawEnv);
          return Response.json({ received: true, ignored: "invalid env" });
        }
        try {
          await handleWebhook(request, rawEnv);
          return Response.json({ received: true });
        } catch (e) {
          console.error("Webhook error:", e);
          return new Response("Webhook error", { status: 400 });
        }
      },
    },
  },
});
