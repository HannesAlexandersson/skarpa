import { createServerFn } from "@tanstack/react-start";
import { bookingSubmissionSchema, bookingRpcArgs } from "./booking-schema";

// Intentionally public, create-only intake. Never expose customer lookups or updates here.
export const submitBooking = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => bookingSubmissionSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: bookingId, error } = await supabaseAdmin.rpc("submit_pickup_booking", bookingRpcArgs(data));
    if (error || !bookingId) {
      return { ok: false as const, error: "Bokningen kunde inte sparas. Försök igen om en stund." };
    }
    return { ok: true as const, bookingId };
  });