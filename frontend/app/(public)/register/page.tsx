"use client";

import Link from "next/link";
import { useState } from "react";
import { GraduationCap, Building2 } from "lucide-react";

import { AuthShell } from "@/components/forms/AuthShell";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

import { cn } from "@/lib/utils";
import authService from "@/services/auth";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      await authService.register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: "ENTREPRENEUR",
      });

      window.location.href = "/login";
    } catch (err: any) {
      console.error("Register error:", err);

      setError(
        err?.message || "Une erreur est survenue."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Créez votre compte"
      subtitle="Rejoignez la plateforme Ellevadz."
    >
      <form
        className="space-y-4"
        onSubmit={handleSubmit}
      >
        <Input
          label="Nom complet"
          placeholder="Votre nom"
          value={form.name}
          onChange={handleChange("name")}
          required
        />

        <Input
          label="Email"
          type="email"
          placeholder="vous@email.com"
          value={form.email}
          onChange={handleChange("email")}
          required
        />

        <Input
          label="Mot de passe"
          type="password"
          placeholder="••••••••"
          value={form.password}
          onChange={handleChange("password")}
          required
        />

        {error && (
          <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          className={cn(
            "w-full",
            loading && "pointer-events-none opacity-60"
          )}
        >
          {loading ? "Création..." : "Créer mon compte"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        Déjà inscrite ?{" "}
        <Link
          href="/login"
          className="font-semibold text-rose-600 hover:underline"
        >
          Se connecter
        </Link>
      </p>

      <div className="mt-8 rounded-2xl border border-sand-200 bg-sand-50 p-5">
        <h3 className="text-center text-base font-semibold text-ink">
          Vous souhaitez un compte professionnel ?
        </h3>

        <p className="mt-1 text-center text-sm text-ink-soft">
          Les comptes Experte et Institution sont
          soumis à une validation par notre équipe.
        </p>

        <div className="mt-5 space-y-3">
          <Link
            href="/apply/expert"
            className="flex items-center gap-4 rounded-xl border border-sand-200 bg-white p-4 transition hover:border-rose-300 hover:bg-rose-50"
          >
            <div className="rounded-full bg-rose-100 p-3">
              <GraduationCap
                size={22}
                className="text-rose-600"
              />
            </div>

            <div className="flex-1">
              <p className="font-semibold text-ink">
                Devenir Experte
              </p>

              <p className="text-sm text-ink-soft">
                Rejoignez notre réseau de mentores et
                accompagnez les entrepreneures.
              </p>
            </div>
          </Link>

          <Link
            href="/apply/institution"
            className="flex items-center gap-4 rounded-xl border border-sand-200 bg-white p-4 transition hover:border-rose-300 hover:bg-rose-50"
          >
            <div className="rounded-full bg-rose-100 p-3">
              <Building2
                size={22}
                className="text-rose-600"
              />
            </div>

            <div className="flex-1">
              <p className="font-semibold text-ink">
                Enregistrer une Institution
              </p>

              <p className="text-sm text-ink-soft">
                Publiez vos programmes de financement
                et accompagnez les entrepreneures.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}
