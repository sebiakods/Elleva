import { AuthShell } from "@/components/forms/AuthShell";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function ResetPasswordPage() {
  return (
    <AuthShell title="Nouveau mot de passe" subtitle="Choisissez un mot de passe sécurisé.">
      <form className="space-y-4">
        <Input label="Nouveau mot de passe" type="password" placeholder="••••••••" />
        <Input label="Confirmer le mot de passe" type="password" placeholder="••••••••" />
        <Button type="submit" className="w-full" size="lg">
          Réinitialiser
        </Button>
      </form>
    </AuthShell>
  );
}

