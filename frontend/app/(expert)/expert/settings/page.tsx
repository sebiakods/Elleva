"use client";

import { useEffect, useState } from "react";

import {
  Bell,
  Lock,
  Globe,
  CreditCard,
  User,
  Save,
} from "lucide-react";

import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";

import {
  getSettings,
  saveSettings,
  getNotificationSettings,
  saveNotificationSettings,
  changePassword,
} from "@/lib/settingsApi";

type ExpertProfile = {
  title?: string;
  specialties?: string[];
  sessionRateDA?: number;
  availableForBooking?: boolean;
  linkedinUrl?: string | null;
  websiteUrl?: string | null;
};

type SettingsData = {
  name?: string;
  email?: string;
  language?: "AR" | "FR" | "EN";
  bio?: string | null;
  expertProfile?: ExpertProfile | null;
};

type NotificationSettings = Record<string, boolean>;

type SettingsResponse = {
  data: SettingsData;
};

type NotificationResponse = {
  data: NotificationSettings;
};

const defaultNotifications: NotificationSettings = {
  email: true,
  financing: true,
  messages: true,
  applications: true,
  reports: false,
};

export default function ExpertSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [language, setLanguage] =
    useState<"AR" | "FR" | "EN">("FR");
  const [bio, setBio] = useState("");

  const [title, setTitle] = useState("");
  const [rate, setRate] = useState(0);
  const [available, setAvailable] = useState(true);
  const [linkedin, setLinkedin] = useState("");
  const [website, setWebsite] = useState("");

  const [notifications, setNotifications] =
    useState<NotificationSettings>(
      defaultNotifications
    );

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  useEffect(() => {
    async function load() {
      try {
        const [
          rawSettingsResponse,
          rawNotificationsResponse,
        ] = await Promise.all([
          getSettings(),
          getNotificationSettings(),
        ]);

        /*
         * settingsApi currently returns unknown.
         * We explicitly tell TypeScript the shape
         * returned by our backend.
         */
        const settingsResponse =
          rawSettingsResponse as SettingsResponse;

        const notificationsResponse =
          rawNotificationsResponse as NotificationResponse;

        const data = settingsResponse.data;

        setName(data?.name ?? "");
        setEmail(data?.email ?? "");
        setLanguage(data?.language ?? "FR");
        setBio(data?.bio ?? "");

        if (data?.expertProfile) {
          setTitle(
            data.expertProfile.title ?? ""
          );

          setRate(
            data.expertProfile.sessionRateDA ?? 0
          );

          setAvailable(
            data.expertProfile
              .availableForBooking ?? true
          );

          setLinkedin(
            data.expertProfile.linkedinUrl ?? ""
          );

          setWebsite(
            data.expertProfile.websiteUrl ?? ""
          );
        }

        if (notificationsResponse?.data) {
          setNotifications(
            notificationsResponse.data
          );
        } else {
          setNotifications(
            defaultNotifications
          );
        }
      } catch (error: unknown) {
        console.error(
          "Failed to load expert settings:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function handleSave() {
    if (saving) {
      return;
    }

    try {
      setSaving(true);

      await saveSettings({
        name,
        language,
        bio,

        expert: {
          title,
          sessionRateDA: Number(rate),
          availableForBooking: available,
          linkedinUrl: linkedin || null,
          websiteUrl: website || null,
        },
      });

      await saveNotificationSettings(
        notifications
      );

      alert("Paramètres enregistrés.");
    } catch (error: unknown) {
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

    if (newPassword.length < 6) {
      alert(
        "Le nouveau mot de passe doit contenir au moins 6 caractères."
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
    } catch (error: unknown) {
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

        {/* PROFILE */}
        <div className="card-surface p-6 shadow-card">
          <div className="mb-5 flex items-center gap-3">
            <User className="text-rose-500" />

            <div>
              <h2 className="font-semibold text-ink">
                Profil expert
              </h2>

              <p className="text-sm text-ink-soft">
                Gérez vos informations professionnelles.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">

            <input
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              className="rounded-xl border border-sand-200 p-3"
              placeholder="Nom"
            />

            <input
              value={email}
              disabled
              className="rounded-xl border border-sand-200 bg-gray-50 p-3"
              placeholder="Email"
            />

            <input
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              className="rounded-xl border border-sand-200 p-3"
              placeholder="Titre professionnel"
            />

            <input
              value={linkedin}
              onChange={(e) =>
                setLinkedin(e.target.value)
              }
              className="rounded-xl border border-sand-200 p-3"
              placeholder="LinkedIn"
            />

            <input
              value={website}
              onChange={(e) =>
                setWebsite(e.target.value)
              }
              className="rounded-xl border border-sand-200 p-3"
              placeholder="Site web"
            />
          </div>

          <textarea
            value={bio}
            onChange={(e) =>
              setBio(e.target.value)
            }
            className="mt-4 min-h-[120px] w-full rounded-xl border border-sand-200 p-3"
            placeholder="Biographie"
          />
        </div>

        {/* LANGUAGE */}
        <div className="card-surface p-6 shadow-card">
          <div className="mb-5 flex items-center gap-3">
            <Globe className="text-rose-500" />

            <h2 className="font-semibold">
              Langue
            </h2>
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
            className="rounded-xl border border-sand-200 p-3"
          >
            <option value="FR">
              Français
            </option>

            <option value="AR">
              العربية
            </option>

            <option value="EN">
              English
            </option>
          </select>
        </div>

        {/* NOTIFICATIONS */}
        <div className="card-surface p-6 shadow-card">
          <div className="mb-5 flex items-center gap-3">
            <Bell className="text-rose-500" />

            <h2 className="font-semibold">
              Notifications
            </h2>
          </div>

          <div className="space-y-4">

            <label className="flex items-center justify-between">
              <span>
                Notifications par email
              </span>

              <input
                type="checkbox"
                checked={
                  notifications.email
                }
                onChange={(e) =>
                  setNotifications(
                    (current) => ({
                      ...current,
                      email:
                        e.target.checked,
                    })
                  )
                }
              />
            </label>

            <label className="flex items-center justify-between">
              <span>
                Notifications de financement
              </span>

              <input
                type="checkbox"
                checked={
                  notifications.financing
                }
                onChange={(e) =>
                  setNotifications(
                    (current) => ({
                      ...current,
                      financing:
                        e.target.checked,
                    })
                  )
                }
              />
            </label>

            <label className="flex items-center justify-between">
              <span>
                Messages des entrepreneures
              </span>

              <input
                type="checkbox"
                checked={
                  notifications.messages
                }
                onChange={(e) =>
                  setNotifications(
                    (current) => ({
                      ...current,
                      messages:
                        e.target.checked,
                    })
                  )
                }
              />
            </label>

            <label className="flex items-center justify-between">
              <span>
                Nouvelles candidatures
              </span>

              <input
                type="checkbox"
                checked={
                  notifications.applications
                }
                onChange={(e) =>
                  setNotifications(
                    (current) => ({
                      ...current,
                      applications:
                        e.target.checked,
                    })
                  )
                }
              />
            </label>

            <label className="flex items-center justify-between">
              <span>
                Rapports mensuels
              </span>

              <input
                type="checkbox"
                checked={
                  notifications.reports
                }
                onChange={(e) =>
                  setNotifications(
                    (current) => ({
                      ...current,
                      reports:
                        e.target.checked,
                    })
                  )
                }
              />
            </label>

          </div>
        </div>

        {/* SESSION PRICE */}
        <div className="card-surface p-6 shadow-card">
          <div className="mb-5 flex items-center gap-3">
            <CreditCard className="text-rose-500" />

            <h2 className="font-semibold">
              Tarif des sessions
            </h2>
          </div>

          <input
            type="number"
            min="0"
            value={rate}
            onChange={(e) =>
              setRate(
                Number(e.target.value)
              )
            }
            className="rounded-xl border border-sand-200 p-3"
            placeholder="Prix en DA"
          />
        </div>

        {/* AVAILABILITY */}
        <div className="card-surface p-6 shadow-card">
          <h2 className="mb-4 font-semibold">
            Disponibilité
          </h2>

          <label className="flex items-center justify-between">
            <span>
              Disponible pour les rendez-vous
            </span>

            <input
              type="checkbox"
              checked={available}
              onChange={(e) =>
                setAvailable(
                  e.target.checked
                )
              }
            />
          </label>
        </div>

        {/* PASSWORD */}
        <div className="card-surface p-6 shadow-card">
          <div className="mb-5 flex items-center gap-3">
            <Lock className="text-rose-500" />

            <h2 className="font-semibold">
              Mot de passe
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">

            <input
              type="password"
              value={currentPassword}
              onChange={(e) =>
                setCurrentPassword(
                  e.target.value
                )
              }
              className="rounded-xl border p-3"
              placeholder="Mot de passe actuel"
            />

            <input
              type="password"
              value={newPassword}
              onChange={(e) =>
                setNewPassword(
                  e.target.value
                )
              }
              className="rounded-xl border p-3"
              placeholder="Nouveau mot de passe"
            />

          </div>

          <Button
            className="mt-4"
            onClick={handlePassword}
          >
            Modifier le mot de passe
          </Button>
        </div>

        {/* SAVE */}
        <Button
          onClick={handleSave}
        >
          <Save size={16} />

          {saving
            ? "Enregistrement..."
            : "Enregistrer les modifications"}
        </Button>

      </div>
    </>
  );
}