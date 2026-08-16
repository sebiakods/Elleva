"use client";

import { useEffect, useState } from "react";
import {
  Globe2,
  UserRound,
  Lock,
  Bell,
  Save,
  Sparkle,
  Loader2,
} from "lucide-react";

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

const notificationLabels: [
  keyof NotificationSettings,
  string,
  string
][] = [
  [
    "email",
    "Notifications par email",
    "Recevez un résumé de votre activité par e-mail.",
  ],
  [
    "financing",
    "Notifications de financement",
    "Nouveaux programmes et opportunités.",
  ],
  [
    "messages",
    "Messages des mentores",
    "Alertes lors d'un nouveau message.",
  ],
  [
    "applications",
    "Nouvelles candidatures",
    "Suivi de vos candidatures en cours.",
  ],
  [
    "reports",
    "Rapports mensuels",
    "Un récapitulatif de votre progression.",
  ],
];

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`
        relative
        h-6
        w-11
        shrink-0
        rounded-full
        transition-colors
        duration-300
        focus-ring
        ${checked ? "bg-rise-gradient" : "bg-sand-200"}
      `}
    >
      <span
        className={`
          absolute
          top-0.5
          h-5
          w-5
          rounded-full
          bg-white
          shadow-sm
          transition-transform
          duration-300
          ${checked ? "translate-x-5" : "translate-x-0.5"}
        `}
      />
    </button>
  );
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [language, setLanguage] =
    useState<"AR" | "FR" | "EN">("FR");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

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
    if (changingPassword) return;

    if (!currentPassword || !newPassword) {
      alert(
        "Veuillez remplir les deux champs de mot de passe."
      );
      return;
    }

    try {
      setChangingPassword(true);

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
    } finally {
      setChangingPassword(false);
    }
  }

  return (
    <main className="min-h-screen bg-sand-50">
      <div className="mx-auto max-w-4xl px-6 py-10">

        {/* Breadcrumb */}
        <div className="mb-8 text-sm text-ink-soft">
          <span>Espace Entrepreneuse</span>
          <span className="mx-2 text-ink-soft/40">
            /
          </span>
          <span className="font-medium text-wine-700">
            Paramètres
          </span>
        </div>

        {/* Header */}
        <div className="relative mb-8">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-16 right-0 -z-10 h-56 w-56 rounded-full bg-rise-gradient-soft opacity-70 blur-3xl"
          />

          <p className="font-script text-2xl leading-none text-rose-500">
            Vue d&apos;ensemble
          </p>

          <h1 className="mt-2 font-display text-3xl font-semibold text-wine-900 sm:text-4xl">
            Mes{" "}
            <span className="text-gradient-rise">
              paramètres
            </span>
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-soft">
            Gérez votre compte, votre sécurité et vos
            préférences de notification.
          </p>
        </div>

        {loading ? (
          <div className="space-y-5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-40 animate-pulse rounded-[2rem] border border-rose-100/60 bg-white/70"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-6">

            {/* LANGUAGE */}
            <section className="relative overflow-hidden rounded-[2rem] border border-rose-100/70 bg-white p-7 shadow-card">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-rise-gradient-soft opacity-0 blur-2xl transition-opacity duration-500 hover:opacity-70"
              />

              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
                  <Globe2 size={18} />
                </div>

                <div>
                  <p className="font-script text-base leading-none text-rose-400">
                    Préférences
                  </p>

                  <h3 className="mt-1 font-display text-lg font-semibold text-wine-900">
                    Langue & affichage
                  </h3>
                </div>
              </div>

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
                className="w-full rounded-xl border border-rose-100/70 bg-sand-50 p-3 text-sm text-ink outline-none transition focus:border-rose-400 focus:bg-white"
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
            </section>

            {/* ACCOUNT */}
            <section className="relative overflow-hidden rounded-[2rem] border border-rose-100/70 bg-white p-7 shadow-card">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-rise-gradient-soft opacity-0 blur-2xl transition-opacity duration-500 hover:opacity-70"
              />

              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-wine-50 text-wine-600">
                  <UserRound size={18} />
                </div>

                <div>
                  <p className="font-script text-base leading-none text-rose-400">
                    Vous
                  </p>

                  <h3 className="mt-1 font-display text-lg font-semibold text-wine-900">
                    Informations du compte
                  </h3>
                </div>
              </div>

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
                />
              </div>
            </section>

            {/* SECURITY */}
            <section className="relative overflow-hidden rounded-[2rem] border border-rose-100/70 bg-white p-7 shadow-card">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-rise-gradient-soft opacity-0 blur-2xl transition-opacity duration-500 hover:opacity-70"
              />

              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gold-50 text-gold-500">
                  <Lock size={18} />
                </div>

                <div>
                  <p className="font-script text-base leading-none text-rose-400">
                    Protégez votre compte
                  </p>

                  <h3 className="mt-1 font-display text-lg font-semibold text-wine-900">
                    Sécurité
                  </h3>
                </div>
              </div>

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
                {changingPassword ? (
                  <span className="flex items-center gap-2">
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                    Mise à jour...
                  </span>
                ) : (
                  "Mettre à jour le mot de passe"
                )}
              </Button>
            </section>

            {/* NOTIFICATIONS */}
            <section className="relative overflow-hidden rounded-[2rem] border border-rose-100/70 bg-white p-7 shadow-card">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-rise-gradient-soft opacity-0 blur-2xl transition-opacity duration-500 hover:opacity-70"
              />

              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <Bell size={18} />
                </div>

                <div>
                  <p className="font-script text-base leading-none text-rose-400">
                    Restez informée
                  </p>

                  <h3 className="mt-1 font-display text-lg font-semibold text-wine-900">
                    Notifications
                  </h3>
                </div>
              </div>

              <div className="divide-y divide-rose-100/60">
                {notificationLabels.map(
                  ([key, label, description]) => (
                    <label
                      key={key}
                      className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                    >
                      <span>
                        <span className="block text-sm font-medium text-ink">
                          {label}
                        </span>

                        <span className="mt-0.5 block text-xs text-ink-soft">
                          {description}
                        </span>
                      </span>

                      <Toggle
                        checked={
                          notifications[key]
                        }
                        onChange={(value) =>
                          setNotifications(
                            (current) => ({
                              ...current,
                              [key]: value,
                            })
                          )
                        }
                      />
                    </label>
                  )
                )}
              </div>
            </section>

            {/* SAVE */}
            <div className="flex flex-col items-start gap-3 rounded-[2rem] border border-dashed border-rose-200 bg-white/60 p-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-center gap-2 text-sm text-ink-soft">
                <Sparkle
                  size={14}
                  className="text-rose-400"
                />

                N&apos;oubliez pas d&apos;enregistrer vos
                modifications.
              </p>

              <Button
                onClick={handleSave}
                className="shrink-0"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                    Enregistrement...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save size={16} />
                    Sauvegarder
                  </span>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}