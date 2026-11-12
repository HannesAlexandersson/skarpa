import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return <footer className="relative z-[2] mt-auto bg-footer text-footer-foreground">
    <div className="mx-auto grid max-w-[1240px] gap-8 px-[clamp(20px,5vw,56px)] py-12 sm:grid-cols-[1fr_1fr_1fr]">
      <Link to="/" className="w-fit font-serif text-3xl">Skärpa.</Link>
      <nav aria-label="Sidfotsnavigation" className="flex flex-col items-start gap-3">
        <Link to="/" className="underline-offset-4 hover:underline">Boka tid</Link>
        <Link to="/priser" className="underline-offset-4 hover:underline">Priser</Link>
        <Link to="/om-oss" className="underline-offset-4 hover:underline">Om oss</Link>
        <Link to="/kontakt" className="underline-offset-4 hover:underline">Kontakt</Link>
      </nav>
      <nav aria-label="Juridisk information" className="flex flex-col items-start gap-3">
        <Link to="/villkor" className="underline-offset-4 hover:underline">Användarvillkor</Link>
        <Link to="/cookiepolicy" className="underline-offset-4 hover:underline">Cookiepolicy</Link>
      </nav>
    </div>
  </footer>;
}