# Booking form: validation, customer duplicates, pickup hours

## 1. Validation and cleanup of form input (mostly in place, tighten it)
Zod is already used: the same rules run in the browser and again on the server, and the database repeats basic length/date checks. React escapes all text on display, so no HTML can be injected. Improvements:
- Clearer per-field error messages in Swedish under each field instead of one general message.
- Stricter rules: name (letters, spaces, hyphens), Swedish phone format (normalized to digits, e.g. `0701234567` / `+46701234567`), email lowercased, address trimmed with collapsed whitespace, control characters stripped from all fields.
- Phone is stored in one normalized form so duplicate detection (point 2) works.

## 2. No duplicate customers
- A customer counts as "the same" when **both email and phone** match (after normalization). Matching on email alone would let anyone attach bookings to someone else's record by typing their email.
- If found: reuse that customer, and **do not overwrite** their stored name/address with unverified input.
- The pickup address is saved on each booking, so a returning customer can have knives picked up from a new address without changing their customer record.
- Database enforces uniqueness (unique on email + phone), so two simultaneous submissions can't create twins.
- Existing duplicate rows (from testing) are merged into one, with their bookings moved over.
- The booking response stays the same whether the customer was new or existing, so the form never reveals who is already a customer.

## 3. Bookable days and hours (foundation now, admin tool later)
- Default rules (editable later): every day, Mon–Sun, 08:00–18:00, 30-minute slots, earliest tomorrow, up to 60 days ahead. Please confirm or give real values.
- Two settings tables: weekly opening hours per weekday, and blocked dates (holidays, vacation).
- Time field becomes a dropdown of allowed slots for the chosen date; closed days show a message and can't be submitted.
- Server and database reject any date/time outside the rules, regardless of what the browser sends.
- Future admin tool only needs to edit these two tables (behind admin login with a separate roles table).

## Technical details
- `src/lib/booking-schema.ts`: refined zod schema + `normalizePhone`, `sanitizeText`; shared availability helper `isSlotAllowed(rules, date, time)`.
- Migration: `bookings.pickup_address` column (backfill from customer), `customers.phone` normalized + unique index on `(email, phone)` after merging duplicates; `submit_pickup_booking` uses `INSERT ... ON CONFLICT (email, phone) DO NOTHING` then selects id; validates slot against `pickup_hours` (weekday, opens_at, closes_at, slot_minutes) and `blocked_dates` (date, reason). Both tables service_role write, public read via a `get_pickup_availability` server function.
- `BookingForm`: loads availability via route loader/query, renders time `<select>`, field-level errors.
- Tests: phone normalization, duplicate reuse doesn't overwrite, night/closed-day slot rejected, existing retry test kept.
