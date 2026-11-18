const steps = ["Vi hämtar", "Vi slipar", "Vi levererar"];

export function StepTiles() {
  return (
    <div aria-label="Så fungerar det" className="grid max-w-[560px] grid-cols-1 gap-3 sm:grid-cols-3">
      {steps.map((label, i) => (
        <div
          key={label}
          className="glass flex items-center gap-4 rounded-[22px] border border-line p-[1.1rem] transition duration-300 hover:-translate-y-1 hover:border-accent sm:block"
        >
          <b className="block font-serif text-[1.7rem] font-normal leading-none text-accent">
            {String(i + 1).padStart(2, "0")}
          </b>
          <span className="block text-[0.9rem] sm:mt-2.5">{label}</span>
        </div>
      ))}
    </div>
  );
}
