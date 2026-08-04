"use client";
import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({
  value,
  max = 5,
  interactive = false,
  size = 16,
  onChange,
  className,
}: {
  value: number;
  max?: number;
  interactive?: boolean;
  size?: number;
  onChange?: (v: number) => void;
  className?: string;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const display = hovered ?? value;

  return (
    <div
      className={cn("flex items-center gap-0.5", className)}
      aria-label={`Note : ${value} sur ${max}`}
      role={interactive ? "radiogroup" : undefined}
    >
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < display;
        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            aria-label={`${i + 1} étoile${i > 0 ? "s" : ""}`}
            onClick={() => interactive && onChange?.(i + 1)}
            onMouseEnter={() => interactive && setHovered(i + 1)}
            onMouseLeave={() => interactive && setHovered(null)}
            className={cn(
              "transition-transform",
              interactive && "cursor-pointer hover:scale-110",
              !interactive && "cursor-default"
            )}
          >
            <Star
              size={size}
              className={cn(
                "transition-colors",
                filled ? "fill-gold-400 text-gold-400" : "fill-sand-200 text-sand-200"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}