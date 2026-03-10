/**
 * routingService.js - Automatic Department Assignment & Workload Balancing
 *
 * Implements the intelligent routing system (Spec Section 5.6) that auto-assigns
 * incoming incidents to the appropriate government department. The service uses
 * a three-tier lookup strategy:
 *  1. Full department name match via ROUTING_RULES
 *  2. incidentTypes array match on the Department model
 *  3. Short name fallback (PWD, TRAFFIC, BBMP, etc.)
 *
 * Also provides workload aggregation across departments and a least-loaded
 * officer suggestion algorithm for optimal assignment distribution.
 */

const Department = require('../models/Department');
const Assignment = require('../models/Assignment');

// Full department name routing rules — maps each incident type to a department
const ROUTING_RULES = {
    pothole: 'Public Works Department',
    road_damage: 'Public Works Department',
    traffic: 'Traffic Management Centre',
    illegal_parking: 'Traffic Management Centre',
    flooding: 'Stormwater Drainage Department',
    sewage: 'Stormwater Drainage Department',
    water_leak: 'Bangalore Water Supply Board',
    streetlight: 'BESCOM Electrical Services',
    garbage: 'Bruhat Bengaluru Mahanagara Palike',
    accident: 'City Police',
    safety_issue: 'City Police',
    noise: 'City Police',
    other: 'Bruhat Bengaluru Mahanagara Palike'
};

// Short name fallback mapping
const shortNameMapping = {
    pothole: 'PWD',
    road_damage: 'PWD',
    traffic: 'TRAFFIC',
    illegal_parking: 'TRAFFIC',
    flooding: 'DRAINAGE',
    sewage: 'DRAINAGE',
    water_leak: 'BWSSB',
    streetlight: 'ELEC',
    garbage: 'BBMP',
    accident: 'POLICE',
    safety_issue: 'POLICE',
    noise: 'POLICE',
    other: 'BBMP'
};

/**
 * Find the appropriate department for an incident type
 */
async function assignDepartment(incidentType) {
    try {
        // Try by full name first
        const deptName = ROUTING_RULES[incidentType] || ROUTING_RULES.other;
        let department = await Department.findOne({ name: deptName, isActive: true });
        if (department) return department;

        // Fallback: try by incidentTypes array
        department = await Department.findOne({
            incidentTypes: incidentType,
            isActive: true
        });
        if (department) return department;

        // Fallback: try by short name
        const shortName = shortNameMapping[incidentType] || 'BBMP';
        department = await Department.findOne({ shortName, isActive: true });
        return department;
    } catch (err) {
        console.error('Error assigning department:', err);
        return null;
    }
}

/**
 * Create an assignment for an incident to a department
 */
async function createAssignment(incidentId, departmentId, options = {}) {
    try {
        const dept = await Department.findById(departmentId);
        if (!dept) return null;

        // Check if assignment already exists
        const existing = await Assignment.findOne({ incidentId });
        if (existing) return existing;

        const assignment = await Assignment.create({
            incidentId,
            departmentId,
            officerId: options.officerId || null,
            assignedBy: options.assignedBy || null,
            slaDueBy: options.slaDueBy || new Date(Date.now() + dept.slaHours * 3600000),
            notes: options.notes || `Auto-assigned to ${dept.name}`
        });

        // Update department current load
        const activeCount = await Assignment.countDocuments({
            departmentId,
            status: { $in: ['pending', 'acknowledged', 'in_progress'] }
        });
        await Department.findByIdAndUpdate(departmentId, { currentLoad: activeCount });

        return assignment;
    } catch (err) {
        console.error('Error creating assignment:', err);
        return null;
    }
}

/**
 * Get workload for all departments
 */
async function getDepartmentWorkloads() {
    try {
        const workloads = await Assignment.aggregate([
            { $match: { status: { $in: ['pending', 'acknowledged', 'in_progress'] } } },
            { $group: { _id: '$departmentId', activeCount: { $sum: 1 } } },
            { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'dept' } },
            { $unwind: '$dept' },
            { $project: { name: '$dept.name', shortName: '$dept.shortName', activeCount: 1 } },
            { $sort: { activeCount: -1 } }
        ]);
        return workloads;
    } catch (err) {
        console.error('Error getting workloads:', err);
        return [];
    }
}

/**
 * Suggest officer with least workload
 */
async function suggestOfficer(departmentId) {
    const Incident = require('../models/Incident');
    try {
        const department = await Department.findById(departmentId).populate('officers', 'name email');
        if (!department || !department.officers.length) return null;

        const officerWorkloads = await Promise.all(
            department.officers.map(async (officer) => {
                const count = await Assignment.countDocuments({
                    officerId: officer._id,
                    status: { $in: ['pending', 'acknowledged', 'in_progress'] }
                });
                return { officer, count };
            })
        );

        officerWorkloads.sort((a, b) => a.count - b.count);
        return officerWorkloads[0]?.officer || null;
    } catch (err) {
        console.error('Error suggesting officer:', err);
        return null;
    }
}

module.exports = {
    assignDepartment,
    createAssignment,
    getDepartmentWorkloads,
    suggestOfficer,
    ROUTING_RULES,
    shortNameMapping
};
