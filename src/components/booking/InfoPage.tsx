import { Link } from "@tanstack/react-router";
import { BackgroundMesh } from "../BackgroundMesh/BackgroundMesh";
import { SiteNav } from "../SiteNav/SiteNav";

export function InfoPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <BackgroundMesh />
      <div className="relative z-2 mx-auto max-w-310 px-[clamp(20px,5vw,56px)] pb-18 pt-[clamp(20px,4vw,40px)]">
        <SiteNav />
        <main className="max-w-2xl">
          <h1 className="mb-6 font-serif text-5xl leading-tight sm:text-6xl">{title}</h1>
          <div className="mb-8 text-muted-foreground">{children}</div>
          <Link to="/" className="text-accent underline underline-offset-4">Boka tid för upphämtning →</Link>
        </main>
      </div>
    </div>
  );
}