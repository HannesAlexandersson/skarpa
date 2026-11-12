import { useMemo, useRef, useState, type FormEvent } from "react";
import { bookingSchema, earliestPickupDate } from "@/lib/booking-schema";
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
};

type BookingFormProps = {
  onSubmit?: ((data: BookingData & { submissionId: string }) => void | string | Promise<void | string>) | undefined;
};

export function BookingForm({ onSubmit }: BookingFormProps) {
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [bookingId, setBookingId] = useState<string | undefined>();
  const submissionId = useRef<string | undefined>(undefined);
  const minDate = useMemo(() => earliestPickupDate(), []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const parsed = bookingSchema.safeParse(Object.fromEntries(new FormData(form).entries()));
    if (!parsed.success) {
      setError("Kontrollera dina kontaktuppgifter och välj ett giltigt datum och tid.");
      return;
    }
    setError("");
    setPending(true);
    submissionId.current ??= crypto.randomUUID();
    try {
      if (!onSubmit) throw new Error("Bokningen kunde inte sparas.");
      const reference = await onSubmit({ ...parsed.data, submissionId: submissionId.current });
      setBookingId(typeof reference === "string" ? reference : undefined);
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
        <BookingSuccess bookingId={bookingId} />
      ) : (
        <>
          <h2 id="formtitle" className="card-title">Boka tid för upphämtning</h2>
          <p className="mb-6 text-[0.95rem] text-muted-foreground">Fyll i dina uppgifter så hör vi av oss.</p>
          <form noValidate onSubmit={handleSubmit} className="grid gap-3.5">
            <FormField id="name" label="Namn" type="text" autoComplete="name" placeholder="Förnamn Efternamn" required />
            <FormField id="address" label="Adress" type="text" autoComplete="street-address" placeholder="Gatuadress, postnummer, ort" required />
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <FormField id="phone" label="Telefon" type="tel" autoComplete="tel" placeholder="070-123 45 67" required />
              <FormField id="email" label="E-post" type="email" autoComplete="email" placeholder="namn@mail.se" required />
            </div>
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <FormField id="date" label="Datum för upphämtning" type="date" min={minDate} required />
              <FormField id="time" label="Tid för upphämtning" type="time" required />
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
