import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  href?: string;
  className?: string;
  type?: "button" | "submit";
  onClick?: () => void;
};

const variants = {
  primary:
    "bg-rise-gradient text-white shadow-bloom hover:brightness-110 hover:-translate-y-0.5",
  secondary: "bg-wine-50 text-wine-700 hover:bg-wine-100",
  ghost: "bg-transparent text-ink hover:bg-sand-100",
  outline: "border border-rose-300 text-rose-600 hover:bg-rose-50",
};

const sizes = {
  sm: "text-sm px-4 py-2",
  md: "text-[15px] px-6 py-3",
  lg: "text-base px-8 py-4",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  href,
  className,
  type = "button",
  onClick,
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-300 focus-ring",
    variants[variant],
    sizes[size],
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
