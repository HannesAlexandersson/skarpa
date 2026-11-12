import { HeroIntro } from "./HeroIntro";
import { BookingForm, type BookingData } from "./BookingForm";

export function HeroSection({ onBook }: { onBook?: (data: BookingData & { submissionId: string }) => void | string | Promise<void | string> }) {
  return (
    <main className="grid items-start gap-[clamp(24px,4vw,64px)] min-[900px]:grid-cols-[1.15fr_0.85fr]">
      <HeroIntro />
      <BookingForm onSubmit={onBook} />
    </main>
  );
}
