import { createServerFn } from "@tanstack/react-start";
import { bookingSubmissionSchema, bookingRpcArgs } from "./booking-schema";

// Intentionally public, create-only intake. Never expose customer lookups or updates here.
export const submitBooking = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => bookingSubmissionSchema.parse(input))
  .handler(async ({ data }) => {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: bookingId, error } = await supabaseAdmin.rpc("submit_pickup_booking", bookingRpcArgs(data));
      if (error || !bookingId) {
        console.error("[Booking] Database rejected booking", { code: error?.code });
        return { ok: false as const, error: "Bokningen kunde inte sparas. Försök igen om en stund." };
      }
      return { ok: true as const, bookingId };
    } catch {
      // Keep infrastructure errors and credentials out of the public RPC response.
      console.error("[Booking] Booking storage unavailable. Verify the hosting service's Supabase server environment variables.");
      return { ok: false as const, error: "Bokningen kunde inte sparas. Försök igen om en stund." };
    }
  });