import { FaqAccordion } from "@/components/common/FaqAccordion";
import { Reveal } from "@/components/common/Reveal";
import faq from "@/data/faq.json";

export default function FaqPage() {
  return (
    <div className="bg-sand-50">
      <section className="bg-rise-gradient-soft px-6 py-16 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="font-script text-3xl text-rose-500">Besoin d&apos;aide ?</p>
            <h1 className="font-display text-4xl text-ink">Questions fréquentes</h1>
          </Reveal>
        </div>
      </section>
      <section className="mx-auto max-w-3xl px-6 py-16 lg:px-10">
        <Reveal>
          <FaqAccordion items={faq} />
        </Reveal>
      </section>
    </div>
  );
}
