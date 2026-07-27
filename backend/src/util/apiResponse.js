exports.successResponse = (res,data,message = 'Succès',statusCode = 200) => {
    res.status(statusCode).json({
        success: true,
        message,
        data
    });
};

exports.errorResponse = (res,message = 'Erreur', statusCode = 400) => {
    res.status(statusCode).json({
        success: false,
        message
    });
};
