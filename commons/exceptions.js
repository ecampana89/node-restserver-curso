const exceptionType = {
    missingParameters: {
        message: 'Missing required fields',
        code: 100,
        httpStatus: 422
    },
    unauthorizeUser: {
        code: 5200,
        message: 'Forbidden',
        httpStatus: 403
    }
}

module.exports = {exceptionType}

