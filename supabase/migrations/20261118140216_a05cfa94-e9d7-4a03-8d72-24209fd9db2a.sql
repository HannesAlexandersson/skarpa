CREATE TYPE public.payment_status AS ENUM ('pending','invoiced','paid','refunded','cancelled');

CREATE TABLE public.payment_methods (
  code text PRIMARY KEY,
  label text NOT NULL,
  timing text NOT NULL CHECK (timing IN ('before','after')),
  active boolean NOT NULL DEFAULT true,
  sort_order smallint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.payment_methods TO anon, authenticated;
GRANT ALL ON public.payment_methods TO service_role;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
CREATE POLICY payment_methods_public_read ON public.payment_methods FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY payment_methods_service_write ON public.payment_methods FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE TRIGGER payment_methods_updated_at BEFORE UPDATE ON public.payment_methods FOR EACH ROW EXECUTE FUNCTION public.set_booking_updated_at();
INSERT INTO public.payment_methods(code, label, timing, active, sort_order) VALUES
 ('invoice','Faktura','after',true,1),('klarna','Klarna','after',true,2),
 ('swish','Swish','before',true,3),('cash','Kontant vid upphämtning/lämning','before',true,4),
 ('paypal','PayPal','before',false,5),('card','Kort','before',false,6);

CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  method_code text NOT NULL REFERENCES public.payment_methods(code),
  status public.payment_status NOT NULL DEFAULT 'pending',
  amount_ore integer CHECK (amount_ore IS NULL OR amount_ore >= 0),
  currency text NOT NULL DEFAULT 'SEK',
  invoiced_at timestamptz,
  paid_at timestamptz,
  provider_reference text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY payments_service_only ON public.payments FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE INDEX payments_booking_id_idx ON public.payments(booking_id);
CREATE TRIGGER payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.set_booking_updated_at();

DROP FUNCTION public.submit_pickup_booking(text, text, text, text, date, time without time zone, uuid);

CREATE FUNCTION public.submit_pickup_booking(p_name text, p_address text, p_phone text, p_email text, p_date date, p_time time without time zone, p_submission_id uuid, p_payment_method text)
RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE customer_uuid uuid; booking_uuid uuid; v_phone text; v_email text; v_today date; h public.pickup_hours%ROWTYPE;
BEGIN
 PERFORM pg_advisory_xact_lock(hashtextextended(p_submission_id::text, 0));
 SELECT id INTO booking_uuid FROM public.bookings WHERE submission_id = p_submission_id;
 IF booking_uuid IS NOT NULL THEN RETURN booking_uuid; END IF;
 IF NOT EXISTS (SELECT 1 FROM public.payment_methods WHERE code = p_payment_method AND active) THEN
  RAISE EXCEPTION 'Payment method not available';
 END IF;
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
 INSERT INTO public.payments(booking_id, method_code) VALUES (booking_uuid, p_payment_method);
 RETURN booking_uuid;
END;
$$;
REVOKE ALL ON FUNCTION public.submit_pickup_booking(text, text, text, text, date, time without time zone, uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_pickup_booking(text, text, text, text, date, time without time zone, uuid, text) TO service_role;