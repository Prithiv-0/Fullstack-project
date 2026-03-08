/**
 * SLA Breach Ticker — runs every 5 minutes
 * Checks for assignments past their SLA deadline and marks as escalated
 * Spec Section 8.3
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
