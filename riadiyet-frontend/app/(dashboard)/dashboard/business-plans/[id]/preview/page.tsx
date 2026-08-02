import { Download, Share2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Preview } from "@/components/business-plan/Preview";

export default async function BusinessPlanPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await params;
  return (
    <>
      <Header title="Aperçu du plan" />
      <div className="mb-6 flex justify-end gap-3">
        <Button variant="outline">
          <Share2 size={16} /> Partager
        </Button>
        <Button>
          <Download size={16} /> Télécharger en PDF
        </Button>
      </div>
      <Preview title="Atelier Lumière — Bougies artisanales" />
    </>
  );
}
