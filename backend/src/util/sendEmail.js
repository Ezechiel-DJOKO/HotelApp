const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    if (!options.to) {
        console.error("❌ sendEmail: Destinataire manquant");
        return;
    }

    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp-relay.brevo.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        tls: {
            rejectUnauthorized: false
        },
        connectionTimeout: 5000, // Timeout de 5s max
        socketTimeout: 5000
    });

    const mailOptions = {
        from: process.env.EMAIL_FROM || `HotelBenin <${process.env.EMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email envoyé à : ${options.to} (MessageId: ${info.messageId})`);
        return info;
    } catch (error) {
        console.error(`❌ Échec envoi email à ${options.to}:`, error.message);
        // On ne fait pas crash l'application
    }
};

module.exports = sendEmail;