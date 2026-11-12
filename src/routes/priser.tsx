import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/booking/InfoPage";

export const Route = createFileRoute("/priser")({
  head: () => ({ meta: [
    { title: "Priser – Skärpa" },
    { name: "description", content: "Prisinformation för Skärpas knivslipning med upphämtning." },
    { property: "og:title", content: "Priser – Skärpa" },
    { property: "og:description", content: "Prisinformation för Skärpas knivslipning med upphämtning." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <InfoPage title="Priser"><p>Prislista kommer snart.</p></InfoPage>,
});