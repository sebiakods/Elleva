import { cn } from "@/lib/utils";

const tones = {
  rose: "bg-rose-50 text-rose-600 border-rose-200",
  wine: "bg-wine-50 text-wine-500 border-wine-100",
  gold: "bg-amber-50 text-gold-500 border-amber-200",
  neutral: "bg-sand-100 text-ink-soft border-sand-200",
};

export function Badge({
  children,
  tone = "rose",
  className,
}: {
  children: React.ReactNode;
  tone?: keyof typeof tones;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-wide",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
