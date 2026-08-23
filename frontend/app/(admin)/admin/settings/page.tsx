"use client";

import { useEffect, useState } from "react";
import {
  Settings,
  Globe2,
  ShieldCheck,
  Bell,
  UserPlus,
  Wrench,
  Download,
  DatabaseBackup,
  Trash2,
  Save,
} from "lucide-react";

import {
  getAdminSettings,
  saveAdminSettings,
} from "@/lib/settingsApi";

type SystemSettingValue =
  | string
  | number
  | boolean
  | null
  | object
  | unknown[];

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
  const [registrationEnabled, setRegistrationEnabled] =
    useState(true);
  const [emailNotifications, setEmailNotifications] =
    useState(true);

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
              setSiteName(
                String(setting.value ?? "Elleva")
              );
              break;

            case "site.language":
              setLanguage(
                String(setting.value ?? "FR")
              );
              break;

            case "site.maintenance":
              setMaintenance(Boolean(setting.value));
              break;

            case "site.registrationEnabled":
              setRegistrationEnabled(
                Boolean(setting.value)
              );
              break;

            case "site.emailNotifications":
              setEmailNotifications(
                Boolean(setting.value)
              );
              break;
          }
        }
      } catch (error: unknown) {
        console.error(
          "Erreur lors du chargement des paramètres:",
          error
        );

        if (error instanceof Error) {
          alert(error.message);
        } else {
          alert(
            "Impossible de charger les paramètres."
          );
        }
      } finally {
        setLoading(false);
      }
    }

    void load();
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
      console.error(
        "Erreur lors de la sauvegarde:",
        error
      );

      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert(
          "Impossible d'enregistrer les paramètres."
        );
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="w-full max-w-full overflow-x-hidden p-5 sm:p-6 lg:p-8">
        {/* BREADCRUMB */}
        <div className="mb-7 text-sm text-ink-soft">
          <span>Espace Admin</span>

          <span className="mx-2 text-ink-soft/40">
            /
          </span>

          <span className="font-medium text-wine-700">
            Paramètres
          </span>
        </div>

        {/* HERO */}
        <div className="relative mb-8">
          <div
            aria-hidden
            className="
              pointer-events-none
              absolute
              -top-14
              right-0
              -z-10
              h-48
              w-48
              rounded-full
              bg-rise-gradient-soft
              opacity-60
              blur-3xl
              md:h-64
              md:w-64
            "
          />

          <p className="font-script text-2xl leading-none text-rose-500">
            Administration,
          </p>

          <h1 className="mt-2 font-display text-3xl font-semibold text-wine-900 sm:text-4xl">
            Paramètres{" "}
            <span className="text-gradient-rise">
              système
            </span>
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-soft">
            Configurez les paramètres généraux et le
            fonctionnement de la plateforme Ellevadz.
          </p>
        </div>

        {/* LOADING */}
        <div className="card-surface p-10 text-center shadow-card">
          <div className="flex flex-col items-center">
            <div
              className="
                mb-3
                h-8
                w-8
                animate-spin
                rounded-full
                border-2
                border-sand-200
                border-t-rose-500
              "
            />

            <p className="text-sm text-ink-soft">
              Chargement des paramètres...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden p-5 sm:p-6 lg:p-8">
      {/* =====================================================
          BREADCRUMB
      ====================================================== */}
      <div className="mb-7 text-sm text-ink-soft">
        <span>Espace Admin</span>

        <span className="mx-2 text-ink-soft/40">
          /
        </span>

        <span className="font-medium text-wine-700">
          Paramètres
        </span>
      </div>

      {/* =====================================================
          HERO
      ====================================================== */}
      <div className="relative mb-8">
        <div
          aria-hidden
          className="
            pointer-events-none
            absolute
            -top-14
            right-0
            -z-10
            h-48
            w-48
            rounded-full
            bg-rise-gradient-soft
            opacity-60
            blur-3xl
            md:h-64
            md:w-64
          "
        />

        <p className="font-script text-2xl leading-none text-rose-500">
          Administration,
        </p>

        <h1 className="mt-2 font-display text-3xl font-semibold text-wine-900 sm:text-4xl">
          Paramètres{" "}
          <span className="text-gradient-rise">
            système
          </span>
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-soft">
          Configurez les paramètres généraux et le
          fonctionnement de la plateforme Ellevadz.
        </p>
      </div>

      {/* =====================================================
          GENERAL + PLATFORM
      ====================================================== */}
      <div className="grid gap-5 xl:grid-cols-2">
        {/* ===================================================
            GENERAL
        ==================================================== */}
        <div className="card-surface shadow-card">
          <div className="flex items-center gap-3 border-b border-sand-100 px-5 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50">
              <Globe2
                size={17}
                className="text-rose-500"
              />
            </div>

            <div>
              <h2 className="font-display text-base font-semibold text-ink">
                Général
              </h2>

              <p className="mt-0.5 text-[11px] text-ink-soft">
                Informations générales de la plateforme.
              </p>
            </div>
          </div>

          <div className="space-y-5 p-5">
            {/* SITE NAME */}
            <div>
              <label
                htmlFor="siteName"
                className="mb-2 block text-xs font-semibold text-ink"
              >
                Nom de la plateforme
              </label>

              <input
                id="siteName"
                value={siteName}
                onChange={(e) =>
                  setSiteName(e.target.value)
                }
                placeholder="Elleva"
                className="
                  w-full
                  rounded-xl
                  border
                  border-sand-200
                  bg-white
                  px-3.5
                  py-2.5
                  text-sm
                  text-ink
                  outline-none
                  transition-all
                  placeholder:text-ink-soft/50
                  focus:border-rose-300
                  focus:ring-2
                  focus:ring-rose-100
                "
              />
            </div>

            {/* LANGUAGE */}
            <div>
              <label
                htmlFor="language"
                className="mb-2 block text-xs font-semibold text-ink"
              >
                Langue par défaut
              </label>

              <select
                id="language"
                value={language}
                onChange={(e) =>
                  setLanguage(e.target.value)
                }
                className="
                  w-full
                  rounded-xl
                  border
                  border-sand-200
                  bg-white
                  px-3.5
                  py-2.5
                  text-sm
                  text-ink
                  outline-none
                  transition-all
                  focus:border-rose-300
                  focus:ring-2
                  focus:ring-rose-100
                "
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
          </div>
        </div>

        {/* ===================================================
            PLATFORM
        ==================================================== */}
        <div className="card-surface shadow-card">
          <div className="flex items-center gap-3 border-b border-sand-100 px-5 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-wine-50">
              <Settings
                size={17}
                className="text-wine-700"
              />
            </div>

            <div>
              <h2 className="font-display text-base font-semibold text-ink">
                Plateforme
              </h2>

              <p className="mt-0.5 text-[11px] text-ink-soft">
                Contrôlez les principales fonctionnalités.
              </p>
            </div>
          </div>

          <div className="divide-y divide-sand-100 px-5">
            {/* REGISTRATION */}
            <SettingToggle
              icon={<UserPlus size={15} />}
              title="Autoriser les inscriptions"
              description="Permettre aux nouveaux utilisateurs de créer un compte."
              checked={registrationEnabled}
              onChange={setRegistrationEnabled}
            />

            {/* EMAIL */}
            <SettingToggle
              icon={<Bell size={15} />}
              title="Notifications email"
              description="Activer l'envoi des notifications par email."
              checked={emailNotifications}
              onChange={setEmailNotifications}
            />

            {/* MAINTENANCE */}
            <SettingToggle
              icon={<Wrench size={15} />}
              title="Mode maintenance"
              description="Désactiver temporairement l'accès à la plateforme."
              checked={maintenance}
              onChange={setMaintenance}
              danger
            />
          </div>
        </div>
      </div>

      {/* =====================================================
          SECURITY / MAINTENANCE
      ====================================================== */}
      <div className="mt-5 card-surface shadow-card">
        <div className="flex items-center gap-3 border-b border-sand-100 px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50">
            <ShieldCheck
              size={17}
              className="text-amber-600"
            />
          </div>

          <div>
            <h2 className="font-display text-base font-semibold text-ink">
              Sécurité & maintenance
            </h2>

            <p className="mt-0.5 text-[11px] text-ink-soft">
              Outils administratifs et maintenance du système.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5 p-5">
          <button
            type="button"
            className="
              inline-flex
              items-center
              gap-2
              rounded-xl
              border
              border-sand-200
              bg-white
              px-3.5
              py-2.5
              text-xs
              font-medium
              text-ink
              transition-all
              hover:border-rose-200
              hover:bg-rose-50
              hover:text-rose-600
            "
          >
            <Download size={14} />
            Exporter les données
          </button>

          <button
            type="button"
            className="
              inline-flex
              items-center
              gap-2
              rounded-xl
              border
              border-sand-200
              bg-white
              px-3.5
              py-2.5
              text-xs
              font-medium
              text-ink
              transition-all
              hover:border-wine-200
              hover:bg-wine-50
              hover:text-wine-700
            "
          >
            <DatabaseBackup size={14} />
            Sauvegarder la base
          </button>

          <button
            type="button"
            className="
              inline-flex
              items-center
              gap-2
              rounded-xl
              border
              border-rose-100
              bg-white
              px-3.5
              py-2.5
              text-xs
              font-medium
              text-rose-600
              transition-all
              hover:bg-rose-50
              hover:text-rose-700
            "
          >
            <Trash2 size={14} />
            Vider le cache
          </button>
        </div>
      </div>

      {/* =====================================================
          SAVE
      ====================================================== */}
      <div className="mt-5 flex justify-end">
        <button
          type="button"
          disabled={saving}
          onClick={() => {
            if (!saving) {
              void handleSave();
            }
          }}
          className="
            inline-flex
            items-center
            gap-2
            rounded-xl
            bg-rise-gradient
            px-5
            py-2.5
            text-sm
            font-semibold
            text-white
            shadow-sm
            transition-all
            hover:brightness-105
            hover:shadow-card
            disabled:pointer-events-none
            disabled:opacity-60
          "
        >
          <Save size={15} />

          {saving
            ? "Enregistrement..."
            : "Sauvegarder"}
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   TOGGLE COMPONENT
============================================================ */

function SettingToggle({
  icon,
  title,
  description,
  checked,
  onChange,
  danger = false,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  danger?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="flex min-w-0 items-start gap-3">
        <div
          className={`
            mt-0.5
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-lg
            ${
              danger
                ? "bg-rose-50 text-rose-500"
                : "bg-sand-50 text-ink-soft"
            }
          `}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-sm font-medium text-ink">
            {title}
          </p>

          <p className="mt-0.5 max-w-md text-[11px] leading-5 text-ink-soft">
            {description}
          </p>
        </div>
      </div>

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
          duration-200
          focus:outline-none
          focus:ring-2
          focus:ring-rose-200
          focus:ring-offset-2
          ${
            checked
              ? "bg-rise-gradient"
              : "bg-sand-200"
          }
        `}
      >
        <span
          className={`
            absolute
            top-1/2
            h-4
            w-4
            -translate-y-1/2
            rounded-full
            bg-white
            shadow-sm
            transition-transform
            duration-200
            ${
              checked
                ? "translate-x-6"
                : "translate-x-1"
            }
          `}
        />
      </button>
    </div>
  );
}
