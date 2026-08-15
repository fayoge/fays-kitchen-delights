import * as React from "react";
import { render } from "@react-email/render";
import { sendLovableEmail } from "@lovable.dev/email-js";

import { ShippingEmail, type ShippingEmailProps } from "@/lib/email-templates/shipping";
import { carrierLabel, trackingUrl } from "@/lib/shipping";

const SENDER_DOMAIN = "notify.fayskitchen.com";
const FROM = "Fay's Kitchen <noreply@fayskitchen.com>";

export async function sendShippingEmail(input: {
  to: string;
  orderNumber: string;
  customerName?: string | null;
  carrier?: string | null;
  trackingNumber?: string | null;
  items: Array<{ description: string; quantity: number }>;
}) {
  const props: ShippingEmailProps = {
    customerName: input.customerName ?? null,
    orderNumber: input.orderNumber,
    carrierLabel: input.carrier ? carrierLabel(input.carrier) : null,
    trackingNumber: input.trackingNumber ?? null,
    trackingUrl: trackingUrl(input.carrier, input.trackingNumber),
    items: input.items,
  };

  const element = React.createElement(ShippingEmail, props);
  const html = await render(element);
  const text = await render(element, { plainText: true });

  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("Email sending is not configured yet.");

  return sendLovableEmail(
    {
      to: input.to,
      from: FROM,
      sender_domain: SENDER_DOMAIN,
      subject: `Your Fay's Kitchen order ${input.orderNumber} has shipped`,
      html,
      text,
      reply_to: "Info@fayskitchen.com",
      purpose: "transactional",
      label: "order-shipped",
      idempotency_key: `shipped-${input.orderNumber}`,
    },
    { apiKey, sendUrl: process.env["LOVABLE_SEND_URL"] },
  );
}
