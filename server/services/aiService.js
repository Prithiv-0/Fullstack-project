/**
 * aiService.js - AI Classification Service for Urban Incidents
 *
 * This module powers the intelligent classification system (Spec Section 8.1).
 * It provides a dual-strategy approach:
 *
 *  1. PRIMARY: Google Gemini API — sends incident details to the Gemini LLM
 *     for NLP-based classification, priority scoring, sentiment analysis,
 *     and department routing suggestions. Requires GEMINI_API_KEY env var.
 *
 *  2. FALLBACK: Rule-based classification — uses keyword matching against
 *     predefined dictionaries to determine incident type, severity level,
 *     and suggested department when the AI API is unavailable.
 *
 * The classifyIncident() function is the main entry point, called automatically
 * after each new incident is created (via postIncidentCreation in incidentRoutes).
 *
 * Output fields: nlpCategory, priorityTag, priorityScore (0-100),
 * classificationConfidence (0-1), sentimentScore (-1 to 1), suggestedDepartment.
 */

// Keyword mappings for rule-based incident type detection (fallback strategy)
const typeKeywords = {
    pothole: ['pothole', 'hole', 'pit', 'crater', 'dip', 'road damage', 'broken road'],
    traffic: ['traffic', 'congestion', 'jam', 'signal', 'blocked', 'slow moving'],
    flooding: ['flood', 'water logging', 'rain water', 'drainage', 'submerged', 'overflow'],
    streetlight: ['light', 'lamp', 'dark', 'no light', 'street light', 'pole', 'bulb'],
    garbage: ['garbage', 'trash', 'waste', 'dump', 'litter', 'debris', 'rubbish', 'dirty'],
    accident: ['accident', 'crash', 'collision', 'hit', 'injured', 'ambulance', 'emergency'],
    water_leak: ['water leak', 'pipe burst', 'water supply', 'leaking', 'broken pipe'],
    road_damage: ['road', 'broken', 'damaged', 'crack', 'asphalt', 'repair needed'],
    safety_issue: ['safety', 'danger', 'hazard', 'risk', 'threat', 'police', 'crime'],
    noise: ['noise', 'loud', 'sound', 'music', 'disturbance', 'construction'],
    illegal_parking: ['parking', 'parked', 'vehicle', 'blocking', 'obstruction'],
    sewage: ['sewage', 'sewer', 'drain', 'smell', 'stink', 'manhole', 'overflow']
};

// Severity keyword mappings — used to determine priority from incident text
const severityKeywords = {
    critical: ['urgent', 'emergency', 'immediate', 'danger', 'critical', 'life threatening', 'injured', 'fire'],
    high: ['severe', 'serious', 'major', 'large', 'widespread', 'blocked', 'hazardous'],
    medium: ['moderate', 'significant', 'noticeable', 'affecting'],
    low: ['minor', 'small', 'slight', 'occasional']
};

// Department routing rules — maps incident types to responsible departments
const ROUTING_RULES = {
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

/**
 * Classify an incident — tries Gemini API first, falls back to rule-based
 */
async function classifyIncident(incident) {
    const geminiKey = process.env.GEMINI_API_KEY;

    // Try Gemini API if key available
    if (geminiKey && geminiKey !== 'your_gemini_api_key') {
        try {
            return await classifyWithGemini(incident, geminiKey);
        } catch (err) {
            console.error('Gemini API error, falling back to rules:', err.message);
        }
    }

    // Fallback to rule-based classification
    return classifyWithRules(incident);
}

/**
 * Gemini API classification (Section 8.1)
 */
async function classifyWithGemini(incident, apiKey) {
    const prompt = `You are a smart city incident classification AI.

Incident Details:
- Type: ${incident.type}
- Title: ${incident.title}
- Description: ${incident.description || ''}
- Location: ${incident.location?.area || ''}, ${incident.location?.zone || ''}

Please analyze and return ONLY a JSON object with these fields:
{
  "nlpCategory": string,
  "priorityTag": "critical|high|medium|low",
  "priorityScore": number (0-100),
  "aiSummary": string,
  "suggestedDepartment": string,
  "classificationConfidence": number (0.0-1.0),
  "sentimentScore": number (-1.0 to 1.0)
}`;

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.2, maxOutputTokens: 500 }
        })
    });

    const data = await response.json();

    if (!data.candidates || !data.candidates[0]) {
        throw new Error('No response from Gemini');
    }

    const raw = data.candidates[0].content.parts[0].text;
    const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());

    return {
        nlpCategory: parsed.nlpCategory,
        priorityTag: parsed.priorityTag,
        priorityScore: parsed.priorityScore,
        aiSummary: parsed.aiSummary,
        suggestedDepartment: parsed.suggestedDepartment,
        classificationConfidence: parsed.classificationConfidence,
        sentimentScore: parsed.sentimentScore,
        llmModel: 'gemini-pro',
        rawResponse: data
    };
}

/**
 * Rule-based classification fallback
 */
function classifyWithRules(incident) {
    const { title, description, type } = incident;
    const text = `${title || ''} ${description || ''}`.toLowerCase();

    // Extract keywords
    const foundKeywords = [];
    Object.entries(typeKeywords).forEach(([, keywords]) => {
        keywords.forEach(kw => { if (text.includes(kw)) foundKeywords.push(kw); });
    });

    // Determine severity
    let priorityTag = 'medium';
    let priorityScore = 50;

    for (const [severity, keywords] of Object.entries(severityKeywords)) {
        if (keywords.some(kw => text.includes(kw))) {
            priorityTag = severity;
            priorityScore = severity === 'critical' ? 90 : severity === 'high' ? 70 : severity === 'medium' ? 50 : 25;
            break;
        }
    }

    const suggestedDepartment = ROUTING_RULES[type] || ROUTING_RULES.other;
    const confidence = Math.min(1, 0.5 + (foundKeywords.length * 0.1));

    return {
        nlpCategory: type,
        priorityTag,
        priorityScore,
        aiSummary: `${type.replace(/_/g, ' ')} issue reported at ${incident.location?.area || 'unknown location'}. Severity: ${priorityTag}. Recommended department: ${suggestedDepartment}.`,
        suggestedDepartment,
        classificationConfidence: confidence,
        sentimentScore: priorityTag === 'critical' ? -0.8 : priorityTag === 'high' ? -0.5 : -0.2,
        llmModel: 'rule-based',
        rawResponse: null,
        // backward compat
        detectedType: type,
        suggestedSeverity: priorityTag,
        priority: priorityScore / 10,
        keywords: foundKeywords.slice(0, 10)
    };
}

module.exports = {
    classifyIncident,
    classifyWithGemini,
    classifyWithRules,
    ROUTING_RULES
};
