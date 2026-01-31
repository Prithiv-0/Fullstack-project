/**
 * Routing Service - Auto-assigns incidents to departments
 */

const Department = require('../models/Department');

// Default department mapping for incident types
const departmentMapping = {
    pothole: 'PWD',           // Public Works Department
    traffic: 'TRAFFIC',       // Traffic Police
    flooding: 'DRAINAGE',     // Drainage/Stormwater
    streetlight: 'ELEC',      // Electrical Department
    garbage: 'BBMP',          // Municipal Corporation
    accident: 'TRAFFIC',      // Traffic Police
    'water-leak': 'BWSSB',    // Water Supply Board
    'road-damage': 'PWD',     // Public Works Department
    'public-safety': 'POLICE',// City Police
    noise: 'POLICE',          // City Police
    'illegal-parking': 'TRAFFIC', // Traffic Police
    sewage: 'DRAINAGE',       // Drainage Department
    other: 'BBMP'             // Municipal Corporation
};

/**
 * Find and assign the appropriate department for an incident type
 * @param {string} incidentType - Type of incident
 * @returns {Object|null} Department document or null
 */
async function assignDepartment(incidentType) {
    try {
        // First try to find by handles incident type
        let department = await Department.findOne({
            handlesIncidentTypes: incidentType,
            isActive: true
        });

        if (department) return department;

        // Fallback to code mapping
        const deptCode = departmentMapping[incidentType] || 'BBMP';
        department = await Department.findOne({ code: deptCode, isActive: true });

        return department;
    } catch (err) {
        console.error('Error assigning department:', err);
        return null;
    }
}

/**
 * Get workload for all departments
 * @returns {Array} Department workloads
 */
async function getDepartmentWorkloads() {
    const Incident = require('../models/Incident');

    try {
        const workloads = await Department.aggregate([
            {
                $lookup: {
                    from: 'incidents',
                    let: { deptId: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$assignedDepartment', '$$deptId'] } } },
                        { $match: { status: { $in: ['reported', 'acknowledged', 'in-progress'] } } }
                    ],
                    as: 'activeIncidents'
                }
            },
            {
                $project: {
                    name: 1,
                    code: 1,
                    activeCount: { $size: '$activeIncidents' }
                }
            },
            { $sort: { activeCount: -1 } }
        ]);

        return workloads;
    } catch (err) {
        console.error('Error getting workloads:', err);
        return [];
    }
}

/**
 * Suggest officer assignment based on workload
 * @param {string} departmentId 
 * @returns {Object|null} Suggested officer
 */
async function suggestOfficer(departmentId) {
    const Incident = require('../models/Incident');

    try {
        const department = await Department.findById(departmentId).populate('officers', 'name email');
        if (!department || !department.officers.length) return null;

        // Count active incidents per officer
        const officerWorkloads = await Promise.all(
            department.officers.map(async (officer) => {
                const count = await Incident.countDocuments({
                    assignedOfficer: officer._id,
                    status: { $in: ['acknowledged', 'in-progress'] }
                });
                return { officer, count };
            })
        );

        // Return officer with least workload
        officerWorkloads.sort((a, b) => a.count - b.count);
        return officerWorkloads[0]?.officer || null;
    } catch (err) {
        console.error('Error suggesting officer:', err);
        return null;
    }
}

module.exports = {
    assignDepartment,
    getDepartmentWorkloads,
    suggestOfficer,
    departmentMapping
};
