import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { DEFAULT_PRICING } from "./pricing";
import { DEFAULT_PICKUP_RULES, MAX_DAYS_AHEAD, type PickupRules } from "./availability";

// Public read of opening hours and blocked dates (no customer data).
export const getPickupAvailability = createServerFn({ method: "GET" }).handler(async (): Promise<PickupRules> => {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) return DEFAULT_PICKUP_RULES;
  const sb = createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => {
      const h = new Headers(init?.headers);
      if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
      h.set("apikey", key);
      return fetch(input, { ...init, headers: h });
    } },
  });
  const [hours, blocked, tiers, campaign, methods] = await Promise.all([
    sb.from("pickup_hours").select("weekday, opens_at, closes_at, slot_minutes"),
    sb.from("blocked_dates").select("blocked_date"),
    sb.from("pricing_tiers").select("min_knives, price_per_knife_ore"),
    sb.from("pricing_campaigns").select("name, first_knife_price_ore, starts_on, ends_on").eq("active", true).maybeSingle(),
    sb.from("payment_methods").select("code").eq("active", true),
  ]);
  if (hours.error || blocked.error) {
    console.error("[Availability] Could not load pickup rules", { code: hours.error?.code ?? blocked.error?.code });
    return DEFAULT_PICKUP_RULES;
  }
  return {
    hours: hours.data.map((h) => ({ weekday: h.weekday, opensAt: h.opens_at.slice(0, 5), closesAt: h.closes_at.slice(0, 5), slotMinutes: h.slot_minutes })),
    blockedDates: blocked.data.map((b) => b.blocked_date),
    maxDaysAhead: MAX_DAYS_AHEAD,
    ...(methods.error ? {} : { activePaymentMethods: methods.data.map((m) => m.code) }),
    pricing: tiers.error || !tiers.data.length ? DEFAULT_PRICING : {
      tiers: tiers.data.map((t) => ({ minKnives: t.min_knives, pricePerKnifeOre: t.price_per_knife_ore })),
      campaign: campaign.data ? { name: campaign.data.name, firstKnifePriceOre: campaign.data.first_knife_price_ore, startsOn: campaign.data.starts_on, endsOn: campaign.data.ends_on } : null,
    },
  };
});
