const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

const validateEmailFormat = (email) => {
    if (!email || typeof email !== 'string') {
        return { valid: false, error: "Email manquant" };
    }
    const cleanEmail = email.trim();
    if (cleanEmail.length < 5 || cleanEmail.length > 254) {
        return { valid: false, error: "Email trop court ou trop long" };
    }
    if (!EMAIL_REGEX.test(cleanEmail)) {
        return { valid: false, error: "Format d'email invalide" };
    }
    return { valid: true };
};

const validateEmailDeep = async (email) => {
    return validateEmailFormat(email);
};

module.exports = {
    validateEmail: validateEmailFormat,
    validateEmailDomain: validateEmailDeep,
    validateEmailDeep,
    EMAIL_REGEX
};
