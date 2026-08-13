import { Header } from "@/components/layout/Header";
import { Preview } from "@/components/business-plan/Preview";

export default async function BusinessPlanPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <>
      <Header title="Aperçu du plan" />
      <Preview planId={id} />
    </>
  );
}