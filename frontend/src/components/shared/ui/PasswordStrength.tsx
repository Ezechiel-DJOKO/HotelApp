"use client";

import { Check, X, Shield, ShieldCheck } from "lucide-react";

interface PasswordStrengthProps {
  password: string;
  showRequirements?: boolean;
}

export interface PasswordRequirement {
  label: string;
  test: (pwd: string) => boolean;
}

export const passwordRequirements: PasswordRequirement[] = [
  {
    label: "Au moins 8 caractères",
    test: (pwd) => pwd.length >= 8,
  },
  {
    label: "Une majuscule (A-Z)",
    test: (pwd) => /[A-Z]/.test(pwd),
  },
  {
    label: "Une minuscule (a-z)",
    test: (pwd) => /[a-z]/.test(pwd),
  },
  {
    label: "Un chiffre (0-9)",
    test: (pwd) => /[0-9]/.test(pwd),
  },
  {
    label: "Un caractère spécial (!@#$%...)",
    test: (pwd) => /[!@#$%^&*(),.?":{}|<>_\-+=/\\[\]~`]/.test(pwd),
  },
];

export const getPasswordStrength = (
  password: string
): {
  score: number;
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
} => {
  if (!password) {
    return {
      score: 0,
      label: "",
      color: "bg-slate-200",
      bgColor: "bg-slate-100",
      textColor: "text-slate-500",
    };
  }

  const passed = passwordRequirements.filter((req) => req.test(password)).length;

  const configs = [
    {
      score: 0,
      label: "Très faible",
      color: "bg-red-500",
      bgColor: "bg-red-50",
      textColor: "text-red-700",
    },
    {
      score: 1,
      label: "Faible",
      color: "bg-orange-500",
      bgColor: "bg-orange-50",
      textColor: "text-orange-700",
    },
    {
      score: 2,
      label: "Moyen",
      color: "bg-yellow-500",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-700",
    },
    {
      score: 3,
      label: "Bon",
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
    },
    {
      score: 4,
      label: "Fort",
      color: "bg-green-500",
      bgColor: "bg-green-50",
      textColor: "text-green-700",
    },
    {
      score: 5,
      label: "Excellent",
      color: "bg-emerald-600",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-700",
    },
  ];

  return configs[passed];
};

export default function PasswordStrength({
  password,
  showRequirements = true,
}: PasswordStrengthProps) {
  const strength = getPasswordStrength(password);
  const passedRequirements = passwordRequirements.filter((req) =>
    req.test(password)
  );

  if (!password) return null;

  return (
    <div className="mt-3 space-y-3">
      {/* Barre de progression */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <div className="flex items-center gap-2">
            {strength.score >= 4 ? (
              <ShieldCheck className="w-4 h-4 text-green-600" />
            ) : (
              <Shield className={`w-4 h-4 ${strength.textColor}`} />
            )}
            <span className={`text-xs font-semibold ${strength.textColor}`}>
              Sécurité : {strength.label}
            </span>
          </div>
          <span className="text-xs text-slate-500">
            {passedRequirements.length}/{passwordRequirements.length} critères
          </span>
        </div>

        {/* Barres */}
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                i <= strength.score ? strength.color : "bg-slate-200"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Requirements */}
      {showRequirements && (
        <div className={`p-3 rounded-lg ${strength.bgColor}`}>
          <p className="text-xs font-semibold text-slate-700 mb-2">
            Votre mot de passe doit contenir :
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {passwordRequirements.map((req, i) => {
              const passed = req.test(password);
              return (
                <div
                  key={i}
                  className={`flex items-center gap-2 text-xs transition ${
                    passed ? "text-green-700" : "text-slate-500"
                  }`}
                >
                  {passed ? (
                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  ) : (
                    <div className="w-4 h-4 bg-slate-300 rounded-full flex items-center justify-center flex-shrink-0">
                      <X className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <span className={passed ? "line-through opacity-70" : ""}>
                    {req.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}