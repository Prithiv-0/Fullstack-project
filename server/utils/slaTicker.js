/**
 * slaTicker.js - SLA Breach Detection Cron Job (Spec Section 8.3)
 *
 * Runs every 5 minutes via node-cron to check for assignments that have
 * exceeded their SLA deadline (slaDueBy). When a breach is detected:
 *  1. The assignment status is set to 'escalated'
 *  2. The escalation counter is incremented
 *  3. All active admin users receive in-app notifications
 *
 * This ensures that overdue incidents are flagged for management attention
 * and never silently fall through the cracks.
 */
const cron = require('node-cron');
const Assignment = require('../models/Assignment');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Run every 5 minutes
cron.schedule('*/5 * * * *', async () => {
    try {
        const now = new Date();

        // Find assignments past SLA deadline that haven't been escalated
        const breached = await Assignment.find({
            status: { $in: ['pending', 'acknowledged', 'in_progress'] },
            slaDueBy: { $lt: now },
            $or: [
                { escalatedAt: { $exists: false } },
                { escalatedAt: null }
            ]
        }).populate('departmentId', 'name shortName')
            .populate('incidentId', 'title type severity');

        if (breached.length === 0) return;

        console.log(`⏰ SLA Ticker: ${breached.length} assignments past SLA deadline`);

        for (const assignment of breached) {
            // Mark as escalated
            assignment.status = 'escalated';
            assignment.escalationCount = (assignment.escalationCount || 0) + 1;
            assignment.escalatedAt = now;
            await assignment.save();

            // Notify admins
            const admins = await User.find({ role: 'admin', isActive: true }).select('_id').lean();
            const notifications = admins.map(admin => ({
                recipientId: admin._id,
                incidentId: assignment.incidentId?._id,
                channel: 'in_app',
                subject: 'SLA Breach Alert',
                message: `SLA breached: ${assignment.incidentId?.title || 'Incident'} assigned to ${assignment.departmentId?.name || 'department'} has exceeded its deadline.`,
                status: 'sent',
                sentAt: now
            }));

            if (notifications.length) {
                await Notification.insertMany(notifications);
            }
        }

        console.log(`⏰ SLA Ticker: Escalated ${breached.length} assignments`);
    } catch (err) {
        console.error('SLA Ticker error:', err);
    }
});

console.log('⏰ SLA breach ticker scheduled (every 5 minutes)');
