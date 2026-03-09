/**
 * authMiddleware.js - Authentication & Authorization Middleware
 *
 * Provides two key middleware functions:
 *  1. authenticate — Verifies JWT tokens from the Authorization header.
 *     Extracts the Bearer token, decodes it, and attaches the user to req.user.
 *  2. authorize — Restricts route access based on user roles (citizen, field_officer,
 *     government_official, admin). Returns 403 if the user's role is not permitted.
 *
 * The 'protect' alias is kept for backward compatibility with older route files.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * authenticate - Middleware to protect routes behind JWT authentication.
 * Expects an Authorization header in the format: "Bearer <token>".
 * Decodes the token, finds the user in the database, and attaches it to req.user.
 */
const authenticate = async (req, res, next) => {
    let token;

    // Extract the Bearer token from the Authorization header
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    // No token found — reject the request
    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Not authorized to access this route'
        });
    }

    try {
        // Verify the token using the JWT secret
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'smartcity-secret');

        // Find the user by ID from the decoded token payload
        req.user = await User.findById(decoded.id);

        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'User not found'
            });
        }

        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            error: 'Not authorized to access this route'
        });
    }
};

/**
 * authorize - Middleware factory that restricts access to specific roles.
 * Usage: authorize('admin', 'government_official') — only allows those roles.
 * Must be used after authenticate so that req.user is available.
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: `User role '${req.user.role}' is not authorized to access this route`
            });
        }
        next();
    };
};

// Backward-compatible alias for 'authenticate'
const protect = authenticate;

module.exports = { authenticate, authorize, protect };
