import { api } from "./api";

export type UserRole =
  | "ADMIN"
  | "ENTREPRENEUR"
  | "EXPERT"
  | "INSTITUTION";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;

  language?: string;
  avatarUrl?: string | null;
  bio?: string | null;
  isVerified?: boolean;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

interface AuthResponse {
  success: boolean;
  message?: string;
  data: {
    user: User;
  };
}

class AuthService {
  async login(credentials: LoginData): Promise<User> {
    const response = await api.post<AuthResponse>(
      "/auth/login",
      credentials
    );

    return response.data.user;
  }

  async register(data: RegisterData): Promise<User> {
    const response = await api.post<AuthResponse>(
      "/auth/register",
      data
    );

    return response.data.user;
  }

  async logout(): Promise<void> {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.warn("Logout failed", err);
    }
  }

  async getCurrentUser(): Promise<User> {
    const response = await api.get<{
      success: boolean;
      data: User;
    }>("/auth/me");

    return response.data;
  }

  async refresh(): Promise<void> {
    await api.post("/auth/refresh");
  }

  /**
   * Authentication is handled by HttpOnly cookies.
   * The browser sends the cookies automatically.
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      await this.getCurrentUser();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * There is intentionally no getToken().
   * JWT tokens must never be read by frontend JavaScript.
   */
  getToken(): null {
    return null;
  }

  /**
   * There is intentionally no localStorage user.
   * Use getCurrentUser() instead.
   */
  getUser(): null {
    return null;
  }

  async getUserRole(): Promise<UserRole | null> {
    try {
      const user = await this.getCurrentUser();
      return user.role;
    } catch {
      return null;
    }
  }

  async isAdmin(): Promise<boolean> {
    return (await this.getUserRole()) === "ADMIN";
  }

  async isExpert(): Promise<boolean> {
    return (await this.getUserRole()) === "EXPERT";
  }

  async isInstitution(): Promise<boolean> {
    return (await this.getUserRole()) === "INSTITUTION";
  }

  async isEntrepreneur(): Promise<boolean> {
    return (await this.getUserRole()) === "ENTREPRENEUR";
  }
}

const authService = new AuthService();

export default authService;
export { authService };