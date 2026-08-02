import { Header } from "@/components/layout/Header";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

function Toggle({ label }: { label: string }) {
  return (
    <label className="flex items-center justify-between py-3">
      <span className="text-sm text-ink">{label}</span>
      <span className="relative inline-flex h-6 w-11 items-center rounded-full bg-rose-200 transition-colors">
        <input type="checkbox" className="peer sr-only" defaultChecked />
        <span className="inline-block h-[18px] w-[18px] translate-x-1 rounded-full bg-white transition-transform peer-checked:translate-x-6" />
      </span>
    </label>
  );
}

export default function SettingsPage() {
  return (
    <>
      <Header title="Paramètres" />
      <div className="grid max-w-3xl gap-6">
        <div className="card-surface p-7 shadow-card">
          <h3 className="mb-4 font-display text-lg text-ink">Langue & affichage</h3>
          <Select label="Langue de la plateforme" defaultValue="fr">
            <option value="ar">العربية</option>
            <option value="fr">Français</option>
            <option value="en">English</option>
          </Select>
        </div>

        <div className="card-surface p-7 shadow-card">
          <h3 className="mb-2 font-display text-lg text-ink">Sécurité</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Mot de passe actuel" type="password" />
            <Input label="Nouveau mot de passe" type="password" />
          </div>
          <Button className="mt-5" variant="secondary">Mettre à jour le mot de passe</Button>
        </div>

        <div className="card-surface p-7 shadow-card divide-y divide-sand-100">
          <h3 className="mb-2 font-display text-lg text-ink">Notifications</h3>
          <Toggle label="Notifications par email" />
          <Toggle label="Notifications de financement" />
          <Toggle label="Messages des mentores" />
        </div>
      </div>
    </>
  );
}
