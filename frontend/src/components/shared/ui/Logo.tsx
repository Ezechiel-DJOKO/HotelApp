"use client";

import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  linkTo?: string;
  className?: string;
}

const sizeMap = {
  sm: { img: "w-8 h-8", text: "text-lg" },
  md: { img: "w-10 h-10", text: "text-xl" },
  lg: { img: "w-12 h-12", text: "text-2xl" },
  xl: { img: "w-16 h-16", text: "text-3xl" },
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
        src="/icons/icon-192x192.png"
        alt="HotelBenin"
        className={`${s.img} rounded-lg`}
      />
      {showText && (
        <span className={`${s.text} font-bold text-slate-900 dark:text-white`}>
          Hotel<span className="text-blue-600">Benin</span>
        </span>
      )}
    </div>
  );

  if (linkTo) {
    return <Link href={linkTo}>{content}</Link>;
  }

  return content;
}