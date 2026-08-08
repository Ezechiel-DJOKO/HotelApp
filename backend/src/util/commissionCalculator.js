/**
 * Calcule la commission selon les étoiles de l'hôtel
 * - 1 à 4 étoiles → 10%
 * - 5 étoiles → 15%
 */
const calculerCommission = (montantTotal, etoiles) => {
    const tauxStandard = parseInt(process.env.COMMISSION_STANDARD) || 10;
    const tauxPremium = parseInt(process.env.COMMISSION_PREMIUM) || 15;
    
    const taux = etoiles >= 5 ? tauxPremium : tauxStandard;
    const commission = Math.round(montantTotal * (taux / 100));
    const montantHotel = montantTotal - commission;
    
    return {
        tauxCommission: taux,
        montantCommission: commission,
        montantHotel: montantHotel
    };
};

/**
 * Génère un numéro de transaction unique
 * Format: HBN-YYYYMMDD-XXXXX
 */
const genererNumeroTransaction = () => {
    const date = new Date();
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(10000 + Math.random() * 90000);
    return `HBN-${yyyy}${mm}${dd}-${random}`;
};

/**
 * Génère un numéro de reçu unique
 * Format: RC-YYYYMMDD-XXXXX
 */
const genererNumeroReçu = () => {
    const date = new Date();
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(10000 + Math.random() * 90000);
    return `RC-${yyyy}${mm}${dd}-${random}`;
};

module.exports = {
    calculerCommission,
    genererNumeroTransaction,
    genererNumeroReçu
};