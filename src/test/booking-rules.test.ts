import { describe, expect, it } from "vitest";
import { bookingSchema, normalizePhone } from "@/lib/booking-schema";
import { DEFAULT_PICKUP_RULES, isSlotAllowed, slotsForDate } from "@/lib/availability";

const base = { name: "Anna Svensson", address: "Testgatan 1", phone: "070-123 45 67", email: " Anna@Example.se ", date: "2099-12-01", time: "14:30" };

describe("Booking rules", () => {
  it("normalizes Swedish phone numbers so the same customer is recognised", () => {
    expect(normalizePhone("070-123 45 67")).toBe("0701234567");
    expect(normalizePhone("+46 70 123 45 67")).toBe("0701234567");
    expect(normalizePhone("0046701234567")).toBe("0701234567");
  });
  it("lowercases email and rejects names with markup", () => {
    expect(bookingSchema.parse(base).email).toBe("anna@example.se");
    expect(bookingSchema.safeParse({ ...base, name: "<script>" }).success).toBe(false);
  });
  it("allows every day including weekends, 08:00 to 17:30 in 30-minute slots", () => {
    const sunday = "2099-12-06";
    expect(slotsForDate(DEFAULT_PICKUP_RULES, sunday)[0]).toBe("08:00");
    expect(slotsForDate(DEFAULT_PICKUP_RULES, sunday).at(-1)).toBe("17:30");
  });
  it("rejects night-time, off-slot, blocked and too-far-ahead pickups", () => {
    const e = "2099-12-01";
    expect(isSlotAllowed(DEFAULT_PICKUP_RULES, e, "03:00", e)).toBe(false);
    expect(isSlotAllowed(DEFAULT_PICKUP_RULES, e, "18:00", e)).toBe(false);
    expect(isSlotAllowed(DEFAULT_PICKUP_RULES, e, "09:15", e)).toBe(false);
    expect(isSlotAllowed({ ...DEFAULT_PICKUP_RULES, blockedDates: [e] }, e, "09:00", e)).toBe(false);
    expect(isSlotAllowed(DEFAULT_PICKUP_RULES, "2100-03-01", "09:00", e)).toBe(false);
    expect(isSlotAllowed(DEFAULT_PICKUP_RULES, e, "09:00", e)).toBe(true);
  });
});
