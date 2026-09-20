"use client";

import Link from "next/link";

export interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  linkTo?: string;
  className?: string;
}

const sizeMap = {
  sm: "w-10 h-10",
  md: "w-14 h-14",
  lg: "w-20 h-20",
  xl: "w-28 h-28",
};

export default function Logo({
  size = "md",
  showText = true,
  linkTo = "/",
  className = "",
}: LogoProps) {
  const s = sizeMap[size];

  const content = (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
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
