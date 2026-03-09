/**
 * errorHandler.js - Centralized Error Handling Middleware
 *
 * This middleware catches all errors thrown in route handlers and sends
 * a consistent JSON error response. It handles three specific Mongoose
 * error types:
 *  - CastError (invalid ObjectId) → 404 Not Found
 *  - Duplicate key error (code 11000) → 400 Bad Request
 *  - ValidationError (schema validation) → 400 Bad Request
 *
 * Any unhandled error defaults to a 500 Internal Server Error response.
 */

const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log the full error stack to console for debugging in development
    console.error(err);

    // Handle Mongoose CastError — occurs when an invalid ObjectId is passed
    if (err.name === 'CastError') {
        const message = 'Resource not found';
        error = { message, statusCode: 404 };
    }

    // Handle MongoDB duplicate key error — e.g., duplicate email on registration
    if (err.code === 11000) {
        const message = 'Duplicate field value entered';
        error = { message, statusCode: 400 };
    }

    // Handle Mongoose validation errors — extracts all validation messages
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message);
        error = { message, statusCode: 400 };
    }

    // Send the error response with appropriate status code
    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Server Error'
    });
};

module.exports = errorHandler;
