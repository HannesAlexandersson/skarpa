import { useMemo, useRef, useState, type FormEvent } from "react";
import { PAYMENT_METHODS, bookingSchema, earliestPickupDate, type BookingFieldErrors, type PaymentMethodCode } from "@/lib/booking-schema";
import { DEFAULT_PICKUP_RULES, addDays, isSlotAllowed, slotsForDate, type PickupRules } from "@/lib/availability";
import Button from "@/components/Button/Button";
import { FormField } from "../Form/FormField";
import { BookingSuccess } from "./BookingSuccess";

export type BookingData = {
  name: string;
  address: string;
  phone: string;
  email: string;
  date: string;
  time: string;
  paymentMethod: PaymentMethodCode;
};

type BookingFormProps = {
  onSubmit?: ((data: BookingData & { submissionId: string }) => void | string | Promise<void | string>) | undefined;
  rules?: PickupRules | undefined;
};

export function BookingForm({ onSubmit, rules = DEFAULT_PICKUP_RULES }: BookingFormProps) {
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<BookingFieldErrors>({});
  const [date, setDate] = useState("");
  const [bookingId, setBookingId] = useState<string | undefined>();
  const [paidWith, setPaidWith] = useState<string | undefined>();
  const submissionId = useRef<string | undefined>(undefined);
  const minDate = useMemo(() => earliestPickupDate(), []);
  const maxDate = addDays(minDate, rules.maxDaysAhead - 1);
  const slots = date ? slotsForDate(rules, date) : [];

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    const parsed = bookingSchema.safeParse(Object.fromEntries(new FormData(e.currentTarget).entries()));
    if (!parsed.success) {
      const errs: BookingFieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof BookingFieldErrors;
        errs[key] ??= issue.message;
      }
      setFieldErrors(errs);
      setError("Kontrollera de markerade fälten.");
      return;
    }
    if (!isSlotAllowed(rules, parsed.data.date, parsed.data.time, minDate)) {
      setFieldErrors({ time: "Den valda tiden går inte att boka. Välj en annan tid." });
      setError("Kontrollera de markerade fälten.");
      return;
    }
    setFieldErrors({});
    setError("");
    setPending(true);
    submissionId.current ??= crypto.randomUUID();
    try {
      if (!onSubmit) throw new Error("Bokningen kunde inte sparas.");
      const reference = await onSubmit({ ...parsed.data, submissionId: submissionId.current });
      setBookingId(typeof reference === "string" ? reference : undefined);
      setPaidWith(PAYMENT_METHODS.find((m) => m.code === parsed.data.paymentMethod)?.label);
      setSent(true);
    } catch {
      setError("Bokningen kunde inte sparas. Dina uppgifter finns kvar – försök igen om en stund.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section
      aria-labelledby="formtitle"
      className="glass-strong mt-2 rounded-[32px] border border-line p-[clamp(22px,3vw,38px)] shadow-card min-[900px]:-ml-12 min-[900px]:mt-[clamp(0px,4vw,56px)]"
    >
      {sent ? (
        <BookingSuccess bookingId={bookingId} paymentMethod={paidWith} />
      ) : (
        <>
          <h2 id="formtitle" className="card-title">Boka tid för upphämtning</h2>
          <p className="mb-6 text-[0.95rem] text-muted-foreground">Fyll i dina uppgifter så hör vi av oss.</p>
          <form noValidate onSubmit={handleSubmit} className="grid gap-3.5">
            <FormField id="name" label="Namn" type="text" autoComplete="name" placeholder="Förnamn Efternamn" maxLength={120} required error={fieldErrors.name} />
            <FormField id="address" label="Adress" type="text" autoComplete="street-address" placeholder="Gatuadress, postnummer, ort" maxLength={500} required error={fieldErrors.address} />
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <FormField id="phone" label="Telefon" type="tel" autoComplete="tel" placeholder="070-123 45 67" maxLength={40} required error={fieldErrors.phone} />
              <FormField id="email" label="E-post" type="email" autoComplete="email" placeholder="namn@mail.se" maxLength={254} required error={fieldErrors.email} />
            </div>
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <FormField id="date" label="Datum för upphämtning" type="date" min={minDate} max={maxDate} required
                value={date} onChange={(e) => setDate(e.target.value)} error={fieldErrors.date} />
              <div className="relative">
                <label htmlFor="time" className="mb-1.5 ml-1 block text-[0.8rem] font-semibold tracking-wide">Tid för upphämtning</label>
                <select id="time" name="time" className="field-input" required defaultValue="" disabled={!date || slots.length === 0}
                  aria-invalid={fieldErrors.time ? true : undefined} aria-describedby={fieldErrors.time ? "time-error" : undefined}>
                  <option value="" disabled>{!date ? "Välj datum först" : slots.length ? "Välj tid" : "Stängt denna dag"}</option>
                  {slots.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                {fieldErrors.time && <p id="time-error" className="ml-1 mt-1 text-xs text-destructive">{fieldErrors.time}</p>}
              </div>
            </div>
            <div className="relative">
              <label htmlFor="paymentMethod" className="mb-1.5 ml-1 block text-[0.8rem] font-semibold tracking-wide">Betalsätt</label>
              <select id="paymentMethod" name="paymentMethod" className="field-input" required defaultValue=""
                aria-invalid={fieldErrors.paymentMethod ? true : undefined} aria-describedby={fieldErrors.paymentMethod ? "paymentMethod-error" : undefined}>
                <option value="" disabled>Välj betalsätt</option>
                <optgroup label="Betala senare">
                  {PAYMENT_METHODS.filter((m) => m.timing === "after").map((m) => <option key={m.code} value={m.code}>{m.label}</option>)}
                </optgroup>
                <optgroup label="Betala innan">
                  {PAYMENT_METHODS.filter((m) => m.timing === "before").map((m) => <option key={m.code} value={m.code}>{m.label}</option>)}
                </optgroup>
              </select>
              {fieldErrors.paymentMethod && <p id="paymentMethod-error" className="ml-1 mt-1 text-xs text-destructive">{fieldErrors.paymentMethod}</p>}
            </div>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <Button type="submit" variant="accent" size="xl" className="mt-1.5" disabled={pending} aria-busy={pending}>
              {pending ? "Sparar bokning…" : "Boka upphämtning"}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Button>
            <p className="mt-1 text-center text-[0.8rem] text-muted-foreground">
              Ingen betalning nu. Vi bekräftar dagen via e-post.
            </p>
          </form>
        </>
      )}
    </section>
  );
}
