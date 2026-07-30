"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface FavoriteButtonProps {
  hotelId: string;
  size?: "sm" | "md" | "lg";
  variant?: "floating" | "inline";
}

export default function FavoriteButton({
  hotelId,
  size = "md",
  variant = "floating",
}: FavoriteButtonProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const favs = JSON.parse(localStorage.getItem("hotel_favoris") || "[]");
    setIsFavorite(favs.includes(hotelId));
  }, [hotelId]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Connectez-vous pour ajouter aux favoris");
      router.push("/auth/login");
      return;
    }

    if (user?.role !== "user") {
      toast.error("Seuls les clients peuvent utiliser les favoris");
      return;
    }

    const favs = JSON.parse(localStorage.getItem("hotel_favoris") || "[]");
    if (isFavorite) {
      const newFavs = favs.filter((id: string) => id !== hotelId);
      localStorage.setItem("hotel_favoris", JSON.stringify(newFavs));
      setIsFavorite(false);
      toast.success("Retiré des favoris");
    } else {
      favs.push(hotelId);
      localStorage.setItem("hotel_favoris", JSON.stringify(favs));
      setIsFavorite(true);
      toast.success("Ajouté aux favoris ❤️");
    }
  };

  const sizes = {
    sm: "w-3.5 h-3.5",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  if (variant === "inline") {
    return (
      <button
        onClick={toggleFavorite}
        className={`p-2 rounded-full transition ${
          isFavorite
            ? "bg-red-50 text-red-500 hover:bg-red-100"
            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
        }`}
      >
        <Heart
          className={`${sizes[size]} ${isFavorite ? "fill-current" : ""}`}
        />
      </button>
    );
  }

  return (
    <button
      onClick={toggleFavorite}
      className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition shadow-md z-10 ${
        isFavorite
          ? "bg-red-500 text-white hover:bg-red-600"
          : "bg-white/90 text-slate-600 hover:bg-white hover:text-red-500"
      }`}
    >
      <Heart
        className={`${sizes[size]} ${isFavorite ? "fill-current" : ""}`}
      />
    </button>
  );
}