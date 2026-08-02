"use client";
import { useState } from "react";
import { HelpCircle, ThumbsUp, Search, CheckCircle2, Clock } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { Tabs } from "@/components/ui/Tabs";
import { Reveal } from "@/components/common/Reveal";

const QUESTIONS = [
  { id:"1", question:"Quelle est la différence entre ANADE et ANSEJ pour une jeune de 28 ans ?", askedBy:"Amina K.", category:"Financement", votes:12, answered:false, askedAt:"Il y a 1h" },
  { id:"2", question:"Comment calculer mon seuil de rentabilité si j'ai des coûts variables saisonniers ?", askedBy:"Yasmine B.", category:"Finance", votes:8, answered:false, askedAt:"Il y a 3h" },
  { id:"3", question:"Puis-je bénéficier d'un financement islamique si j'ai déjà un prêt bancaire ?", askedBy:"Lina T.", category:"Financement", votes:5, answered:true, askedAt:"Hier", answer:"Oui, c'est possible sous certaines conditions. La finance islamique et les prêts bancaires conventionnels peuvent coexister tant que votre taux d'endettement global reste dans les limites fixées par les établissements." },
];

function QuestionCard({ q }: { q: typeof QUESTIONS[0] }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <Reveal>
      <div className="card-surface p-5 shadow-card">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge tone="rose">{q.category}</Badge>
          {q.answered
            ? <Badge tone="wine"><CheckCircle2 size={11} className="mr-1"/>Répondu</Badge>
            : <Badge tone="gold"><Clock size={11} className="mr-1"/>En attente</Badge>
          }
        </div>
        <h3 className="mb-2 font-display text-base text-ink leading-snug">{q.question}</h3>
        <div className="mb-3 flex items-center gap-3 text-xs text-ink-soft">
          <span>Posé par {q.askedBy}</span>
          <span>{q.askedAt}</span>
          <span className="flex items-center gap-1"><ThumbsUp size={11}/>{q.votes}</span>
        </div>

        {q.answered && q.answer && (
          <div className="mb-3 rounded-xl bg-rose-50 p-4 text-sm text-ink-soft border border-rose-100">
            <p className="font-semibold text-rose-600 mb-1 text-xs">Votre réponse</p>
            {q.answer}
          </div>
        )}

        {!q.answered && (
          <>
            {!expanded ? (
              <Button onClick={() => setExpanded(true)} size="sm" className="w-full">
                Répondre à cette question
              </Button>
            ) : (
              <div className="space-y-3">
                <textarea rows={4} placeholder="Votre réponse experte…"
                  className="w-full rounded-xl border border-sand-200 bg-white px-4 py-3 text-sm outline-none focus-ring focus:border-rose-400" />
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1">Publier la réponse</Button>
                  <Button variant="ghost" size="sm" onClick={() => setExpanded(false)}>Annuler</Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Reveal>
  );
}

export default function ExpertQAPage() {
  const [search, setSearch] = useState("");
  const filter = (answered: boolean) =>
    QUESTIONS.filter(q => q.answered === answered &&
      q.question.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <>
      <Header title="Questions & Réponses" />
      <div className="mb-6 flex items-center gap-2 rounded-full border border-sand-200 bg-white px-4 py-2 w-full max-w-xs">
        <Search size={15} className="text-ink-soft" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher une question…"
          className="bg-transparent text-sm outline-none placeholder:text-ink-soft/60 w-full" />
      </div>
      <Tabs tabs={[
        { label:`En attente (${filter(false).length})`, content:
          filter(false).length === 0
            ? <div className="card-surface shadow-card"><EmptyState icon={HelpCircle} title="Aucune question en attente" description="Toutes les questions ont été répondues. Excellent travail !" /></div>
            : <div className="space-y-4">{filter(false).map(q => <QuestionCard key={q.id} q={q}/>)}</div>
        },
        { label:`Répondues (${filter(true).length})`, content:
          <div className="space-y-4">{filter(true).map(q => <QuestionCard key={q.id} q={q}/>)}</div>
        },
      ]}/>
    </>
  );
}