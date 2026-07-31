const nodemailer = require('nodemailer');
const createTransporter = require('../config/email');

const sendEmail = async (options) => {
    if (!options.to) {
        throw new Error('❌ Destinataire (to) manquant');
    }

    const transporter = createTransporter();

    const message = {
        from: process.env.EMAIL_FROM || `HotelBenin <${process.env.EMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
    };

    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 ENVOI EMAIL');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   De        : ${message.from}`);
    console.log(`   À         : ${message.to}`);
    console.log(`   Sujet     : ${message.subject}`);

    try {
        const info = await transporter.sendMail(message);
        console.log(`✅ EMAIL ENVOYÉ`);
        console.log(`   Message ID : ${info.messageId}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('');
        return info;
    } catch (error) {
        console.error(`❌ ÉCHEC ENVOI : ${error.message}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        throw new Error(`Échec envoi email: ${error.message}`);
    }
};

module.exports = sendEmail;