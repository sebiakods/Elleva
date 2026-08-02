import { User } from "lucide-react";
import { PageShell } from "@/components/common/PageShell";

export default function ExpertProfilePage() {
  return (
    <PageShell
      title="Mon profil public"
      badge="Profil visible par les entrepreneures"
      icon={User}
      description="Modifiez votre présentation, vos spécialités, votre photo et vos liens. Ce profil est affiché dans l'annuaire public des expertes."
    />
  );
}