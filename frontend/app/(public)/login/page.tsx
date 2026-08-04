"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AuthShell } from "@/components/forms/AuthShell";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

import authService from "@/services/auth";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const user = await authService.login({
        email: email.trim(),
        password,
      });

      console.log("Logged user:", user);

      switch (user.role) {
        case "ADMIN":
          router.replace("/admin");
          return;

        case "EXPERT":
          router.replace("/expert");
          return;

        case "INSTITUTION":
          router.replace("/institution");
          return;

        case "ENTREPRENEUR":
          router.replace("/dashboard");
          return;

        default:
          console.error("Unknown role:", user.role);
          setError(`Rôle inconnu : ${user.role}`);
      }
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.message ??
          err?.message ??
          "Email ou mot de passe incorrect."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Bon retour parmi nous"
      subtitle="Connectez-vous pour continuer votre parcours."
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <Input
          label="Email"
          type="email"
          placeholder="vous@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          label="Mot de passe"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && (
          <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          size="lg"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </Button>

        <p className="text-center text-sm text-ink-soft">
          Pas encore de compte ?{" "}
          <Link
            href="/register"
            className="font-semibold text-rose-600 hover:underline"
          >
            Rejoindre Ellevadz
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}