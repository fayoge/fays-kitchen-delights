import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Loader2, Send, Truck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatMoney } from "@/lib/products";
import { CARRIERS, carrierLabel, trackingUrl } from "@/lib/shipping";
import {
  getOrder,
  markOrderComplete,
  sendShippingNotification,
  updateOrderShipping,
  updateOrderStatus,
  type OrderStatus,
} from "@/utils/orders.functions";

export const Route = createFileRoute("/admin/$id")({
  component: OrderDetail,
});

const NEXT_STATUSES: OrderStatus[] = [
  "paid",
  "processing",
  "fulfilled",
  "shipped",
  "completed",
  "cancelled",
  "refunded",
];

function OrderDetail() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const [carrier, setCarrier] = useState("");
  const [tracking, setTracking] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-order", id],
    queryFn: () => getOrder({ data: { id } }),
  });

  const order = data && !("error" in data) ? data.order : null;

  useEffect(() => {
    if (!order) return;
    setCarrier(order.carrier ?? "");
    setTracking(order.tracking_number ?? "");
  }, [order?.id, order?.carrier, order?.tracking_number]);

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin-order", id] });
    await queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
  };

  const mutation = useMutation({
    mutationFn: (status: OrderStatus) => updateOrderStatus({ data: { id, status } }),
    onSuccess: refresh,
  });

  const shippingMutation = useMutation({
    mutationFn: (markShipped: boolean) =>
      updateOrderShipping({
        data: { id, carrier, trackingNumber: tracking, markShipped },
      }),
    onSuccess: async (res) => {
      if (res && "error" in res && res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Shipping details saved");
      await refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const notifyMutation = useMutation({
    mutationFn: () => sendShippingNotification({ data: { id } }),
    onSuccess: async (res) => {
      if (res && "error" in res && res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Shipping notification sent to the customer");
      await refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const completeMutation = useMutation({
    mutationFn: () => markOrderComplete({ data: { id } }),
    onSuccess: async (res) => {
      if (res && "error" in res && res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Order marked complete");
      await refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });


  if (isLoading) {
    return (
      <div className="flex justify-center py-20 text-muted-foreground">
        <Loader2 className="size-6 animate-spin" />
      </div>
    );
  }

  if (!data || "error" in data || !order) {
    return (
      <p className="py-20 text-center text-destructive">
        {(data && "error" in data ? data.error : null) ?? "Order not found"}
      </p>
    );
  }

  const items = (order.items ?? []) as Array<{

    description: string;
    quantity: number;
    amountTotal: number;
    priceId: string | null;
  }>;
  const address = (order.shipping_address ?? null) as {
    name?: string;
    address?: Record<string, string | null>;
  } | null;

  return (
    <div>
      <Link
        to="/admin"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> All orders
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl">{order.order_number}</h1>
          <p className="text-sm text-muted-foreground">
            {new Date(order.created_at).toLocaleString()} · {order.environment} mode
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {NEXT_STATUSES.map((status) => (
            <Button
              key={status}
              size="sm"
              variant={order.status === status ? "default" : "outline"}
              disabled={mutation.isPending}
              onClick={() => mutation.mutate(status)}
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      <section className="mt-8 rounded-xl border border-border p-6">
        <h2 className="flex items-center gap-2 font-display text-xl">
          <Truck className="size-5" /> Shipping
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="carrier">Carrier (U.S.)</Label>
            <Select value={carrier} onValueChange={setCarrier}>
              <SelectTrigger id="carrier">
                <SelectValue placeholder="Select a carrier" />
              </SelectTrigger>
              <SelectContent>
                {CARRIERS.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tracking">Tracking number</Label>
            <Input
              id="tracking"
              value={tracking}
              onChange={(e) => setTracking(e.target.value.toUpperCase())}
              placeholder="e.g. 9400111899223197428490"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            variant="outline"
            disabled={shippingMutation.isPending}
            onClick={() => shippingMutation.mutate(false)}
          >
            Save tracking
          </Button>
          <Button
            disabled={shippingMutation.isPending || !tracking || !carrier}
            onClick={() => shippingMutation.mutate(true)}
          >
            <Truck className="size-4" /> Mark shipped
          </Button>
          <Button
            variant="secondary"
            disabled={notifyMutation.isPending || !order.customer_email}
            onClick={() => notifyMutation.mutate()}
          >
            {notifyMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            Send shipped notification
          </Button>
          <Button
            variant="outline"
            disabled={completeMutation.isPending || order.status === "completed"}
            onClick={() => completeMutation.mutate()}
          >
            <CheckCircle2 className="size-4" /> Mark order complete
          </Button>
        </div>

        <dl className="mt-4 space-y-1 text-sm text-muted-foreground">
          <div>
            Saved: {carrierLabel(order.carrier)} · {order.tracking_number ?? "no tracking number"}
            {trackingUrl(order.carrier, order.tracking_number) ? (
              <>
                {" "}
                ·{" "}
                <a
                  className="underline"
                  href={trackingUrl(order.carrier, order.tracking_number)!}
                  target="_blank"
                  rel="noreferrer"
                >
                  Track package
                </a>
              </>
            ) : null}
          </div>
          <div>
            Shipped: {order.shipped_at ? new Date(order.shipped_at).toLocaleString() : "not yet"}
          </div>
          <div>
            Customer notified:{" "}
            {order.shipping_notified_at
              ? new Date(order.shipping_notified_at).toLocaleString()
              : "not yet"}
          </div>
          <div>
            Completed:{" "}
            {order.completed_at ? new Date(order.completed_at).toLocaleString() : "not yet"}
          </div>
        </dl>
      </section>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <section className="rounded-xl border border-border p-6">
          <h2 className="font-display text-xl">Customer</h2>
          <dl className="mt-3 space-y-1 text-sm">
            <div>{order.customer_name ?? "—"}</div>
            <div className="text-muted-foreground">{order.customer_email}</div>
            {order.customer_phone ? (
              <div className="text-muted-foreground">{order.customer_phone}</div>
            ) : null}
          </dl>
          {address?.address ? (
            <div className="mt-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Shipping to</p>
              <p>
                {[
                  address.name,
                  address.address["line1"],
                  address.address["line2"],
                  [
                    address.address["city"],
                    address.address["state"],
                    address.address["postal_code"],
                  ]
                    .filter(Boolean)
                    .join(", "),
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
          ) : null}
        </section>

        <section className="rounded-xl border border-border p-6">
          <h2 className="font-display text-xl">Payment</h2>
          <dl className="mt-3 space-y-1 text-sm text-muted-foreground">
            <div>Payment status: {order.payment_status}</div>
            <div>Fulfillment: {order.status}</div>
            <div className="break-all">Session: {order.stripe_session_id}</div>
            <div className="break-all">
              Payment intent: {order.stripe_payment_intent_id ?? "—"}
            </div>
          </dl>
        </section>
      </div>

      <section className="mt-6 rounded-xl border border-border p-6">
        <h2 className="font-display text-xl">Items</h2>
        <ul className="mt-4 divide-y divide-border">
          {items.map((item, i) => (
            <li key={i} className="flex justify-between gap-4 py-3 text-sm">
              <span>
                {item.description}
                <span className="text-muted-foreground"> × {item.quantity}</span>
                {item.priceId ? (
                  <span className="block text-xs text-muted-foreground">{item.priceId}</span>
                ) : null}
              </span>
              <span className="tabular-nums">{formatMoney(item.amountTotal / 100)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-1 border-t border-border pt-4 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span className="tabular-nums">{formatMoney(order.subtotal / 100)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Shipping</span>
            <span className="tabular-nums">
              {order.shipping_amount === 0 ? "Free" : formatMoney(order.shipping_amount / 100)}
            </span>
          </div>
          {order.tax_amount > 0 ? (
            <div className="flex justify-between text-muted-foreground">
              <span>Tax</span>
              <span className="tabular-nums">{formatMoney(order.tax_amount / 100)}</span>
            </div>
          ) : null}
          <div className="flex justify-between pt-2 text-base font-medium">
            <span>Total</span>
            <span className="tabular-nums">{formatMoney(order.total / 100)}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
