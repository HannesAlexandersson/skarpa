import { describe, expect, it } from "vitest";
import { DEFAULT_PRICING, calculatePriceOre } from "@/lib/pricing";
import { bookingSchema } from "@/lib/booking-schema";

const kr = (n: number) => n * 100;
const campaign = { ...DEFAULT_PRICING, campaign: { name: "Kom och testa", firstKnifePriceOre: kr(50), startsOn: "2099-01-01", endsOn: "2099-01-31" } };

describe("standard pricing", () => {
  it.each([[1, 150], [2, 240], [3, 330], [4, 420], [5, 500], [7, 700]])("%i knives cost %i kr", (n, total) => {
    expect(calculatePriceOre(DEFAULT_PRICING, n)).toBe(kr(total));
  });
});

describe("campaign: first knife 50 kr", () => {
  it.each([[1, 50], [2, 170], [3, 270], [4, 365], [5, 450], [6, 550]])("%i knives cost %i kr", (n, total) => {
    expect(calculatePriceOre(campaign, n, "2099-01-15")).toBe(kr(total));
  });
  it("does not apply outside its dates", () => {
    expect(calculatePriceOre(campaign, 3, "2099-02-01")).toBe(kr(330));
  });
});

describe("knife count", () => {
  const base = { name: "Anna Svensson", address: "Testgatan 1", phone: "0701234567", email: "a@b.se", date: "2099-12-01", time: "14:30", paymentMethod: "cash" };
  it("rejects 0 and 21", () => {
    expect(bookingSchema.safeParse({ ...base, knifeCount: "0" }).success).toBe(false);
    expect(bookingSchema.safeParse({ ...base, knifeCount: "21" }).success).toBe(false);
  });
  it("accepts a number from the form", () => {
    expect(bookingSchema.parse({ ...base, knifeCount: "3" }).knifeCount).toBe(3);
  });
});
