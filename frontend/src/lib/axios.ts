import axios from "axios";
import Cookies from "js-cookie";

// URL par défaut si la variable Vercel n'est pas encore chargée
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://hotelapp-benin.onrender.com/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Ajoute automatiquement le token JWT à chaque requête
api.interceptors.request.use((config) => {
  const token = Cookies.get("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Gère les erreurs globales
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || "Une erreur est survenue";

    // Si le token est invalide -> déconnexion auto
    if (error.response?.status === 401) {
      Cookies.remove("token");
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/auth")) {
        window.location.href = "/auth/login";
      }
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
