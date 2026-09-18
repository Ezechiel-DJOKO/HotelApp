const axios = require('axios');

/**
 * Initier un paiement CinetPay (API Checkout v2)
 */
const initierPaiementCinetPay = async ({
    transaction_id,
    amount,
    currency = 'XOF',
    description,
    customer_name,
    customer_surname,
    customer_email,
    customer_phone_number,
}) => {
    try {
        const payload = {
            apikey: process.env.CINETPAY_API_KEY,
            site_id: process.env.CINETPAY_SITE_ID || 'hotelbenin',
            transaction_id,
            amount: Math.round(amount),
            currency,
            description: description || 'Reservation HotelBenin',
            return_url: `${process.env.FRONTEND_URL}/client/payment/callback?transaction_id=${transaction_id}`,
            notify_url: `${process.env.NGROK_URL || process.env.BACKEND_URL}/api/payments/webhook`,
            customer_name: customer_name || '',
            customer_surname: customer_surname || '',
            customer_email: customer_email || '',
            customer_phone_number: customer_phone_number || '',
            channels: 'ALL',
        };

        console.log('💳 CinetPay - Initiation (v2):', {
            url: 'https://api-checkout.cinetpay.com/v2/payment',
            transaction_id,
            amount,
        });

        const response = await axios.post(
            'https://api-checkout.cinetpay.com/v2/payment',
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );

        console.log('✅ CinetPay - Réponse:', JSON.stringify(response.data, null, 2));

        const data = response.data?.data || response.data;

        if (data?.payment_url) {
            return {
                success: true,
                paymentUrl: data.payment_url,
                paymentToken: data.payment_token || transaction_id,
                transactionId: transaction_id,
            };
        }

        if (response.data?.code === '201') {
            return {
                success: true,
                paymentUrl: response.data.data?.payment_url,
                paymentToken: response.data.data?.payment_token || transaction_id,
                transactionId: transaction_id,
            };
        }

        return {
            success: false,
            error: response.data?.message || response.data?.description || 'Réponse inattendue',
        };
    } catch (error) {
        const errData = error.response?.data;
        console.error('❌ CinetPay error:', errData || error.message);
        return {
            success: false,
            error: errData?.message || errData?.description || error.message,
        };
    }
};

/**
 * Vérifier le statut d'une transaction
 */
const verifierPaiementCinetPay = async (transaction_id) => {
    try {
        console.log('🔍 CinetPay - Vérification:', transaction_id);

        const response = await axios.post(
            'https://api-checkout.cinetpay.com/v2/payment/check',
            {
                apikey: process.env.CINETPAY_API_KEY,
                site_id: process.env.CINETPAY_SITE_ID || 'hotelbenin',
                transaction_id,
            },
            { headers: { 'Content-Type': 'application/json' } }
        );

        console.log('📥 CinetPay - Statut:', JSON.stringify(response.data, null, 2));

        const data = response.data?.data || response.data;

        if (data.status === 'ACCEPTED') {
            return { success: true, status: 'reussi', data };
        }

        return {
            success: false,
            status: data.status === 'REFUSED' ? 'echoue' : 'en_attente',
            data,
            error: data.message || `Statut: ${data.status}`,
        };
    } catch (error) {
        console.error('❌ CinetPay verify error:', error.response?.data || error.message);
        return {
            success: false,
            status: 'echoue',
            error: error.response?.data?.message || error.message,
        };
    }
};

module.exports = {
    initierPaiementCinetPay,
    verifierPaiementCinetPay,
};