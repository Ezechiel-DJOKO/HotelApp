"use client";

import { useState, useRef } from "react";
import { Camera, Loader2, User, X, Check } from "lucide-react";
import toast from "react-hot-toast";

interface AvatarUploadProps {
  currentAvatar?: string;
  userName: string;
  onUpload: (file: File) => Promise<void>;
  size?: "sm" | "md" | "lg" | "xl";
  color?: "blue" | "purple" | "red" | "green";
  editable?: boolean;
}

const sizeMap = {
  sm: "w-16 h-16",
  md: "w-24 h-24",
  lg: "w-32 h-32",
  xl: "w-40 h-40",
};

const iconSizeMap = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
  xl: "w-8 h-8",
};

const gradientMap = {
  blue: "from-blue-500 to-cyan-500",
  purple: "from-purple-500 to-pink-500",
  red: "from-red-500 to-orange-500",
  green: "from-green-500 to-emerald-500",
};

const textSizeMap = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-3xl",
  xl: "text-5xl",
};

export default function AvatarUpload({
  currentAvatar,
  userName,
  onUpload,
  size = "lg",
  color = "blue",
  editable = true,
}: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const getInitials = () => {
    return userName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner une image");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 5 MB");
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
      setPendingFile(file);
      setShowConfirm(true);
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmUpload = async () => {
    if (!pendingFile) return;

    setUploading(true);
    try {
      await onUpload(pendingFile);
      toast.success("Photo de profil mise à jour !");
      setShowConfirm(false);
      setPreview(null);
      setPendingFile(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erreur d'upload"
      );
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setPreview(null);
    setPendingFile(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const displayImage = preview || currentAvatar;

  return (
    <div className="relative inline-block group">
      {/* Avatar circle */}
      <div
        className={`${sizeMap[size]} rounded-full overflow-hidden border-4 border-white shadow-xl relative bg-gradient-to-br ${gradientMap[color]} flex items-center justify-center`}
      >
        {displayImage ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={displayImage}
            alt={userName}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className={`text-white font-bold ${textSizeMap[size]}`}>
            {getInitials() || <User className={iconSizeMap[size]} />}
          </span>
        )}

        {/* Loading overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
            <Loader2 className={`${iconSizeMap[size]} text-white animate-spin`} />
          </div>
        )}
      </div>

      {/* Bouton camera (si editable) */}
      {editable && !showConfirm && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={`absolute -bottom-1 -right-1 bg-white p-2 rounded-full shadow-lg border-2 border-white hover:scale-110 transition-all duration-200 disabled:opacity-50 group-hover:bg-gradient-to-br group-hover:${gradientMap[color]} group-hover:text-white`}
          aria-label="Changer la photo"
        >
          <Camera className={iconSizeMap[size]} />
        </button>
      )}

      {/* Boutons Confirmer/Annuler */}
      {showConfirm && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          <button
            type="button"
            onClick={handleCancel}
            disabled={uploading}
            className="bg-white p-2 rounded-full shadow-lg border-2 border-red-200 text-red-600 hover:bg-red-50 hover:scale-110 transition-all"
            aria-label="Annuler"
          >
            <X className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handleConfirmUpload}
            disabled={uploading}
            className={`bg-gradient-to-br ${gradientMap[color]} p-2 rounded-full shadow-lg border-2 border-white text-white hover:scale-110 transition-all disabled:opacity-50`}
            aria-label="Confirmer"
          >
            {uploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Check className="w-5 h-5" />
            )}
          </button>
        </div>
      )}

      {/* Input file caché */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}