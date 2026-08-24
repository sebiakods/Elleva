"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, Sparkle } from "lucide-react";

type NotificationType =
  | "SESSION_BOOKED"
  | "BUSINESS_PLAN_SUBMITTED"
  | "BUSINESS_PLAN_REVIEWED"
  | "NEW_MESSAGE"
  | "NEW_QUESTION"
  | "NEW_REVIEW"
  | "APPLICATION_STATUS_CHANGED"
  | "PROGRAM_PUBLISHED"
  | "GENERAL";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  readAt: string | null;
  link: string | null;
  createdAt: string;
}

interface NotificationsResponse {
  success: boolean;
  notifications: Notification[];
  count: number;
}
import { API_BASE_URL as API_URL } from "@/services/api";


async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(options.headers);

  if (options.body) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
    cache: "no-store",
  });
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getNotificationIcon(
  type: NotificationType
): string {
  switch (type) {
    case "NEW_MESSAGE":
      return "💬";

    case "SESSION_BOOKED":
      return "📅";

    case "BUSINESS_PLAN_SUBMITTED":
      return "📄";

    case "BUSINESS_PLAN_REVIEWED":
      return "📄";

    case "APPLICATION_STATUS_CHANGED":
      return "📋";

    case "PROGRAM_PUBLISHED":
      return "💰";

    case "NEW_QUESTION":
      return "❓";

    case "NEW_REVIEW":
      return "⭐";

    case "GENERAL":
    default:
      return "🔔";
  }
}

export default function EntrepreneurNotificationsPage() {
  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [unreadCount, setUnreadCount] =
    useState(0);

  /**
   * Load notifications
   */
  const loadNotifications =
    useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

        const response =
          await apiFetch("/notifications");

        const data =
          (await response.json()) as NotificationsResponse & {
            message?: string;
          };

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Impossible de charger les notifications."
          );
        }

        const list = Array.isArray(
          data.notifications
        )
          ? data.notifications
          : [];

        setNotifications(list);

        setUnreadCount(
          list.filter(
            (notification) =>
              !notification.isRead
          ).length
        );
      } catch (err) {
        console.error(
          "Load notifications error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Impossible de charger les notifications."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  /**
   * Mark one notification as read
   */
  async function markAsRead(
    notification: Notification
  ): Promise<boolean> {
    if (notification.isRead) {
      return true;
    }

    try {
      const response = await apiFetch(
        `/notifications/${notification.id}/read`,
        {
          method: "PATCH",
        }
      );

      const data = await response.json().catch(
        () => null
      );

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Impossible de marquer la notification comme lue."
        );
      }

      const now = new Date().toISOString();

      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id
            ? {
                ...item,
                isRead: true,
                readAt: now,
              }
            : item
        )
      );

      setUnreadCount((count) =>
        Math.max(0, count - 1)
      );

      return true;
    } catch (err) {
      console.error(
        "Mark notification as read error:",
        err
      );

      return false;
    }
  }

  /**
   * Mark all notifications as read
   */
  async function markAllAsRead() {
    if (unreadCount === 0) {
      return;
    }

    try {
      const response = await apiFetch(
        "/notifications/read-all",
        {
          method: "PATCH",
        }
      );

      const data = await response.json().catch(
        () => null
      );

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Impossible de marquer les notifications comme lues."
        );
      }

      const now = new Date().toISOString();

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          isRead: true,
          readAt:
            notification.readAt || now,
        }))
      );

      setUnreadCount(0);
    } catch (err) {
      console.error(
        "Mark all notifications as read error:",
        err
      );
    }
  }

  /**
   * Open notification
   */
  async function openNotification(
    notification: Notification
  ) {
    const success =
      await markAsRead(notification);

    if (!success) {
      return;
    }

    if (!notification.link) {
      return;
    }

    /**
     * Internal links stay in the Next.js application.
     */
    if (notification.link.startsWith("/")) {
      window.location.assign(
        notification.link
      );
      return;
    }

    /**
     * External links.
     */
    window.location.assign(
      notification.link
    );
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
            Notifications
          </span>
        </div>

        {/* Header */}
        <div className="relative mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-16 right-0 -z-10 h-56 w-56 rounded-full bg-rise-gradient-soft opacity-70 blur-3xl md:h-72 md:w-72"
          />

          <div>
            <p className="font-script text-2xl leading-none text-rose-500">
              Vue d&apos;ensemble
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h1 className="font-display text-3xl font-semibold text-wine-900 sm:text-4xl">
                Mes{" "}
                <span className="text-gradient-rise">
                  notifications
                </span>
              </h1>

              {unreadCount > 0 && (
                <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-600">
                  {unreadCount} non lue
                  {unreadCount > 1 ? "s" : ""}
                </span>
              )}
            </div>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-soft">
              Suivez vos messages, candidatures,
              séances et programmes en un coup
              d&apos;œil.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="focus-ring shrink-0 rounded-xl border border-rose-100/70 bg-white px-4 py-2.5 text-sm font-semibold text-ink-soft shadow-card transition hover:bg-sand-100"
            >
              Tout marquer comme lu
            </button>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div
            className="space-y-3"
            aria-busy="true"
            aria-label="Chargement des notifications"
          >
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-24 animate-pulse rounded-[2rem] border border-rose-100/60 bg-white/70"
              />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-center">
            <p className="mb-4 text-sm text-wine-700">
              {error}
            </p>

            <button
              type="button"
              onClick={loadNotifications}
              className="focus-ring rounded-xl bg-rise-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-bloom transition hover:brightness-105"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading &&
          !error &&
          notifications.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-rose-200 bg-white/60 px-6 py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-400">
                <Sparkle size={22} />
              </div>

              <p className="font-script text-xl text-rose-500">
                Vous êtes à jour
              </p>

              <p className="mt-2 max-w-sm text-sm text-ink-soft">
                Aucune notification pour le moment.
              </p>
            </div>
          )}

        {/* Notifications */}
        {!loading &&
          !error &&
          notifications.length > 0 && (
            <div className="space-y-4">
              {notifications.map(
                (notification) => (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() =>
                      openNotification(
                        notification
                      )
                    }
                    className={`group relative block w-full overflow-hidden rounded-[2rem] border p-5 text-left shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-bloom ${
                      notification.isRead
                        ? "border-rose-100/70 bg-white"
                        : "border-rose-200 bg-rose-50/60"
                    }`}
                  >
                    {/* Decorative corner */}
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-rise-gradient-soft opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-70"
                    />

                    <div className="relative flex gap-4">
                      {/* Icon */}
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-xl shadow-sm transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
                        {getNotificationIcon(
                          notification.type
                        )}
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-start justify-between gap-3">
                          <h3 className="font-display text-base font-semibold text-wine-900">
                            {notification.title}
                          </h3>

                          {!notification.isRead && (
                            <span
                              aria-label="Non lue"
                              className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-rose-500"
                            />
                          )}
                        </div>

                        <p className="text-sm leading-6 text-ink-soft">
                          {notification.body}
                        </p>

                        <p className="mt-2 text-xs text-ink-soft/60">
                          {formatDate(
                            notification.createdAt
                          )}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              )}
            </div>
          )}
      </div>
    </main>
  );
}
