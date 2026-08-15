ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'shipped';
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'completed';

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS tracking_number text,
  ADD COLUMN IF NOT EXISTS carrier text,
  ADD COLUMN IF NOT EXISTS shipped_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS shipping_notified_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS completed_at timestamp with time zone;