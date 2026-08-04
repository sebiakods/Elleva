import { Header } from "@/components/layout/Header";
import { BusinessPlanBuilder } from "@/components/business-plan/BusinessPlanBuilder";

export default function NewBusinessPlanPage() {
  return (
    <>
      <Header title="Nouveau business plan" />
      <BusinessPlanBuilder />
    </>
  );
}
