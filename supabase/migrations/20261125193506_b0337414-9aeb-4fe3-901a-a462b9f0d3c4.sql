ALTER TABLE public.bookings
  ADD COLUMN withdrawal_consent_at timestamptz,
  ADD COLUMN withdrawal_consent_text text,
  ADD COLUMN withdrawal_consent_version text,
  ADD CONSTRAINT bookings_withdrawal_consent_complete CHECK (
    (withdrawal_consent_at IS NULL AND withdrawal_consent_text IS NULL AND withdrawal_consent_version IS NULL)
    OR
    (withdrawal_consent_at IS NOT NULL AND length(trim(withdrawal_consent_text)) > 0 AND length(trim(withdrawal_consent_version)) > 0)
  );

DROP FUNCTION public.submit_pickup_booking(text, text, text, text, date, time without time zone, uuid, text, integer);

CREATE FUNCTION public.submit_pickup_booking(
  p_name text,
  p_address text,
  p_phone text,
  p_email text,
  p_date date,
  p_time time without time zone,
  p_submission_id uuid,
  p_payment_method text,
  p_knife_count integer,
  p_withdrawal_consent boolean,
  p_withdrawal_consent_text text,
  p_withdrawal_consent_version text
)
RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE customer_uuid uuid; booking_uuid uuid; v_phone text; v_email text; v_today date; h public.pickup_hours%ROWTYPE;
BEGIN
 PERFORM pg_advisory_xact_lock(hashtextextended(p_submission_id::text, 0));
 SELECT id INTO booking_uuid FROM public.bookings WHERE submission_id = p_submission_id;
 IF booking_uuid IS NOT NULL THEN RETURN booking_uuid; END IF;
 IF p_withdrawal_consent IS NOT TRUE OR nullif(trim(p_withdrawal_consent_text), '') IS NULL OR nullif(trim(p_withdrawal_consent_version), '') IS NULL THEN
  RAISE EXCEPTION 'Withdrawal-period consent required';
 END IF;
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
 INSERT INTO public.bookings(
   customer_id, pickup_date, pickup_time, pickup_address, submission_id, knife_count,
   withdrawal_consent_at, withdrawal_consent_text, withdrawal_consent_version
 ) VALUES (
   customer_uuid, p_date, p_time, trim(p_address), p_submission_id, p_knife_count,
   now(), trim(p_withdrawal_consent_text), trim(p_withdrawal_consent_version)
 ) RETURNING id INTO booking_uuid;
 INSERT INTO public.payments(booking_id, method_code, amount_ore) VALUES (booking_uuid, p_payment_method, public.calculate_price_ore(p_knife_count, p_date));
 RETURN booking_uuid;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_pickup_booking(text, text, text, text, date, time without time zone, uuid, text, integer, boolean, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_pickup_booking(text, text, text, text, date, time without time zone, uuid, text, integer, boolean, text, text) TO service_role;