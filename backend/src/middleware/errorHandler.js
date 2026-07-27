const { errorResponse } = require('../util/apiResponse');

const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message;

    if (err.name === 'CastError') {
        statusCode = 404;
        message = 'Ressource non trouvée';
    }

    if (err.code === 11000) {
        statusCode = 400;
        message = 'Cette valeur existe déjà';
    }

    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors).map((val) => val.message).join(', ');
    }

    errorResponse(res, message, statusCode);
};

module.exports = errorHandler;