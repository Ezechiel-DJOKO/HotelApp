"use client";

import { useState, useRef } from "react";
import { Upload, X, ImagePlus } from "lucide-react";
import toast from "react-hot-toast";

interface ImageUploadProps {
  onChange: (files: File[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  existingUrls?: string[];
  onRemoveExisting?: (url: string) => void;
  label?: string;
}

export default function ImageUpload({
  onChange,
  maxFiles = 10,
  maxSizeMB = 5,
  existingUrls = [],
  onRemoveExisting,
  label = "Images",
}: ImageUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const arr = Array.from(newFiles);
    const total = files.length + arr.length + existingUrls.length;

    if (total > maxFiles) {
      toast.error(`Maximum ${maxFiles} images`);
      return;
    }

    const valid: File[] = [];
    for (const f of arr) {
      if (f.size > maxSizeMB * 1024 * 1024) {
        toast.error(`${f.name} dépasse ${maxSizeMB}MB`);
        continue;
      }
      valid.push(f);
    }

    const newList = [...files, ...valid];
    setFiles(newList);
    setPreviews([...previews, ...valid.map((f) => URL.createObjectURL(f))]);
    onChange(newList);
  };

  const removeNew = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setFiles(newFiles);
    setPreviews(newPreviews);
    onChange(newFiles);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {/* Images existantes */}
        {existingUrls.map((url) => (
          <div
            key={url}
            className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group bg-slate-100"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt="Image existante"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {onRemoveExisting && (
              <button
                type="button"
                onClick={() => onRemoveExisting(url)}
                className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition z-10"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}

        {/* Nouvelles images (previews) */}
        {previews.map((src, i) => (
          <div
            key={src}
            className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group bg-slate-100"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`Nouvelle image ${i + 1}`}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => removeNew(i)}
              className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition z-10"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        {/* Bouton ajouter */}
        {existingUrls.length + files.length < maxFiles && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 text-gray-500 hover:border-blue-500 hover:text-blue-600 transition bg-slate-50"
          >
            <ImagePlus className="w-8 h-8" />
            <span className="text-xs font-medium">Ajouter</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />

      <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
        <Upload className="w-3 h-3" />
        Max {maxFiles} images, {maxSizeMB}MB chacune
      </p>
    </div>
  );
}