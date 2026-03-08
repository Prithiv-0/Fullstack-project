const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Department = require('../models/Department');
const User = require('../models/User');

dotenv.config({ path: '../../.env' });

const departments = [
    {
        name: 'Bruhat Bengaluru Mahanagara Palike',
        shortName: 'BBMP',
        contactEmail: 'bbmp@karnataka.gov.in',
        contactPhone: '080-22975803',
        incidentTypes: ['garbage', 'other'],
        slaHours: 48
    },
    {
        name: 'Public Works Department',
        shortName: 'PWD',
        contactEmail: 'pwd@karnataka.gov.in',
        contactPhone: '080-22353553',
        incidentTypes: ['pothole', 'road_damage'],
        slaHours: 24
    },
    {
        name: 'Traffic Management Centre',
        shortName: 'TRAFFIC',
        contactEmail: 'traffic@karnataka.gov.in',
        contactPhone: '080-22942222',
        incidentTypes: ['traffic', 'accident', 'illegal_parking'],
        slaHours: 12
    },
    {
        name: 'Stormwater Drainage Department',
        shortName: 'DRAINAGE',
        contactEmail: 'drainage@karnataka.gov.in',
        contactPhone: '080-22975000',
        incidentTypes: ['flooding', 'sewage'],
        slaHours: 24
    },
    {
        name: 'BESCOM Electrical Services',
        shortName: 'ELEC',
        contactEmail: 'bescom@karnataka.gov.in',
        contactPhone: '1912',
        incidentTypes: ['streetlight'],
        slaHours: 24
    },
    {
        name: 'Bangalore Water Supply Board',
        shortName: 'BWSSB',
        contactEmail: 'bwssb@karnataka.gov.in',
        contactPhone: '1916',
        incidentTypes: ['water_leak'],
        slaHours: 12
    },
    {
        name: 'City Police',
        shortName: 'POLICE',
        contactEmail: 'police@karnataka.gov.in',
        contactPhone: '100',
        incidentTypes: ['safety_issue', 'noise'],
        slaHours: 4
    }
];

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-city-command');
        console.log('Connected to MongoDB');

        // Clear existing data
        await Department.deleteMany({});
        console.log('Cleared departments');

        // Insert departments
        await Department.insertMany(departments);
        console.log('Seeded departments');

        // Create admin user
        const adminExists = await User.findOne({ email: 'admin@smartcity.gov.in' });
        if (!adminExists) {
            await User.create({
                name: 'City Admin',
                email: 'admin@smartcity.gov.in',
                password: 'admin123',
                role: 'admin',
                zone: 'Central'
            });
            console.log('Created admin user (admin@smartcity.gov.in / admin123)');
        }

        // Create government official
        const officialExists = await User.findOne({ email: 'official@smartcity.gov.in' });
        if (!officialExists) {
            const bbmpDept = await Department.findOne({ shortName: 'BBMP' });
            await User.create({
                name: 'BBMP Officer',
                email: 'official@smartcity.gov.in',
                password: 'official123',
                role: 'government_official',
                department: bbmpDept?._id,
                zone: 'Central'
            });
            console.log('Created official user (official@smartcity.gov.in / official123)');
        }

        // Create field officer
        const fieldOfficerExists = await User.findOne({ email: 'officer@smartcity.gov.in' });
        if (!fieldOfficerExists) {
            const pwdDept = await Department.findOne({ shortName: 'PWD' });
            await User.create({
                name: 'PWD Field Officer',
                email: 'officer@smartcity.gov.in',
                password: 'officer123',
                role: 'field_officer',
                department: pwdDept?._id,
                zone: 'Central'
            });
            console.log('Created field officer (officer@smartcity.gov.in / officer123)');
        }

        // Create sample citizen
        const citizenExists = await User.findOne({ email: 'citizen@example.com' });
        if (!citizenExists) {
            await User.create({
                name: 'Test Citizen',
                email: 'citizen@example.com',
                password: 'citizen123',
                role: 'citizen',
                phone: '9876543210',
                zone: 'Central'
            });
            console.log('Created citizen user (citizen@example.com / citizen123)');
        }

        console.log('\n✅ Database seeded successfully!');
        console.log('\nTest Users:');
        console.log('  Admin:           admin@smartcity.gov.in / admin123');
        console.log('  Official:        official@smartcity.gov.in / official123');
        console.log('  Field Officer:   officer@smartcity.gov.in / officer123');
        console.log('  Citizen:         citizen@example.com / citizen123');

        process.exit(0);
    } catch (err) {
        console.error('Seed error:', err);
        process.exit(1);
    }
};

seedDatabase();
