ALTER TABLE public.bookings ADD COLUMN knife_count smallint NOT NULL DEFAULT 1 CHECK (knife_count BETWEEN 1 AND 20);

CREATE TABLE public.pricing_tiers (
  min_knives smallint PRIMARY KEY CHECK (min_knives >= 1),
  price_per_knife_ore integer NOT NULL CHECK (price_per_knife_ore >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.pricing_tiers TO anon, authenticated;
GRANT ALL ON public.pricing_tiers TO service_role;
ALTER TABLE public.pricing_tiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY pricing_tiers_public_read ON public.pricing_tiers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY pricing_tiers_service_write ON public.pricing_tiers FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE TRIGGER pricing_tiers_updated_at BEFORE UPDATE ON public.pricing_tiers FOR EACH ROW EXECUTE FUNCTION public.set_booking_updated_at();
INSERT INTO public.pricing_tiers(min_knives, price_per_knife_ore) VALUES (1,15000),(2,12000),(3,11000),(4,10500),(5,10000);

CREATE TABLE public.pricing_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 120),
  first_knife_price_ore integer NOT NULL CHECK (first_knife_price_ore >= 0),
  starts_on date,
  ends_on date,
  active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (starts_on IS NULL OR ends_on IS NULL OR ends_on >= starts_on)
);
GRANT SELECT ON public.pricing_campaigns TO anon, authenticated;
GRANT ALL ON public.pricing_campaigns TO service_role;
ALTER TABLE public.pricing_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY pricing_campaigns_public_read ON public.pricing_campaigns FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY pricing_campaigns_service_write ON public.pricing_campaigns FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE UNIQUE INDEX pricing_campaigns_one_active ON public.pricing_campaigns ((true)) WHERE active;
CREATE TRIGGER pricing_campaigns_updated_at BEFORE UPDATE ON public.pricing_campaigns FOR EACH ROW EXECUTE FUNCTION public.set_booking_updated_at();

CREATE FUNCTION public.calculate_price_ore(p_knife_count integer, p_date date)
RETURNS integer LANGUAGE plpgsql STABLE SET search_path = public AS $$
DECLARE per_knife integer; first_price integer;
BEGIN
  IF p_knife_count < 1 THEN RAISE EXCEPTION 'Invalid knife count'; END IF;
  SELECT price_per_knife_ore INTO per_knife FROM public.pricing_tiers WHERE min_knives <= p_knife_count ORDER BY min_knives DESC LIMIT 1;
  IF per_knife IS NULL THEN RAISE EXCEPTION 'No pricing configured'; END IF;
  SELECT first_knife_price_ore INTO first_price FROM public.pricing_campaigns
   WHERE active AND (starts_on IS NULL OR starts_on <= p_date) AND (ends_on IS NULL OR ends_on >= p_date) LIMIT 1;
  IF first_price IS NULL THEN RETURN per_knife * p_knife_count; END IF;
  RETURN first_price + per_knife * (p_knife_count - 1);
END $$;
GRANT EXECUTE ON FUNCTION public.calculate_price_ore(integer, date) TO anon, authenticated, service_role;

DROP FUNCTION public.submit_pickup_booking(text, text, text, text, date, time without time zone, uuid, text);
CREATE FUNCTION public.submit_pickup_booking(p_name text, p_address text, p_phone text, p_email text, p_date date, p_time time without time zone, p_submission_id uuid, p_payment_method text, p_knife_count integer)
RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE customer_uuid uuid; booking_uuid uuid; v_phone text; v_email text; v_today date; h public.pickup_hours%ROWTYPE;
BEGIN
 PERFORM pg_advisory_xact_lock(hashtextextended(p_submission_id::text, 0));
 SELECT id INTO booking_uuid FROM public.bookings WHERE submission_id = p_submission_id;
 IF booking_uuid IS NOT NULL THEN RETURN booking_uuid; END IF;
 IF p_knife_count IS NULL OR p_knife_count NOT BETWEEN 1 AND 20 THEN RAISE EXCEPTION 'Invalid knife count'; END IF;
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
 INSERT INTO public.bookings(customer_id, pickup_date, pickup_time, pickup_address, submission_id, knife_count)
   VALUES (customer_uuid, p_date, p_time, trim(p_address), p_submission_id, p_knife_count) RETURNING id INTO booking_uuid;
 INSERT INTO public.payments(booking_id, method_code, amount_ore) VALUES (booking_uuid, p_payment_method, public.calculate_price_ore(p_knife_count, p_date));
 RETURN booking_uuid;
END;
$$;
REVOKE ALL ON FUNCTION public.submit_pickup_booking(text, text, text, text, date, time without time zone, uuid, text, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_pickup_booking(text, text, text, text, date, time without time zone, uuid, text, integer) TO service_role;