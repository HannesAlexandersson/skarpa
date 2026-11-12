import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import Button from "@/components/Button/Button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const destinations = [
  { to: "/", label: "Boka tid" },
  { to: "/priser", label: "Priser" },
  { to: "/om-oss", label: "Om oss" },
  { to: "/kontakt", label: "Kontakt" },
] as const;

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const cancelClose = () => clearTimeout(closeTimer.current);
  const showMenu = () => { cancelClose(); setOpen(true); };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 180);
  };
  useEffect(() => () => clearTimeout(closeTimer.current), []);

  return (
    <nav aria-label="Huvudnavigation" className="mb-[clamp(40px,8vw,96px)] grid grid-cols-[1fr_auto_1fr] items-center">
      <div className="font-serif text-[1.4rem] font-semibold tracking-tight">
        Skärpa<span className="text-accent">.</span>
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="nav" size="sm" className="size-11 p-0" aria-label="Öppna navigation" onMouseEnter={showMenu} onMouseLeave={scheduleClose}>
            <Menu className="size-6" aria-hidden="true" />
          </Button>
        </PopoverTrigger>
        <PopoverContent aria-label="Navigation" className="w-44 p-2 pointer-events-auto" sideOffset={8} onMouseEnter={cancelClose} onMouseLeave={scheduleClose} onOpenAutoFocus={(event) => event.preventDefault()}>
          <div className="flex flex-col">
            {destinations.map(({ to, label }) => (
              <Link key={to} to={to} onClick={() => setOpen(false)} className="rounded-md px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring" activeProps={{ className: "bg-muted text-accent" }} activeOptions={{ exact: true }}>
                {label}
              </Link>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      <a
        href="tel:+46000000000"
        className="glass justify-self-end rounded-full border border-line px-4 py-2 text-[0.95rem] text-foreground transition duration-200 hover:-translate-y-0.5 hover:border-accent"
      >
        Ring oss
      </a>
    </nav>
  );
}
