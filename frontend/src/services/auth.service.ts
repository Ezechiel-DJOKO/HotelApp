import api from "@/lib/axios";
import { ApiResponse, User } from "@/types";

export interface RegisterResponse {
  utilisateurID: string;
  email: string;
  role?: string;
  fallbackOtp?: string | null;
}

export interface LoginResponse {
  token: string;
  utilisateur: User;
}

export interface RegisterData {
  email: string;
  password: string;
  password_confirm: string;
  nom: string;
  prenom: string;
  phone?: string;
}

export const authService = {
  // Inscription
  register: async (data: RegisterData) => {
    const res = await api.post<ApiResponse<RegisterResponse>>("/auth/register", data);
    return res.data;
  },

  // Vérification OTP
  verifyOTP: async (email: string, otpCode: string) => {
    const res = await api.post<ApiResponse<LoginResponse>>("/auth/verify-otp", {
      email,
      otpCode,
    });
    return res.data;
  },

  // Connexion
  login: async (email: string, password: string) => {
    const res = await api.post<ApiResponse<LoginResponse>>("/auth/login", {
      email,
      password,
    });
    return res.data;
  },

  // Renvoyer OTP
  resendOTP: async (email: string) => {
    const res = await api.post<ApiResponse<null>>("/auth/resend-otp", { email });
    return res.data;
  },

  // Mot de passe oublié
  forgotPassword: async (email: string) => {
    const res = await api.post<ApiResponse<null>>("/auth/forgot-password", { email });
    return res.data;
  },

  // Reset mot de passe
  resetPassword: async (email: string, otpCode: string, newPassword: string) => {
    const res = await api.post<ApiResponse<null>>("/auth/reset-password", {
      email,
      otpCode,
      newPassword,
    });
    return res.data;
  },

  // Profil connecté
  getMe: async () => {
    const res = await api.get<ApiResponse<{ utilisateur: User }>>("/auth/me");
    return res.data;
  },

  // Déconnexion
  logout: async () => {
    const res = await api.post<ApiResponse<null>>("/auth/logout");
    return res.data;
  },
};