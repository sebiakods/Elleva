import Link from "next/link";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/common/Reveal";
import articles from "@/data/articles.json";

export default function ResourcesPage() {
  return (
    <div className="bg-sand-50">
      <section className="bg-rise-gradient-soft px-6 py-16 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <p className="font-script text-3xl text-rose-500">Centre de ressources</p>
            <h1 className="font-display text-4xl text-ink">Articles & guides</h1>
            <p className="mt-3 max-w-xl text-ink-soft">
              Des contenus pratiques pour avancer dans votre projet entrepreneurial.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="grid gap-6 md:grid-cols-3">
          {articles.map((a, i) => (
            <Reveal delay={i * 100} key={a.slug}>
              <Link href={`/article/${a.slug}`}>
                <Card className="h-full">
                  <Badge tone="rose">{a.category}</Badge>
                  <h3 className="mt-3 mb-2 font-display text-xl text-ink">{a.title}</h3>
                  <p className="text-sm leading-relaxed text-ink-soft">{a.excerpt}</p>
                  <div className="mt-5 flex items-center gap-2 text-xs text-ink-soft">
                    <Clock size={14} /> {a.readTime} · {a.date}
                  </div>
                </Card>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}

