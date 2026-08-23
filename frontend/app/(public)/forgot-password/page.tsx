import Link from "next/link";
import { AuthShell } from "@/components/forms/AuthShell";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function ForgotPasswordPage() {
  return (
    <AuthShell title="Mot de passe oublié" subtitle="Recevez un lien de réinitialisation par email.">
      <form className="space-y-4">
        <Input label="Email" type="email" placeholder="vous@email.com" />
        <Button type="submit" className="w-full" size="lg">
          Envoyer le lien
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-soft">
        <Link href="/login" className="font-semibold text-rose-600 hover:underline">
          Retour à la connexion
        </Link>
      </p>
    </AuthShell>
  );
}

