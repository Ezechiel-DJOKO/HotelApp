const nodemailer = require('nodemailer');
const createTransporter = require('../config/email');

const sendEmail = async (options) => {
    const transporter = createTransporter();

    const message = {
        from: `${process.env.EMAIL_FROM || 'no-reply'} <${process.env.EMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
    };

    try {
        const info = await transporter.sendMail(message);
        console.log("✅ Email envoyé: ", info.messageId);
        if (process.env.NODE_ENV === 'development' && process.env.USE_ETHEREAL === 'true') {
            try {
                console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
            } catch (e) {
                console.warn('Impossible d\'obtenir l\'URL de prévisualisation:', e.message);
            }
        }
        return info;
    } catch (error) {
        console.error('❌ Erreur envoi email:', error);
        // On relance l'erreur avec un message plus clair
        throw new Error(`Échec envoi email: ${error.message}`);
    }
};

module.exports = sendEmail;