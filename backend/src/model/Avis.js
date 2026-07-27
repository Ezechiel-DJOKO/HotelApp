const mongoose = require('mongoose');

const avisSchema = new mongoose.Schema({
    utilisateur: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur', required: true },
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
    note: { type: Number, required: true, min: 1, max: 5 },
    titre: String,
    commentaire: { type: String, required: true },
    estVerifie: { type: Boolean, default: false },
}, { timestamps: true });

avisSchema.statics.calculerMoyenne = async function (hotelId) {
    const stats = await this.aggregate([
        { $match: { hotel: hotelId } },
        {
            $group: {
                _id: '$hotel',
                moyenne: { $avg: '$note' },
                total: { $sum: 1 },
            },
        },
    ]);

    if (stats.length > 0) {
        await mongoose.model('Hotel').findByIdAndUpdate(hotelId, {
            note: Math.round(stats[0].moyenne * 10) / 10,
            nombreAvis: stats[0].total,
        });
    } else {
        await mongoose.model('Hotel').findByIdAndUpdate(hotelId, {
            note: 0,
            nombreAvis: 0,
        });
    }
};

avisSchema.post('save', function () {
    this.constructor.calculerMoyenne(this.hotel);
});

module.exports = mongoose.model('Avis', avisSchema);