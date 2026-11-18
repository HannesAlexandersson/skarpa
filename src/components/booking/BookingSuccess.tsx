export function BookingSuccess({ bookingId, paymentMethod, knives, priceText }: { bookingId?: string | undefined; paymentMethod?: string | undefined; knives?: number | undefined; priceText?: string | undefined }) {
  return (
    <div role="status" aria-live="polite" className="animate-pop py-8 text-center">
      <div aria-hidden="true" className="mx-auto mb-4 grid size-16 place-items-center rounded-full bg-accent text-[1.8rem] text-accent-foreground">
        ✓
      </div>
      <h2 className="card-title">Tack!</h2>
      <p className="text-[0.95rem] text-muted-foreground">Din förfrågan är skickad. Vi hör av oss snart.</p>
      {paymentMethod && <p className="mt-3 text-sm text-muted-foreground">Betalsätt: {paymentMethod}</p>}
      {knives && <p className="mt-1 text-sm text-muted-foreground">Antal knivar: {knives}</p>}
      {priceText && <p className="mt-1 text-sm text-muted-foreground">Preliminärt pris: {priceText}</p>}
      {bookingId && <p className="mt-4 break-all text-xs text-muted-foreground">Bokningsreferens: {bookingId}</p>}
    </div>
  );
}
