const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

const formatMontant = (nombre) => {
    return Math.round(nombre).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

const genererRecuPDF = async (transaction, reservation, hotel, chambre, utilisateur) => {
    return new Promise(async (resolve, reject) => {
        try {
            const receiptsDir = path.join(__dirname, '../../receipts');
            if (!fs.existsSync(receiptsDir)) {
                fs.mkdirSync(receiptsDir, { recursive: true });
            }

            const fileName = `recu-${transaction.numeroReçu}.pdf`;
            const filePath = path.join(receiptsDir, fileName);

            // QR Code
            const qrData = JSON.stringify({
                r: transaction.numeroReçu,
                id: reservation._id.toString().slice(-8),
                h: hotel.nom,
                m: transaction.montantTotal
            });

            const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
                width: 120, margin: 1,
                color: { dark: '#1e40af', light: '#ffffff' }
            });

            const qrCodeBuffer = Buffer.from(
                qrCodeDataUrl.replace(/^data:image\/png;base64,/, ''), 'base64'
            );

            // PDF compact (1 page)
            const doc = new PDFDocument({ size: 'A4', margin: 40 });
            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);

            const blue = '#1e40af';
            const gray = '#64748b';
            const lightGray = '#f1f5f9';
            const W = doc.page.width - 80; // largeur utile

            // ============ HEADER (compact) ============
            doc.rect(0, 0, doc.page.width, 80).fill(blue);
            doc.fontSize(22).fillColor('white').font('Helvetica-Bold').text('HotelBenin', 40, 25);
            doc.fontSize(8).font('Helvetica').text('La 1ere plateforme d\'hebergement au Benin', 40, 52);
            doc.fontSize(14).font('Helvetica-Bold').text('RECU DE PAIEMENT', 40, 30, { width: W, align: 'right' });

            let y = 95;

            // ============ NUMÉRO + DATE (1 ligne) ============
            doc.rect(40, y, W, 35).fill(lightGray);
            doc.fontSize(8).fillColor(gray).font('Helvetica').text('N° RECU', 55, y + 8);
            doc.fontSize(12).fillColor(blue).font('Helvetica-Bold').text(transaction.numeroReçu, 55, y + 18);
            doc.fontSize(8).fillColor(gray).font('Helvetica').text('DATE', 350, y + 8);
            doc.fontSize(10).fillColor('black').font('Helvetica-Bold').text(
                new Date(transaction.datePaiement || Date.now()).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }),
                350, y + 19
            );

            y += 50;

            // ============ CLIENT (compact) ============
            doc.fontSize(10).fillColor(blue).font('Helvetica-Bold').text('CLIENT', 40, y);
            y += 14;
            doc.fontSize(9).fillColor('black').font('Helvetica-Bold').text(`${utilisateur.prenom} ${utilisateur.nom}`, 40, y);
            y += 12;
            doc.fontSize(8).fillColor(gray).font('Helvetica').text(`Email : ${utilisateur.email}`, 40, y);
            if (utilisateur.phone) {
                doc.text(`  |  Tel : ${utilisateur.phone}`, 200, y);
            }

            y += 20;

            // ============ HÔTEL (compact) ============
            doc.fontSize(10).fillColor(blue).font('Helvetica-Bold').text('HOTEL', 40, y);
            y += 14;
            doc.fontSize(9).fillColor('black').font('Helvetica-Bold').text(hotel.nom, 40, y);
            y += 12;
            doc.fontSize(8).fillColor(gray).font('Helvetica').text(`${hotel.adresse}, ${hotel.ville}`, 40, y);
            if (hotel.telephone) {
                doc.text(`  |  Tel : ${hotel.telephone}`, 300, y);
            }

            y += 22;

            // ============ SÉJOUR (tableau compact) ============
            const nuits = Math.ceil(
                (new Date(reservation.dateDepart).getTime() - new Date(reservation.dateArrivee).getTime()) / (1000 * 60 * 60 * 24)
            );

            doc.rect(40, y, W, 65).fill(lightGray);

            // Ligne 1 : Chambre
            doc.fontSize(8).fillColor(gray).font('Helvetica').text('CHAMBRE', 55, y + 8);
            doc.fontSize(9).fillColor('black').font('Helvetica-Bold').text(`${chambre.nom} (${chambre.type})`, 55, y + 18);

            // Ligne 1 droite : Nuits + Voyageurs
            doc.fontSize(8).fillColor(gray).font('Helvetica').text('DUREE', 350, y + 8);
            doc.fontSize(9).fillColor('black').font('Helvetica-Bold').text(`${nuits} nuit${nuits > 1 ? 's' : ''}`, 350, y + 18);

            // Ligne 2 : Dates
            doc.fontSize(8).fillColor(gray).font('Helvetica').text('ARRIVEE', 55, y + 38);
            doc.fontSize(9).fillColor('black').font('Helvetica-Bold').text(
                new Date(reservation.dateArrivee).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' }),
                55, y + 48
            );

            doc.fontSize(8).fillColor(gray).font('Helvetica').text('DEPART', 300, y + 38);
            doc.fontSize(9).fillColor('black').font('Helvetica-Bold').text(
                new Date(reservation.dateDepart).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' }),
                300, y + 48
            );

            const voyageursText = `${reservation.voyageurs.adultes} adulte${reservation.voyageurs.adultes > 1 ? 's' : ''}${
                reservation.voyageurs.enfants > 0 ? `, ${reservation.voyageurs.enfants} enfant${reservation.voyageurs.enfants > 1 ? 's' : ''}` : ''
            }`;
            doc.fontSize(8).fillColor(gray).font('Helvetica').text('VOYAGEURS', 450, y + 38);
            doc.fontSize(9).fillColor('black').font('Helvetica-Bold').text(voyageursText, 450, y + 48);

            y += 80;

            // ============ PAIEMENT (compact) ============
            const methodeLabels = {
                mtn_momo: 'MTN Mobile Money', moov_money: 'Moov Money', orange_money: 'Orange Money',
                wave: 'Wave', carte_visa: 'Carte Visa', carte_mastercard: 'Carte Mastercard', demo: 'Paiement Demo'
            };

            doc.fontSize(10).fillColor(blue).font('Helvetica-Bold').text('PAIEMENT', 40, y);
            y += 14;
            doc.fontSize(8).fillColor(gray).font('Helvetica').text('Methode : ', 40, y);
            doc.fontSize(9).fillColor('black').font('Helvetica-Bold').text(methodeLabels[transaction.methode] || transaction.methode, 95, y);

            y += 20;

            // TOTAL (encadré vert)
            doc.rect(40, y, W, 40).fill('#dcfce7');
            doc.fontSize(10).fillColor('#166534').font('Helvetica-Bold').text('MONTANT TOTAL PAYE', 55, y + 12);
            doc.fontSize(18).fillColor('#166534').font('Helvetica-Bold').text(
                `${formatMontant(transaction.montantTotal)} ${transaction.devise}`,
                doc.page.width - 220, y + 8, { width: 180, align: 'right' }
            );

            y += 55;

            // ============ QR CODE + TEXTE (côte à côte) ============
            doc.fontSize(9).fillColor(gray).font('Helvetica-Bold').text(
                'PRESENTEZ CE RECU A L\'HOTEL', 40, y, { width: W, align: 'center' }
            );

            y += 15;

            // QR à gauche
            doc.image(qrCodeBuffer, doc.page.width / 2 - 45, y, { width: 90, height: 90 });

            y += 100;

            // Numéro de réservation
            doc.fontSize(7).fillColor(gray).font('Helvetica').text(
                `Numero de reservation : ${reservation._id.toString().slice(-8).toUpperCase()}`,
                40, y, { width: W, align: 'center' }
            );

            // ============ FOOTER (compact) ============
            const footerY = doc.page.height - 40;
            doc.rect(0, footerY, doc.page.width, 40).fill(blue);
            doc.fontSize(7).fillColor('white').font('Helvetica').text(
                'HotelBenin - La 1ere plateforme d\'hebergement au Benin  |  Email : contact@hotelbenin.bj  |  Web : www.hotelbenin.bj',
                40, footerY + 12, { width: W, align: 'center' }
            );
            doc.fontSize(6).text(
                `(c) ${new Date().getFullYear()} HotelBenin - Recu genere automatiquement`,
                40, footerY + 25, { width: W, align: 'center' }
            );

            doc.end();

            stream.on('finish', () => {
                console.log(`✅ Reçu PDF (1 page) : ${fileName}`);
                resolve({ fileName, filePath, qrCodeData: qrData });
            });
            stream.on('error', reject);
        } catch (error) {
            console.error('❌ Erreur PDF:', error);
            reject(error);
        }
    });
};

module.exports = { genererRecuPDF };