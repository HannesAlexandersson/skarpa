import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/booking/InfoPage";

export const Route = createFileRoute("/cookiepolicy")({
  head: () => ({ meta: [
    { title: "Cookiepolicy – Skärpa" },
    { name: "description", content: "Information om cookies, besöksstatistik och bokningsuppgifter hos Skärpa." },
    { property: "og:title", content: "Cookiepolicy – Skärpa" },
    { property: "og:description", content: "Information om cookies, besöksstatistik och bokningsuppgifter hos Skärpa." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <InfoPage title="Cookiepolicy"><div className="space-y-6">
    <section><h2 className="mb-2 text-xl text-foreground">Cookies och lokal lagring</h2><p>De offentliga sidorna använder inte cookies eller lokal lagring för bokningar. Formuläret behåller dina uppgifter i sidans minne medan du fyller i det. Ingen inloggning, reklampixel eller extern inbäddning används på dessa sidor.</p></section>
    <section className="space-y-3"><h2 className="text-xl text-foreground">Besöksstatistik</h2><p>På den publicerade webbplatsen registreras sidbesök och klick för alla besökare. Webbplatsen har ingen samtyckesbanner. Sidbesök, tid på sidan, laddningshastighet och fel registreras för varje besökare utan cookies och utan att identifiera någon.</p>
    <p>Lovables statistik använder inga cookies, lagrar ingenting på besökarens enhet, sparar inte IP-adresser och identifierar inte besökare. Den registrerar besökta sidor, var besökare kom ifrån, land, webbläsare, operativsystem, enhetstyp, hur länge besökare stannar, sidornas laddningshastighet, fel och klick på knappar och länkar. Klick identifieras genom sin plats på sidan, inte sin text.</p>
    <p>Detaljerad data sparas i 90 dagar och dagliga sammanställningar i ett år.</p><p>Lovable samlar in dessa uppgifter åt oss. <a href="https://lovable.dev/privacy" className="underline underline-offset-4">Lovables integritetspolicy</a> förklarar hur uppgifterna hanteras.</p></section>
    <section><h2 className="mb-2 text-xl text-foreground">Bokningsuppgifter</h2><p>När du skickar formuläret sparas namn, adress, telefonnummer och e-postadress som kunduppgifter hos Supabase. Bokningen sparas med en koppling till kunden samt önskat datum och tid. Uppgifterna är inte offentligt tillgängliga. Skärpa använder dem för att hantera förfrågan. Lagringstid och kontaktväg för frågor om personuppgifter behöver fastställas av Skärpa.</p></section>
    <section><h2 className="mb-2 text-xl text-foreground">Typsnitt</h2><p>Typsnitten hämtas från Google Fonts. Vid hämtningen får Google bland annat din IP-adress och teknisk information från webbläsaren. Webbplatsen lagrar inte dessa förfrågningar på din enhet; webbläsaren kan lagra typsnitt i sin vanliga cache. <a href="https://policies.google.com/privacy" className="underline underline-offset-4">Googles integritetspolicy</a> beskriver deras hantering.</p></section>
  </div></InfoPage>,
});