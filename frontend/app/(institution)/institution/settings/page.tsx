"use client";

import { useEffect, useState } from "react";

import {
  Bell,
  Shield,
  Globe,
  Building2,
  Lock,
  Save,
} from "lucide-react";

import {
  getSettings,
  saveSettings,
  getNotificationSettings,
  saveNotificationSettings,
  changePassword,
} from "@/lib/settingsApi";

type InstitutionProfile = {
  institutionName?: string;
  type?: string;
  city?: string;
  websiteUrl?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  logoUrl?: string | null;
  isVerified?: boolean;
};

type SettingsData = {
  name?: string;
  email?: string;
  language?: "AR" | "FR" | "EN";
  bio?: string | null;
  institutionProfile?: InstitutionProfile | null;
};

type SettingsResponse = {
  data: SettingsData;
};

type NotificationSettings = {
  email: boolean;
  financing: boolean;
  messages: boolean;
  applications: boolean;
  reports: boolean;
};

type NotificationResponse = {
  data: Partial<NotificationSettings>;
};

const defaultNotifications: NotificationSettings = {
  email: true,
  financing: true,
  messages: true,
  applications: true,
  reports: false,
};

export default function InstitutionSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [language, setLanguage] = useState<"AR" | "FR" | "EN">("FR");
  const [bio, setBio] = useState("");

  const [institutionName, setInstitutionName] = useState("");
  const [city, setCity] = useState("");
  const [website, setWebsite] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const [notifications, setNotifications] =
    useState<NotificationSettings>(defaultNotifications);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [
          rawSettingsResponse,
          rawNotificationResponse,
        ] = await Promise.all([
          getSettings(),
          getNotificationSettings(),
        ]);

        /*
         * settingsApi currently returns unknown.
         * We explicitly validate/cast the response shape here
         * instead of changing the frontend Button or API code.
         */
        const settingsResponse =
          rawSettingsResponse as SettingsResponse;

        const notificationResponse =
          rawNotificationResponse as NotificationResponse;

        const data = settingsResponse.data;

        setName(data?.name ?? "");
        setEmail(data?.email ?? "");
        setLanguage(data?.language ?? "FR");
        setBio(data?.bio ?? "");

        if (data?.institutionProfile) {
          const profile = data.institutionProfile;

          setInstitutionName(
            profile.institutionName ?? ""
          );

          setCity(profile.city ?? "");

          setWebsite(
            profile.websiteUrl ?? ""
          );

          setContactEmail(
            profile.contactEmail ?? ""
          );

          setContactPhone(
            profile.contactPhone ?? ""
          );
        }

        /*
         * Merge backend values with defaults so that
         * missing notification properties never become undefined.
         */
        setNotifications({
          ...defaultNotifications,
          ...(notificationResponse.data ?? {}),
        });
      } catch (error: unknown) {
        console.error(
          "Failed to load institution settings:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function handleSave() {
    try {
      setSaving(true);

      await saveSettings({
        name,
        language,
        bio,

        institution: {
          institutionName,
          city,
          websiteUrl: website || null,
          contactEmail: contactEmail || null,
          contactPhone: contactPhone || null,
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
      <div className="p-7">
        Chargement...
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ACCOUNT */}
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <Building2 className="h-5 w-5 text-purple-600" />

          <h2 className="text-lg font-semibold">
            Informations du compte
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <input
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            className="rounded-xl border px-4 py-3"
            placeholder="Nom"
          />

          <input
            value={email}
            disabled
            className="rounded-xl border bg-gray-50 px-4 py-3"
            placeholder="Email"
          />
        </div>
      </section>

      {/* INSTITUTION PROFILE */}
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <Building2 className="h-5 w-5 text-purple-600" />

          <div>
            <h2 className="text-lg font-semibold">
              Profil institution
            </h2>

            <p className="text-sm text-gray-500">
              Gérez les informations de votre institution.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <input
            value={institutionName}
            onChange={(e) =>
              setInstitutionName(e.target.value)
            }
            className="rounded-xl border px-4 py-3"
            placeholder="Nom de l'institution"
          />

          <input
            value={city}
            onChange={(e) =>
              setCity(e.target.value)
            }
            className="rounded-xl border px-4 py-3"
            placeholder="Ville"
          />

          <input
            value={website}
            onChange={(e) =>
              setWebsite(e.target.value)
            }
            className="rounded-xl border px-4 py-3"
            placeholder="Site web"
          />

          <input
            value={contactEmail}
            onChange={(e) =>
              setContactEmail(e.target.value)
            }
            className="rounded-xl border px-4 py-3"
            placeholder="Email de contact"
          />

          <input
            value={contactPhone}
            onChange={(e) =>
              setContactPhone(e.target.value)
            }
            className="rounded-xl border px-4 py-3"
            placeholder="Téléphone"
          />
        </div>

        <textarea
          value={bio}
          onChange={(e) =>
            setBio(e.target.value)
          }
          className="mt-4 min-h-[120px] w-full rounded-xl border px-4 py-3"
          placeholder="Description de l'institution"
        />
      </section>

      {/* NOTIFICATIONS */}
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
              Notifications par email
            </span>

            <input
              type="checkbox"
              checked={notifications.email}
              onChange={(e) =>
                setNotifications((current) => ({
                  ...current,
                  email: e.target.checked,
                }))
              }
            />
          </label>

          <label className="flex items-center justify-between">
            <span>
              Notifications de financement
            </span>

            <input
              type="checkbox"
              checked={notifications.financing}
              onChange={(e) =>
                setNotifications((current) => ({
                  ...current,
                  financing: e.target.checked,
                }))
              }
            />
          </label>

          <label className="flex items-center justify-between">
            <span>
              Messages des entrepreneures
            </span>

            <input
              type="checkbox"
              checked={notifications.messages}
              onChange={(e) =>
                setNotifications((current) => ({
                  ...current,
                  messages: e.target.checked,
                }))
              }
            />
          </label>

          <label className="flex items-center justify-between">
            <span>
              Nouvelles candidatures reçues
            </span>

            <input
              type="checkbox"
              checked={notifications.applications}
              onChange={(e) =>
                setNotifications((current) => ({
                  ...current,
                  applications: e.target.checked,
                }))
              }
            />
          </label>

          <label className="flex items-center justify-between">
            <span>
              Rapports mensuels
            </span>

            <input
              type="checkbox"
              checked={notifications.reports}
              onChange={(e) =>
                setNotifications((current) => ({
                  ...current,
                  reports: e.target.checked,
                }))
              }
            />
          </label>

        </div>
      </section>

      {/* LANGUAGE */}
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <Globe className="h-5 w-5 text-purple-600" />

          <h2 className="text-lg font-semibold">
            Préférences
          </h2>
        </div>

        <select
          value={language}
          onChange={(e) =>
            setLanguage(
              e.target.value as "AR" | "FR" | "EN"
            )
          }
          className="w-full rounded-xl border px-4 py-3"
        >
          <option value="FR">
            Français
          </option>

          <option value="EN">
            English
          </option>

          <option value="AR">
            العربية
          </option>
        </select>
      </section>

      {/* SECURITY */}
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <Shield className="h-5 w-5 text-purple-600" />

          <h2 className="text-lg font-semibold">
            Sécurité
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <input
            type="password"
            value={currentPassword}
            onChange={(e) =>
              setCurrentPassword(e.target.value)
            }
            className="rounded-xl border px-4 py-3"
            placeholder="Mot de passe actuel"
          />

          <input
            type="password"
            value={newPassword}
            onChange={(e) =>
              setNewPassword(e.target.value)
            }
            className="rounded-xl border px-4 py-3"
            placeholder="Nouveau mot de passe"
          />
        </div>

        <button
          onClick={() => {
            if (currentPassword && newPassword) {
              handlePassword();
            }
          }}
          className="mt-4 flex items-center gap-2 rounded-xl border px-5 py-3 hover:bg-gray-50"
        >
          <Lock size={18} />
          Modifier le mot de passe
        </button>
      </section>

      {/* SAVE */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            if (!saving) {
              handleSave();
            }
          }}
          className="flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={saving}
        >
          <Save size={18} />

          {saving
            ? "Enregistrement..."
            : "Enregistrer les modifications"}
        </button>
      </div>

    </div>
  );
}
