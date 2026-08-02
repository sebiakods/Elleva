"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

const DAYS = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];
const MONTHS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

const EVENTS: Record<number, { time:string; name:string; topic:string; tone:"rose"|"wine"|"gold" }[]> = {
  2:  [{ time:"15:00", name:"Amina K.", topic:"Plan financier", tone:"rose" }],
  4:  [{ time:"10:30", name:"Yasmine B.", topic:"Marketing digital", tone:"wine" }],
  8:  [{ time:"14:00", name:"Lina T.", topic:"Pitch investisseurs", tone:"gold" }],
  15: [{ time:"09:00", name:"Sara K.", topic:"Étude de marché", tone:"rose" }, { time:"11:30", name:"Nora M.", topic:"Finance islamique", tone:"wine" }],
};

export default function ExpertCalendarPage() {
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(6); // July (0-indexed)
  const [selectedDay, setSelectedDay] = useState<number | null>(2);

  const firstDow = new Date(year, month, 1).getDay();
  const offset = firstDow === 0 ? 6 : firstDow - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array.from({ length: offset + daysInMonth });

  const prev = () => { if (month === 0) { setMonth(11); setYear(y => y-1); } else setMonth(m => m-1); };
  const next = () => { if (month === 11) { setMonth(0); setYear(y => y+1); } else setMonth(m => m+1); };

  const dayEvents = selectedDay ? (EVENTS[selectedDay] ?? []) : [];

  return (
    <>
      <Header title="Calendrier" />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Calendar grid */}
        <div className="card-surface p-6 shadow-card">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-xl text-ink">{MONTHS[month]} {year}</h2>
            <div className="flex gap-2">
              <button onClick={prev} className="rounded-full p-2 hover:bg-sand-100 focus-ring transition-colors">
                <ChevronLeft size={18}/>
              </button>
              <button onClick={next} className="rounded-full p-2 hover:bg-sand-100 focus-ring transition-colors">
                <ChevronRight size={18}/>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {DAYS.map(d => <p key={d} className="text-xs font-semibold text-ink-soft py-1">{d}</p>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((_, idx) => {
              const day = idx - offset + 1;
              const valid = day > 0 && day <= daysInMonth;
              const hasEvent = valid && !!EVENTS[day];
              const isSelected = valid && selectedDay === day;
              const isToday = valid && day === 2;
              return (
                <button key={idx} disabled={!valid}
                  onClick={() => valid && setSelectedDay(day)}
                  className={cn(
                    "relative flex h-10 w-full items-center justify-center rounded-xl text-sm transition-all focus-ring",
                    !valid && "opacity-0 pointer-events-none",
                    isSelected && "bg-rise-gradient text-white font-semibold shadow-bloom",
                    !isSelected && isToday && "border-2 border-rose-400 text-rose-600 font-semibold",
                    !isSelected && !isToday && "hover:bg-sand-50 text-ink"
                  )}>
                  {valid && day}
                  {hasEvent && !isSelected && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-rose-500"/>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Day detail */}
        <div className="card-surface p-6 shadow-card">
          <h3 className="mb-4 font-display text-lg text-ink">
            {selectedDay ? `${selectedDay} ${MONTHS[month]}` : "Sélectionnez un jour"}
          </h3>
          {dayEvents.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <CalendarDays size={28} className="mb-3 text-sand-200"/>
              <p className="text-sm text-ink-soft">Aucune session ce jour</p>
              <Button size="sm" variant="secondary" className="mt-4">+ Ajouter une dispo</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {dayEvents.map((ev, i) => (
                <div key={i} className={cn(
                  "rounded-xl p-4 border-l-4",
                  ev.tone === "rose" && "bg-rose-50 border-rose-400",
                  ev.tone === "wine" && "bg-wine-50 border-wine-500",
                  ev.tone === "gold" && "bg-amber-50 border-gold-400",
                )}>
                  <p className="font-semibold text-sm text-ink">{ev.time} · {ev.name}</p>
                  <p className="text-xs text-ink-soft mt-0.5">{ev.topic}</p>
                  <Badge tone={ev.tone} className="mt-2">Session</Badge>
                </div>
              ))}
              <Button size="sm" variant="secondary" className="w-full mt-2">+ Ajouter une dispo</Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}