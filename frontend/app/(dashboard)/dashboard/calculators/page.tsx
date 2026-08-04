import { Header } from "@/components/layout/Header";
import { Table } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";

const history = [
  { tool: "Simulateur de prêt", date: "28 juin 2026", result: "48 500 DA / mois" },
  { tool: "Seuil de rentabilité", date: "22 juin 2026", result: "260 unités" },
  { tool: "ROI", date: "15 juin 2026", result: "35%" },
];

export default function CalculatorsHistoryPage() {
  return (
    <>
      <Header title="Historique des calculateurs" />
      <Table
        columns={["Outil", "Date", "Résultat"]}
        rows={history.map((h) => [
          <span key="t" className="font-medium">{h.tool}</span>,
          h.date,
          <Badge key="r" tone="rose">{h.result}</Badge>,
        ])}
      />
    </>
  );
}
