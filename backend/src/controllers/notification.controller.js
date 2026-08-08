const Notification = require('../model/Notification');
const { successResponse, errorResponse } = require('../util/apiResponse');

// GET : Mes notifications
exports.getMesNotifications = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, lue } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const filter = { utilisateur: req.utilisateur._id };
        if (lue !== undefined) {
            filter.lue = lue === 'true';
        }

        const notifications = await Notification.find(filter)
            .sort('-createdAt')
            .skip(skip)
            .limit(Number(limit));

        const total = await Notification.countDocuments(filter);
        const nonLues = await Notification.countDocuments({
            utilisateur: req.utilisateur._id,
            lue: false
        });

        successResponse(res, {
            notifications,
            total,
            nonLues,
            page: Number(page)
        }, 'Notifications récupérées');
    } catch (error) {
        next(error);
    }
};

// PUT : Marquer une notif comme lue
exports.marquerLue = async (req, res, next) => {
    try {
        const notif = await Notification.findOneAndUpdate(
            { _id: req.params.id, utilisateur: req.utilisateur._id },
            { lue: true, dateLu: new Date() },
            { new: true }
        );

        if (!notif) {
            return errorResponse(res, 'Notification non trouvée', 404);
        }

        successResponse(res, { notification: notif }, 'Notification marquée lue');
    } catch (error) {
        next(error);
    }
};

// PUT : Marquer toutes comme lues
exports.marquerToutesLues = async (req, res, next) => {
    try {
        await Notification.updateMany(
            { utilisateur: req.utilisateur._id, lue: false },
            { lue: true, dateLu: new Date() }
        );

        successResponse(res, {}, 'Toutes les notifications marquées lues');
    } catch (error) {
        next(error);
    }
};

// DELETE : Supprimer une notif
exports.supprimer = async (req, res, next) => {
    try {
        const notif = await Notification.findOneAndDelete({
            _id: req.params.id,
            utilisateur: req.utilisateur._id
        });

        if (!notif) {
            return errorResponse(res, 'Notification non trouvée', 404);
        }

        successResponse(res, {}, 'Notification supprimée');
    } catch (error) {
        next(error);
    }
};

// DELETE : Supprimer toutes les notifs lues
exports.supprimerLues = async (req, res, next) => {
    try {
        await Notification.deleteMany({
            utilisateur: req.utilisateur._id,
            lue: true
        });

        successResponse(res, {}, 'Notifications lues supprimées');
    } catch (error) {
        next(error);
    }
};