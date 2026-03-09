const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Groq = require('groq-sdk');
const Incident = require('../models/Incident');
const User = require('../models/User');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const INCIDENT_TYPES = [
    'pothole', 'traffic', 'flooding', 'streetlight',
    'garbage', 'accident', 'water_leak', 'road_damage',
    'safety_issue', 'noise', 'illegal_parking', 'sewage', 'other'
];

const SOURCES = ['social_media', 'iot_sensor', 'traffic_api', 'manual'];

// Bangalore Zones & Coordinates roughly
const ZONES = [
    { name: 'Central', lat: 12.9716, lng: 77.5946, areas: ['MG Road', 'Shivajinagar', 'Cubbon Park'] },
    { name: 'South', lat: 12.9121, lng: 77.5873, areas: ['Jayanagar', 'JP Nagar', 'BTM Layout'] },
    { name: 'East', lat: 12.9719, lng: 77.6412, areas: ['Indiranagar', 'Whitefield', 'KR Puram'] },
    { name: 'West', lat: 12.9850, lng: 77.5505, areas: ['Rajajinagar', 'Malleswaram', 'Vijayanagar'] }
];

async function generateSimulatedIncident(source) {
    const type = INCIDENT_TYPES[Math.floor(Math.random() * INCIDENT_TYPES.length)];
    const zone = ZONES[Math.floor(Math.random() * ZONES.length)];
    const area = zone.areas[Math.floor(Math.random() * zone.areas.length)];

    // Add some random jitter to coords (about 1-2km)
    const lat = zone.lat + (Math.random() - 0.5) * 0.02;
    const lng = zone.lng + (Math.random() - 0.5) * 0.02;

    const promptMap = {
        'social_media': `Generate a dramatic, slightly angry tweet or facebook post complaining about a ${type} issue in ${area}, Bangalore. Include emojis. Return ONLY a JSON object with 'title' (short summary) and 'description' (the full social media post).`,
        'iot_sensor': `Generate a system log payload from a smart city IoT sensor detecting a ${type} event in ${area}, Bangalore. Make it look like technical machine output with metrics. Return ONLY a JSON object with 'title' (technical alert name) and 'description' (the JSON/log payload).`,
        'traffic_api': `Generate a traffic camera or navigation API alert about a ${type} incident in ${area}, Bangalore. Make it sound like an automated traffic dispatch. Return ONLY a JSON object with 'title' (alert headline) and 'description' (detailed traffic impact summary).`,
        'manual': `Generate formal field notes from a government inspector logging a ${type} issue in ${area}, Bangalore during their patrol. Use formal administrative language. Return ONLY a JSON object with 'title' (inspection report title) and 'description' (the field notes).`
    };

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "You are a smart city data generator. You must respond ONLY with valid, parsable JSON matching the requested schema. Do not wrap in markdown blocks, just raw JSON." },
                { role: "user", content: promptMap[source] }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.8,
            max_completion_tokens: 500,
            response_format: { type: "json_object" }
        });

        const content = completion.choices[0]?.message?.content;
        const data = JSON.parse(content);

        return {
            type,
            title: data.title || `${source.toUpperCase()} Alert: ${type}`,
            description: typeof data.description === 'object' ? JSON.stringify(data.description, null, 2) : (data.description || 'Auto-generated incident description'),
            location: {
                lat: parseFloat(lat.toFixed(6)),
                lng: parseFloat(lng.toFixed(6)),
                address: `Near ${area} main junction`,
                area,
                zone: zone.name
            },
            source,
            severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
            status: 'reported',
            isVerified: false
        };
    } catch (err) {
        console.error(`Error generating ${source} incident:`, err.message);
        return null; // Skip on error
    }
}

async function runSeeder() {
    if (!process.env.GROQ_API_KEY) {
        console.error(" ERROR: GROQ_API_KEY is missing from .env (add it first!)");
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-city-command');
        console.log(' Connected to MongoDB');

        const citizen = await User.findOne({ role: 'citizen' });
        if (!citizen) {
            console.error(" Need at least one citizen user to attribute incidents to. Run standard seed first.");
            process.exit(1);
        }

        console.log(` Using Groq to simulate data feeds (Model: LLaMA 3.3 70B)`);

        let successCount = 0;

        // Generate 3 incidents for each of the 4 non-citizen sources
        for (const source of SOURCES) {
            console.log(`\n📡 Generating 3 incidents for source: ${source}...`);
            for (let i = 0; i < 3; i++) {
                process.stdout.write(`  [${i + 1}/3] Generating... `);
                const incidentData = await generateSimulatedIncident(source);

                if (incidentData) {
                    incidentData.reportedBy = citizen._id;
                    incidentData.timeline = [{
                        status: 'reported',
                        comment: `Ingested via ${source} feed integration`,
                        updatedBy: citizen._id
                    }];

                    await Incident.create(incidentData);
                    console.log(` Created: "${incidentData.title}"`);
                    successCount++;
                } else {
                    console.log(` Failed`);
                }
            }
        }

        console.log(`\n Success! Added ${successCount} multi-source incidents to the database.`);
        console.log(`Check your command dashboard to see them!`);

        process.exit(0);
    } catch (err) {
        console.error("Seeder failed:", err);
        process.exit(1);
    }
}

runSeeder();
