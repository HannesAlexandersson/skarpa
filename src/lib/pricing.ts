// Mirrors public.calculate_price_ore. Prices live in pricing_tiers/pricing_campaigns; the server recalculates on save.
export type PricingTier = { minKnives: number; pricePerKnifeOre: number };
export type PricingCampaign = { name: string; firstKnifePriceOre: number; startsOn: string | null; endsOn: string | null };
export type PricingRules = { tiers: PricingTier[]; campaign: PricingCampaign | null };

export const MAX_KNIVES = 20;

export const DEFAULT_PRICING: PricingRules = {
  tiers: [
    { minKnives: 1, pricePerKnifeOre: 15000 }, { minKnives: 2, pricePerKnifeOre: 12000 },
    { minKnives: 3, pricePerKnifeOre: 11000 }, { minKnives: 4, pricePerKnifeOre: 10500 },
    { minKnives: 5, pricePerKnifeOre: 10000 },
  ],
  campaign: null,
};

export function campaignFor(rules: PricingRules, date?: string) {
  const c = rules.campaign;
  if (!c) return null;
  if (date && ((c.startsOn && date < c.startsOn) || (c.endsOn && date > c.endsOn))) return null;
  return c;
}

export function calculatePriceOre(rules: PricingRules, knives: number, date?: string): number | null {
  if (!Number.isInteger(knives) || knives < 1) return null;
  const tier = [...rules.tiers].sort((a, b) => b.minKnives - a.minKnives).find((t) => t.minKnives <= knives);
  if (!tier) return null;
  const c = campaignFor(rules, date);
  return c ? c.firstKnifePriceOre + tier.pricePerKnifeOre * (knives - 1) : tier.pricePerKnifeOre * knives;
}

export const formatKr = (ore: number) => `${(ore / 100).toLocaleString("sv-SE", { maximumFractionDigits: 2 })} kr`;
