CREATE TABLE public.customers (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 name text NOT NULL,
 address text NOT NULL,
 phone text NOT NULL,
 email text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.customers TO service_role;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY customers_service_only ON public.customers FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE TABLE public.bookings (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
 pickup_date date NOT NULL,
 pickup_time time without time zone NOT NULL,
 submission_id uuid NOT NULL UNIQUE,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY bookings_service_only ON public.bookings FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE INDEX bookings_customer_id_idx ON public.bookings(customer_id);

CREATE FUNCTION public.set_booking_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
CREATE TRIGGER customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.set_booking_updated_at();
CREATE TRIGGER bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.set_booking_updated_at();

CREATE FUNCTION public.submit_pickup_booking(p_name text, p_address text, p_phone text, p_email text, p_date date, p_time time without time zone, p_submission_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE customer_uuid uuid; booking_uuid uuid;
BEGIN
 PERFORM pg_advisory_xact_lock(hashtextextended(p_submission_id::text, 0));
 SELECT id INTO booking_uuid FROM public.bookings WHERE submission_id = p_submission_id;
 IF booking_uuid IS NOT NULL THEN RETURN booking_uuid; END IF;
 IF length(trim(p_name)) NOT BETWEEN 1 AND 120 OR length(trim(p_address)) NOT BETWEEN 1 AND 500 OR length(trim(p_phone)) NOT BETWEEN 3 AND 40 OR length(trim(p_email)) NOT BETWEEN 3 AND 254 THEN
  RAISE EXCEPTION 'Invalid customer details';
 END IF;
 IF p_date <= (now() AT TIME ZONE 'Europe/Stockholm')::date THEN RAISE EXCEPTION 'Pickup must be tomorrow or later'; END IF;
 INSERT INTO public.customers(name, address, phone, email) VALUES (trim(p_name), trim(p_address), trim(p_phone), lower(trim(p_email))) RETURNING id INTO customer_uuid;
 INSERT INTO public.bookings(customer_id, pickup_date, pickup_time, submission_id) VALUES (customer_uuid, p_date, p_time, p_submission_id) RETURNING id INTO booking_uuid;
 RETURN booking_uuid;
END;
$$;
REVOKE ALL ON FUNCTION public.submit_pickup_booking(text, text, text, text, date, time without time zone, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_pickup_booking(text, text, text, text, date, time without time zone, uuid) TO service_role;