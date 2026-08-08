const { v4: uuidv4 } = require('uuid');

/**
 * Simule un paiement (mode démo)
 * Retourne une réponse similaire à ce que CinetPay renverrait
 */
const simulerPaiement = async ({ montant, methode, telephone }) => {
    // Simuler un délai réseau (500ms)
    await new Promise(resolve => setTimeout(resolve, 500));

    // Générer une fausse référence
    const referenceExterne = `DEMO-${uuidv4().split('-')[0].toUpperCase()}`;

    // 95% de chance de succès en démo
    const succes = Math.random() < 0.95;

    if (!succes) {
        return {
            success: false,
            error: 'Solde insuffisant (simulation)',
            reference: referenceExterne
        };
    }

    return {
        success: true,
        reference: referenceExterne,
        transactionData: {
            provider: 'DEMO',
            methode,
            telephone: telephone || null,
            montant,
            devise: 'XOF',
            timestamp: new Date().toISOString(),
            statut: 'SUCCESS',
            message: 'Paiement simulé avec succès'
        }
    };
};

/**
 * Simule un remboursement
 */
const simulerRemboursement = async ({ referenceExterne, montant }) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
        success: true,
        reference: `REFUND-${uuidv4().split('-')[0].toUpperCase()}`,
        remboursementData: {
            provider: 'DEMO',
            referenceOriginale: referenceExterne,
            montantRembourse: montant,
            timestamp: new Date().toISOString()
        }
    };
};

module.exports = {
    simulerPaiement,
    simulerRemboursement
};