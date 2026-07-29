import api from "@/lib/axios";
import { ApiResponse, User } from "@/types";

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
  register: async (data: RegisterData) => {
    const res = await api.post<ApiResponse<null>>("/auth/register", data);
    return res.data;
  },

  verifyOTP: async (email: string, otpCode: string) => {
    const res = await api.post<ApiResponse<LoginResponse>>("/auth/verify-otp", {
      email,
      otpCode,
    });
    return res.data;
  },

  login: async (email: string, password: string) => {
    const res = await api.post<ApiResponse<LoginResponse>>("/auth/login", {
      email,
      password,
    });
    return res.data;
  },

  resendOTP: async (email: string) => {
    const res = await api.post<ApiResponse<null>>("/auth/resend-otp", { email });
    return res.data;
  },

  forgotPassword: async (email: string) => {
    const res = await api.post<ApiResponse<null>>("/auth/forgot-password", {
      email,
    });
    return res.data;
  },

  resetPassword: async (
    email: string,
    otpCode: string,
    newPassword: string
  ) => {
    const res = await api.post<ApiResponse<null>>("/auth/reset-password", {
      email,
      otpCode,
      newPassword,
    });
    return res.data;
  },

  changePassword: async (oldPassword: string, newPassword: string) => {
    const res = await api.post<ApiResponse<null>>("/auth/change-password", {
      oldPassword,
      newPassword,
    });
    return res.data;
  },

  getMe: async () => {
    const res = await api.get<ApiResponse<{ utilisateur: User }>>("/auth/me");
    return res.data;
  },

  logout: async () => {
    const res = await api.post<ApiResponse<null>>("/auth/logout");
    return res.data;
  },
};