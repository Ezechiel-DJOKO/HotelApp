const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const formatMontant = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

const genererRelevePDF = async (reversement) => {
    return new Promise((resolve, reject) => {
        try {
            const releverDir = path.join(__dirname, '../../releves');
            if (!fs.existsSync(releverDir)) {
                fs.mkdirSync(releverDir, { recursive: true });
            }

            const fileName = `releve-${reversement.numeroReversement}.pdf`;
            const filePath = path.join(releverDir, fileName);

            const doc = new PDFDocument({ size: 'A4', margin: 50 });
            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);

            const primaryColor = '#059669';
            const grayColor = '#64748b';
            const lightGray = '#f1f5f9';

            // HEADER
            doc.rect(0, 0, doc.page.width, 120).fill(primaryColor);
            doc.fontSize(28).fillColor('white').font('Helvetica-Bold').text('HotelBenin', 50, 40);
            doc.fontSize(10).font('Helvetica').text('Releve de reversement', 50, 75);
            doc.fontSize(18).font('Helvetica-Bold').text('RELEVE OFFICIEL', 50, 95, {
                width: doc.page.width - 100, align: 'right'
            });

            let y = 160;

            // Numéro
            doc.rect(50, y, doc.page.width - 100, 60).fill(lightGray);
            doc.fontSize(10).fillColor(grayColor).font('Helvetica').text('N° REVERSEMENT', 70, y + 15);
            doc.fontSize(18).fillColor(primaryColor).font('Helvetica-Bold').text(reversement.numeroReversement, 70, y + 30);
            doc.fontSize(10).fillColor(grayColor).font('Helvetica').text('DATE', 350, y + 15);
            doc.fontSize(12).fillColor('black').font('Helvetica-Bold')
                .text(new Date(reversement.dateReversement).toLocaleDateString('fr-FR', {
                    day: '2-digit', month: 'long', year: 'numeric'
                }), 350, y + 32);

            y += 90;

            // BÉNÉFICIAIRE
            doc.fontSize(14).fillColor(primaryColor).font('Helvetica-Bold').text('BENEFICIAIRE', 50, y);
            y += 20;
            doc.strokeColor(primaryColor).lineWidth(2).moveTo(50, y).lineTo(180, y).stroke();
            y += 15;
            doc.fontSize(12).fillColor('black').font('Helvetica-Bold')
                .text(`${reversement.proprietaire.prenom} ${reversement.proprietaire.nom}`, 50, y);
            y += 18;
            doc.fontSize(10).fillColor(grayColor).font('Helvetica').text(`Email : ${reversement.proprietaire.email}`, 50, y);
            y += 14;
            doc.text(`Hotel : ${reversement.hotel.nom} (${reversement.hotel.ville})`, 50, y);

            y += 30;

            // MÉTHODE
            doc.fontSize(14).fillColor(primaryColor).font('Helvetica-Bold').text('MODE DE REVERSEMENT', 50, y);
            y += 20;
            doc.strokeColor(primaryColor).lineWidth(2).moveTo(50, y).lineTo(230, y).stroke();
            y += 15;

            doc.rect(50, y, doc.page.width - 100, 60).fill(lightGray);
            doc.fontSize(10).fillColor(grayColor).font('Helvetica').text('METHODE', 70, y + 15);
            doc.fontSize(12).fillColor('black').font('Helvetica-Bold')
                .text(reversement.methode.replace('_', ' ').toUpperCase(), 70, y + 30);
            doc.fontSize(10).fillColor(grayColor).font('Helvetica').text('REFERENCE', 320, y + 15);
            doc.fontSize(12).fillColor('black').font('Helvetica-Bold').text(reversement.referenceExterne, 320, y + 30);

            y += 90;

            // TRANSACTIONS
            doc.fontSize(14).fillColor(primaryColor).font('Helvetica-Bold').text('TRANSACTIONS INCLUSES', 50, y);
            y += 20;
            doc.strokeColor(primaryColor).lineWidth(2).moveTo(50, y).lineTo(240, y).stroke();
            y += 15;

            // Header du tableau
            doc.fontSize(9).fillColor(grayColor).font('Helvetica-Bold')
                .text('N° TRANSACTION', 50, y)
                .text('CLIENT', 180, y)
                .text('MONTANT', 350, y, { width: 80, align: 'right' })
                .text('COMMISSION', 440, y, { width: 100, align: 'right' });

            y += 15;
            doc.strokeColor('#e5e7eb').lineWidth(1).moveTo(50, y).lineTo(doc.page.width - 50, y).stroke();
            y += 5;

            // Lignes
            reversement.transactions.forEach((t) => {
                if (y > 700) {
                    doc.addPage();
                    y = 50;
                }
                doc.fontSize(9).fillColor('black').font('Helvetica');
                doc.text(t.numeroTransaction, 50, y);
                doc.text(
                    t.utilisateur ? `${t.utilisateur.prenom} ${t.utilisateur.nom}` : 'N/A',
                    180, y, { width: 160 }
                );
                doc.text(`${formatMontant(t.montantTotal)} XOF`, 350, y, { width: 80, align: 'right' });
                doc.fillColor('#dc2626').text(`-${formatMontant(t.montantCommission)}`, 440, y, {
                    width: 100, align: 'right'
                });
                y += 18;
            });

            y += 20;
            doc.strokeColor('#e5e7eb').lineWidth(1).moveTo(50, y).lineTo(doc.page.width - 50, y).stroke();
            y += 10;

            // TOTAL
            doc.rect(50, y, doc.page.width - 100, 60).fill('#dcfce7');
            doc.fontSize(12).fillColor('#166534').font('Helvetica-Bold').text('MONTANT TOTAL VERSE', 70, y + 18);
            doc.fontSize(22).fillColor('#166534').font('Helvetica-Bold')
                .text(`${formatMontant(reversement.montantTotal)} XOF`,
                    doc.page.width - 250, y + 18, { width: 200, align: 'right' });

            y += 80;

            // Notes
            if (reversement.notes) {
                doc.fontSize(10).fillColor(grayColor).font('Helvetica')
                    .text(`Notes : ${reversement.notes}`, 50, y, { width: doc.page.width - 100 });
            }

            // FOOTER
            const footerY = doc.page.height - 60;
            doc.rect(0, footerY, doc.page.width, 60).fill(primaryColor);
            doc.fontSize(9).fillColor('white').font('Helvetica')
                .text('HotelBenin - Releve officiel de reversement', 50, footerY + 20,
                    { width: doc.page.width - 100, align: 'center' });
            doc.fontSize(7).text(
                `(c) ${new Date().getFullYear()} HotelBenin - Document genere automatiquement`,
                50, footerY + 40, { width: doc.page.width - 100, align: 'center' }
            );

            doc.end();

            stream.on('finish', () => resolve({ fileName, filePath }));
            stream.on('error', reject);
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { genererRelevePDF };