const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Department = require('../models/Department');
const User = require('../models/User');

dotenv.config({ path: '../../.env' });

const departments = [
    {
        name: 'Bruhat Bengaluru Mahanagara Palike',
        code: 'BBMP',
        description: 'Municipal Corporation handling general city services',
        handlesIncidentTypes: ['garbage', 'other'],
        contact: { email: 'bbmp@karnataka.gov.in', phone: '080-22975803' }
    },
    {
        name: 'Public Works Department',
        code: 'PWD',
        description: 'Roads, bridges, and infrastructure maintenance',
        handlesIncidentTypes: ['pothole', 'road-damage'],
        contact: { email: 'pwd@karnataka.gov.in', phone: '080-22353553' }
    },
    {
        name: 'Traffic Management Centre',
        code: 'TRAFFIC',
        description: 'Traffic control and accident management',
        handlesIncidentTypes: ['traffic', 'accident', 'illegal-parking'],
        contact: { email: 'traffic@karnataka.gov.in', phone: '080-22942222' }
    },
    {
        name: 'Stormwater Drainage Department',
        code: 'DRAINAGE',
        description: 'Drainage, flooding, and sewage management',
        handlesIncidentTypes: ['flooding', 'sewage'],
        contact: { email: 'drainage@karnataka.gov.in', phone: '080-22975000' }
    },
    {
        name: 'BESCOM Electrical Services',
        code: 'ELEC',
        description: 'Street lighting and electrical infrastructure',
        handlesIncidentTypes: ['streetlight'],
        contact: { email: 'bescom@karnataka.gov.in', phone: '1912' }
    },
    {
        name: 'Bangalore Water Supply Board',
        code: 'BWSSB',
        description: 'Water supply and pipeline maintenance',
        handlesIncidentTypes: ['water-leak'],
        contact: { email: 'bwssb@karnataka.gov.in', phone: '1916' }
    },
    {
        name: 'City Police',
        code: 'POLICE',
        description: 'Law enforcement and public safety',
        handlesIncidentTypes: ['public-safety', 'noise'],
        contact: { email: 'police@karnataka.gov.in', phone: '100' }
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
                role: 'admin'
            });
            console.log('Created admin user (admin@smartcity.gov.in / admin123)');
        }

        // Create sample official
        const officialExists = await User.findOne({ email: 'official@smartcity.gov.in' });
        if (!officialExists) {
            const bbmpDept = await Department.findOne({ code: 'BBMP' });
            await User.create({
                name: 'BBMP Officer',
                email: 'official@smartcity.gov.in',
                password: 'official123',
                role: 'official',
                department: bbmpDept?._id
            });
            console.log('Created official user (official@smartcity.gov.in / official123)');
        }

        // Create sample citizen
        const citizenExists = await User.findOne({ email: 'citizen@example.com' });
        if (!citizenExists) {
            await User.create({
                name: 'Test Citizen',
                email: 'citizen@example.com',
                password: 'citizen123',
                role: 'citizen',
                phone: '9876543210'
            });
            console.log('Created citizen user (citizen@example.com / citizen123)');
        }

        console.log('\n✅ Database seeded successfully!');
        console.log('\nTest Users:');
        console.log('  Admin: admin@smartcity.gov.in / admin123');
        console.log('  Official: official@smartcity.gov.in / official123');
        console.log('  Citizen: citizen@example.com / citizen123');

        process.exit(0);
    } catch (err) {
        console.error('Seed error:', err);
        process.exit(1);
    }
};

seedDatabase();
