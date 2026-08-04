import Image from "next/image";
import { cn } from "@/lib/utils";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

const sizes: Record<AvatarSize, { outer: string; text: string }> = {
  xs: { outer: "h-7 w-7", text: "text-xs" },
  sm: { outer: "h-9 w-9", text: "text-sm" },
  md: { outer: "h-11 w-11", text: "text-sm" },
  lg: { outer: "h-16 w-16", text: "text-lg" },
  xl: { outer: "h-20 w-20", text: "text-2xl" },
};

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");
}

export function Avatar({
  name,
  src,
  size = "md",
  className,
}: {
  name: string;
  src?: string;
  size?: AvatarSize;
  className?: string;
}) {
  const s = sizes[size];
  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-full",
        s.outer,
        className
      )}
      aria-label={name}
      title={name}
    >
      {src ? (
        <Image src={src} alt={name} fill className="object-cover" sizes="80px" />
      ) : (
        <div
          className={cn(
            "flex h-full w-full items-center justify-center bg-rise-gradient font-semibold text-white",
            s.text
          )}
        >
          {initials(name)}
        </div>
      )}
    </div>
  );
}