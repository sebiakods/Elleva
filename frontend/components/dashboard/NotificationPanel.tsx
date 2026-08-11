"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell } from "lucide-react";

interface Notification {
  id: string;
  type: string;
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

export function NotificationPanel() {
  const [notifications, setNotifications] = useState<
    Notification[]
  >([]);

  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    try {
      const token = getToken();

      if (!token) {
        setNotifications([]);
        return;
      }

      const response = await fetch(
        `${API_URL}/notifications`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to load notifications: ${response.status}`
        );
      }

      const data =
        (await response.json()) as NotificationsResponse;

      setNotifications(data.notifications || []);
    } catch (error) {
      console.error(
        "Failed to load notifications:",
        error
      );

      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();

    // Refresh notifications periodically so the
    // dashboard stays up to date.
    const interval = setInterval(
      loadNotifications,
      30000
    );

    return () => clearInterval(interval);
  }, [loadNotifications]);

  async function handleNotificationClick(
    notification: Notification
  ) {
    try {
      if (!notification.isRead) {
        const token = getToken();

        if (token) {
          await fetch(
            `${API_URL}/notifications/${notification.id}/read`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
        }

        setNotifications((current) =>
          current.map((item) =>
            item.id === notification.id
              ? {
                  ...item,
                  isRead: true,
                  readAt: new Date().toISOString(),
                }
              : item
          )
        );
      }

      if (notification.link) {
        window.location.href = notification.link;
      }
    } catch (error) {
      console.error(
        "Failed to mark notification as read:",
        error
      );
    }
  }

  return (
    <div className="card-surface p-6 shadow-card">
      <h3 className="mb-4 flex items-center gap-2 font-display text-lg text-ink">
        <Bell
          size={18}
          className="text-rose-500"
        />

        Notifications

        {notifications.some(
          (notification) => !notification.isRead
        ) && (
          <span className="ml-auto rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-600">
            {
              notifications.filter(
                (notification) =>
                  !notification.isRead
              ).length
            }
          </span>
        )}
      </h3>

      {loading ? (
        <div className="space-y-3">
          <div className="h-12 animate-pulse rounded-xl bg-sand-50" />
          <div className="h-12 animate-pulse rounded-xl bg-sand-50" />
          <div className="h-12 animate-pulse rounded-xl bg-sand-50" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-xl bg-sand-50 p-4 text-sm text-ink-soft">
          Aucune notification pour le moment.
        </div>
      ) : (
        <ul className="space-y-3">
          {notifications
            .slice(0, 5)
            .map((notification) => (
              <li key={notification.id}>
                <button
                  type="button"
                  onClick={() =>
                    handleNotificationClick(
                      notification
                    )
                  }
                  className={`flex w-full items-start gap-2.5 rounded-xl p-3 text-left text-sm text-ink-soft transition hover:opacity-80 ${
                    notification.isRead
                      ? "bg-sand-50"
                      : "bg-sand-50"
                  }`}
                >
                  {!notification.isRead && (
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />
                  )}

                  <div
                    className={
                      notification.isRead
                        ? "pl-[10px]"
                        : ""
                    }
                  >
                    <p className="font-medium text-ink">
                      {notification.title}
                    </p>

                    <p className="mt-0.5 line-clamp-2">
                      {notification.body}
                    </p>
                  </div>
                </button>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}