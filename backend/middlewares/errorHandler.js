export const errorHandler = (err, req, res, next) => {

    const status = err.statusCode || 500;

    // Log error for debugging
    console.error('❌ Error Handler:', {
        message: err.message,
        status,
        path: req.path,
        method: req.method,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });

    res.status(status).json({
        success: false,
        message: err.message || 'Something went wrong',
        status,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    })

}

export const notfound = (req, res, next) => {

    const error = new Error(`Route ${req.originalUrl} Not Found`);

    error.statusCode = 404;
    next(error);
}