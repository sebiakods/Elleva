import { Mail, Phone, MapPin } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/common/Reveal";

export default function ContactPage() {
  return (
    <div className="bg-sand-50">
      <section className="bg-rise-gradient-soft px-6 py-16 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="font-script text-3xl text-rose-500">Restons en contact</p>
            <h1 className="font-display text-4xl text-ink">Contactez l&apos;équipe Ellevadz</h1>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[1fr_1.2fr] lg:px-10">
        <Reveal className="space-y-6">
          {[
            { icon: Mail, label: "contact@ellevadz.dz" },
            { icon: Phone, label: "+213 (0) 21 00 00 00" },
            { icon: MapPin, label: "Alger, Algérie" },
          ].map((c) => (
            <div key={c.label} className="flex items-center gap-4 card-surface p-4 shadow-card">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-rise-gradient text-white">
                <c.icon size={18} />
              </span>
              <span className="text-sm font-medium text-ink">{c.label}</span>
            </div>
          ))}
          <div className="card-surface h-56 overflow-hidden shadow-card">
            <iframe
              title="Carte"
              className="h-full w-full grayscale"
              loading="lazy"
              src="https://maps.google.com/maps?q=Algiers&t=&z=12&ie=UTF8&iwloc=&output=embed"
            />
          </div>
        </Reveal>

        <Reveal delay={120} className="card-surface space-y-4 p-8 shadow-card">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Nom complet" placeholder="Votre nom" />
            <Input label="Email" type="email" placeholder="vous@email.com" />
          </div>
          <Input label="Sujet" placeholder="Sujet de votre message" />
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink-soft">Message</span>
            <textarea
              rows={5}
              placeholder="Votre message…"
              className="w-full rounded-xl border border-sand-200 bg-white px-4 py-3 text-[15px] outline-none focus-ring focus:border-rose-400"
            />
          </label>
          <Button className="w-full" size="lg">
            Envoyer le message
          </Button>
        </Reveal>
      </section>
    </div>
  );
}
