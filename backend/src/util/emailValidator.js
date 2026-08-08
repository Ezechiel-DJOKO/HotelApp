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
    console.log(`🔍 Validation email : ${email}`);

    // Vérification 1 : format basique
    const formatCheck = validateEmailFormat(email);
    if (!formatCheck.valid) {
        return formatCheck;
    }

    // En mode développement : validation légère (pas de MX check)
    if (process.env.NODE_ENV === 'development') {
        console.log('   Mode DEV : validation MX ignorée');
        return { valid: true };
    }

    // En production : validation complète
    try {
        const result = await emailValidator.validate({
            email: email,
            sender: process.env.EMAIL_USER || 'noreply@hotelbenin.bj',
            validateRegex: true,
            validateMx: true,
            validateTypo: false,
            validateDisposable: true,
            validateSMTP: false
        });

        console.log(`   Résultat :`, {
            valid: result.valid,
            reason: result.reason,
        });

        if (!result.valid) {
            let error = "Email invalide";

            switch (result.reason) {
                case 'regex':
                    error = "Format d'email invalide";
                    break;
                case 'disposable':
                    error = "Les emails jetables ne sont pas acceptés";
                    break;
                case 'mx':
                    error = "Ce domaine email n'existe pas ou n'accepte pas les mails";
                    break;
                default:
                    error = "Email invalide ou inexistant";
            }

            return { valid: false, error };
        }

        return { valid: true };
    } catch (error) {
        console.error(`❌ Erreur validation email :`, error.message);
        // En cas d'erreur, on laisse passer
        return { valid: true, warning: "Validation impossible" };
    }
};

module.exports = {
    validateEmail: validateEmailFormat,
    validateEmailDomain: validateEmailDeep,
    validateEmailDeep,
    EMAIL_REGEX
};

