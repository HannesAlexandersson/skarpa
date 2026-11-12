import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/booking/InfoPage";

export const Route = createFileRoute("/kontakt")({
  head: () => ({ meta: [
    { title: "Kontakt – Skärpa" },
    { name: "description", content: "Kontaktinformation för Skärpa." },
    { property: "og:title", content: "Kontakt – Skärpa" },
    { property: "og:description", content: "Kontaktinformation för Skärpa." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <InfoPage title="Kontakt"><p>Kontaktuppgifter kommer snart.</p></InfoPage>,
});