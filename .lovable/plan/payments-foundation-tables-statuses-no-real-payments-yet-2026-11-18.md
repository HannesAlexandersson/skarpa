# Payments foundation (tables + statuses, no real payments yet)

## Goal
Every booking gets a payment record, so you can see whether it's paid, invoiced or still open. The customer picks a payment method when they book: pay later (invoice, Klarna) or pay up front (Swish, cash at pickup/drop-off). No money moves yet.

## What the customer sees
- A new required "Betalsätt" (payment method) field in the booking form, with two groups:
  - Betala senare: Faktura, Klarna
  - Betala innan: Swish, Kontant vid upphämtning/lämning
- The confirmation shows the chosen payment method. Nothing else changes.

## Data structure
```text
customers 1 ── * bookings 1 ── * payments * ── 1 payment_methods
```
- **payment_methods** (lookup list): code (cash, swish, klarna, invoice, paypal, card), Swedish name, timing (before/after), and active yes/no. PayPal and card are added but switched off until a provider is connected. Anyone can read the active ones, since the form needs them.
- **payments**: booking, payment method, status, amount in öre (empty until the price is known), currency (SEK), invoiced_at, paid_at, provider reference (for Stripe later), timestamps. Server only, no public access.
- **Status** is one field instead of isPaid/isSent: `pending` -> `invoiced` -> `paid`, plus `refunded` / `cancelled`.
- The payment links to the booking, and the booking already knows the customer. We don't store the customer on the payment or a payment_id on the booking, because duplicated data can drift apart. This also lets one booking have several payments later (deposit, rest, refund).

## How saving works
- The existing booking function also takes the payment method and creates a `pending` payment in the same step. Either everything is saved or nothing is, and retries never create duplicates.
- The method is validated in the form, on the server and in the database. Only active methods are accepted.

## Backlog (not in this round)
- Real payments via Stripe (built into Lovable). It covers card, Klarna, Swish, PayPal and invoices through one integration.
- Email confirmation when a customer books. This needs your own domain first.
- Admin view to mark payments as invoiced/paid and enter the amount.

## Technical details
- Migration: enum `payment_status`; tables `payment_methods` (text PK `code`) and `payments` (FK `booking_id` on delete cascade, FK `method_code`), with grants, RLS, updated_at triggers and an index on booking_id. Seed rows for the methods.
- Extend `submit_pickup_booking` with `p_payment_method`. It checks that the method is active and inserts the payment idempotently (only for a newly created booking).
- `bookingSchema` gets `paymentMethod` (Zod enum plus Swedish error message). `bookingRpcArgs` maps it. A new select in BookingForm is grouped with optgroup.
- Tests: schema rejects a missing or unknown method; RPC args include the method; the form requires a method. Verify a test booking creates exactly one pending payment.
- Update roadmap.md and the AGENTS.md rule on the payment structure; push to GitHub when you ask for it.
