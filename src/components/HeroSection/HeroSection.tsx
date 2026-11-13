import type { PickupRules } from "@/lib/availability";
import { HeroIntro } from "./HeroIntro";
import { BookingForm, type BookingData } from "@/components/booking/BookingForm";

export function HeroSection({ onBook, rules }: { rules?: PickupRules | undefined; onBook?: (data: BookingData & { submissionId: string }) => void | string | Promise<void | string> }) {
  return (
    <main className="grid items-start gap-[clamp(24px,4vw,64px)] min-[900px]:grid-cols-[1.15fr_0.85fr]">
      <HeroIntro />
      <BookingForm onSubmit={onBook} rules={rules} />
    </main>
  );
}
