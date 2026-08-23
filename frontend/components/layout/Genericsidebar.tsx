"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as Icons from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { cn } from "@/lib/utils";
import authService from "@/services/auth";

type NavLink = {
  href: string;
  label: string;
  icon: string;
};

type SidebarTheme = "light" | "dark";

function DynamicIcon({
  name,
  size = 18,
}: {
  name: string;
  size?: number;
}) {
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
  const router = useRouter();

  const isDark = theme === "dark";

const handleLogout = async () => {
  console.log("🔴 LOGOUT BUTTON CLICKED");

  try {
    console.log("🟡 Calling authService.logout()...");

    await authService.logout();

    console.log("🟢 authService.logout() SUCCESS");
  } catch (error) {
    console.error("❌ handleLogout ERROR:", error);
  } finally {
    console.log("➡️ Redirecting to /login");
    router.replace("/login");
  }
};
  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen w-64 shrink-0 flex-col overflow-y-auto border-r p-5 lg:flex",
        isDark
          ? "border-white/10 bg-wine-900"
          : "border-sand-200 bg-white"
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "mb-8",
          isDark ? "w-fit rounded-xl bg-white/95 px-4 py-2" : "px-1"
        )}
      >
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
      <button
        type="button"
        onClick={handleLogout}
        className={cn(
          "mt-2 flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition-colors",
          isDark
            ? "text-white/70 hover:bg-white/10"
            : "text-ink-soft hover:bg-sand-50"
        )}
      >
        <DynamicIcon name="LogOut" />
        Déconnexion
      </button>
    </aside>
  );
}
