const emailValidator = require('deep-email-validator');

// Regex de base pour le format
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/**
 * Validation basique du format (rapide)
 */
const validateEmailFormat = (email) => {
    if (!email || typeof email !== 'string') {
        return { valid: false, error: "Email manquant" };
    }
    if (email.length < 5 || email.length > 254) {
        return { valid: false, error: "Email trop court ou trop long" };
    }
    if (!EMAIL_REGEX.test(email)) {
        return { valid: false, error: "Format d'email invalide" };
    }
    if (email.includes(' ')) {
        return { valid: false, error: "L'email ne doit pas contenir d'espaces" };
    }
    return { valid: true };
};

/**
 * ✅ VALIDATION COMPLÈTE : vérifie l'existence réelle de l'email
 * - Format (regex)
 * - Domaine (DNS)
 * - Existence SMTP (le serveur mail accepte-t-il ce destinataire ?)
 * - Detection email jetable (temp-mail, etc.)
 */
const validateEmailDeep = async (email) => {
    console.log(`🔍 Validation profonde de l'email : ${email}`);

    // Vérification 1 : format basique
    const formatCheck = validateEmailFormat(email);
    if (!formatCheck.valid) {
        return formatCheck;
    }

    try {
        // Vérification 2 : validation profonde (SMTP + DNS + format + disposable)
        const result = await emailValidator.validate({
            email: email,
            sender: process.env.EMAIL_USER || 'noreply@hotelbenin.bj',
            validateRegex: true,
            validateMx: true,           // Le domaine a-t-il des serveurs mail ?
            validateTypo: true,         // Détection des typos (gmial.com → gmail.com)
            validateDisposable: true,   // Bloque les emails jetables (temp-mail, yopmail, etc.)
            validateSMTP: true          // ✅ Vérifie SMTP que l'adresse existe
        });

        console.log(`   Résultat :`, {
            valid: result.valid,
            reason: result.reason,
            validators: result.validators
        });

        if (!result.valid) {
            let error = "Email invalide";

            // Traduction des erreurs
            switch (result.reason) {
                case 'regex':
                    error = "Format d'email invalide";
                    break;
                case 'typo':
                    error = `Faute de frappe détectée. Vouliez-vous dire "${result.validators.typo?.reason}" ?`;
                    break;
                case 'disposable':
                    error = "Les emails jetables (temporaires) ne sont pas acceptés";
                    break;
                case 'mx':
                    error = "Ce domaine email n'existe pas ou n'accepte pas les mails";
                    break;
                case 'smtp':
                    error = "Cette adresse email n'existe pas chez le fournisseur";
                    break;
                default:
                    error = "Email invalide ou inexistant";
            }

            return { valid: false, error };
        }

        return { valid: true };
    } catch (error) {
        console.error(`❌ Erreur validation email :`, error.message);
        // En cas d'erreur de validation (timeout SMTP, etc.), on laisse passer
        // pour ne pas bloquer les vrais utilisateurs
        return { valid: true, warning: "Validation approfondie impossible" };
    }
};

module.exports = {
    validateEmail: validateEmailFormat,
    validateEmailDomain: validateEmailDeep,
    validateEmailDeep,
    EMAIL_REGEX
};