import { notFound } from "next/navigation";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/common/Reveal";
import articles from "@/data/articles.json";

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = articles.find((a) => a.slug === slug);
  if (!article) return notFound();

  return (
    <article className="bg-sand-50">
      <section className="bg-rise-gradient-soft px-6 py-16 lg:px-10">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <Badge tone="rose">{article.category}</Badge>
            <h1 className="mt-4 font-display text-4xl text-ink">{article.title}</h1>
            <div className="mt-4 flex items-center gap-2 text-sm text-ink-soft">
              <Clock size={14} /> {article.readTime} · {article.date}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16 lg:px-10">
        <Reveal className="card-surface space-y-5 p-8 shadow-card text-[15px] leading-relaxed text-ink-soft">
          <p>{article.excerpt}</p>
          <p>
            Ce guide pratique vous accompagne pas à pas. Adaptez chaque recommandation à la réalité de votre secteur et n&apos;hésitez pas à solliciter une mentore Ellevadz pour valider votre approche.
          </p>
          <p>
            Pensez à documenter vos hypothèses dans votre Business Plan Builder afin de garder une trace cohérente de vos décisions financières.
          </p>
        </Reveal>
      </section>
    </article>
  );
}
