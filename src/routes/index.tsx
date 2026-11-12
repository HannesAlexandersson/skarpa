import { createFileRoute } from "@tanstack/react-router";
import { BackgroundMesh } from "@/components/BackgroundMesh/BackgroundMesh";
import { SiteNav } from "@/components/SiteNav/SiteNav";
import { HeroSection } from "@/components/HeroSection/HeroSection";
import { useServerFn } from "@tanstack/react-start";
import { submitBooking } from "@/lib/bookings.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Skärpa – Boka tid för upphämtning" },
      { name: "description", content: "Knivslipning med upphämtning. Vi hämtar, slipar för hand och lämnar tillbaka." },
      { property: "og:title", content: "Skärpa – Boka tid för upphämtning" },
      { property: "og:description", content: "Knivslipning med upphämtning. Vi hämtar, slipar för hand och lämnar tillbaka." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const saveBooking = useServerFn(submitBooking);
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <BackgroundMesh />
      <div className="relative z-[2] mx-auto max-w-[1240px] px-[clamp(20px,5vw,56px)] pb-[72px] pt-[clamp(20px,4vw,40px)]">
        <SiteNav />
        <HeroSection onBook={async (data) => {
          const result = await saveBooking({ data });
          if (!result.ok) throw new Error(result.error);
          return result.bookingId;
        }} />
      </div>
    </div>
  );
}
