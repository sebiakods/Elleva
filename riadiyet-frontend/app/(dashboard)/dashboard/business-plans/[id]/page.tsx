import { Header } from "@/components/layout/Header";
import { BusinessPlanBuilder } from "@/components/business-plan/BusinessPlanBuilder";

export default async function EditBusinessPlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <>
      <Header title={`Modifier le plan #${id}`} />
      <BusinessPlanBuilder initialTitle="Atelier Lumière — Bougies artisanales" />
    </>
  );
}
