import { Heart, Target, Sparkles } from "lucide-react";
import { Reveal } from "@/components/common/Reveal";

export default function AboutPage() {
  return (
    <div className="bg-sand-50">
      <section className="bg-rise-gradient-soft px-6 py-20 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="font-script text-3xl text-rose-500">Notre mission</p>
            <h1 className="font-display text-4xl text-ink sm:text-5xl">
              Faire <span className="text-gradient-rise">élever</span> chaque entrepreneure
            </h1>
            <p className="mt-5 text-ink-soft leading-relaxed">
              Ellevadz est née d&apos;une conviction simple : les femmes entrepreneures méritent un accès clair et équitable au financement, à la formation et au mentorat.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20 lg:px-10">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: Heart, title: "Bienveillance", text: "Un accompagnement humain, à chaque étape du parcours entrepreneurial." },
            { icon: Target, title: "Clarté", text: "Des informations financières simplifiées, sans jargon inutile." },
            { icon: Sparkles, title: "Ambition", text: "Des outils professionnels pour transformer une idée en entreprise durable." },
          ].map((v, i) => (
            <Reveal delay={i * 100} key={v.title} className="card-surface p-8 text-center shadow-card">
              <v.icon className="mx-auto mb-4 text-rose-500" size={28} />
              <h3 className="mb-2 font-display text-xl text-ink">{v.title}</h3>
              <p className="text-sm leading-relaxed text-ink-soft">{v.text}</p>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}

