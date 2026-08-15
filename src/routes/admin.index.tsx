import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/products";
import { listOrders } from "@/utils/orders.functions";

export const Route = createFileRoute("/admin/")({
  component: OrdersList,
});

const statusTone: Record<string, string> = {
  paid: "bg-primary/15 text-primary",
  processing: "bg-accent text-accent-foreground",
  fulfilled: "bg-emerald-500/15 text-emerald-700",
  cancelled: "bg-muted text-muted-foreground",
  refunded: "bg-destructive/15 text-destructive",
};

function OrdersList() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => listOrders(),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20 text-muted-foreground">
        <Loader2 className="size-6 animate-spin" />
      </div>
    );
  }

  if (!data || "error" in data) {
    return <p className="py-20 text-center text-destructive">{data?.error ?? "Unable to load orders"}</p>;
  }

  if (data.orders.length === 0) {
    return <p className="py-20 text-center text-muted-foreground">No orders yet.</p>;
  }

  return (
    <div>
      <h1 className="text-3xl">Orders</h1>
      <div className="mt-6 overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Items</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Payment</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.orders.map((order) => {
              const items = (order.items ?? []) as Array<{
                description: string;
                quantity: number;
              }>;
              return (
                <tr key={order.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <Link
                      to="/admin/$id"
                      params={{ id: order.id }}
                      className="font-medium underline-offset-2 hover:underline"
                    >
                      {order.order_number}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {order.customer_name ?? "—"}
                    <div className="text-xs text-muted-foreground">{order.customer_email}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {items.map((i) => `${i.description} ×${i.quantity}`).join(", ")}
                  </td>
                  <td className="px-4 py-3 tabular-nums">{formatMoney(order.total / 100)}</td>
                  <td className="px-4 py-3">{order.payment_status}</td>
                  <td className="px-4 py-3">
                    <Badge className={statusTone[order.status] ?? ""} variant="secondary">
                      {order.status}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
