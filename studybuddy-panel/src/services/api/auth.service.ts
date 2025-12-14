import { apiClient } from "@/lib/api.config";
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  ResetPasswordRequest,
  ChangePasswordRequest,
} from "@/lib/types";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  email: string;
  role: string;
  nameid: string;
  exp: number;
}

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      "/auth/login",
      credentials
    );
    const { token, userId, email, fullName, role } = response.data;

    // Store token and user info
    localStorage.setItem("authToken", token);
    localStorage.setItem(
      "user",
      JSON.stringify({ userId, email, fullName, role })
    );

    return response.data;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/register", data);
    const { token, userId, email, fullName, role } = response.data;

    // Store token and user info
    localStorage.setItem("authToken", token);
    localStorage.setItem(
      "user",
      JSON.stringify({ userId, email, fullName, role })
    );

    return response.data;
  },

  logout(): void {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;

    try {
      const user = JSON.parse(userStr);
      return {
        userId: user.userId,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      };
    } catch {
      return null;
    }
  },

  getToken(): string | null {
    return localStorage.getItem("authToken");
  },

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch {
      return false;
    }
  },

  getUserRole(): string | null {
    const user = this.getCurrentUser();
    return user?.role || null;
  },

  async resetPassword(request: ResetPasswordRequest): Promise<void> {
    await apiClient.post("/api/v1/auth/reset-password", request);
  },

  async changePassword(request: ChangePasswordRequest): Promise<void> {
    await apiClient.post("/api/v1/auth/change-password", request);
  },

  async forgotPassword(email: string): Promise<void> {
    await apiClient.post("/api/v1/auth/forgot-password", { email });
  },
};
