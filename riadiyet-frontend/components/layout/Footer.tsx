import { Logo } from "@/components/common/Logo";
import { Instagram, Facebook, Linkedin, Mail } from "lucide-react";

const columns = [
  {
    title: "Plateforme",
    links: [
      { label: "Financement", href: "/financing" },
      { label: "Outils financiers", href: "/calculators" },
      { label: "Business Plan", href: "/business-plan" },
      { label: "Tarifs", href: "/pricing" },
    ],
  },
  {
    title: "Ressources",
    links: [
      { label: "Articles", href: "/resources" },
      { label: "FAQ", href: "/faq" },
      { label: "À propos", href: "/about" },
      { label: "Fonctionnalités", href: "/features" },
    ],
  },
  {
    title: "Compte",
    links: [
      { label: "Connexion", href: "/login" },
      { label: "Inscription", href: "/register" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-sand-200 bg-wine-900 text-sand-100">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="rounded-xl bg-white/95 px-4 py-2 w-fit">
              <Logo />
            </div>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-sand-100/70">
              La plateforme qui accompagne les femmes entrepreneures à chaque étape : financement, business plan et mentorat.
            </p>
            <div className="mt-6 flex gap-3">
              {[Instagram, Facebook, Linkedin, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-sand-100/80 transition-colors hover:bg-rose-500 hover:border-rose-500 hover:text-white"
                  aria-label="social"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 font-display text-lg text-white">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-sm text-sand-100/70 transition-colors hover:text-rose-300"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-sand-100/50 sm:flex-row">
          <p>© {new Date().getFullYear()} Ellevadz — Elle s&apos;élève. Tous droits réservés.</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-sand-100">Confidentialité</a>
            <a href="#" className="hover:text-sand-100">Conditions</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
