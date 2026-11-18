import { z } from "zod";
import { MAX_KNIVES } from "./pricing";

export function earliestPickupDate(now = new Date()) {
  const today = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Stockholm", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
  const tomorrow = new Date(`${today}T12:00:00Z`);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  return tomorrow.toISOString().slice(0, 10);
}

/** Removes control characters, trims and collapses whitespace. */
export function sanitizeText(value: string) {
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim();
}

/** Normalizes Swedish phone numbers to digits, +46/0046 → leading 0. Mirrors public.normalize_phone. */
export function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (/^\s*(\+|00)/.test(value) && digits.startsWith("0046")) return `0${digits.slice(4)}`;
  if (/^\s*(\+|00)/.test(value) && digits.startsWith("46") && digits.length > 9) return `0${digits.slice(2)}`;
  return digits;
}

const text = (max: number, message: string) =>
  z.string().transform(sanitizeText).pipe(z.string().min(1, message).max(max, `Högst ${max} tecken.`));

/** Selectable payment methods; must match active rows in public.payment_methods. */
export const PAYMENT_METHODS = [
  { code: "invoice", label: "Faktura", timing: "after" },
  { code: "klarna", label: "Klarna", timing: "after" },
  { code: "swish", label: "Swish", timing: "before" },
  { code: "cash", label: "Kontant vid upphämtning/lämning", timing: "before" },
] as const;
export type PaymentMethodCode = (typeof PAYMENT_METHODS)[number]["code"];
const paymentCodes = PAYMENT_METHODS.map((m) => m.code) as [PaymentMethodCode, ...PaymentMethodCode[]];

export const bookingSchema = z.object({
  name: text(120, "Ange ditt namn.").pipe(z.string().regex(/^[\p{L}][\p{L}\p{M}' .-]*$/u, "Namnet får bara innehålla bokstäver, mellanslag och bindestreck.")),
  address: text(500, "Ange din adress."),
  phone: z.string().refine((v) => /^[\d\s+()-]*$/.test(v), "Telefonnumret får bara innehålla siffror.")
    .transform(normalizePhone)
    .pipe(z.string().regex(/^0\d{6,14}$/, "Ange ett giltigt svenskt telefonnummer, t.ex. 070-123 45 67.")),
  email: z.string().transform((v) => sanitizeText(v).toLowerCase()).pipe(z.string().email("Ange en giltig e-postadress.").max(254)),
  date: z.string({ required_error: "Välj ett datum." }).regex(/^\d{4}-\d{2}-\d{2}$/, "Välj ett datum.").refine((value) => {
    const date = new Date(`${value}T12:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value && value >= earliestPickupDate();
  }, "Välj ett datum från och med i morgon."),
  time: z.string({ required_error: "Välj en tid." }).regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Välj en tid."),
  paymentMethod: z.enum(paymentCodes, { message: "Välj ett betalsätt." }),
  knifeCount: z.coerce.number({ invalid_type_error: "Ange antal knivar." }).int("Ange ett heltal.").min(1, "Minst 1 kniv.").max(MAX_KNIVES, `Högst ${MAX_KNIVES} knivar – kontakta oss för större beställningar.`).default(1),
});

export type BookingFieldErrors = Partial<Record<keyof z.infer<typeof bookingSchema>, string>>;

export const bookingSubmissionSchema = bookingSchema.extend({ submissionId: z.string().uuid() });

export function bookingRpcArgs(data: z.infer<typeof bookingSubmissionSchema>) {
  return { p_name: data.name, p_address: data.address, p_phone: data.phone, p_email: data.email,
    p_date: data.date, p_time: data.time, p_submission_id: data.submissionId, p_payment_method: data.paymentMethod, p_knife_count: data.knifeCount };
}
