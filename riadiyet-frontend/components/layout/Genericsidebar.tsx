"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Icons from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { cn } from "@/lib/utils";

type NavLink = {
  href: string;
  label: string;
  icon: string; // lucide icon name
};

type SidebarTheme = "light" | "dark";

function DynamicIcon({ name, size = 18 }: { name: string; size?: number }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Icon = (Icons as any)[name] as Icons.LucideIcon | undefined;
  if (!Icon) return null;
  return <Icon size={size} />;
}

export function GenericSidebar({
  links,
  theme = "light",
  sectionLabel,
}: {
  links: NavLink[];
  theme?: SidebarTheme;
  sectionLabel?: string;
}) {
  const pathname = usePathname();
  const isDark = theme === "dark";

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen w-64 shrink-0 flex-col p-5 lg:flex overflow-y-auto",
        isDark
          ? "border-r border-white/10 bg-wine-900"
          : "border-r border-sand-200 bg-white"
      )}
    >
      {/* Logo */}
      <div className={cn("mb-8", isDark ? "rounded-xl bg-white/95 px-4 py-2 w-fit" : "px-1")}>
        <Logo />
      </div>

      {/* Section label */}
      {sectionLabel && (
        <p
          className={cn(
            "mb-2 px-2 text-xs font-semibold uppercase tracking-wider",
            isDark ? "text-white/40" : "text-ink-soft/60"
          )}
        >
          {sectionLabel}
        </p>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {links.map((l) => {
          // Active: exact match OR starts-with for nested routes (but not root)
          const isRoot = l.href.split("/").filter(Boolean).length === 1;
          const active = isRoot
            ? pathname === l.href
            : pathname === l.href || pathname.startsWith(l.href + "/");

          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-rise-gradient text-white shadow-bloom"
                  : isDark
                  ? "text-white/70 hover:bg-white/10"
                  : "text-ink-soft hover:bg-sand-50"
              )}
            >
              <DynamicIcon name={l.icon} />
              {l.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <Link
        href="/login"
        className={cn(
          "mt-2 flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
          isDark ? "text-white/70 hover:bg-white/10" : "text-ink-soft hover:bg-sand-50"
        )}
      >
        <DynamicIcon name="LogOut" />
        Déconnexion
      </Link>
    </aside>
  );
}