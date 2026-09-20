"use client";

import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  linkTo?: string;
  className?: string;
}

const sizeMap = {
  sm: "w-12",
  md: "w-16",
  lg: "w-24",
  xl: "w-32",
};

export default function Logo({
  size = "md",
  linkTo = "/",
  className = "",
}: LogoProps) {
  const s = sizeMap[size];

  const content = (
    <div className={`flex items-center justify-center ${className}`}>
      {/* On utilise ton nouveau logo */}
      <img
        src="/logo.jpg"
        alt="Hotel Benin Logo"
        className={`${s} object-contain rounded-lg shadow-sm bg-white p-1`}
      />
    </div>
  );

  if (linkTo) {
    return <Link href={linkTo}>{content}</Link>;
  }

  return content;
}