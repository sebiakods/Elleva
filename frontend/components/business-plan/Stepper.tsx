import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export function Stepper({
  steps,
  current,
}: {
  steps: string[];
  current: number;
}) {
  return (
    <div className="flex items-center">
      {steps.map((s, i) => (
        <div key={s} className="flex flex-1 items-center last:flex-none">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                i < current
                  ? "bg-rise-gradient text-white"
                  : i === current
                  ? "border-2 border-rose-500 text-rose-600"
                  : "border-2 border-sand-200 text-ink-soft"
              )}
            >
              {i < current ? <Check size={16} /> : i + 1}
            </div>
            <span className={cn("mt-2 hidden text-xs sm:block", i === current ? "text-ink font-semibold" : "text-ink-soft")}>
              {s}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={cn("mx-2 h-px flex-1", i < current ? "bg-rose-400" : "bg-sand-200")} />
          )}
        </div>
      ))}
    </div>
  );
}

