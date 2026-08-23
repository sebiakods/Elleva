import {
  Building2,
  Landmark,
  GraduationCap,
  BriefcaseBusiness,
  Globe2,
} from "lucide-react";

import { Reveal } from "@/components/common/Reveal";

const institutions = [
  {
    name: "Banque Nationale d'Algérie",
    type: "Banque",
    description:
      "Institution bancaire proposant des solutions de financement et d'accompagnement pour les entrepreneures et les entreprises.",
    services: [
      "Financement",
      "Crédits professionnels",
      "Accompagnement",
    ],
    icon: Landmark,
  },
  {
    name: "Agence Nationale d'Appui et de Développement de l'Entrepreneuriat",
    type: "Organisme public",
    description:
      "Organisme dédié à l'accompagnement des entrepreneurs et au développement de l'entrepreneuriat en Algérie.",
    services: [
      "Accompagnement",
      "Création d'entreprise",
      "Financement",
    ],
    icon: Building2,
  },
  {
    name: "Algerian Startup Fund",
    type: "Investisseur",
    description:
      "Fonds destiné à soutenir les startups et les projets innovants à fort potentiel de croissance.",
    services: [
      "Investissement",
      "Startups",
      "Innovation",
    ],
    icon: BriefcaseBusiness,
  },
  {
    name: "Algeria Venture",
    type: "Accompagnement & investissement",
    description:
      "Acteur de l'écosystème startup algérien proposant accompagnement, développement et mise en relation avec des partenaires.",
    services: [
      "Accompagnement",
      "Innovation",
      "Réseau",
    ],
    icon: Globe2,
  },
];

export default function InstitutionsDirectoryPage() {
  return (
    <div className="min-h-screen bg-sand-50">
      {/* Hero */}
      <section className="bg-rise-gradient-soft px-6 py-16 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <p className="font-script text-3xl text-rose-500">
              Partenaires financiers
            </p>

            <h1 className="font-display text-4xl text-ink sm:text-5xl">
              Annuaire des institutions
            </h1>

            <p className="mt-3 max-w-xl text-ink-soft">
              Banques, organismes publics, incubateurs et investisseurs
              partenaires d&apos;Ellevadz.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Institutions */}
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="mb-8">
          <h2 className="font-display text-2xl text-ink">
            Nos institutions partenaires
          </h2>

          <p className="mt-1 text-sm text-ink-soft">
            Découvrez les organismes qui accompagnent les entrepreneures.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {institutions.map((institution) => {
            const Icon = institution.icon;

            return (
              <article
                key={institution.name}
                className="card-surface overflow-hidden shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Header */}
                <div className="bg-rise-gradient-soft px-6 py-7">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm">
                      <Icon className="h-7 w-7 text-rose-500" />
                    </div>

                    <div>
                      <span className="inline-flex rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-rose-600">
                        {institution.type}
                      </span>

                      <h3 className="mt-2 font-display text-xl leading-tight text-ink">
                        {institution.name}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <p className="text-sm leading-6 text-ink-soft">
                    {institution.description}
                  </p>

                  <div className="mt-6">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
                      Services
                    </h4>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {institution.services.map((service) => (
                        <span
                          key={service}
                          className="rounded-full bg-sand-100 px-3 py-1.5 text-xs font-medium text-ink"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
