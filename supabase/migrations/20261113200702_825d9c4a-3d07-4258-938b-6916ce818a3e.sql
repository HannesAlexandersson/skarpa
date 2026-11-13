CREATE FUNCTION public.normalize_phone(p text) RETURNS text LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT CASE WHEN d LIKE '46%' AND length(d) > 9 AND p ~ '^\s*(\+|00)' THEN '0' || substr(d, 3)
              WHEN d LIKE '0046%' THEN '0' || substr(d, 5)
              ELSE d END
  FROM (SELECT regexp_replace(coalesce(p, ''), '\D', '', 'g') AS d) s
$$;

ALTER TABLE public.bookings ADD COLUMN pickup_address text;
UPDATE public.bookings b SET pickup_address = c.address FROM public.customers c WHERE c.id = b.customer_id;
ALTER TABLE public.bookings ALTER COLUMN pickup_address SET NOT NULL;

UPDATE public.customers SET email = lower(trim(email)), phone = public.normalize_phone(phone);
WITH ranked AS (
  SELECT id, first_value(id) OVER (PARTITION BY email, phone ORDER BY created_at, id) AS keep_id FROM public.customers
)
UPDATE public.bookings b SET customer_id = r.keep_id FROM ranked r WHERE b.customer_id = r.id AND r.id <> r.keep_id;
DELETE FROM public.customers c WHERE EXISTS (
  SELECT 1 FROM public.customers k WHERE k.email = c.email AND k.phone = c.phone AND (k.created_at, k.id) < (c.created_at, c.id)
);
CREATE UNIQUE INDEX customers_email_phone_key ON public.customers(email, phone);

CREATE TABLE public.pickup_hours (
  weekday smallint PRIMARY KEY CHECK (weekday BETWEEN 1 AND 7),
  opens_at time NOT NULL,
  closes_at time NOT NULL,
  slot_minutes integer NOT NULL DEFAULT 30 CHECK (slot_minutes BETWEEN 5 AND 240),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (closes_at > opens_at)
);
GRANT SELECT ON public.pickup_hours TO anon, authenticated;
GRANT ALL ON public.pickup_hours TO service_role;
ALTER TABLE public.pickup_hours ENABLE ROW LEVEL SECURITY;
CREATE POLICY pickup_hours_public_read ON public.pickup_hours FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY pickup_hours_service_write ON public.pickup_hours FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE TRIGGER pickup_hours_updated_at BEFORE UPDATE ON public.pickup_hours FOR EACH ROW EXECUTE FUNCTION public.set_booking_updated_at();
INSERT INTO public.pickup_hours(weekday, opens_at, closes_at, slot_minutes)
SELECT d, '08:00', '18:00', 30 FROM generate_series(1, 7) d;

CREATE TABLE public.blocked_dates (
  blocked_date date PRIMARY KEY,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.blocked_dates TO anon, authenticated;
GRANT ALL ON public.blocked_dates TO service_role;
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;
CREATE POLICY blocked_dates_public_read ON public.blocked_dates FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY blocked_dates_service_write ON public.blocked_dates FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE TRIGGER blocked_dates_updated_at BEFORE UPDATE ON public.blocked_dates FOR EACH ROW EXECUTE FUNCTION public.set_booking_updated_at();

CREATE OR REPLACE FUNCTION public.submit_pickup_booking(p_name text, p_address text, p_phone text, p_email text, p_date date, p_time time without time zone, p_submission_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE customer_uuid uuid; booking_uuid uuid; v_phone text; v_email text; v_today date; h public.pickup_hours%ROWTYPE;
BEGIN
 PERFORM pg_advisory_xact_lock(hashtextextended(p_submission_id::text, 0));
 SELECT id INTO booking_uuid FROM public.bookings WHERE submission_id = p_submission_id;
 IF booking_uuid IS NOT NULL THEN RETURN booking_uuid; END IF;
 v_phone := public.normalize_phone(p_phone);
 v_email := lower(trim(p_email));
 IF length(trim(p_name)) NOT BETWEEN 1 AND 120 OR length(trim(p_address)) NOT BETWEEN 1 AND 500
    OR length(v_phone) NOT BETWEEN 7 AND 15 OR length(v_email) NOT BETWEEN 3 AND 254 OR v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN
  RAISE EXCEPTION 'Invalid customer details';
 END IF;
 v_today := (now() AT TIME ZONE 'Europe/Stockholm')::date;
 IF p_date <= v_today OR p_date > v_today + 60 THEN RAISE EXCEPTION 'Pickup date out of range'; END IF;
 IF EXISTS (SELECT 1 FROM public.blocked_dates WHERE blocked_date = p_date) THEN RAISE EXCEPTION 'Pickup date closed'; END IF;
 SELECT * INTO h FROM public.pickup_hours WHERE weekday = extract(isodow FROM p_date)::smallint;
 IF NOT FOUND OR p_time < h.opens_at OR p_time >= h.closes_at
    OR (extract(epoch FROM (p_time - h.opens_at))::integer / 60) % h.slot_minutes <> 0 THEN
  RAISE EXCEPTION 'Pickup time not available';
 END IF;
 INSERT INTO public.customers(name, address, phone, email) VALUES (trim(p_name), trim(p_address), v_phone, v_email)
   ON CONFLICT (email, phone) DO NOTHING RETURNING id INTO customer_uuid;
 IF customer_uuid IS NULL THEN SELECT id INTO customer_uuid FROM public.customers WHERE email = v_email AND phone = v_phone; END IF;
 INSERT INTO public.bookings(customer_id, pickup_date, pickup_time, pickup_address, submission_id)
   VALUES (customer_uuid, p_date, p_time, trim(p_address), p_submission_id) RETURNING id INTO booking_uuid;
 RETURN booking_uuid;
END;
$$;
REVOKE ALL ON FUNCTION public.submit_pickup_booking(text, text, text, text, date, time without time zone, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_pickup_booking(text, text, text, text, date, time without time zone, uuid) TO service_role;