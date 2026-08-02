"use client";

import {
  Settings,
  Bell,
  Shield,
  Globe,
  UserCog,
  Building2,
  Lock,
  Save,
} from "lucide-react";

import { PageShell } from "@/components/common/PageShell";

export default function InstitutionSettingsPage() {
  return (
    <div className="space-y-6">
      <PageShell
        title="Paramètres"
        badge="Configuration du compte"
        icon={Settings}
        description="Gérez les accès au compte institution, les notifications, les préférences de langue et la sécurité du compte."
      />

      <div className="space-y-6">

        {/* Account */}
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <UserCog className="h-5 w-5 text-purple-600" />
            <h2 className="text-lg font-semibold">
              Informations du compte
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm text-gray-600">
                Nom de l'institution
              </label>

              <input
                className="mt-2 w-full rounded-xl border px-4 py-3"
                defaultValue="Institution Demo"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">
                Email administrateur
              </label>

              <input
                className="mt-2 w-full rounded-xl border px-4 py-3"
                defaultValue="admin@institution.com"
              />
            </div>
          </div>
        </section>


        {/* Institution Profile */}
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <Building2 className="h-5 w-5 text-purple-600" />

            <h2 className="text-lg font-semibold">
              Profil institution
            </h2>
          </div>

          <textarea
            className="min-h-[120px] w-full rounded-xl border px-4 py-3"
            defaultValue="Organisation dédiée au financement et accompagnement des entrepreneures."
          />
        </section>


        {/* Notifications */}
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <Bell className="h-5 w-5 text-purple-600" />

            <h2 className="text-lg font-semibold">
              Notifications
            </h2>
          </div>


          <div className="space-y-4">

            <label className="flex items-center justify-between">
              <span>
                Nouvelles candidatures reçues
              </span>

              <input type="checkbox" defaultChecked />
            </label>


            <label className="flex items-center justify-between">
              <span>
                Messages des entrepreneures
              </span>

              <input type="checkbox" defaultChecked />
            </label>


            <label className="flex items-center justify-between">
              <span>
                Rapports mensuels
              </span>

              <input type="checkbox" />
            </label>

          </div>
        </section>


        {/* Preferences */}
        <section className="rounded-2xl border bg-white p-6 shadow-sm">

          <div className="mb-5 flex items-center gap-3">
            <Globe className="h-5 w-5 text-purple-600" />

            <h2 className="text-lg font-semibold">
              Préférences
            </h2>
          </div>


          <select className="w-full rounded-xl border px-4 py-3">
            <option>Français</option>
            <option>English</option>
            <option>العربية</option>
          </select>

        </section>


        {/* Security */}
        <section className="rounded-2xl border bg-white p-6 shadow-sm">

          <div className="mb-5 flex items-center gap-3">
            <Shield className="h-5 w-5 text-purple-600" />

            <h2 className="text-lg font-semibold">
              Sécurité
            </h2>
          </div>


          <button
            className="
              flex items-center gap-2
              rounded-xl border
              px-5 py-3
              hover:bg-gray-50
            "
          >
            <Lock size={18} />
            Modifier le mot de passe
          </button>

        </section>


        {/* Save */}
        <div className="flex justify-end">

          <button
            className="
              flex items-center gap-2
              rounded-xl
              bg-purple-600
              px-6 py-3
              text-white
              hover:bg-purple-700
            "
          >
            <Save size={18} />
            Enregistrer les modifications
          </button>

        </div>

      </div>
    </div>
  );
}