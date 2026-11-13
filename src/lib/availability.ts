export type PickupHours = { weekday: number; opensAt: string; closesAt: string; slotMinutes: number };
export type PickupRules = { hours: PickupHours[]; blockedDates: string[]; maxDaysAhead: number };

export const MAX_DAYS_AHEAD = 60;

// Fallback that mirrors the database defaults; the live rules come from the pickup_hours/blocked_dates tables.
export const DEFAULT_PICKUP_RULES: PickupRules = {
  hours: [1, 2, 3, 4, 5, 6, 7].map((weekday) => ({ weekday, opensAt: "08:00", closesAt: "18:00", slotMinutes: 30 })),
  blockedDates: [],
  maxDaysAhead: MAX_DAYS_AHEAD,
};

const toMinutes = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
const toTime = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

/** ISO weekday: 1 = Monday … 7 = Sunday */
export function isoWeekday(date: string) {
  const d = new Date(`${date}T12:00:00Z`).getUTCDay();
  return d === 0 ? 7 : d;
}

export function addDays(date: string, days: number) {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function slotsForDate(rules: PickupRules, date: string): string[] {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || rules.blockedDates.includes(date)) return [];
  const h = rules.hours.find((x) => x.weekday === isoWeekday(date));
  if (!h) return [];
  const slots: string[] = [];
  for (let m = toMinutes(h.opensAt); m < toMinutes(h.closesAt); m += h.slotMinutes) slots.push(toTime(m));
  return slots;
}

export function isSlotAllowed(rules: PickupRules, date: string, time: string, earliest: string) {
  if (date < earliest || date > addDays(earliest, rules.maxDaysAhead - 1)) return false;
  return slotsForDate(rules, date).includes(time);
}
