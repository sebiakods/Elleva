"use client";

import { useCallback, useEffect, useState } from "react";

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
  success?: boolean;
  notifications?: Notification[];
  count?: number;
  message?: string;
}

const API_URL = '/api';

/* ========================================================================== */
/* API                                                                        */
/* ========================================================================== */

async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(options.headers);

  /*
   * Only add JSON content type when we actually have a JSON body.
   *
   * This avoids unnecessary Content-Type headers for GET/PATCH requests.
   */
  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,

    /*
     * IMPORTANT:
     *
     * Authentication is handled by the httpOnly cookie.
     * We do NOT read accessToken from localStorage anymore.
     */
    credentials: "include",

    cache: "no-store",
  });
}

/* ========================================================================== */
/* HELPERS                                                                    */
/* ========================================================================== */

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

    case "NEW_QUESTION":
      return "❓";

    case "NEW_REVIEW":
      return "⭐";

    case "SESSION_BOOKED":
      return "📅";

    case "BUSINESS_PLAN_SUBMITTED":
      return "📄";

    case "BUSINESS_PLAN_REVIEWED":
      return "✅";

    case "APPLICATION_STATUS_CHANGED":
      return "📋";

    case "PROGRAM_PUBLISHED":
      return "💰";

    case "GENERAL":
    default:
      return "🔔";
  }
}

/* ========================================================================== */
/* PAGE                                                                       */
/* ========================================================================== */

export default function ExpertNotificationsPage() {
  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [markingAllAsRead, setMarkingAllAsRead] =
    useState(false);

  const [markingId, setMarkingId] =
    useState<string | null>(null);

  /* ======================================================================== */
  /* LOAD NOTIFICATIONS                                                       */
  /* ======================================================================== */

  const loadNotifications =
    useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

        const response =
          await apiFetch("/notifications");

        /*
         * If the backend returns 401, the session is no longer valid.
         */
        if (response.status === 401) {
          window.location.href = "/login";
          return;
        }

        const data =
          (await response.json().catch(
            () => null
          )) as NotificationsResponse | null;

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Impossible de charger les notifications."
          );
        }

        const notificationList =
          Array.isArray(data?.notifications)
            ? data.notifications
            : [];

        setNotifications(
          notificationList
        );

        setUnreadCount(
          notificationList.filter(
            (notification) =>
              !notification.isRead
          ).length
        );
      } catch (err) {
        console.error(
          "LOAD NOTIFICATIONS ERROR:",
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

  /* ======================================================================== */
  /* INITIAL LOAD                                                             */
  /* ======================================================================== */

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  /* ======================================================================== */
  /* MARK ONE AS READ                                                         */
  /* ======================================================================== */

  const handleMarkAsRead = useCallback(
    async (notification: Notification) => {
      if (
        notification.isRead ||
        markingId === notification.id
      ) {
        return true;
      }

      try {
        setMarkingId(notification.id);

        const response =
          await apiFetch(
            `/notifications/${encodeURIComponent(
              notification.id
            )}/read`,
            {
              method: "PATCH",
            }
          );

        if (response.status === 401) {
          window.location.href = "/login";
          return false;
        }

        const data =
          (await response.json().catch(
            () => null
          )) as NotificationsResponse | null;

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Impossible de marquer la notification comme lue."
          );
        }

        const readAt =
          new Date().toISOString();

        setNotifications((current) =>
          current.map((item) =>
            item.id === notification.id
              ? {
                  ...item,
                  isRead: true,
                  readAt,
                }
              : item
          )
        );

        setUnreadCount((current) =>
          Math.max(0, current - 1)
        );

        return true;
      } catch (err) {
        console.error(
          "MARK NOTIFICATION AS READ ERROR:",
          err
        );

        return false;
      } finally {
        setMarkingId(null);
      }
    },
    [markingId]
  );

  /* ======================================================================== */
  /* MARK ALL AS READ                                                         */
  /* ======================================================================== */

  const handleMarkAllAsRead =
    useCallback(async () => {
      if (
        unreadCount === 0 ||
        markingAllAsRead
      ) {
        return;
      }

      try {
        setMarkingAllAsRead(true);

        const response =
          await apiFetch(
            "/notifications/read-all",
            {
              method: "PATCH",
            }
          );

        if (response.status === 401) {
          window.location.href = "/login";
          return;
        }

        const data =
          (await response.json().catch(
            () => null
          )) as NotificationsResponse | null;

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Impossible de marquer toutes les notifications comme lues."
          );
        }

        const readAt =
          new Date().toISOString();

        setNotifications((current) =>
          current.map(
            (notification) => ({
              ...notification,
              isRead: true,
              readAt:
                notification.readAt ||
                readAt,
            })
          )
        );

        setUnreadCount(0);
      } catch (err) {
        console.error(
          "MARK ALL NOTIFICATIONS AS READ ERROR:",
          err
        );

        alert(
          err instanceof Error
            ? err.message
            : "Impossible de marquer les notifications comme lues."
        );
      } finally {
        setMarkingAllAsRead(false);
      }
    }, [markingAllAsRead, unreadCount]);

  /* ======================================================================== */
  /* NOTIFICATION CLICK                                                       */
  /* ======================================================================== */

  const handleNotificationClick =
    async (
      notification: Notification
    ) => {
      const markedAsRead =
        await handleMarkAsRead(
          notification
        );

      /*
       * Do not navigate if marking the notification
       * failed. This prevents losing the error silently.
       */
      if (
        !markedAsRead &&
        !notification.isRead
      ) {
        return;
      }

      if (notification.link) {
        /*
         * Internal links should use normal browser navigation.
         * External links are also supported.
         */
        window.location.assign(
          notification.link
        );
      }
    };

  /* ======================================================================== */
  /* RENDER                                                                   */
  /* ======================================================================== */

  return (
    <main className="min-h-screen bg-sand-50 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-4xl">

        {/* ================================================================== */}
        {/* BREADCRUMB                                                         */}
        {/* ================================================================== */}

        <div className="mb-8 text-sm text-ink-soft">
          <span>Espace Experte</span>

          <span className="mx-2 text-ink-soft/40">
            /
          </span>

          <span className="font-medium text-wine-700">
            Notifications
          </span>
        </div>

        {/* ================================================================== */}
        {/* HEADER                                                             */}
        {/* ================================================================== */}

        <div className="relative mb-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-16 right-0 -z-10 h-56 w-56 rounded-full bg-rise-gradient-soft opacity-70 blur-3xl md:h-72 md:w-72"
          />

          <p className="font-script text-2xl leading-none text-rose-500">
            Vue d'ensemble
          </p>

          <h1 className="mt-2 font-display text-3xl font-semibold text-wine-900 sm:text-4xl">
            Mes{" "}
            <span className="text-gradient-rise">
              notifications
            </span>
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-soft">
            Restez informée en temps réel de
            l'avancement de vos mentorées et des
            actions nécessitant votre attention.
          </p>
        </div>

        {/* ================================================================== */}
        {/* ACTIONS                                                            */}
        {/* ================================================================== */}

        <div className="mb-8 flex min-h-10 items-center justify-end gap-3">
          {unreadCount > 0 && (
            <>
              <span className="rounded-full bg-wine-50 px-3 py-1 text-xs font-semibold text-wine-700">
                {unreadCount} non lue
                {unreadCount !== 1
                  ? "s"
                  : ""}
              </span>

              <button
                type="button"
                onClick={
                  handleMarkAllAsRead
                }
                disabled={markingAllAsRead}
                className="rounded-xl border border-sand-200 bg-white px-4 py-2 text-sm font-medium text-ink-soft shadow-sm transition hover:bg-sand-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {markingAllAsRead
                  ? "Traitement..."
                  : "Tout marquer comme lu"}
              </button>
            </>
          )}
        </div>

        {/* ================================================================== */}
        {/* LOADING                                                            */}
        {/* ================================================================== */}

        {loading && (
          <div className="rounded-2xl border border-sand-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-sand-200 border-t-wine-700" />

            <p className="text-sm text-ink-soft">
              Chargement des notifications...
            </p>
          </div>
        )}

        {/* ================================================================== */}
        {/* ERROR                                                              */}
        {/* ================================================================== */}

        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <div className="mb-3 text-3xl">
              ⚠️
            </div>

            <p className="mb-4 text-sm text-red-700">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                void loadNotifications()
              }
              className="rounded-xl bg-wine-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-wine-800"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* ================================================================== */}
        {/* EMPTY                                                              */}
        {/* ================================================================== */}

        {!loading &&
          !error &&
          notifications.length === 0 && (
            <div className="rounded-2xl border border-sand-200 bg-white p-12 text-center shadow-sm">
              <div className="mb-4 text-5xl">
                🔔
              </div>

              <h2 className="mb-2 font-display text-lg font-semibold text-wine-900">
                Aucune notification
              </h2>

              <p className="text-sm text-ink-soft">
                Vous êtes à jour.
              </p>
            </div>
          )}

        {/* ================================================================== */}
        {/* NOTIFICATIONS                                                      */}
        {/* ================================================================== */}

        {!loading &&
          !error &&
          notifications.length > 0 && (
            <div
              className="space-y-3"
              aria-live="polite"
            >
              {notifications.map(
                (notification) => {
                  const isMarking =
                    markingId ===
                    notification.id;

                  return (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() =>
                        void handleNotificationClick(
                          notification
                        )
                      }
                      disabled={isMarking}
                      aria-label={`Notification : ${notification.title}`}
                      className={`group w-full rounded-2xl border p-5 text-left shadow-sm transition hover:-translate-y-[1px] hover:shadow-md disabled:cursor-wait disabled:opacity-70 ${
                        notification.isRead
                          ? "border-sand-200 bg-white"
                          : "border-wine-200 bg-wine-50/60"
                      }`}
                    >
                      <div className="flex gap-4">

                        {/* ICON */}

                        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
                          {getNotificationIcon(
                            notification.type
                          )}

                          {!notification.isRead && (
                            <span
                              aria-hidden="true"
                              className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-wine-600"
                            />
                          )}
                        </div>

                        {/* CONTENT */}

                        <div className="min-w-0 flex-1">

                          <div className="mb-1 flex items-start justify-between gap-3">

                            <h3
                              className={`font-semibold ${
                                notification.isRead
                                  ? "text-wine-900"
                                  : "text-wine-900"
                              }`}
                            >
                              {notification.title}
                            </h3>

                            {isMarking && (
                              <span className="shrink-0 text-xs text-ink-soft">
                                ...
                              </span>
                            )}
                          </div>

                          <p className="text-sm leading-6 text-ink-soft">
                            {notification.body}
                          </p>

                          <p className="mt-2 text-xs text-ink-soft/70">
                            {formatDate(
                              notification.createdAt
                            )}
                          </p>

                          {notification.link && (
                            <p className="mt-2 text-xs font-medium text-wine-700 opacity-0 transition group-hover:opacity-100">
                              Voir les détails →
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                }
              )}
            </div>
          )}
      </div>
    </main>
  );
}
