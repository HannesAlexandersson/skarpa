import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
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
  const [hours, blocked] = await Promise.all([
    sb.from("pickup_hours").select("weekday, opens_at, closes_at, slot_minutes"),
    sb.from("blocked_dates").select("blocked_date"),
  ]);
  if (hours.error || blocked.error) {
    console.error("[Availability] Could not load pickup rules", { code: hours.error?.code ?? blocked.error?.code });
    return DEFAULT_PICKUP_RULES;
  }
  return {
    hours: hours.data.map((h) => ({ weekday: h.weekday, opensAt: h.opens_at.slice(0, 5), closesAt: h.closes_at.slice(0, 5), slotMinutes: h.slot_minutes })),
    blockedDates: blocked.data.map((b) => b.blocked_date),
    maxDaysAhead: MAX_DAYS_AHEAD,
  };
});
