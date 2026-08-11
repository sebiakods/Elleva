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
  success: boolean;
  notifications: Notification[];
  count: number;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000/api";

function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token")
  );
}

async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
) {
  const token = getToken();

  const headers = new Headers(
    options.headers || {}
  );

  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set(
      "Authorization",
      `Bearer ${token}`
    );
  }

  return fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    cache: "no-store",
  });
}

function formatDate(dateString: string) {
  const date = new Date(dateString);

  return date.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getNotificationIcon(
  type: NotificationType
) {
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

    default:
      return "🔔";
  }
}

export default function ExpertNotificationsPage() {
  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const loadNotifications =
    useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

        const response =
          await apiFetch("/notifications");

        if (!response.ok) {
          throw new Error(
            "Failed to load notifications"
          );
        }

        const data =
          (await response.json()) as NotificationsResponse;

        setNotifications(
          data.notifications || []
        );

        setUnreadCount(
          (data.notifications || []).filter(
            (notification) =>
              !notification.isRead
          ).length
        );
      } catch (err) {
        console.error(err);

        setError(
          "Impossible de charger les notifications."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  async function handleMarkAsRead(
    notification: Notification
  ) {
    if (notification.isRead) {
      return;
    }

    try {
      const response = await apiFetch(
        `/notifications/${notification.id}/read`,
        {
          method: "PATCH",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to mark notification as read"
        );
      }

      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id
            ? {
                ...item,
                isRead: true,
                readAt:
                  new Date().toISOString(),
              }
            : item
        )
      );

      setUnreadCount((count) =>
        Math.max(0, count - 1)
      );
    } catch (err) {
      console.error(err);
    }
  }

  async function handleMarkAllAsRead() {
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

      if (!response.ok) {
        throw new Error(
          "Failed to mark all notifications as read"
        );
      }

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          isRead: true,
          readAt:
            notification.readAt ||
            new Date().toISOString(),
        }))
      );

      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleNotificationClick(
    notification: Notification
  ) {
    await handleMarkAsRead(notification);

    if (notification.link) {
      window.location.href =
        notification.link;
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">
                Notifications
              </h1>

              {unreadCount > 0 && (
                <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-semibold text-purple-700">
                  {unreadCount} non lue
                  {unreadCount > 1
                    ? "s"
                    : ""}
                </span>
              )}
            </div>

            <p className="text-sm text-slate-500">
              Retrouvez ici toutes vos
              notifications.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100"
            >
              Tout marquer comme lu
            </button>
          )}
        </div>

        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-purple-600" />

            <p className="text-sm text-slate-500">
              Chargement des notifications...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="mb-4 text-sm text-red-700">
              {error}
            </p>

            <button
              type="button"
              onClick={loadNotifications}
              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Réessayer
            </button>
          </div>
        )}

        {!loading &&
          !error &&
          notifications.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <div className="mb-4 text-5xl">
                🔔
              </div>

              <h2 className="mb-2 text-lg font-semibold text-slate-900">
                Aucune notification
              </h2>

              <p className="text-sm text-slate-500">
                Vous êtes à jour.
              </p>
            </div>
          )}

        {!loading &&
          !error &&
          notifications.length > 0 && (
            <div className="space-y-3">
              {notifications.map(
                (notification) => (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() =>
                      handleNotificationClick(
                        notification
                      )
                    }
                    className={`w-full rounded-2xl border p-5 text-left shadow-sm transition hover:-translate-y-[1px] hover:shadow-md ${
                      notification.isRead
                        ? "border-slate-200 bg-white"
                        : "border-purple-200 bg-purple-50/70"
                    }`}
                  >
                    <div className="flex gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
                        {getNotificationIcon(
                          notification.type
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-start justify-between gap-3">
                          <h3 className="font-semibold text-slate-900">
                            {notification.title}
                          </h3>

                          {!notification.isRead && (
                            <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-purple-600" />
                          )}
                        </div>

                        <p className="text-sm leading-6 text-slate-600">
                          {notification.body}
                        </p>

                        <p className="mt-2 text-xs text-slate-400">
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