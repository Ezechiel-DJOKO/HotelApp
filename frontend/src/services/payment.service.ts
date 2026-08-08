import api from "@/lib/axios";
import { ApiResponse, Transaction, PaymentMethod, PaymentMethodOption } from "@/types";

interface InitPaymentResponse {
  reservationId: string;
  montantTotal: number;
  devise: string;
  hotel: {
    nom: string;
    etoiles: number;
  };
  chambre: {
    nom: string;
  };
  dates: {
    arrivee: string;
    depart: string;
  };
  paymentMode: string;
  methodesDisponibles: PaymentMethodOption[];
}

interface ConfirmPaymentData {
  reservationId: string;
  methode: PaymentMethod;
  telephone?: string;
}

interface ConfirmPaymentResponse {
  transaction: {
    numeroTransaction: string;
    numeroReçu: string;
    montantTotal: number;
    methode: string;
    statut: string;
    receiptUrl: string;
  };
  reservation: {
    _id: string;
    statut: string;
  };
}

export const paymentService = {
  // Initier un paiement
  initierPaiement: async (reservationId: string) => {
    const res = await api.post<ApiResponse<InitPaymentResponse>>(
      "/payments/initier",
      { reservationId }
    );
    return res.data;
  },

  // Confirmer le paiement (simulation)
  confirmerPaiement: async (data: ConfirmPaymentData) => {
    const res = await api.post<ApiResponse<ConfirmPaymentResponse>>(
      "/payments/confirmer",
      data
    );
    return res.data;
  },

  // Télécharger le reçu PDF
// Télécharger le reçu PDF (avec authentification)
telechargerRecu: async (transactionId: string, numeroReçu?: string) => {
  try {
    const response = await api.get(`/payments/receipt/${transactionId}`, {
      responseType: "blob", // ⭐ IMPORTANT : recevoir le fichier binaire
    });

    // Créer un blob à partir de la réponse
    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);

    // Créer un lien invisible pour télécharger
    const link = document.createElement("a");
    link.href = url;
    link.download = `Recu-HotelBenin-${numeroReçu || transactionId}.pdf`;
    document.body.appendChild(link);
    link.click();

    // Nettoyer
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error("Erreur téléchargement:", error);
    throw new Error("Impossible de télécharger le reçu");
  }
},

  // Mes paiements (client)
  getMesPaiements: async () => {
    const res = await api.get<ApiResponse<{ transactions: Transaction[] }>>(
      "/payments/mes-paiements"
    );
    return res.data;
  },

  // Revenus owner
  getMesRevenus: async () => {
    const res = await api.get<
      ApiResponse<{
        transactions: Transaction[];
        stats: {
          totalTransactions: number;
          revenuBrut: number;
          totalCommission: number;
          revenuNet: number;
          deja_verse: number;
          a_recevoir: number;
          en_attente: number;
          deja_paye: number;
        };
      }>
    >("/payments/mes-revenus");
    return res.data;
  },

  // Toutes les transactions (admin)
  getAllTransactions: async () => {
    const res = await api.get<
      ApiResponse<{
        transactions: Transaction[];
        stats: {
          totalTransactions: number;
          revenuTotal: number;
          commissionsTotales: number;
          aReverser: number;
          transactionsReussies: number;
          transactionsEchouees: number;
        };
      }>
    >("/payments/all");
    return res.data;
  },
};