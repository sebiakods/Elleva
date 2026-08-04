import { FileText, Calculator, Users, Search, Bell, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/common/Reveal";

const features = [
  { icon: Search, title: "Annuaire de financement", text: "Recherchez et filtrez les programmes par type, montant et secteur." },
  { icon: FileText, title: "Business Plan Builder", text: "Un assistant guidé pour structurer votre plan d'affaires." },
  { icon: Calculator, title: "Outils financiers", text: "ROI, seuil de rentabilité, prêt et coût de démarrage en un clic." },
  { icon: Users, title: "Mentorat", text: "Échangez avec des mentores vérifiées et obtenez des retours concrets." },
  { icon: Bell, title: "Notifications", text: "Suivez l'avancement de vos candidatures et de vos plans en temps réel." },
  { icon: ShieldCheck, title: "Sécurité", text: "Vos données sont chiffrées et protégées à chaque étape." },
];

export default function FeaturesPage() {
  return (
    <div className="bg-sand-50">
      <section className="bg-rise-gradient-soft px-6 py-20 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="font-script text-3xl text-rose-500">Fonctionnalités</p>
            <h1 className="font-display text-4xl text-ink">Tout ce qu&apos;il faut pour avancer</h1>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20 lg:px-10">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Reveal delay={i * 80} key={f.title} className="card-surface p-7 shadow-card">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rise-gradient text-white">
                <f.icon size={20} />
              </div>
              <h3 className="mb-2 font-display text-lg text-ink">{f.title}</h3>
              <p className="text-sm leading-relaxed text-ink-soft">{f.text}</p>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
