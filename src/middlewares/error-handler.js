const ApiError = require('../utils/api-error')

// Central error handler. Any error passed to next(err) — including
// ApiError instances thrown inside asyncHandler-wrapped controllers —
// lands here instead of Express's default HTML error page.
const errorHandler = (err, req, res, next) => {
    let error = err

    if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode || 500
        const message = error.message || "Something went wrong"
        error = new ApiError(statusCode, message, error?.errors || [], err.stack)
    }

    const response = {
        success: false,
        statusCode: error.statusCode,
        message: error.message,
        errors: error.errors,
        ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {})
    }

    return res.status(error.statusCode).json(response)
}

module.exports = errorHandler
