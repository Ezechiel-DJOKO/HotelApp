"use client";

import Link from "next/link";
import {
  Hotel,
  Handshake,
  Building2,
  ArrowRight,
  Shield,
  TrendingUp,
  Globe,
  Award,
  Star,
  Users,
  Sparkles,
} from "lucide-react";

import PageHeader from "@/components/shared/ui/PageHeader";
import Card from "@/components/shared/ui/Card";

const opportunities = [
  {
    icon: <Hotel className="w-10 h-10" />,
    title: "Devenir Propriétaire",
    subtitle: "Prenez les rênes d'un hôtel",
    description:
      "Choisissez parmi nos hôtels partenaires et devenez propriétaire ou gestionnaire. Rachat, gérance, copropriété — plusieurs options s'offrent à vous.",
    features: [
      "Choisir parmi les hôtels existants",
      "Proposer un hôtel non listé",
      "Rachat, gérance ou copropriété",
      "Accompagnement complet",
    ],
    href: "/client/investir/devenir-proprietaire",
    gradient: "from-purple-500 via-purple-600 to-indigo-700",
    buttonText: "Explorer les hôtels",
    badge: "🏨 Populaire",
  },
  {
    icon: <Handshake className="w-10 h-10" />,
    title: "Devenir Partenaire",
    subtitle: "Investissez dans l'hôtellerie",
    description:
      "Sponsorisez ou investissez dans un hôtel existant. Associez votre marque, financez une rénovation ou développez un partenariat commercial lucratif.",
    features: [
      "Sponsor officiel d'un hôtel",
      "Investissement financier",
      "Partenariat commercial",
      "Retour sur investissement",
    ],
    href: "/client/investir/devenir-partenaire",
    gradient: "from-blue-500 via-blue-600 to-cyan-700",
    buttonText: "Devenir partenaire",
    badge: "🤝 Nouveau",
  },
  {
    icon: <Building2 className="w-10 h-10" />,
    title: "Construire un Hôtel",
    subtitle: "Créez votre empire hôtelier",
    description:
      "Vous rêvez de construire un hôtel au Bénin ? HotelBenin vous accompagne de A à Z : recherche de terrain, permis, construction et mise en ligne.",
    features: [
      "Recherche de terrain",
      "Accompagnement administratif",
      "Suivi de construction",
      "Mise en ligne sur la plateforme",
    ],
    href: "/client/investir/construire-hotel",
    gradient: "from-amber-500 via-orange-500 to-red-600",
    buttonText: "Lancer mon projet",
    badge: "🏗️ Premium",
  },
];

export default function InvestirPage() {
  return (
    <div className="space-y-8 max-w-6xl">
      <PageHeader
        title="Investir avec HotelBenin"
        description="Découvrez nos opportunités d'investissement dans l'hôtellerie béninoise"
      />

      {/* Hero Banner */}
      <Card className="bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 border-0 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 opacity-10">
          <Building2 className="w-64 h-64 -mt-12 -mr-12" />
        </div>
        <div className="relative py-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Opportunités d&apos;investissement
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Investissez dans l&apos;hôtellerie
            <br />
            <span className="text-white/90">au Bénin 🇧🇯</span>
          </h2>
          <p className="text-white/90 max-w-2xl mx-auto mb-6">
            Que vous souhaitiez devenir propriétaire, partenaire ou construire
            un nouvel hôtel, HotelBenin vous accompagne dans votre projet
            d&apos;investissement.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto">
            {[
              { icon: <Shield className="w-5 h-5" />, text: "100% Sécurisé" },
              { icon: <TrendingUp className="w-5 h-5" />, text: "ROI Élevé" },
              { icon: <Globe className="w-5 h-5" />, text: "Marché en croissance" },
              { icon: <Award className="w-5 h-5" />, text: "Accompagnement pro" },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center"
              >
                <div className="flex justify-center mb-1">{item.icon}</div>
                <p className="text-xs font-medium">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* 3 Opportunités */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {opportunities.map((opp, i) => (
          <Link key={i} href={opp.href} className="group">
            <Card
              padding="none"
              hover
              className="overflow-hidden h-full flex flex-col"
            >
              {/* Header gradient */}
              <div
                className={`bg-gradient-to-br ${opp.gradient} p-6 text-white relative overflow-hidden`}
              >
                <div className="absolute top-2 right-2 bg-white/20 backdrop-blur-sm text-xs font-bold px-2 py-1 rounded-full">
                  {opp.badge}
                </div>
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  {opp.icon}
                </div>
                <h3 className="text-xl font-bold mb-1">{opp.title}</h3>
                <p className="text-sm text-white/90">{opp.subtitle}</p>
              </div>

              {/* Body */}
              <div className="p-6 flex-1 flex flex-col">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 flex-1">
                  {opp.description}
                </p>

                <ul className="space-y-2 mb-6">
                  {opp.features.map((feature, j) => (
                    <li
                      key={j}
                      className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300"
                    >
                      <div className="w-5 h-5 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <Star className="w-3 h-3 text-green-600" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>

                <div
                  className={`w-full bg-gradient-to-r ${opp.gradient} text-white py-3 rounded-lg font-medium text-center group-hover:opacity-90 transition flex items-center justify-center gap-2`}
                >
                  {opp.buttonText}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Statistiques */}
      <Card className="bg-slate-50 dark:bg-slate-800">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Pourquoi investir au Bénin ?
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Le secteur hôtelier béninois est en pleine croissance
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { value: "+15%", label: "Croissance tourisme/an", icon: <TrendingUp className="w-6 h-6 text-green-600" /> },
            { value: "2M+", label: "Touristes par an", icon: <Users className="w-6 h-6 text-blue-600" /> },
            { value: "85%", label: "Taux d'occupation", icon: <Hotel className="w-6 h-6 text-purple-600" /> },
            { value: "24/7", label: "Support HotelBenin", icon: <Shield className="w-6 h-6 text-orange-600" /> },
          ].map((stat, i) => (
            <div key={i} className="text-center p-4 bg-white dark:bg-slate-700 rounded-xl">
              <div className="flex justify-center mb-2">{stat.icon}</div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {stat.value}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* FAQ rapide */}
      <Card>
        <h3 className="font-bold text-slate-900 dark:text-white mb-4">
          ❓ Questions fréquentes
        </h3>
        <div className="space-y-3">
          {[
            {
              q: "Qui peut investir ?",
              a: "Toute personne physique ou morale, béninoise ou étrangère, peut soumettre une demande d'investissement.",
            },
            {
              q: "Combien de temps pour traiter ma demande ?",
              a: "Notre équipe examine chaque demande sous 48 heures et vous contacte pour discuter de votre projet.",
            },
            {
              q: "Y a-t-il des frais ?",
              a: "La soumission de demande est 100% gratuite. Les frais éventuels sont discutés uniquement si votre projet est accepté.",
            },
          ].map((faq, i) => (
            <div
              key={i}
              className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg"
            >
              <p className="font-semibold text-slate-900 dark:text-white mb-1">
                {faq.q}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}