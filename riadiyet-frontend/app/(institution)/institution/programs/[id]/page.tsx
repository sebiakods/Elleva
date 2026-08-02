"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  FileText,
  Globe,
  Landmark,
  Mail,
  Pencil,
  Phone,
  Users,
} from "lucide-react";

import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function ProgramDetailsPage() {
  const { id } = useParams();

  // Temporary data
  // Later replace with API call:
  // GET /api/institution/programs/:id
  const program = {
    id,
    title: "Programme Innovation Femmes 2026",
    status: "Publié",
    category: "Subvention",
    fundingType: "Subvention",
    minAmount: "200 000",
    maxAmount: "1 000 000",
    currency: "DZD",
    openingDate: "01/09/2026",
    closingDate: "30/09/2026",
    region: "Algérie",

    description:
      "Ce programme accompagne les femmes entrepreneures dans le développement de leurs projets innovants grâce à un financement adapté et un accompagnement spécialisé.",

    targetAudience:
      "Femmes entrepreneures, startups innovantes, PME.",

    eligibility: [
      "Entreprise enregistrée",
      "Projet innovant",
      "Activité depuis au moins 6 mois",
      "Résider en Algérie",
    ],

    documents: [
      "Business Plan",
      "Registre de commerce",
      "Carte d'identité",
      "Prévisions financières",
    ],

    website: "https://institution.dz",
    email: "contact@institution.dz",
    phone: "+213 555 00 00 00",

    applications: 46,
  };

  return (
    <>
      <Header title="Programme de financement" />

      <div className="mx-auto max-w-7xl space-y-8">

        {/* Header */}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div>

            <Link href="/institution/programs">
              <Button variant="outline">
                <ArrowLeft size={18} />
                Retour
              </Button>
            </Link>

            <div className="mt-6 flex items-center gap-3">

              <h1 className="font-display text-4xl text-ink">
                {program.title}
              </h1>

              <Badge tone="rose">{program.status}</Badge>

            </div>

            <p className="mt-3 text-ink-soft">
              Consultez les informations de votre programme de financement.
            </p>

          </div>

          <Link href={`/institution/programs/${program.id}/edit`}>
            <Button>
              <Pencil size={18} />
              Modifier
            </Button>
          </Link>

        </div>

        {/* Info */}

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

          <Card hover={false}>
            <div className="flex items-center gap-3">
              <Landmark className="text-rose-600" />
              <div>
                <p className="text-sm text-ink-soft">Catégorie</p>
                <h3 className="font-semibold">{program.category}</h3>
              </div>
            </div>
          </Card>

          <Card hover={false}>
            <div className="flex items-center gap-3">
              <DollarSign className="text-green-600" />
              <div>
                <p className="text-sm text-ink-soft">Montant</p>
                <h3 className="font-semibold">
                  {program.minAmount} - {program.maxAmount} {program.currency}
                </h3>
              </div>
            </div>
          </Card>

          <Card hover={false}>
            <div className="flex items-center gap-3">
              <Users className="text-blue-600" />
              <div>
                <p className="text-sm text-ink-soft">Candidatures</p>
                <h3 className="font-semibold">
                  {program.applications}
                </h3>
              </div>
            </div>
          </Card>

          <Card hover={false}>
            <div className="flex items-center gap-3">
              <Calendar className="text-amber-600" />
              <div>
                <p className="text-sm text-ink-soft">
                  Clôture
                </p>
                <h3 className="font-semibold">
                  {program.closingDate}
                </h3>
              </div>
            </div>
          </Card>

        </div>

        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">

          {/* Left */}

          <div className="space-y-6">

            <Card hover={false}>
              <h2 className="mb-4 text-2xl font-display">
                Description
              </h2>

              <p className="leading-7 text-ink-soft">
                {program.description}
              </p>
            </Card>

            <Card hover={false}>
              <h2 className="mb-4 text-2xl font-display">
                Public cible
              </h2>

              <p className="leading-7 text-ink-soft">
                {program.targetAudience}
              </p>
            </Card>

            <Card hover={false}>
              <h2 className="mb-4 text-2xl font-display">
                Critères d'éligibilité
              </h2>

              <ul className="space-y-3">
                {program.eligibility.map((item) => (
                  <li
                    key={item}
                    className="rounded-xl border border-sand-200 bg-sand-50 p-4"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </Card>

            <Card hover={false}>
              <h2 className="mb-4 flex items-center gap-2 text-2xl font-display">
                <FileText size={22} />
                Documents requis
              </h2>

              <ul className="space-y-3">
                {program.documents.map((doc) => (
                  <li
                    key={doc}
                    className="rounded-xl border border-sand-200 bg-white p-4"
                  >
                    {doc}
                  </li>
                ))}
              </ul>
            </Card>

          </div>

          {/* Right */}

          <aside className="space-y-6">

            <Card hover={false}>

              <h2 className="mb-5 text-xl font-display">
                Informations
              </h2>

              <div className="space-y-4 text-sm">

                <div className="flex justify-between">
                  <span className="text-ink-soft">Type</span>
                  <span>{program.fundingType}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-ink-soft">Région</span>
                  <span>{program.region}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-ink-soft">Ouverture</span>
                  <span>{program.openingDate}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-ink-soft">Clôture</span>
                  <span>{program.closingDate}</span>
                </div>

              </div>

            </Card>

            <Card hover={false}>

              <h2 className="mb-5 text-xl font-display">
                Contact
              </h2>

              <div className="space-y-4">

                <div className="flex items-center gap-3">
                  <Globe size={18} />
                  <span>{program.website}</span>
                </div>

                <div className="flex items-center gap-3">
                  <Mail size={18} />
                  <span>{program.email}</span>
                </div>

                <div className="flex items-center gap-3">
                  <Phone size={18} />
                  <span>{program.phone}</span>
                </div>

              </div>

            </Card>

          </aside>

        </div>

      </div>
    </>
  );
}