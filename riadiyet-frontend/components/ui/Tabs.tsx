"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Tabs({
  tabs,
}: {
  tabs: { label: string; content: React.ReactNode }[];
}) {
  const [active, setActive] = useState(0);
  return (
    <div>
      <div className="mb-6 flex gap-1 rounded-full bg-sand-100 p-1 w-fit">
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            onClick={() => setActive(i)}
            className={cn(
              "rounded-full px-5 py-2 text-sm font-semibold transition-all focus-ring",
              active === i ? "bg-white text-rose-600 shadow-card" : "text-ink-soft hover:text-ink"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div key={active} className="animate-rise">
        {tabs[active].content}
      </div>
    </div>
  );
}
