import type { Metadata, Viewport } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import InstallPWA from "@/components/shared/InstallPWA";
import ThemeProvider from "@/components/shared/ThemeProvider";

export const metadata: Metadata = {
  title: {
    default: "HotelBenin - Réservation d'hôtels au Bénin",
    template: "%s | HotelBenin",
  },
  description:
    "La 1ère plateforme d'hébergement au Bénin. Réservez facilement les meilleurs hôtels, auberges et résidences du pays.",
  manifest: "/manifest.json",
  keywords: [
    "hôtel",
    "Bénin",
    "réservation",
    "voyage",
    "Cotonou",
    "Porto-Novo",
    "hébergement",
    "auberge",
  ],
  authors: [{ name: "HotelBenin" }],
  creator: "HotelBenin",
  publisher: "HotelBenin",
  applicationName: "HotelBenin",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "HotelBenin",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://hotelbenin.bj",
    title: "HotelBenin - Réservation d'hôtels au Bénin",
    description:
      "Trouvez et réservez les meilleurs hôtels au Bénin en quelques clics",
    siteName: "HotelBenin",
  },
  twitter: {
    card: "summary_large_image",
    title: "HotelBenin",
    description: "Réservation d'hôtels au Bénin",
  },
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/icon-192x192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#1e40af",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1e40af" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="HotelBenin" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className="antialiased">
        <ThemeProvider>
        {children}
        <InstallPWA />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#fff",
              color: "#333",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            },
            success: {
              iconTheme: {
                primary: "#10b981",
                secondary: "#fff",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#fff",
              },
            },
          }}
        />
        </ThemeProvider>
      </body>
    </html>
  );
}