import { StepTiles } from "@/components/HeroSection/StepTiles/StepTiles";

export function HeroIntro() {
  return (
    <section>
      <p className="eyebrow">Knivslipning med upphämtning</p>
      <h1 className="mb-6 font-serif text-[clamp(3rem,8.2vw,7.4rem)] font-normal leading-[0.95] tracking-[-0.035em] [font-variation-settings:'opsz'_144]">
        Vassa knivar,
        <br />
        <em className="text-accent">hämtade</em> vid din dörr.
      </h1>
      <p className="mb-10 max-w-[34ch] text-[clamp(1rem,1.5vw,1.2rem)] text-muted-foreground">
        Välj en dag - vi hämtar, slipar för hand och lämnar tillbaka. Du behöver inte lyfta ett finger.
      </p>
      <StepTiles />
    </section>
  );
}
