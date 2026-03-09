/**
 * Comprehensive Seed Script — Smart City Platform
 * Populates ALL 10 collections with realistic data for every feature.
 *
 * Usage:  node seeds/fullSeed.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

// Models
const User = require('../models/User');
const Incident = require('../models/Incident');
const Department = require('../models/Department');
const Assignment = require('../models/Assignment');
const IncidentIntelligence = require('../models/IncidentIntelligence');
const RiskForecast = require('../models/RiskForecast');
const ResolutionLog = require('../models/ResolutionLog');
const Notification = require('../models/Notification');
const Feedback = require('../models/Feedback');
const AnalyticsAggregate = require('../models/AnalyticsAggregate');

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/smart-city-command';

// ─── HELPER ───
const daysAgo = (n) => new Date(Date.now() - n * 86400000);
const hoursAgo = (n) => new Date(Date.now() - n * 3600000);
const randomPick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// ─── DATA ───
const ZONES = ['Central', 'North', 'South', 'East', 'West', 'Mahadevapura', 'Bommanahalli', 'Dasarahalli', 'Yelahanka', 'Rajarajeshwari Nagar'];

const BANGALORE_COORDS = [
    { lat: 12.9716, lng: 77.5946, area: 'MG Road', zone: 'Central' },
    { lat: 12.9352, lng: 77.6145, area: 'Koramangala', zone: 'South' },
    { lat: 12.9698, lng: 77.7500, area: 'Whitefield', zone: 'Mahadevapura' },
    { lat: 13.0358, lng: 77.5970, area: 'Yelahanka', zone: 'Yelahanka' },
    { lat: 12.9063, lng: 77.5857, area: 'Banashankari', zone: 'South' },
    { lat: 12.9784, lng: 77.6408, area: 'Indiranagar', zone: 'East' },
    { lat: 12.9344, lng: 77.6101, area: 'BTM Layout', zone: 'South' },
    { lat: 12.9611, lng: 77.6387, area: 'HAL Airport Road', zone: 'East' },
    { lat: 12.9141, lng: 77.6411, area: 'HSR Layout', zone: 'Bommanahalli' },
    { lat: 12.9566, lng: 77.7009, area: 'Marathahalli', zone: 'Mahadevapura' },
    { lat: 12.9850, lng: 77.5533, area: 'Rajajinagar', zone: 'West' },
    { lat: 13.0070, lng: 77.5650, area: 'Malleswaram', zone: 'North' },
    { lat: 12.9300, lng: 77.5600, area: 'Basavanagudi', zone: 'South' },
    { lat: 13.0200, lng: 77.6400, area: 'Hebbal', zone: 'North' },
    { lat: 12.9100, lng: 77.6500, area: 'Bommanahalli', zone: 'Bommanahalli' },
    { lat: 12.9500, lng: 77.5200, area: 'RR Nagar', zone: 'Rajarajeshwari Nagar' },
    { lat: 13.0400, lng: 77.5200, area: 'Dasarahalli', zone: 'Dasarahalli' },
    { lat: 12.9600, lng: 77.5800, area: 'Cubbon Park', zone: 'Central' },
    { lat: 12.9900, lng: 77.7100, area: 'ITPL', zone: 'Mahadevapura' },
    { lat: 12.9250, lng: 77.5900, area: 'Jayanagar', zone: 'South' },
];

const INCIDENT_TEMPLATES = [
    { type: 'pothole', title: 'Large pothole on main road', desc: 'Deep pothole approximately 2 feet wide causing vehicle damage. Multiple vehicles have been affected.' },
    { type: 'pothole', title: 'Crater-sized pothole near junction', desc: 'Massive pothole formed after rain. Two-wheelers are falling. Very dangerous especially at night.' },
    { type: 'traffic', title: 'Traffic signal malfunction at junction', desc: 'Traffic light stuck on red for over an hour. Causing massive congestion during peak hours.' },
    { type: 'traffic', title: 'No traffic management during road work', desc: 'Road construction has blocked one lane with no traffic diversion. Terrible jams daily.' },
    { type: 'flooding', title: 'Severe waterlogging on residential street', desc: 'Water level has risen to 2 feet in the area after heavy rain. Vehicles stranded, residents unable to exit homes.' },
    { type: 'flooding', title: 'Underpass completely flooded', desc: 'The underpass is submerged in water. Vehicles cannot pass through, causing major detours.' },
    { type: 'streetlight', title: 'Multiple street lights not working', desc: 'Entire stretch of 500m has no working street lights. Very unsafe for pedestrians at night.' },
    { type: 'streetlight', title: 'Broken street light pole leaning dangerously', desc: 'The pole is tilting at 45 degrees and could fall anytime. Risk to pedestrians and parked vehicles.' },
    { type: 'garbage', title: 'Garbage dumped on main road', desc: 'Large pile of garbage blocking half the road. Foul smell affecting nearby residents and shops.' },
    { type: 'garbage', title: 'Overflowing garbage bins for 5 days', desc: 'BBMP bins not emptied in 5 days. Garbage overflowing onto sidewalk. Stray dogs scattering waste.' },
    { type: 'accident', title: 'Multi-vehicle accident near flyover', desc: 'Three vehicles involved in collision. Road partially blocked. Minor injuries reported.' },
    { type: 'water_leak', title: 'Major water pipeline burst', desc: 'Water gushing out from broken pipeline. Road is flooded. Water supply affected to nearby apartments.' },
    { type: 'water_leak', title: 'Continuous water seepage on road', desc: 'Underground pipe leak causing constant water flow on the road surface. Road deteriorating rapidly.' },
    { type: 'road_damage', title: 'Road cave-in near construction site', desc: 'A section of road has caved in near metro construction. Very dangerous for vehicles.' },
    { type: 'road_damage', title: 'Broken road divider at busy junction', desc: 'The concrete road divider is broken and parts are on the road. Vehicles swerving to avoid debris.' },
    { type: 'safety_issue', title: 'Open manhole without cover', desc: 'Manhole cover missing on busy pedestrian sidewalk. Already 2 people have fallen. Immediately dangerous.' },
    { type: 'safety_issue', title: 'Exposed electrical wires near park', desc: 'Electrical wires hanging low near children\'s park. Very dangerous especially during rain.' },
    { type: 'noise', title: 'Construction noise past 10 PM daily', desc: 'Construction at commercial site continues past midnight. Affecting sleep of thousands of residents.' },
    { type: 'illegal_parking', title: 'Vehicles blocking emergency exit', desc: 'Cars parked in no-parking zone blocking the fire exit of a shopping complex.' },
    { type: 'sewage', title: 'Sewage overflow on residential street', desc: 'Raw sewage flowing onto the street from blocked drain. Health hazard for the entire locality.' },
    { type: 'sewage', title: 'Manholes overflowing with sewage', desc: 'Multiple manholes in the area are overflowing with sewage. Unbearable stench. Children falling sick.' },
    { type: 'accident', title: 'Bus collision at signal', desc: 'BMTC bus collided with auto-rickshaw at traffic signal. Passengers have minor injuries.' },
    { type: 'garbage', title: 'Construction debris dumped illegally', desc: 'Construction waste dumped on vacant plot near school. Dust causing breathing problems for students.' },
    { type: 'pothole', title: 'Road full of potholes after re-tarring', desc: 'Newly tarred road has developed numerous potholes within a week. Quality of work is very poor.' },
    { type: 'flooding', title: 'Stormwater drain blocked causing flooding', desc: 'The stormwater drain is completely blocked with garbage. Even slight rain causes knee-deep water.' },
];

const SEVERITIES = ['critical', 'high', 'medium', 'low'];
const STATUSES = ['reported', 'acknowledged', 'assigned', 'in_progress', 'resolved', 'closed'];

// ─── SEED FUNCTION ───
async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB:', MONGO_URI.replace(/\/\/.*@/, '//<credentials>@'));

        // ── Clear existing data ──
        console.log('\n🗑️  Clearing existing data...');
        await Promise.all([
            User.deleteMany({}),
            Incident.deleteMany({}),
            Department.deleteMany({}),
            Assignment.deleteMany({}),
            IncidentIntelligence.deleteMany({}),
            RiskForecast.deleteMany({}),
            ResolutionLog.deleteMany({}),
            Notification.deleteMany({}),
            Feedback.deleteMany({}),
            AnalyticsAggregate.deleteMany({})
        ]);
        console.log('   Done.');

        // ═════════════════════════════════════════════
        // 1. USERS  (4 roles × multiple each = 12)
        // ═════════════════════════════════════════════
        console.log('\n👤 Creating users...');
        const hashedPw = await bcrypt.hash('password123', 12);

        const usersData = [
            { name: 'Admin User', email: 'admin@smartcity.gov.in', role: 'admin', zone: 'Central', phone: '9800000001', isVerified: true },
            { name: 'System Admin', email: 'sysadmin@smartcity.gov.in', role: 'admin', zone: 'North', phone: '9800000002', isVerified: true },
            { name: 'Rajesh Kumar', email: 'official@smartcity.gov.in', role: 'government_official', zone: 'Central', phone: '9800000003', isVerified: true },
            { name: 'Priya Sharma', email: 'priya.official@smartcity.gov.in', role: 'government_official', zone: 'South', phone: '9800000004', isVerified: true },
            { name: 'Constable Ravi', email: 'ravi.officer@smartcity.gov.in', role: 'field_officer', zone: 'Central', phone: '9800000005', isVerified: true },
            { name: 'Officer Suresh', email: 'suresh.officer@smartcity.gov.in', role: 'field_officer', zone: 'East', phone: '9800000006', isVerified: true },
            { name: 'Officer Meena', email: 'meena.officer@smartcity.gov.in', role: 'field_officer', zone: 'South', phone: '9800000007', isVerified: true },
            { name: 'Officer Karthik', email: 'karthik.officer@smartcity.gov.in', role: 'field_officer', zone: 'Mahadevapura', phone: '9800000008', isVerified: true },
            { name: 'Amit Patel', email: 'citizen@example.com', role: 'citizen', zone: 'Central', phone: '9876543210', isVerified: true },
            { name: 'Sneha Reddy', email: 'sneha@example.com', role: 'citizen', zone: 'Koramangala', phone: '9876543211' },
            { name: 'Vikram Singh', email: 'vikram@example.com', role: 'citizen', zone: 'Mahadevapura', phone: '9876543212' },
            { name: 'Lakshmi Devi', email: 'lakshmi@example.com', role: 'citizen', zone: 'Yelahanka', phone: '9876543213' },
            { name: 'Mohammed Irfan', email: 'irfan@example.com', role: 'citizen', zone: 'East', phone: '9876543214' },
            { name: 'Ananya Rao', email: 'ananya@example.com', role: 'citizen', zone: 'South', phone: '9876543215' },
        ];

        const users = await User.insertMany(usersData.map(u => ({ ...u, password: hashedPw, userId: crypto.randomUUID() })));
        console.log(`   ✅ ${users.length} users created`);

        const adminUser = users.find(u => u.email === 'admin@smartcity.gov.in');
        const citizens = users.filter(u => u.role === 'citizen');
        const officers = users.filter(u => u.role === 'field_officer');
        const officials = users.filter(u => u.role === 'government_official');

        // ═════════════════════════════════════════════
        // 2. DEPARTMENTS  (7 departments)
        // ═════════════════════════════════════════════
        console.log('\n🏢 Creating departments...');
        const deptsData = [
            { name: 'Public Works Department', shortName: 'PWD', contactEmail: 'pwd@smartcity.gov.in', contactPhone: '080-22222001', incidentTypes: ['pothole', 'road_damage'], slaHours: 48, officers: [officers[0]._id] },
            { name: 'Traffic Management Centre', shortName: 'TMC', contactEmail: 'tmc@smartcity.gov.in', contactPhone: '080-22222002', incidentTypes: ['traffic', 'illegal_parking'], slaHours: 12, officers: [officers[1]._id] },
            { name: 'Stormwater Drainage Department', shortName: 'SDD', contactEmail: 'sdd@smartcity.gov.in', contactPhone: '080-22222003', incidentTypes: ['flooding', 'sewage'], slaHours: 24, officers: [officers[2]._id] },
            { name: 'Bangalore Water Supply Board', shortName: 'BWSSB', contactEmail: 'bwssb@smartcity.gov.in', contactPhone: '080-22222004', incidentTypes: ['water_leak'], slaHours: 6, officers: [] },
            { name: 'BESCOM Electrical Services', shortName: 'BESCOM', contactEmail: 'bescom@smartcity.gov.in', contactPhone: '080-22222005', incidentTypes: ['streetlight'], slaHours: 24, officers: [] },
            { name: 'BBMP / Bruhat Mahanagara Palike', shortName: 'BBMP', contactEmail: 'bbmp@smartcity.gov.in', contactPhone: '080-22222006', incidentTypes: ['garbage', 'other'], slaHours: 24, officers: [] },
            { name: 'City Police', shortName: 'KSP', contactEmail: 'police@smartcity.gov.in', contactPhone: '080-22222007', incidentTypes: ['accident', 'safety_issue', 'noise'], slaHours: 2, officers: [officers[3]._id] },
        ];

        const departments = await Department.insertMany(deptsData.map(d => ({
            ...d, deptId: crypto.randomUUID(), zone: randomPick(ZONES), currentLoad: randomInt(0, 8)
        })));
        console.log(`   ✅ ${departments.length} departments created`);

        // Build routing map
        const deptByType = {};
        departments.forEach(d => d.incidentTypes.forEach(t => { deptByType[t] = d; }));

        // ═════════════════════════════════════════════
        // 3. INCIDENTS  (25 realistic incidents)
        // ═════════════════════════════════════════════
        console.log('\n📋 Creating incidents...');
        const incidents = [];
        for (let i = 0; i < INCIDENT_TEMPLATES.length; i++) {
            const tpl = INCIDENT_TEMPLATES[i];
            const loc = BANGALORE_COORDS[i % BANGALORE_COORDS.length];
            const severity = randomPick(SEVERITIES);
            const status = randomPick(STATUSES);
            const created = daysAgo(randomInt(0, 30));

            incidents.push({
                incidentId: crypto.randomUUID(),
                type: tpl.type,
                title: tpl.title,
                description: tpl.desc,
                location: { lat: loc.lat + (Math.random() - 0.5) * 0.01, lng: loc.lng + (Math.random() - 0.5) * 0.01, address: `Near ${loc.area} Main Road`, area: loc.area, zone: loc.zone },
                severity,
                isEmergency: severity === 'critical' || ['accident', 'flooding', 'safety_issue'].includes(tpl.type),
                status,
                reportedBy: randomPick(citizens)._id,
                isVerified: ['acknowledged', 'assigned', 'in_progress', 'resolved', 'closed'].includes(status),
                isFalse: false,
                source: 'citizen_app',
                aiProcessed: Math.random() > 0.3,
                createdAt: created,
                updatedAt: new Date(created.getTime() + randomInt(1, 48) * 3600000)
            });
        }

        const savedIncidents = await Incident.insertMany(incidents);
        console.log(`   ✅ ${savedIncidents.length} incidents created`);

        // ═════════════════════════════════════════════
        // 4. ASSIGNMENTS  (for assigned/in_progress/resolved/closed incidents)
        // ═════════════════════════════════════════════
        console.log('\n📌 Creating assignments...');
        const assignableIncidents = savedIncidents.filter(i => ['assigned', 'in_progress', 'resolved', 'closed'].includes(i.status));
        const assignments = [];

        for (const inc of assignableIncidents) {
            const dept = deptByType[inc.type] || departments[5]; // BBMP fallback
            const assignedAt = new Date(inc.createdAt.getTime() + randomInt(1, 12) * 3600000);
            const aStatus = inc.status === 'resolved' || inc.status === 'closed' ? 'completed' : inc.status === 'in_progress' ? 'in_progress' : 'pending';
            const referenceNumber = `AUTO-${String(assignments.length + 1).padStart(4, '0')}`;

            assignments.push({
                assignmentId: crypto.randomUUID(),
                incidentId: inc._id,
                departmentId: dept._id,
                officerId: dept.officers?.length ? dept.officers[0] : (officers[randomInt(0, officers.length - 1)]._id),
                assignedBy: adminUser._id,
                assignedAt,
                slaDueBy: new Date(assignedAt.getTime() + dept.slaHours * 3600000),
                status: aStatus,
                escalationCount: aStatus === 'escalated' ? 1 : 0,
                notes: 'Auto-assigned by system based on incident type routing rules.',
                assignmentType: 'auto',
                notifyReporter: true,
                referenceNumber
            });
        }

        const savedAssignments = await Assignment.insertMany(assignments);
        console.log(`   ✅ ${savedAssignments.length} assignments created`);

        // ═════════════════════════════════════════════
        // 5. INCIDENT INTELLIGENCE  (AI classifications)
        // ═════════════════════════════════════════════
        console.log('\n🤖 Creating AI classifications...');
        const aiCategories = {
            pothole: 'road_infrastructure', traffic: 'traffic_management', flooding: 'stormwater_management',
            streetlight: 'electrical_infrastructure', garbage: 'waste_management', accident: 'public_safety',
            water_leak: 'water_infrastructure', road_damage: 'road_infrastructure', safety_issue: 'public_safety',
            noise: 'noise_pollution', illegal_parking: 'traffic_management', sewage: 'stormwater_management'
        };

        const intelligence = savedIncidents.filter(i => i.aiProcessed).map(inc => ({
            incidentId: inc._id,
            nlpCategory: aiCategories[inc.type] || 'general',
            priorityScore: randomInt(20, 95),
            priorityTag: inc.severity,
            aiSummary: `AI Analysis: ${inc.title}. This ${inc.type.replace(/_/g, ' ')} incident in ${inc.location.area} has been classified as ${inc.severity} priority. Recommended department: ${(deptByType[inc.type] || departments[5]).name}. Immediate intervention ${inc.severity === 'critical' ? 'required' : 'recommended'}.`,
            suggestedDepartment: (deptByType[inc.type] || departments[5]).name,
            classificationConfidence: (Math.random() * 0.3 + 0.7).toFixed(2) * 1,
            sentimentScore: (Math.random() * -1).toFixed(2) * 1,
            llmModel: 'gemini-pro',
            processedAt: new Date(inc.createdAt.getTime() + 60000),
            createdAt: new Date(inc.createdAt.getTime() + 60000)
        }));

        const savedIntel = await IncidentIntelligence.insertMany(intelligence);
        console.log(`   ✅ ${savedIntel.length} AI classifications created`);

        // ═════════════════════════════════════════════
        // 6. RESOLUTION LOGS  (for resolved/closed)
        // ═════════════════════════════════════════════
        console.log('\n📝 Creating resolution logs...');
        const resolvedIncidents = savedIncidents.filter(i => ['resolved', 'closed'].includes(i.status));
        const resolutionLogs = resolvedIncidents.map(inc => ({
            logId: crypto.randomUUID(),
            incidentId: inc._id,
            officerId: randomPick(officers)._id,
            action: `Issue resolved: ${inc.type.replace(/_/g, ' ')} at ${inc.location.area} has been addressed. Area inspected and cleared.`,
            resolutionCategory: randomPick(['repair', 'maintenance', 'replacement', 'cleaning']),
            timeSpentHours: randomInt(1, 8),
            materialsUsed: randomPick(['Concrete mix, road markers', 'Drainage tools and pump', 'Replacement light unit', 'Cleaning equipment and safety cones']),
            requiresFollowUp: Math.random() > 0.65,
            statusBefore: 'in_progress',
            statusAfter: inc.status,
            timestamp: new Date(inc.updatedAt),
            notes: 'Field verification completed. Issue resolved satisfactorily.',
            tta: randomInt(30, 480),
            ttr: randomInt(120, 2880),
            isResolved: true
        }));

        const savedLogs = await ResolutionLog.insertMany(resolutionLogs);
        console.log(`   ✅ ${savedLogs.length} resolution logs created`);

        // ═════════════════════════════════════════════
        // 7. NOTIFICATIONS  (various triggers)
        // ═════════════════════════════════════════════
        console.log('\n🔔 Creating notifications...');
        const notifications = [];

        // Notifications for each incident to its reporter
        for (const inc of savedIncidents.slice(0, 15)) {
            notifications.push({
                notifId: crypto.randomUUID(),
                recipientId: inc.reportedBy,
                incidentId: inc._id,
                channel: 'in_app',
                subject: `Incident ${inc.status}: ${inc.title}`,
                message: `Your reported incident "${inc.title}" is now ${inc.status.replace(/_/g, ' ')}. ${inc.status === 'resolved' ? 'Please provide feedback.' : 'We are working on it.'}`,
                status: 'delivered',
                sentAt: inc.updatedAt,
                deliveredAt: inc.updatedAt
            });
        }

        // SLA breach alerts to admin
        for (let i = 0; i < 3; i++) {
            notifications.push({
                notifId: crypto.randomUUID(),
                recipientId: adminUser._id,
                channel: 'email',
                subject: 'SLA Breach Alert',
                message: `Assignment has exceeded SLA deadline. Please take immediate action to escalate or reassign.`,
                status: 'sent',
                sentAt: daysAgo(randomInt(1, 7))
            });
        }

        // Admin broadcast
        notifications.push({
            notifId: crypto.randomUUID(),
            recipientId: citizens[0]._id,
            channel: 'in_app',
            subject: 'Heavy Rain Advisory — Central Zone',
            message: 'Due to heavy rains expected this week, please avoid low-lying areas. Report any flooding immediately through the SOS feature.',
            status: 'delivered',
            sentAt: daysAgo(2),
            deliveredAt: daysAgo(2)
        });

        const savedNotifs = await Notification.insertMany(notifications);
        console.log(`   ✅ ${savedNotifs.length} notifications created`);

        // ═════════════════════════════════════════════
        // 8. FEEDBACK  (for resolved incidents)
        // ═════════════════════════════════════════════
        console.log('\n⭐ Creating feedback...');
        const feedbacks = resolvedIncidents.slice(0, 6).map(inc => ({
            feedbackId: crypto.randomUUID(),
            incidentId: inc._id,
            citizenId: inc.reportedBy,
            rating: randomInt(3, 5),
            responseSatisfaction: randomInt(2, 5),
            resolvedSatisfaction: randomInt(3, 5),
            easeOfUse: randomInt(3, 5),
            resolutionSatisfaction: randomPick(['neutral', 'satisfied', 'very_satisfied']),
            communicationClarity: randomPick(['fair', 'good', 'excellent']),
            wouldRecommend: Math.random() > 0.25,
            followUpRequested: Math.random() > 0.7,
            comments: randomPick([
                'Quick resolution, very impressed with the speed!',
                'Good work, but took a bit longer than expected.',
                'Excellent! The team was very professional.',
                'Satisfactory. The road was repaired well.',
                'Not fully resolved, issue might recur.',
                'Very happy with the service. Keep it up!'
            ]),
            submittedAt: new Date(inc.updatedAt.getTime() + randomInt(1, 48) * 3600000)
        }));

        const savedFeedback = await Feedback.insertMany(feedbacks);
        console.log(`   ✅ ${savedFeedback.length} feedback entries created`);

        // ═════════════════════════════════════════════
        // 9. RISK FORECASTS  (per zone)
        // ═════════════════════════════════════════════
        console.log('\n📊 Creating risk forecasts...');
        const forecasts = ZONES.map(zone => ({
            forecastId: crypto.randomUUID(),
            zone,
            incidentType: 'all',
            riskScore: randomInt(15, 90),
            riskLevel: randomPick(['very_high', 'high', 'moderate', 'low']),
            forecastDate: new Date(Date.now() + 7 * 86400000),
            timeHorizon: '7d',
            model: 'statistical_mvp',
            confidence: (Math.random() * 0.3 + 0.6).toFixed(2) * 1,
            historicalDataPoints: Array.from({ length: 7 }, (_, i) => ({
                date: daysAgo(7 - i),
                incidentCount: randomInt(0, 8),
                avgSeverity: (Math.random() * 2 + 1).toFixed(1) * 1
            })),
            recommendations: randomPick([
                ['Increase patrol frequency in high-risk areas', 'Pre-position drainage pumps', 'Alert BBMP for waste clearance'],
                ['Deploy traffic police during peak hours', 'Inspect road conditions after rain', 'Monitor CCTV for illegal dumping'],
                ['Check stormwater drains', 'Alert residents of potential flooding', 'Coordinate with BWSSB for water supply']
            ]),
            generatedAt: new Date()
        }));

        const savedForecasts = await RiskForecast.insertMany(forecasts);
        console.log(`   ✅ ${savedForecasts.length} risk forecasts created`);

        // ═════════════════════════════════════════════
        // 10. ANALYTICS AGGREGATES  (monthly)
        // ═════════════════════════════════════════════
        console.log('\n📈 Creating analytics aggregates...');
        const aggregates = [
            {
                aggId: crypto.randomUUID(), period: '2026-03', periodType: 'monthly', zone: 'all',
                incidentCounts: {
                    total: savedIncidents.length,
                    byType: { pothole: 4, traffic: 2, flooding: 3, streetlight: 2, garbage: 3, accident: 2, water_leak: 2, road_damage: 2, safety_issue: 2, noise: 1, illegal_parking: 1, sewage: 2 },
                    bySeverity: { critical: 4, high: 7, medium: 9, low: 5 },
                    byStatus: { reported: 4, acknowledged: 3, assigned: 3, in_progress: 5, resolved: 6, closed: 4 }
                },
                avgTTA: 145, avgTTR: 1320,
                deptPerformance: departments.map(d => ({
                    deptId: d._id, name: d.name,
                    assigned: randomInt(2, 8), resolved: randomInt(1, 6),
                    avgTTR: randomInt(120, 2400), slaBreaches: randomInt(0, 2)
                })),
                citizenSatisfactionAvg: 3.8,
                generatedAt: new Date()
            },
            {
                aggId: crypto.randomUUID(), period: '2026-02', periodType: 'monthly', zone: 'all',
                incidentCounts: {
                    total: 18,
                    byType: { pothole: 3, traffic: 3, flooding: 1, streetlight: 2, garbage: 2, accident: 1, water_leak: 2, road_damage: 1, safety_issue: 1, noise: 1, sewage: 1 },
                    bySeverity: { critical: 2, high: 5, medium: 7, low: 4 },
                    byStatus: { reported: 2, acknowledged: 1, in_progress: 3, resolved: 8, closed: 4 }
                },
                avgTTA: 120, avgTTR: 960,
                deptPerformance: departments.map(d => ({
                    deptId: d._id, name: d.name,
                    assigned: randomInt(1, 5), resolved: randomInt(1, 4),
                    avgTTR: randomInt(60, 1800), slaBreaches: randomInt(0, 1)
                })),
                citizenSatisfactionAvg: 4.1,
                generatedAt: daysAgo(30)
            }
        ];

        const savedAgg = await AnalyticsAggregate.insertMany(aggregates);
        console.log(`   ✅ ${savedAgg.length} analytics aggregates created`);

        // ═════════════════════════════════════════════
        // SUMMARY
        // ═════════════════════════════════════════════
        console.log('\n' + '═'.repeat(50));
        console.log('🎉 DATABASE SEEDED SUCCESSFULLY!');
        console.log('═'.repeat(50));
        console.log(`  👤 Users:                 ${users.length}`);
        console.log(`  🏢 Departments:           ${departments.length}`);
        console.log(`  📋 Incidents:             ${savedIncidents.length}`);
        console.log(`  📌 Assignments:           ${savedAssignments.length}`);
        console.log(`  🤖 AI Classifications:    ${savedIntel.length}`);
        console.log(`  📝 Resolution Logs:       ${savedLogs.length}`);
        console.log(`  🔔 Notifications:         ${savedNotifs.length}`);
        console.log(`  ⭐ Feedback:              ${savedFeedback.length}`);
        console.log(`  📊 Risk Forecasts:        ${savedForecasts.length}`);
        console.log(`  📈 Analytics Aggregates:  ${savedAgg.length}`);
        console.log('═'.repeat(50));
        console.log('\n🔑 LOGIN CREDENTIALS (password: password123):');
        console.log('  Admin:    admin@smartcity.gov.in');
        console.log('  Official: official@smartcity.gov.in');
        console.log('  Officer:  ravi.officer@smartcity.gov.in');
        console.log('  Citizen:  citizen@example.com');
        console.log('═'.repeat(50));

        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err);
        await mongoose.connection.close();
        process.exit(1);
    }
}

seed();
