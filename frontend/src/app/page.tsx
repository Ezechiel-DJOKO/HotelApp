import PublicNavbar from "@/components/shared/public/PublicNavbar";
import { Hotel, MapPin, Star } from "lucide-react";

export default function HomePage() {
  return (
    <>
      <PublicNavbar />

      <main>
        <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white py-16 sm:py-20 lg:py-24 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
              Trouvez votre hôtel idéal au Bénin 🇧🇯
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-blue-100 mb-6 sm:mb-8 max-w-2xl mx-auto">
              Réservez facilement les meilleurs hôtels, auberges et résidences
              du pays au meilleur prix.
            </p>
            <button className="bg-white text-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-gray-100 transition shadow-lg">
              Découvrir les hôtels
            </button>
          </div>
        </section>

        <section className="py-12 sm:py-16 lg:py-20 max-w-7xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12 text-gray-900">
            Pourquoi choisir HotelBenin ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Hotel className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-900">
                Large sélection
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Des centaines d&apos;hébergements partout au Bénin.
              </p>
            </div>
            <div className="text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-7 h-7 sm:w-8 sm:h-8 text-purple-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-900">
                Toutes les villes
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Cotonou, Porto-Novo, Parakou, et bien plus.
              </p>
            </div>
            <div className="text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Star className="w-7 h-7 sm:w-8 sm:h-8 text-yellow-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-900">
                Avis vérifiés
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Des vrais avis de vrais voyageurs.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}