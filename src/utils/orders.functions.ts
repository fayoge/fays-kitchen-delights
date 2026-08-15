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
