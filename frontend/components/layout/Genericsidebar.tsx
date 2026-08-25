"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as Icons from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { cn } from "@/lib/utils";
import authService from "@/services/auth";
import { useState } from "react";

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

  const [mobileOpen, setMobileOpen] = useState(false);

  const isDark = theme === "dark";

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      router.replace("/login");
    }
  };

  const isActive = (href: string) => {
    const isRoot = href.split("/").filter(Boolean).length === 1;

    return isRoot
      ? pathname === href
      : pathname === href || pathname.startsWith(href + "/");
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div
        className={cn(
          "mb-8",
          isDark
            ? "w-fit rounded-xl bg-white/95 px-4 py-2"
            : "px-1"
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
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
              isActive(l.href)
                ? "bg-rise-gradient text-white shadow-bloom"
                : isDark
                ? "text-white/70 hover:bg-white/10"
                : "text-ink-soft hover:bg-sand-50"
            )}
          >
            <DynamicIcon name={l.icon} />
            {l.label}
          </Link>
        ))}
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
    </>
  );

  return (
    <>
      {/* ================================================================ */}
      {/* DESKTOP SIDEBAR                                                   */}
      {/* ================================================================ */}

      <aside
        className={cn(
          "sticky top-0 flex h-screen w-64 shrink-0 flex-col overflow-y-auto border-r p-5",
          isDark
            ? "border-white/10 bg-wine-900"
            : "border-sand-200 bg-white"
        )}
      >
        {sidebarContent}
      </aside>

      {/* ================================================================ */}
      {/* MOBILE HEADER                                                     */}
      {/* ================================================================ */}

      <div
        className={cn(
          "fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between border-b px-4 lg:hidden",
          isDark
            ? "border-white/10 bg-wine-900"
            : "border-sand-200 bg-white"
        )}
      >
        <div
          className={cn(
            isDark
              ? "rounded-lg bg-white/95 px-3 py-1"
              : ""
          )}
        >
          <Logo />
        </div>

        <button
          type="button"
          aria-label="Ouvrir le menu"
          onClick={() => setMobileOpen(true)}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl",
            isDark
              ? "text-white hover:bg-white/10"
              : "text-ink-soft hover:bg-sand-50"
          )}
        >
          <Icons.Menu size={24} />
        </button>
      </div>

      {/* ================================================================ */}
      {/* MOBILE OVERLAY                                                    */}
      {/* ================================================================ */}

      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label={sectionLabel || "Navigation"}
        >
          {/* Overlay */}
          <button
            type="button"
            aria-label="Fermer le menu"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-black/50"
          />

          {/* Drawer */}
          <aside
            className={cn(
              "absolute left-0 top-0 flex h-full w-72 max-w-[85vw] flex-col overflow-y-auto border-r p-5 shadow-2xl",
              isDark
                ? "border-white/10 bg-wine-900"
                : "border-sand-200 bg-white"
            )}
          >
            {/* Close */}
            <div className="mb-5 flex items-center justify-between">
              <div
                className={cn(
                  isDark
                    ? "rounded-lg bg-white/95 px-3 py-1"
                    : ""
                )}
              >
                <Logo />
              </div>

              <button
                type="button"
                aria-label="Fermer le menu"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl",
                  isDark
                    ? "text-white hover:bg-white/10"
                    : "text-ink-soft hover:bg-sand-50"
                )}
              >
                <Icons.X size={22} />
              </button>
            </div>

            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}