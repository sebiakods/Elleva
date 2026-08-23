"use client";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/Button";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-all duration-300",
        scrolled ? "bg-white/90 shadow-card backdrop-blur-md" : "bg-transparent"
      )}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <Logo withTagline />

        <div className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="underline-rise text-[15px] font-medium text-ink-soft transition-colors hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <Button href="/login" variant="ghost" size="sm">
            Connexion
          </Button>
          <Button href="/register" variant="primary" size="sm">
            Rejoindre Ellevadz
          </Button>
        </div>

        <button
          className="rounded-full p-2 text-ink lg:hidden focus-ring"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {open && (
        <div className="animate-rise space-y-1 border-t border-sand-200 bg-white px-6 py-4 lg:hidden">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block rounded-lg px-3 py-2.5 text-[15px] font-medium text-ink-soft hover:bg-rose-50 hover:text-rose-600"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="flex gap-3 pt-3">
            <Button href="/login" variant="outline" className="flex-1">
              Connexion
            </Button>
            <Button href="/register" variant="primary" className="flex-1">
              Rejoindre
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}

