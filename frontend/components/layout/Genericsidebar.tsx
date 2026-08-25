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

  const handleNavigation = () => {
    setMobileOpen(false);
  };

  return (
    <>
      {/* ================================================================ */}
      {/* MOBILE TOP BAR                                                   */}
      {/* ================================================================ */}

      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between border-b px-4 lg:hidden",
          isDark
            ? "border-white/10 bg-wine-900"
            : "border-sand-200 bg-white"
        )}
      >
        <div
          className={cn(
            "rounded-lg",
            isDark ? "bg-white/95 px-3 py-1.5" : ""
          )}
        >
          <Logo />
        </div>

        <button
          type="button"
          aria-label={
            mobileOpen
              ? "Fermer le menu"
              : "Ouvrir le menu"
          }
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((open) => !open)}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
            isDark
              ? "text-white hover:bg-white/10"
              : "text-ink-soft hover:bg-sand-50"
          )}
        >
          {mobileOpen ? (
            <Icons.X size={24} />
          ) : (
            <Icons.Menu size={24} />
          )}
        </button>
      </header>

      {/* ================================================================ */}
      {/* MOBILE OVERLAY                                                    */}
      {/* ================================================================ */}

      {mobileOpen && (
        <button
          type="button"
          aria-label="Fermer le menu"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      {/* ================================================================ */}
      {/* SIDEBAR                                                           */}
      {/* ================================================================ */}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen w-64 shrink-0 flex-col overflow-y-auto border-r p-5 transition-transform duration-300 lg:sticky lg:z-auto lg:translate-x-0",
          isDark
            ? "border-white/10 bg-wine-900"
            : "border-sand-200 bg-white",

          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full",

          "lg:flex"
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            "mb-8 flex items-center justify-between",
            isDark
              ? "w-fit rounded-xl bg-white/95 px-4 py-2"
              : "px-1"
          )}
        >
          <Logo />

          {/* Mobile close button */}
          <button
            type="button"
            aria-label="Fermer le menu"
            onClick={() => setMobileOpen(false)}
            className={cn(
              "ml-4 flex h-9 w-9 items-center justify-center rounded-lg lg:hidden",
              isDark
                ? "text-wine-900 hover:bg-sand-100"
                : "text-ink-soft hover:bg-sand-50"
            )}
          >
            <Icons.X size={20} />
          </button>
        </div>

        {/* Section label */}
        {sectionLabel && (
          <p
            className={cn(
              "mb-2 px-2 text-xs font-semibold uppercase tracking-wider",
              isDark
                ? "text-white/40"
                : "text-ink-soft/60"
            )}
          >
            {sectionLabel}
          </p>
        )}

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {links.map((l) => {
            const isRoot =
              l.href.split("/").filter(Boolean).length === 1;

            const active = isRoot
              ? pathname === l.href
              : pathname === l.href ||
                pathname.startsWith(l.href + "/");

            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={handleNavigation}
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
    </>
  );
}