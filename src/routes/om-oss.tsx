import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/booking/InfoPage";

export const Route = createFileRoute("/om-oss")({
  head: () => ({ meta: [
    { title: "Om oss – Skärpa" },
    { name: "description", content: "Om Skärpa och knivslipning med upphämtning vid din dörr." },
    { property: "og:title", content: "Om oss – Skärpa" },
    { property: "og:description", content: "Om Skärpa och knivslipning med upphämtning vid din dörr." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <InfoPage title="Om oss"><p>Vi hämtar dina knivar, slipar för hand och lämnar tillbaka.</p></InfoPage>,
});