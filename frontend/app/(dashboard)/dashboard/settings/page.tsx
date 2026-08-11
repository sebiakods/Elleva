"use client";

import { useEffect, useState } from "react";

import { Header } from "@/components/layout/Header";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

import {
  getSettings,
  getNotificationSettings,
  saveSettings,
  saveNotificationSettings,
  changePassword,
} from "@/lib/settingsApi";

type NotificationSettings = {
  email: boolean;
  financing: boolean;
  messages: boolean;
  applications: boolean;
  reports: boolean;
};

type PersonalSettings = {
  id: string;
  email: string;
  name: string;
  language: "AR" | "FR" | "EN";
  bio: string | null;
  avatarUrl: string | null;
  role: string;
  expertProfile?: unknown;
  institutionProfile?: unknown;
};

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [language, setLanguage] =
    useState<"AR" | "FR" | "EN">("FR");

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [notifications, setNotifications] =
    useState<NotificationSettings>({
      email: true,
      financing: true,
      messages: true,
      applications: true,
      reports: false,
    });

  useEffect(() => {
    async function load() {
      try {
        const settingsResponse = await getSettings();
        const notificationResponse =
          await getNotificationSettings();

        const settings =
          settingsResponse as PersonalSettings;

        const notificationSettings =
          notificationResponse as NotificationSettings;

        setName(settings.name || "");
        setEmail(settings.email || "");
        setLanguage(settings.language || "FR");

        setNotifications({
          email:
            notificationSettings.email ?? true,
          financing:
            notificationSettings.financing ?? true,
          messages:
            notificationSettings.messages ?? true,
          applications:
            notificationSettings.applications ?? true,
          reports:
            notificationSettings.reports ?? false,
        });
      } catch (error) {
        console.error(
          "Failed to load settings:",
          error
        );
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

      await saveSettings({
        name,
        language,
      });

      await saveNotificationSettings(
        notifications
      );

      alert("Paramètres enregistrés.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Impossible d'enregistrer les paramètres.";

      alert(message);
    } finally {
      setSaving(false);
    }
  }

  async function handlePassword() {
    if (!currentPassword || !newPassword) {
      alert(
        "Veuillez remplir les deux champs de mot de passe."
      );
      return;
    }

    try {
      await changePassword(
        currentPassword,
        newPassword
      );

      setCurrentPassword("");
      setNewPassword("");

      alert("Mot de passe modifié.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Impossible de modifier le mot de passe.";

      alert(message);
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
        {/* LANGUAGE */}
        <div className="card-surface p-7 shadow-card">
          <h3 className="mb-5 font-display text-lg text-ink">
            Langue & affichage
          </h3>

          <select
            value={language}
            onChange={(e) =>
              setLanguage(
                e.target.value as
                  | "AR"
                  | "FR"
                  | "EN"
              )
            }
            className="w-full rounded-xl border border-sand-200 bg-white p-3"
          >
            <option value="AR">
              العربية
            </option>

            <option value="FR">
              Français
            </option>

            <option value="EN">
              English
            </option>
          </select>
        </div>

        {/* ACCOUNT */}
        <div className="card-surface p-7 shadow-card">
          <h3 className="mb-5 font-display text-lg text-ink">
            Informations du compte
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Nom"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
            />

            <Input
              label="Email"
              value={email}
              disabled
            />
          </div>
        </div>

        {/* SECURITY */}
        <div className="card-surface p-7 shadow-card">
          <h3 className="mb-5 font-display text-lg text-ink">
            Sécurité
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Mot de passe actuel"
              type="password"
              value={currentPassword}
              onChange={(e) =>
                setCurrentPassword(
                  e.target.value
                )
              }
            />

            <Input
              label="Nouveau mot de passe"
              type="password"
              value={newPassword}
              onChange={(e) =>
                setNewPassword(
                  e.target.value
                )
              }
            />
          </div>

          <Button
            className="mt-5"
            variant="secondary"
            onClick={handlePassword}
          >
            Mettre à jour le mot de passe
          </Button>
        </div>

        {/* NOTIFICATIONS */}
        <div className="card-surface p-7 shadow-card">
          <h3 className="mb-5 font-display text-lg text-ink">
            Notifications
          </h3>

          <div className="space-y-4">
            {(
              [
                [
                  "email",
                  "Notifications par email",
                ],
                [
                  "financing",
                  "Notifications de financement",
                ],
                [
                  "messages",
                  "Messages des mentores",
                ],
                [
                  "applications",
                  "Nouvelles candidatures",
                ],
                [
                  "reports",
                  "Rapports mensuels",
                ],
              ] as const
            ).map(([key, label]) => (
              <label
                key={key}
                className="flex items-center justify-between"
              >
                <span>{label}</span>

                <input
                  type="checkbox"
                  checked={
                    notifications[key]
                  }
                  onChange={(e) =>
                    setNotifications(
                      (current) => ({
                        ...current,
                        [key]:
                          e.target.checked,
                      })
                    )
                  }
                />
              </label>
            ))}
          </div>
        </div>

        {/* SAVE */}
        <Button
          variant="secondary"
          onClick={handleSave}
        >
          {saving
            ? "Enregistrement..."
            : "Sauvegarder"}
        </Button>
      </div>
    </>
  );
}

