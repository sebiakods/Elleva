import { Star } from "lucide-react";
import { PageShell } from "@/components/common/PageShell";

export default function ExpertReviewsPage() {
  return (
    <PageShell
      title="Mes avis"
      badge="Réputation"
      icon={Star}
      description="Consultez les évaluations laissées par les entrepreneures après leurs sessions. Votre note globale et vos commentaires publics."
    />
  );
}