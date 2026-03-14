/**
 * @module routes/notification.routes
 * @description Notification management routes for alerts and broadcasts.
 *   Supports sending targeted notifications, viewing notification history,
 *   marking notifications as read, and broadcasting messages to citizens by zone.
 *
 * @routes
 *   POST /send         - Send notification(s) to specific user(s) (admin)
 *   GET  /history      - Get the authenticated user's notification history (paginated)
 *   PUT  /:id/read     - Mark a notification as read
 *   GET  /unread-count - Get count of unread notifications for the current user
 *   POST /broadcast    - Broadcast a message to all citizens or a specific zone (admin)
 */
const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/authMiddleware');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @route   POST /api/v1/notifications/send
// @desc    Send alert to user(s)
// @access  admin
router.post('/send', authenticate, authorize('admin'), async (req, res) => {
    try {
        const { recipientId, incidentId, channel, subject, message } = req.body;
        if (!message) return res.status(400).json({ success: false, error: 'Message required' });

        const recipients = Array.isArray(recipientId) ? recipientId : [recipientId];
        const notifications = [];

        for (const rid of recipients) {
            const notif = await Notification.create({
                recipientId: rid, incidentId,
                channel: channel || 'in_app',
                subject, message,
                status: 'sent', sentAt: new Date()
            });
            notifications.push(notif);
        }

        res.status(201).json({ success: true, data: notifications, message: `${notifications.length} notification(s) sent` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   GET /api/v1/notifications/history
// @desc    Get my notification history
router.get('/history', authenticate, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        const [notifications, total] = await Promise.all([
            Notification.find({ recipientId: req.user.id })
                .populate('incidentId', 'title type status')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit).limit(limit).lean(),
            Notification.countDocuments({ recipientId: req.user.id })
        ]);

        res.json({ success: true, data: notifications, total, page, limit });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   PUT /api/v1/notifications/:id/read
// @desc    Mark notification as read
router.put('/:id/read', authenticate, async (req, res) => {
    try {
        const notif = await Notification.findOneAndUpdate(
            { _id: req.params.id, recipientId: req.user.id },
            { status: 'read' },
            { new: true }
        );
        if (!notif) return res.status(404).json({ success: false, error: 'Notification not found' });
        res.json({ success: true, data: notif });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   GET /api/v1/notifications/unread-count
// @desc    Count of unread notifications
router.get('/unread-count', authenticate, async (req, res) => {
    try {
        const count = await Notification.countDocuments({
            recipientId: req.user.id,
            status: { $in: ['pending', 'sent', 'delivered'] }
        });
        res.json({ success: true, data: { count } });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// @route   POST /api/v1/notifications/broadcast
// @desc    Broadcast to zone/all citizens
// @access  admin
router.post('/broadcast', authenticate, authorize('admin'), async (req, res) => {
    try {
        const { zone, subject, message, channel } = req.body;
        if (!message) return res.status(400).json({ success: false, error: 'Message required' });

        const filter = { role: 'citizen', isActive: true };
        if (zone && zone !== 'all') filter.zone = zone;

        const citizens = await User.find(filter).select('_id').lean();
        const notifications = [];

        for (const citizen of citizens) {
            notifications.push({
                recipientId: citizen._id,
                channel: channel || 'in_app',
                subject, message,
                status: 'sent', sentAt: new Date()
            });
        }

        if (notifications.length) await Notification.insertMany(notifications);

        res.status(201).json({
            success: true,
            message: `Broadcast sent to ${notifications.length} citizens`,
            data: { recipientCount: notifications.length }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

module.exports = router;
