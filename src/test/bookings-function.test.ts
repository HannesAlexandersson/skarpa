import { beforeEach, describe, expect, it, vi } from "vitest";

const { rpc } = vi.hoisted(() => ({ rpc: vi.fn() }));
vi.mock("@tanstack/react-start", () => ({
  createServerFn: () => ({
    inputValidator: (validate: (input: unknown) => unknown) => ({
      handler: (handle: (input: { data: unknown }) => unknown) =>
        (input: { data: unknown }) => handle({ data: validate(input.data) }),
    }),
  }),
}));
vi.mock("@/integrations/supabase/client.server", () => ({ supabaseAdmin: { rpc } }));
import { submitBooking } from "@/lib/bookings.functions";

const data = {
  name: "Booking test", address: "Testgatan 1", phone: "0700000000",
  email: "booking-test@example.com", date: "2099-12-01", time: "14:30",
  submissionId: "b7d41702-56a0-4f98-8e30-e744f237471a",
};

describe("Public booking server function", () => {
  beforeEach(() => { rpc.mockReset(); });
  it("returns success only after the database supplies the saved booking reference", async () => {
    rpc.mockResolvedValue({ data: "saved-booking-id", error: null });
    expect(await submitBooking({ data })).toEqual({ ok: true, bookingId: "saved-booking-id" });
    expect(rpc).toHaveBeenCalledWith("submit_pickup_booking", expect.objectContaining({
      p_submission_id: data.submissionId, p_date: "2099-12-01", p_time: "14:30",
    }));
  });
  it("does not report a saved booking or expose infrastructure errors when configuration is missing", async () => {
    rpc.mockRejectedValue(new Error("Missing SUPABASE_SERVICE_ROLE_KEY"));
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      const result = await submitBooking({ data });
      expect(result.ok).toBe(false);
      expect(JSON.stringify(result)).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
      expect(result).not.toHaveProperty("bookingId");
    } finally { log.mockRestore(); }
  });
});