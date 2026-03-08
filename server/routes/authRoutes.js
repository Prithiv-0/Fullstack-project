const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimit');
const jwt = require('jsonwebtoken');

// @route   POST /api/v1/auth/register
router.post('/register', [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('role').optional().isIn(['citizen', 'field_officer', 'government_official', 'admin'])
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: errors.array()[0].msg, details: errors.array() });
    }

    try {
        const { name, email, password, role, phone, zone } = req.body;

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ success: false, error: 'User already exists' });
        }

        user = await User.create({
            name, email, password,
            role: role || 'citizen',
            phone, zone
        });

        sendTokenResponse(user, 201, res);
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   POST /api/v1/auth/login
router.post('/login', authLimiter, [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: errors.array()[0].msg });
    }

    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        sendTokenResponse(user, 200, res);
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   POST /api/v1/auth/logout
router.post('/logout', authenticate, async (req, res) => {
    res.json({ success: true, message: 'Logged out successfully' });
});

// @route   POST /api/v1/auth/refresh
router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ success: false, error: 'Refresh token required' });
        }

        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'smartcity-refresh-secret');
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid refresh token' });
        }

        const accessToken = user.getSignedJwtToken();
        res.json({ success: true, data: { accessToken } });
    } catch (err) {
        return res.status(401).json({ success: false, error: 'Invalid refresh token' });
    }
});

// @route   GET /api/v1/auth/profile
router.get('/profile', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('department');
        res.json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   GET /api/v1/auth/me (alias)
router.get('/me', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('department');
        res.json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   PUT /api/v1/auth/profile
router.put('/profile', authenticate, async (req, res) => {
    try {
        const fieldsToUpdate = {};
        const allowed = ['name', 'phone', 'zone', 'profilePhoto'];
        allowed.forEach(f => { if (req.body[f] !== undefined) fieldsToUpdate[f] = req.body[f]; });

        const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
            new: true, runValidators: true
        });

        res.json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// backward compat alias
router.put('/updateprofile', authenticate, async (req, res) => {
    try {
        const fieldsToUpdate = {};
        const allowed = ['name', 'email', 'phone', 'zone', 'profilePhoto'];
        allowed.forEach(f => { if (req.body[f] !== undefined) fieldsToUpdate[f] = req.body[f]; });

        const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
            new: true, runValidators: true
        });
        res.json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   POST /api/v1/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json({ success: false, error: 'No user with that email' });
        }
        // In production, generate reset token and send email
        res.json({ success: true, message: 'Password reset email sent' });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   POST /api/v1/auth/reset-password
router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        // In production, verify token and reset password
        res.json({ success: true, message: 'Password reset successful' });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// Helper function to create and send token response
const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();
    const refreshToken = user.getRefreshToken();

    res.status(statusCode).json({
        success: true,
        token,
        accessToken: token,
        refreshToken,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            zone: user.zone
        }
    });
};

module.exports = router;
