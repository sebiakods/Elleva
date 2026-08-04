import Link from "next/link";
import {
  Landmark,
  Moon,
  Building2,
  Rocket,
  Search,
  FileText,
  Calculator,
  Users,
  ArrowRight,
  Sparkles,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/common/Reveal";
import { RiseStroke } from "@/components/common/RiseStroke";
import financing from "@/data/financing.json";
import testimonials from "@/data/testimonials.json";
import { FINANCING_CATEGORIES } from "@/lib/constants";
import { formatDZD } from "@/lib/utils";

const categoryIcons = { Landmark, Moon, Building2, Rocket };

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-rise-gradient-soft pb-24 pt-16 lg:pt-24">
        <div className="pointer-events-none absolute -right-32 top-10 h-96 w-96 rounded-full bg-rose-300/30 blur-3xl animate-float" />
        <div className="pointer-events-none absolute -left-24 top-60 h-72 w-72 rounded-full bg-wine-300/20 blur-3xl animate-float" style={{ animationDelay: "2s" }} />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2 lg:px-10">
          <div>
            <Badge tone="wine" className="mb-6">✦ Pensée pour les femmes entrepreneures</Badge>
            <h1 className="font-display text-4xl leading-tight text-ink sm:text-5xl lg:text-[3.4rem]">
              Trouvez le financement,
              <br />
              <span className="text-gradient-rise">elle s&apos;élève</span>{" "}
              <span className="font-script text-5xl text-wine-500 sm:text-6xl">avec son projet</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink-soft">
              Ellevadz réunit financement, business plan et mentorat dans une seule plateforme conçue pour faire grandir votre entreprise — à votre rythme.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button href="/register" size="lg">
                Démarrer gratuitement <ArrowRight size={18} />
              </Button>
              <Button href="/financing"  variant="outline" size="lg">
                Explorer les financements
              </Button>
            </div>

            <div className="mt-10 flex items-center gap-4">
              <RiseStroke className="h-10 w-32" />
              <span className="text-sm font-medium text-wine-500">+2 400 entrepreneures accompagnées</span>
            </div>
          </div>

          <Reveal delay={150} className="relative">
            <div className="card-surface shadow-bloom p-7">
              <p className="mb-4 text-sm font-semibold text-ink-soft">Simulateur rapide</p>
              <div className="space-y-4">
                <div className="rounded-xl border border-sand-200 p-4">
                  <p className="text-xs text-ink-soft">Montant souhaité</p>
                  <p className="font-display text-2xl text-ink">{formatDZD(2500000)}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-rose-50 p-4">
                    <p className="text-xs text-rose-600">Mensualité estimée</p>
                    <p className="font-display text-xl text-rose-700">{formatDZD(48500)}</p>
                  </div>
                  <div className="rounded-xl bg-wine-50 p-4">
                    <p className="text-xs text-wine-500">Programmes éligibles</p>
                    <p className="font-display text-xl text-wine-700">12</p>
                  </div>
                </div>
                <Button href="/calculators" variant="secondary" className="w-full">
                  Affiner ma simulation
                </Button>
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 hidden rounded-2xl bg-white p-4 shadow-bloom sm:flex items-center gap-3 animate-float">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rise-gradient text-white">
                <Sparkles size={18} />
              </div>
              <div>
                <p className="text-xs text-ink-soft">Business plan</p>
                <p className="text-sm font-semibold text-ink">82% complété</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* SEARCH FINANCING */}
      <section className="mx-auto -mt-10 max-w-5xl px-6 lg:px-10">
        <Reveal>
          <div className="card-surface shadow-bloom flex flex-col gap-3 p-3 sm:flex-row">
            <div className="flex flex-1 items-center gap-3 rounded-xl px-4 py-3">
              <Search size={18} className="text-ink-soft" />
              <input
                placeholder="Recherchez un programme, une banque, un secteur…"
                className="w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-soft/60"
              />
            </div>
            <Button size="md" className="sm:w-auto">Rechercher</Button>
          </div>
        </Reveal>
      </section>

      {/* POPULAR PROGRAMS */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <Reveal className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="font-script text-3xl text-rose-500">Programmes populaires</p>
            <h2 className="font-display text-3xl text-ink sm:text-4xl">Quatre voies de financement</h2>
          </div>
          <Button href="/financing"  variant="ghost">
            Voir tout l&apos;annuaire <ArrowRight size={16} />
          </Button>
        </Reveal>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FINANCING_CATEGORIES.map((cat, i) => {
            const Icon = categoryIcons[cat.icon as keyof typeof categoryIcons];
            return (
              <Reveal delay={i * 100} key={cat.slug}>
                <Card className="h-full">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-rise-gradient text-white">
                    <Icon size={22} />
                  </div>
                  <h3 className="mb-2 font-display text-xl text-ink">{cat.label}</h3>
                  <p className="text-sm leading-relaxed text-ink-soft">
                    {financing.filter((f) => f.category === cat.slug).length} programme(s) disponible(s) actuellement.
                  </p>
                  <Link href="/financing" className="underline-rise mt-4 inline-block text-sm font-semibold text-rose-600">
                    Découvrir →
                  </Link>
                </Card>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-wine-900 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal className="mb-14 max-w-xl">
            <p className="font-script text-3xl text-rose-300">Tout en un seul endroit</p>
            <h2 className="font-display text-3xl text-white sm:text-4xl">Des outils pensés pour chaque étape</h2>
          </Reveal>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: FileText, title: "Business Plan Builder", text: "Créez un business plan structuré, étape par étape, exportable en PDF." },
              { icon: Calculator, title: "Outils financiers", text: "ROI, seuil de rentabilité, simulateur de prêt et coût de démarrage." },
              { icon: Users, title: "Mentorat", text: "Échangez avec des mentores vérifiées pour affiner votre stratégie." },
            ].map((f, i) => (
              <Reveal delay={i * 120} key={f.title}>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-7 transition-colors hover:bg-white/10">
                  <f.icon className="mb-4 text-rose-300" size={26} />
                  <h3 className="mb-2 font-display text-xl text-white">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-sand-100/70">{f.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <Reveal className="mb-14 text-center">
          <p className="font-script text-3xl text-rose-500">Le parcours</p>
          <h2 className="font-display text-3xl text-ink sm:text-4xl">Comment ça marche</h2>
        </Reveal>

        <div className="relative grid gap-10 md:grid-cols-4">
          <div className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-rose-200 via-rose-400 to-wine-500 md:block" />
          {[
            { step: "Étape 1", title: "Créez votre profil", text: "Inscrivez-vous et décrivez votre projet en quelques minutes." },
            { step: "Étape 2", title: "Construisez votre plan", text: "Utilisez le Business Plan Builder guidé." },
            { step: "Étape 3", title: "Trouvez un financement", text: "Filtrez les programmes selon votre éligibilité." },
            { step: "Étape 4", title: "Élevez votre projet", text: "Soumettez votre dossier et suivez son avancement." },
          ].map((s, i) => (
            <Reveal delay={i * 120} key={s.step} className="relative text-center md:text-left">
              <div className="relative z-10 mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rise-gradient font-display text-lg text-white shadow-bloom md:mx-0">
                {i + 1}
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-rose-500">{s.step}</p>
              <h3 className="mt-1 font-display text-lg text-ink">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* STATISTICS */}
      <section className="bg-rise-gradient py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 text-center text-white sm:grid-cols-3 lg:px-10">
          {[
            { icon: Users, value: "2 400+", label: "Entrepreneures accompagnées" },
            { icon: TrendingUp, value: "1.2 Md DA", label: "Financements facilités" },
            { icon: ShieldCheck, value: "94%", label: "Taux de satisfaction" },
          ].map((s) => (
            <Reveal key={s.label}>
              <s.icon className="mx-auto mb-3 opacity-80" size={26} />
              <p className="font-display text-4xl">{s.value}</p>
              <p className="mt-1 text-sm text-white/80">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <Reveal className="mb-14 text-center">
          <p className="font-script text-3xl text-rose-500">Elles témoignent</p>
          <h2 className="font-display text-3xl text-ink sm:text-4xl">Des parcours inspirants</h2>
        </Reveal>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal delay={i * 120} key={t.name}>
              <Card className="h-full">
                <p className="font-script text-4xl text-rose-300">&ldquo;</p>
                <p className="text-[15px] leading-relaxed text-ink-soft">{t.quote}</p>
                <div className="mt-5 border-t border-sand-100 pt-4">
                  <p className="font-semibold text-ink">{t.name}</p>
                  <p className="text-xs text-ink-soft">{t.role}</p>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      {/* PARTNERS */}
      <section className="border-y border-sand-200 bg-sand-50 py-14">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <p className="mb-8 text-center text-xs font-semibold uppercase tracking-widest text-ink-soft">
            Partenaires institutionnels
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-70">
            {["BNA", "Al Baraka", "ANADE", "Algeria Venture", "CNAC"].map((p) => (
              <span key={p} className="font-display text-xl text-ink-soft">{p}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <Reveal className="relative overflow-hidden rounded-3xl bg-rise-gradient p-12 text-center text-white sm:p-16">
          <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <h2 className="font-display text-3xl sm:text-4xl">Prête à faire élever votre projet ?</h2>
          <p className="mx-auto mt-4 max-w-md text-white/85">
            Rejoignez une communauté de femmes entrepreneures et accédez à des financements adaptés dès aujourd&apos;hui.
          </p>
          <Button href="/register" variant="secondary" size="lg" className="mt-8 bg-white text-rose-600 hover:bg-sand-50">
            Créer mon compte gratuit
          </Button>
        </Reveal>
      </section>
    </>
  );
}
