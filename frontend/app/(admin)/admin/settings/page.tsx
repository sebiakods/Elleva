"use client";

import { useEffect, useState } from "react";

import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";

import {
  getAdminSettings,
  saveAdminSettings,
} from "@/lib/settingsApi";

type SystemSettingValue = string | number | boolean | null | object | unknown[];

type SystemSetting = {
  id: string;
  key: string;
  value: SystemSettingValue;
};

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [siteName, setSiteName] = useState("Elleva");
  const [language, setLanguage] = useState("FR");
  const [maintenance, setMaintenance] = useState(false);
  const [registrationEnabled, setRegistrationEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);

  useEffect(() => {
    async function load() {
      try {
          const response = (await getAdminSettings()) as {
            data: SystemSetting[];
          };

          const settings = response.data;

        for (const setting of settings) {
          switch (setting.key) {
            case "site.name":
              setSiteName(String(setting.value ?? "Elleva"));
              break;

            case "site.language":
              setLanguage(String(setting.value ?? "FR"));
              break;

            case "site.maintenance":
              setMaintenance(Boolean(setting.value));
              break;

            case "site.registrationEnabled":
              setRegistrationEnabled(Boolean(setting.value));
              break;

            case "site.emailNotifications":
              setEmailNotifications(Boolean(setting.value));
              break;
          }
        }
      } catch (error: unknown) {
        console.error("Erreur lors du chargement des paramètres:", error);

        if (error instanceof Error) {
          alert(error.message);
        } else {
          alert("Impossible de charger les paramètres.");
        }
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function handleSave() {
    if (saving) return;

    try {
      setSaving(true);

      await saveAdminSettings([
        {
          key: "site.name",
          value: siteName,
        },
        {
          key: "site.language",
          value: language,
        },
        {
          key: "site.maintenance",
          value: maintenance,
        },
        {
          key: "site.registrationEnabled",
          value: registrationEnabled,
        },
        {
          key: "site.emailNotifications",
          value: emailNotifications,
        },
      ]);

      alert("Paramètres système enregistrés.");
    } catch (error: unknown) {
      console.error("Erreur lors de la sauvegarde:", error);

      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Impossible d'enregistrer les paramètres.");
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <>
        <Header title="Paramètres" />

        <div className="p-7">
          Chargement...
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Paramètres" />

      <div className="space-y-6">
        {/* GENERAL */}
        <div className="card-surface p-7 shadow-card">
          <h3 className="mb-5 font-display text-lg text-ink">
            Général
          </h3>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm">
                Nom de la plateforme
              </label>

              <input
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full rounded-xl border border-sand-200 p-3"
                placeholder="Elleva"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm">
                Langue par défaut
              </label>

              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full rounded-xl border border-sand-200 p-3"
              >
                <option value="AR">العربية</option>
                <option value="FR">Français</option>
                <option value="EN">English</option>
              </select>
            </div>
          </div>
        </div>

        {/* PLATFORM */}
        <div className="card-surface p-7 shadow-card">
          <h3 className="mb-5 font-display text-lg text-ink">
            Plateforme
          </h3>

          <div className="space-y-5">
            <label className="flex items-center justify-between">
              <span>Autoriser les inscriptions</span>

              <input
                type="checkbox"
                checked={registrationEnabled}
                onChange={(e) =>
                  setRegistrationEnabled(e.target.checked)
                }
              />
            </label>

            <label className="flex items-center justify-between">
              <span>Notifications email</span>

              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) =>
                  setEmailNotifications(e.target.checked)
                }
              />
            </label>

            <label className="flex items-center justify-between">
              <span>Mode maintenance</span>

              <input
                type="checkbox"
                checked={maintenance}
                onChange={(e) =>
                  setMaintenance(e.target.checked)
                }
              />
            </label>
          </div>
        </div>

        {/* SECURITY / MAINTENANCE */}
        <div className="card-surface p-7 shadow-card">
          <h3 className="mb-5 font-display text-lg text-ink">
            Sécurité & maintenance
          </h3>

          <div className="flex flex-wrap gap-3">
            <Button variant="outline">
              Exporter les données
            </Button>

            <Button variant="secondary">
              Sauvegarder la base
            </Button>

            <Button
              variant="ghost"
              className="text-rose-600"
            >
              Vider le cache
            </Button>
          </div>
        </div>

        {/* SAVE */}
        <Button
          onClick={() => {
            if (!saving) {
              void handleSave();
            }
          }}
        >
          {saving ? "Enregistrement..." : "Sauvegarder"}
        </Button>
      </div>
    </>
  );
}
