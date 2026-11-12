import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/booking/InfoPage";

export const Route = createFileRoute("/villkor")({
  head: () => ({
    meta: [
      { title: "Användarvillkor - Skärpa" },
      { name: "description", content: "Villkor för bokningsförfrågningar hos Skärpa." },
      { property: "og:title", content: "Användarvillkor - Skärpa" },
      { property: "og:description", content: "Villkor för bokningsförfrågningar hos Skärpa." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ]
  }),
  component: () => <InfoPage title="Användarvillkor"><div className="space-y-6">
    <p>Användarvillkor - Skärpa, Munkebäcks kniv och nyckelservice</p>
    <section><h2 className="mb-2 text-xl text-foreground">Bokningsförfrågan</h2><p>Formuläret skickar en förfrågan om upphämtning för knivslipning. Skärpa återkommer för att bekräfta dagen. Ingen betalning sker i formuläret.</p></section>
    <section><h2 className="mb-2 text-xl text-foreground">Uppgifter vid bokning</h2><p>Namn, adress, telefonnummer, e-postadress samt önskat datum och tid sparas hos Supabase för att Skärpa ska kunna hantera förfrågan och kontakta kunden.</p></section>
    <p>Pris, betalningsvillkor, avbokning, ångerrätt, ansvar, kontaktuppgifter och lagringstid behöver fastställas innan de fullständiga villkoren publiceras.</p>
    <section><h2 className="mb-2 text-xl text-foreground">Lagring av personuppgifter</h2><p>Namn, adress, telefonnummer, e-postadress samt information om varje enskild bokning lagras i databasen Supabase. All data hanteras i enlighet med gällande lagstiftning.</p></section>
    <p>Kunder har rättigheter i enlighet med GDPR. Kunder som har sin persondata lagrad hos Skärpas databaser kan begära utdrag. För att begära utdrag v.g kontakta kundtjänst.</p>
  </div>

  </InfoPage>,
});