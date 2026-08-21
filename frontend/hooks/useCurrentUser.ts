"use client";

import { useEffect, useState } from "react";
import authService, { User } from "@/services/auth";

export type CurrentUser = User;

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      try {
        const freshUser = await authService.getCurrentUser();

        if (mounted) {
          setUser(freshUser);
        }
      } catch {
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadUser();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    user,
    loading,
  };
}