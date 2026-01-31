const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Incident = require('../models/Incident');
const User = require('../models/User');
const Department = require('../models/Department');

dotenv.config({ path: '../../.env' });

const sampleIncidents = [
    {
        title: 'Large pothole on MG Road causing traffic',
        description: 'There is a massive pothole approximately 2 feet wide near the MG Road metro station entrance. Multiple vehicles have been damaged. The pothole is filled with water and not easily visible. Urgent repair needed as it is causing major traffic congestion during peak hours.',
        type: 'pothole',
        severity: 'high',
        priority: 8,
        status: 'in-progress',
        location: {
            coordinates: [77.6197, 12.9758],
            address: 'MG Road, near Metro Station Exit 2',
            area: 'MG Road',
            city: 'Bengaluru'
        }
    },
    {
        title: 'Street light not working for 2 weeks',
        description: 'The street light near Koramangala Water Tank junction has been non-functional for the past 2 weeks. The area becomes very dark after 6 PM making it unsafe for pedestrians. Several complaints have been made but no action taken yet.',
        type: 'streetlight',
        severity: 'medium',
        priority: 5,
        status: 'acknowledged',
        location: {
            coordinates: [77.6245, 12.9352],
            address: 'Water Tank Road, Koramangala 4th Block',
            area: 'Koramangala',
            city: 'Bengaluru'
        }
    },
    {
        title: 'Garbage piled up near residential area',
        description: 'Huge pile of garbage has accumulated near the community dustbin. The garbage has not been collected for over a week. The smell is unbearable and attracting stray dogs and insects. Health hazard for nearby residents.',
        type: 'garbage',
        severity: 'high',
        priority: 7,
        status: 'reported',
        location: {
            coordinates: [77.6411, 12.9719],
            address: '12th Main Road, HAL Layout',
            area: 'Indiranagar',
            city: 'Bengaluru'
        }
    },
    {
        title: 'Severe waterlogging after rain',
        description: 'The entire stretch of road near Silk Board junction is waterlogged after yesterday\'s rain. Water level is approximately 1.5 feet high. Vehicles are stranded and traffic is at a complete halt. Drainage system seems to have failed completely.',
        type: 'flooding',
        severity: 'critical',
        priority: 10,
        status: 'in-progress',
        location: {
            coordinates: [77.6225, 12.9173],
            address: 'Silk Board Junction, Outer Ring Road',
            area: 'BTM Layout',
            city: 'Bengaluru'
        }
    },
    {
        title: 'Traffic signal malfunction at major junction',
        description: 'The traffic signal at Marathahalli junction has been malfunctioning since morning. All lights are blinking yellow causing massive confusion. Traffic police are managing manually but the situation is chaotic. Needs immediate attention.',
        type: 'traffic',
        severity: 'high',
        priority: 9,
        status: 'acknowledged',
        location: {
            coordinates: [77.7010, 12.9591],
            address: 'Marathahalli Bridge Junction',
            area: 'Marathahalli',
            city: 'Bengaluru'
        }
    },
    {
        title: 'Water pipeline burst on main road',
        description: 'A major water pipeline has burst on 80 Feet Road. Water is gushing out continuously and flooding the road. Traffic has been diverted. The water is also entering nearby shops causing damage. BWSSB team needed urgently.',
        type: 'water-leak',
        severity: 'critical',
        priority: 10,
        status: 'reported',
        location: {
            coordinates: [77.6475, 12.9081],
            address: '80 Feet Road, Bannerghatta Road Junction',
            area: 'JP Nagar',
            city: 'Bengaluru'
        }
    },
    {
        title: 'Illegal parking blocking ambulance route',
        description: 'Multiple vehicles are parked illegally on both sides of the road near the hospital entrance. This is blocking the ambulance route. Despite warning signs, vehicles continue to park here. Regular enforcement needed.',
        type: 'illegal-parking',
        severity: 'high',
        priority: 8,
        status: 'resolved',
        location: {
            coordinates: [77.5946, 12.9307],
            address: 'Near Jayadeva Hospital, 9th Block',
            area: 'Jayanagar',
            city: 'Bengaluru'
        }
    },
    {
        title: 'Damaged road divider causing accidents',
        description: 'The road divider near Electronic City toll plaza has been damaged after a truck accident last week. The broken concrete pieces are scattered on the road causing danger to two-wheeler riders. Several minor accidents have already occurred.',
        type: 'road-damage',
        severity: 'high',
        priority: 8,
        status: 'in-progress',
        location: {
            coordinates: [77.6588, 12.8458],
            address: 'Electronic City Toll Plaza',
            area: 'Electronic City',
            city: 'Bengaluru'
        }
    },
    {
        title: 'Open manhole on busy street',
        description: 'A manhole cover is missing on Church Street near the coffee shop. The open manhole is a serious safety hazard especially at night. Someone placed a tree branch to mark it but proper barricading and repair is needed urgently.',
        type: 'public-safety',
        severity: 'critical',
        priority: 10,
        status: 'acknowledged',
        location: {
            coordinates: [77.6088, 12.9746],
            address: 'Church Street, near Koshy\'s',
            area: 'MG Road',
            city: 'Bengaluru'
        }
    },
    {
        title: 'Sewage overflow in residential colony',
        description: 'The main sewage line in the colony has overflowed. Raw sewage is flowing on the streets for the past 3 days. The stench is unbearable and poses serious health risks. Children cannot even play outside. Immediate action required.',
        type: 'sewage',
        severity: 'critical',
        priority: 9,
        status: 'reported',
        location: {
            coordinates: [77.5801, 12.9716],
            address: '4th Cross, Rajajinagar 1st Block',
            area: 'Rajajinagar',
            city: 'Bengaluru'
        }
    },
    {
        title: 'Construction noise during prohibited hours',
        description: 'Construction work at a new apartment complex is continuing past 10 PM daily. The noise from heavy machinery is disturbing the entire neighborhood. Residents cannot sleep. Construction work should be stopped after 6 PM as per rules.',
        type: 'noise',
        severity: 'medium',
        priority: 5,
        status: 'resolved',
        location: {
            coordinates: [77.5503, 12.9698],
            address: 'Near Vijayanagar Metro Station',
            area: 'Vijayanagar',
            city: 'Bengaluru'
        }
    },
    {
        title: 'Minor accident at school zone',
        description: 'A minor accident occurred between a car and an auto-rickshaw near the school gate during pickup time. No major injuries but the road needs traffic management during school hours. Speed breakers may be required.',
        type: 'accident',
        severity: 'medium',
        priority: 6,
        status: 'resolved',
        location: {
            coordinates: [77.5683, 12.9892],
            address: 'Near Malleshwaram Circle, 18th Cross',
            area: 'Malleshwaram',
            city: 'Bengaluru'
        }
    },
    {
        title: 'Multiple potholes on service road',
        description: 'The service road parallel to Outer Ring Road has multiple large potholes. Commuters are forced to drive on the main road causing more congestion. At least 15-20 potholes need to be filled.',
        type: 'pothole',
        severity: 'medium',
        priority: 6,
        status: 'reported',
        location: {
            coordinates: [77.6950, 12.9277],
            address: 'Service Road, Bellandur',
            area: 'Bellandur',
            city: 'Bengaluru'
        }
    },
    {
        title: 'Street light flickering dangerously',
        description: 'Multiple street lights on this stretch are flickering and making buzzing sounds. Sparks were seen coming from one of the poles yesterday. Electrical hazard that needs immediate attention before it causes a fire.',
        type: 'streetlight',
        severity: 'high',
        priority: 7,
        status: 'acknowledged',
        location: {
            coordinates: [77.6094, 12.9352],
            address: 'Lalbagh Road, near South Gate',
            area: 'Lalbagh',
            city: 'Bengaluru'
        }
    },
    {
        title: 'Overflowing public dustbin',
        description: 'The public dustbin near the bus stop has been overflowing for days. Waste is spilling onto the footpath and road. Many people waiting at the bus stop are affected by the smell. Regular cleaning schedule needed.',
        type: 'garbage',
        severity: 'low',
        priority: 4,
        status: 'reported',
        location: {
            coordinates: [77.5795, 12.9850],
            address: 'Yeshwanthpur Bus Stand',
            area: 'Yeshwanthpur',
            city: 'Bengaluru'
        }
    }
];

const seedIncidents = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-city-command');
        console.log('Connected to MongoDB');

        // Get citizen user and departments
        const citizen = await User.findOne({ role: 'citizen' });
        const departments = await Department.find({});

        if (!citizen) {
            console.log('Please run seedData.js first to create users');
            process.exit(1);
        }

        // Clear existing incidents
        await Incident.deleteMany({});
        console.log('Cleared existing incidents');

        // Assign departments based on incident type
        const getDepartment = (type) => {
            const mapping = {
                pothole: 'PWD',
                traffic: 'TRAFFIC',
                flooding: 'DRAINAGE',
                streetlight: 'ELEC',
                garbage: 'BBMP',
                accident: 'TRAFFIC',
                'water-leak': 'BWSSB',
                'road-damage': 'PWD',
                'public-safety': 'POLICE',
                noise: 'POLICE',
                'illegal-parking': 'TRAFFIC',
                sewage: 'DRAINAGE'
            };
            const code = mapping[type] || 'BBMP';
            return departments.find(d => d.code === code);
        };

        // Create incidents with proper associations
        const incidentsToCreate = sampleIncidents.map(incident => {
            const dept = getDepartment(incident.type);
            return {
                ...incident,
                reportedBy: citizen._id,
                assignedDepartment: dept?._id,
                aiClassification: {
                    detectedType: incident.type,
                    confidence: 0.85 + Math.random() * 0.1,
                    suggestedSeverity: incident.severity,
                    keywords: incident.title.toLowerCase().split(' ').slice(0, 5)
                },
                timeline: [
                    {
                        status: 'reported',
                        comment: 'Incident reported by citizen',
                        updatedBy: citizen._id,
                        updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random time in past week
                    }
                ],
                createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
            };
        });

        await Incident.insertMany(incidentsToCreate);
        console.log(`✅ Created ${incidentsToCreate.length} sample incidents`);

        // Log summary
        const stats = await Incident.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);
        console.log('\nIncident Summary:');
        stats.forEach(s => console.log(`  ${s._id}: ${s.count}`));

        console.log('\n✅ Sample data seeded successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Seed error:', err);
        process.exit(1);
    }
};

seedIncidents();
