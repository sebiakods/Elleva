import { Header } from "@/components/layout/Header";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

export default function AdminSettingsPage() {
  return (
    <>
      <Header title="Paramètres du site" />
      <div className="grid max-w-3xl gap-6">
        <div className="card-surface p-7 shadow-card">
          <h3 className="mb-5 font-display text-lg text-ink">Général</h3>
          <div className="grid gap-5 sm:grid-cols-2">
            <Input label="Nom du site" defaultValue="Ellevadz" />
            <Input label="Email de contact" defaultValue="contact@ellevadz.dz" />
            <Select label="Langue par défaut" defaultValue="fr">
              <option value="ar">العربية</option>
              <option value="fr">Français</option>
              <option value="en">English</option>
            </Select>
            <Input label="URL du site" defaultValue="https://ellevadz.dz" />
          </div>
          <Button className="mt-5">Sauvegarder</Button>
        </div>

        <div className="card-surface p-7 shadow-card">
          <h3 className="mb-5 font-display text-lg text-ink">Sécurité & maintenance</h3>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline">Exporter les données</Button>
            <Button variant="secondary">Sauvegarder la base</Button>
            <Button variant="ghost" className="text-rose-600">Vider le cache</Button>
          </div>
        </div>
      </div>
    </>
  );
}
