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
            data.expertProfile.availableForBooking ??
              true
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
    if (saving) return;

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

  /*
   * Shared page header.
   * Same visual language as the Expert dashboard/calendar/etc.
   */
  function PageHeader() {
    return (
      <>
        {/* Breadcrumb */}
        <div className="mb-8 text-sm text-ink-soft">
          <span>Espace Experte</span>

          <span className="mx-2 text-ink-soft/40">
            /
          </span>

          <span className="font-medium text-wine-700">
            Paramètres
          </span>
        </div>

        {/* Header */}
        <div className="relative mb-10">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-16 right-0 -z-10 h-56 w-56 rounded-full bg-rise-gradient-soft opacity-70 blur-3xl md:h-72 md:w-72"
          />

          <p className="font-script text-2xl leading-none text-rose-500">
            Espace Experte,
          </p>

          <h1 className="mt-2 font-display text-3xl font-semibold text-wine-900 sm:text-4xl">
            Mes{" "}
            <span className="text-gradient-rise">
              paramètres
            </span>
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-soft">
            Gérez votre profil professionnel, vos
            notifications, votre disponibilité et vos
            préférences.
          </p>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <main>
        <PageHeader />

        <div className="card-surface p-6 shadow-card">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 animate-pulse rounded-full bg-sand-100" />

            <p className="text-sm text-ink-soft">
              Chargement des paramètres...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <PageHeader />

      <div className="space-y-6">

        {/* =====================================================
            PROFILE
        ====================================================== */}
        <section className="card-surface p-6 shadow-card">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50">
              <User
                size={19}
                className="text-rose-500"
              />
            </div>

            <div>
              <h2 className="font-display text-lg text-ink">
                Profil expert
              </h2>

              <p className="mt-0.5 text-xs text-ink-soft">
                Gérez vos informations professionnelles.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">

            {/* Name */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-soft">
                Nom
              </label>

              <input
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                className="w-full rounded-xl border border-sand-200 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-50"
                placeholder="Nom"
              />
            </div>

            {/* Email */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-soft">
                Email
              </label>

              <input
                value={email}
                disabled
                className="w-full cursor-not-allowed rounded-xl border border-sand-200 bg-sand-50 px-4 py-3 text-sm text-ink-soft outline-none"
                placeholder="Email"
              />
            </div>

            {/* Professional title */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-soft">
                Titre professionnel
              </label>

              <input
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                className="w-full rounded-xl border border-sand-200 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-50"
                placeholder="Ex : Consultante en entrepreneuriat"
              />
            </div>

            {/* LinkedIn */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-soft">
                LinkedIn
              </label>

              <input
                value={linkedin}
                onChange={(e) =>
                  setLinkedin(e.target.value)
                }
                className="w-full rounded-xl border border-sand-200 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-50"
                placeholder="https://linkedin.com/..."
              />
            </div>

            {/* Website */}
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-ink-soft">
                Site web
              </label>

              <input
                value={website}
                onChange={(e) =>
                  setWebsite(e.target.value)
                }
                className="w-full rounded-xl border border-sand-200 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-50"
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Bio */}
          <div className="mt-4">
            <label className="mb-1.5 block text-xs font-medium text-ink-soft">
              Biographie
            </label>

            <textarea
              value={bio}
              onChange={(e) =>
                setBio(e.target.value)
              }
              className="min-h-[120px] w-full resize-none rounded-xl border border-sand-200 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-50"
              placeholder="Présentez votre parcours et votre expertise..."
            />
          </div>
        </section>

        {/* =====================================================
            LANGUAGE
        ====================================================== */}
        <section className="card-surface p-6 shadow-card">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sand-100">
              <Globe
                size={19}
                className="text-ink"
              />
            </div>

            <div>
              <h2 className="font-display text-lg text-ink">
                Langue
              </h2>

              <p className="mt-0.5 text-xs text-ink-soft">
                Choisissez votre langue préférée.
              </p>
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
            className="w-full max-w-sm rounded-xl border border-sand-200 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-50"
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
        </section>

        {/* =====================================================
            NOTIFICATIONS
        ====================================================== */}
        <section className="card-surface p-6 shadow-card">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50">
              <Bell
                size={19}
                className="text-rose-500"
              />
            </div>

            <div>
              <h2 className="font-display text-lg text-ink">
                Notifications
              </h2>

              <p className="mt-0.5 text-xs text-ink-soft">
                Choisissez les notifications que vous
                souhaitez recevoir.
              </p>
            </div>
          </div>

          <div className="divide-y divide-sand-100">

            {/* Email */}
            <label className="flex cursor-pointer items-center justify-between py-4 first:pt-0">
              <div>
                <p className="text-sm font-medium text-ink">
                  Notifications par email
                </p>

                <p className="mt-1 text-xs text-ink-soft">
                  Recevoir les notifications importantes
                  par email.
                </p>
              </div>

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
                className="h-4 w-4 accent-rose-500"
              />
            </label>

            {/* Financing */}
            <label className="flex cursor-pointer items-center justify-between py-4">
              <div>
                <p className="text-sm font-medium text-ink">
                  Notifications de financement
                </p>

                <p className="mt-1 text-xs text-ink-soft">
                  Recevoir les informations liées aux
                  financements.
                </p>
              </div>

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
                className="h-4 w-4 accent-rose-500"
              />
            </label>

            {/* Messages */}
            <label className="flex cursor-pointer items-center justify-between py-4">
              <div>
                <p className="text-sm font-medium text-ink">
                  Messages des entrepreneures
                </p>

                <p className="mt-1 text-xs text-ink-soft">
                  Être informée des nouveaux messages.
                </p>
              </div>

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
                className="h-4 w-4 accent-rose-500"
              />
            </label>

            {/* Applications */}
            <label className="flex cursor-pointer items-center justify-between py-4">
              <div>
                <p className="text-sm font-medium text-ink">
                  Nouvelles candidatures
                </p>

                <p className="mt-1 text-xs text-ink-soft">
                  Recevoir les notifications concernant
                  les candidatures.
                </p>
              </div>

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
                className="h-4 w-4 accent-rose-500"
              />
            </label>

            {/* Reports */}
            <label className="flex cursor-pointer items-center justify-between py-4 last:pb-0">
              <div>
                <p className="text-sm font-medium text-ink">
                  Rapports mensuels
                </p>

                <p className="mt-1 text-xs text-ink-soft">
                  Recevoir un résumé mensuel de votre
                  activité.
                </p>
              </div>

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
                className="h-4 w-4 accent-rose-500"
              />
            </label>

          </div>
        </section>

        {/* =====================================================
            SESSION PRICE
        ====================================================== */}
        <section className="card-surface p-6 shadow-card">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sand-100">
              <CreditCard
                size={19}
                className="text-ink"
              />
            </div>

            <div>
              <h2 className="font-display text-lg text-ink">
                Tarif des sessions
              </h2>

              <p className="mt-0.5 text-xs text-ink-soft">
                Définissez votre tarif pour les sessions
                d'accompagnement.
              </p>
            </div>
          </div>

          <div className="max-w-sm">
            <label className="mb-1.5 block text-xs font-medium text-ink-soft">
              Prix par session
            </label>

            <div className="relative">
              <input
                type="number"
                min="0"
                value={rate}
                onChange={(e) =>
                  setRate(
                    Number(e.target.value)
                  )
                }
                className="w-full rounded-xl border border-sand-200 bg-white px-4 py-3 pr-14 text-sm text-ink outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-50"
                placeholder="Prix en DA"
              />

              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-ink-soft">
                DA
              </span>
            </div>
          </div>
        </section>

        {/* =====================================================
            AVAILABILITY
        ====================================================== */}
        <section className="card-surface p-6 shadow-card">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sand-100">
              <User
                size={19}
                className="text-ink"
              />
            </div>

            <div>
              <h2 className="font-display text-lg text-ink">
                Disponibilité
              </h2>

              <p className="mt-0.5 text-xs text-ink-soft">
                Gérez votre disponibilité pour les rendez-vous.
              </p>
            </div>
          </div>

          <label className="flex max-w-xl cursor-pointer items-center justify-between rounded-xl border border-sand-200 bg-sand-50 px-4 py-4 transition hover:border-rose-100 hover:bg-rose-50/30">
            <div>
              <p className="text-sm font-medium text-ink">
                Disponible pour les rendez-vous
              </p>

              <p className="mt-1 text-xs text-ink-soft">
                Les entrepreneures pourront vous contacter
                pour réserver une session.
              </p>
            </div>

            <input
              type="checkbox"
              checked={available}
              onChange={(e) =>
                setAvailable(
                  e.target.checked
                )
              }
              className="h-4 w-4 accent-rose-500"
            />
          </label>
        </section>

        {/* =====================================================
            PASSWORD
        ====================================================== */}
        <section className="card-surface p-6 shadow-card">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50">
              <Lock
                size={19}
                className="text-rose-500"
              />
            </div>

            <div>
              <h2 className="font-display text-lg text-ink">
                Mot de passe
              </h2>

              <p className="mt-0.5 text-xs text-ink-soft">
                Modifiez votre mot de passe pour sécuriser
                votre compte.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">

            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-soft">
                Mot de passe actuel
              </label>

              <input
                type="password"
                value={currentPassword}
                onChange={(e) =>
                  setCurrentPassword(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-sand-200 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-50"
                placeholder="Mot de passe actuel"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-soft">
                Nouveau mot de passe
              </label>

              <input
                type="password"
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-sand-200 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-50"
                placeholder="Nouveau mot de passe"
              />
            </div>
          </div>

          <Button
            className="mt-5"
            onClick={handlePassword}
          >
            Modifier le mot de passe
          </Button>
        </section>

        {/* =====================================================
            SAVE
        ====================================================== */}
        <div className="flex justify-end border-t border-sand-100 pt-6 pb-4">
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-xl bg-rise-gradient px-5 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            <Save size={16} />

            {saving
              ? "Enregistrement..."
              : "Enregistrer les modifications"}
          </button>
        </div>
      </div>
    </main>
  );
}