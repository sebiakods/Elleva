"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function FaqAccordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={item.q} className="card-surface overflow-hidden shadow-card">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between p-5 text-left focus-ring"
          >
            <span className="font-display text-lg text-ink">{item.q}</span>
            <ChevronDown
              className={cn("shrink-0 text-rose-500 transition-transform", open === i && "rotate-180")}
              size={20}
            />
          </button>
          <div
            className={cn(
              "grid transition-all duration-300",
              open === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            )}
          >
            <div className="overflow-hidden">
              <p className="px-5 pb-5 text-sm leading-relaxed text-ink-soft">{item.a}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

