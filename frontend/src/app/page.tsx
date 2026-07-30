"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { hotelService } from "@/services/hotel.service";
import { Hotel } from "@/types";
import {
  Hotel as HotelIcon,
  MapPin,
  Star,
  Search,
  Shield,
  Users,
  TrendingUp,
  Compass,
} from "lucide-react";

import PublicNavbar from "@/components/shared/public/PublicNavbar";
import HotelCard from "@/components/shared/public/HotelCard";
import Loader from "@/components/shared/ui/Loader";
import Button from "@/components/shared/ui/Button";

export default function HomePage() {
  const router = useRouter();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchCity, setSearchCity] = useState("");

  const loadHotels = useCallback(async () => {
    try {
      const res = await hotelService.getHotels({ limit: 6 });
      setHotels(res.data?.hotels || []);
    } catch (error) {
      console.error("Erreur:", error);
      setHotels([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHotels();
  }, [loadHotels]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchCity) {
      router.push(`/hotels?ville=${encodeURIComponent(searchCity)}`);
    } else {
      router.push("/hotels");
    }
  };

  return (
    <>
      <PublicNavbar />

      <main>
        {/* HERO */}
        <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 text-white py-20 sm:py-28 lg:py-32 px-4 overflow-hidden">
          {/* Décorations */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-300 rounded-full blur-3xl"></div>
          </div>

          <div className="relative max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <Compass className="w-4 h-4" />
              La 1ère plateforme d&apos;hébergement au Bénin
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Trouvez votre hôtel
              <br />
              <span className="bg-gradient-to-r from-yellow-200 to-cyan-200 bg-clip-text text-transparent">
                idéal au Bénin 🇧🇯
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              Réservez facilement les meilleurs hôtels, auberges et résidences
              du pays au meilleur prix.
            </p>

            {/* Barre de recherche */}
            <form
              onSubmit={handleSearch}
              className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-2 flex flex-col sm:flex-row gap-2"
            >
              <div className="flex-1 flex items-center gap-2 px-4">
                <MapPin className="w-5 h-5 text-blue-600" />
                <input
                  type="text"
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  placeholder="Où voulez-vous aller ? (ex: Cotonou)"
                  className="flex-1 py-3 outline-none text-slate-900 placeholder:text-slate-400"
                />
              </div>
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold px-6 py-3 rounded-xl transition inline-flex items-center gap-2 justify-center"
              >
                <Search className="w-5 h-5" />
                Rechercher
              </button>
            </form>
          </div>
        </section>

        {/* FEATURES */}
        <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
              Pourquoi choisir HotelBenin ?
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Des milliers de voyageurs nous font confiance chaque année
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <HotelIcon className="w-7 h-7" />,
                title: "Large sélection",
                desc: "Des centaines d'hébergements partout au Bénin",
                color: "bg-blue-100 text-blue-600",
              },
              {
                icon: <Shield className="w-7 h-7" />,
                title: "Réservation sécurisée",
                desc: "Vos données et paiements sont protégés",
                color: "bg-green-100 text-green-600",
              },
              {
                icon: <Star className="w-7 h-7" />,
                title: "Avis vérifiés",
                desc: "Des vrais avis de vrais voyageurs",
                color: "bg-yellow-100 text-yellow-600",
              },
            ].map((f, i) => (
              <div
                key={i}
                className="text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-lg transition"
              >
                <div
                  className={`w-16 h-16 ${f.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}
                >
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold mb-2 text-slate-900">
                  {f.title}
                </h3>
                <p className="text-slate-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* HÔTELS POPULAIRES */}
        <section className="py-16 sm:py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
                  🔥 Hôtels populaires
                </h2>
                <p className="text-slate-600">
                  Découvrez les hôtels les mieux notés
                </p>
              </div>
              <Link href="/hotels">
                <Button
                  variant="outline"
                  icon={<TrendingUp className="w-4 h-4" />}
                >
                  Voir tous les hôtels
                </Button>
              </Link>
            </div>

            {loading ? (
              <Loader />
            ) : hotels.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl">
                <HotelIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">
                  Aucun hôtel disponible pour le moment
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hotels.map((hotel) => (
                  <HotelCard key={hotel._id} hotel={hotel} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4">
          <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-3xl p-8 sm:p-12 lg:p-16 text-white text-center">
            <div className="max-w-2xl mx-auto">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-80" />
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Prêt à réserver votre séjour ?
              </h2>
              <p className="text-lg text-blue-100 mb-8">
                Créez votre compte gratuitement et découvrez des centaines
                d&apos;hôtels au Bénin
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/auth/register">
                  <Button
                    size="lg"
                    className="bg-white text-blue-600 hover:bg-blue-50"
                  >
                    Créer mon compte
                  </Button>
                </Link>
                <Link href="/hotels">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white/10"
                  >
                    Explorer les hôtels
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="bg-slate-900 text-slate-400 py-12 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="bg-blue-600 p-2 rounded-lg">
                <HotelIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                Hotel<span className="text-blue-500">Benin</span>
              </span>
            </div>
            <p className="text-sm">
              © 2025 HotelBenin. Tous droits réservés.
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}