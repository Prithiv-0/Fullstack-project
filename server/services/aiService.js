/**
 * AI Service for Incident Classification
 * Uses rule-based NLP for classification and severity scoring
 */

// Keyword mappings for incident types
const typeKeywords = {
    pothole: ['pothole', 'hole', 'pit', 'crater', 'dip', 'road damage', 'broken road'],
    traffic: ['traffic', 'congestion', 'jam', 'signal', 'blocked', 'slow moving', 'accident'],
    flooding: ['flood', 'water logging', 'rain water', 'drainage', 'submerged', 'overflow'],
    streetlight: ['light', 'lamp', 'dark', 'no light', 'street light', 'pole', 'bulb'],
    garbage: ['garbage', 'trash', 'waste', 'dump', 'litter', 'debris', 'rubbish', 'dirty'],
    accident: ['accident', 'crash', 'collision', 'hit', 'injured', 'ambulance', 'emergency'],
    'water-leak': ['water leak', 'pipe burst', 'water supply', 'leaking', 'broken pipe'],
    'road-damage': ['road', 'broken', 'damaged', 'crack', 'asphalt', 'repair needed'],
    'public-safety': ['safety', 'danger', 'hazard', 'risk', 'threat', 'police', 'crime'],
    noise: ['noise', 'loud', 'sound', 'music', 'disturbance', 'construction'],
    'illegal-parking': ['parking', 'parked', 'vehicle', 'blocking', 'obstruction'],
    sewage: ['sewage', 'sewer', 'drain', 'smell', 'stink', 'manhole', 'overflow']
};

// Severity keywords
const severityKeywords = {
    critical: ['urgent', 'emergency', 'immediate', 'danger', 'critical', 'life threatening', 'injured', 'accident', 'fire'],
    high: ['severe', 'serious', 'major', 'large', 'widespread', 'blocked', 'hazardous'],
    medium: ['moderate', 'significant', 'noticeable', 'affecting'],
    low: ['minor', 'small', 'slight', 'occasional']
};

// High-risk areas (for severity boosting)
const highRiskAreas = ['hospital', 'school', 'market', 'junction', 'highway', 'main road', 'bus stop'];

/**
 * Classify an incident based on its content
 * @param {Object} incident - {title, description, type}
 * @returns {Object} AI classification result
 */
function classifyIncident(incident) {
    const { title, description, type } = incident;
    const text = `${title || ''} ${description || ''}`.toLowerCase();

    // Extract keywords found
    const foundKeywords = [];
    Object.entries(typeKeywords).forEach(([incType, keywords]) => {
        keywords.forEach(kw => {
            if (text.includes(kw)) {
                foundKeywords.push(kw);
            }
        });
    });

    // Determine suggested type if not provided
    let detectedType = type;
    if (!type || type === 'other') {
        let maxMatch = 0;
        Object.entries(typeKeywords).forEach(([incType, keywords]) => {
            const matchCount = keywords.filter(kw => text.includes(kw)).length;
            if (matchCount > maxMatch) {
                maxMatch = matchCount;
                detectedType = incType;
            }
        });
    }

    // Calculate severity
    let suggestedSeverity = 'medium';
    let severityScore = 5;

    for (const [severity, keywords] of Object.entries(severityKeywords)) {
        if (keywords.some(kw => text.includes(kw))) {
            suggestedSeverity = severity;
            severityScore = severity === 'critical' ? 10 : severity === 'high' ? 8 : severity === 'medium' ? 5 : 3;
            break;
        }
    }

    // Boost severity for high-risk areas
    if (highRiskAreas.some(area => text.includes(area))) {
        severityScore = Math.min(10, severityScore + 2);
        if (suggestedSeverity === 'low') suggestedSeverity = 'medium';
        if (suggestedSeverity === 'medium') suggestedSeverity = 'high';
    }

    // Calculate confidence (0-1)
    const confidence = Math.min(1, 0.5 + (foundKeywords.length * 0.1));

    return {
        detectedType,
        suggestedSeverity,
        priority: severityScore,
        confidence,
        keywords: foundKeywords.slice(0, 10)
    };
}

/**
 * Generate a summary for an incident
 * @param {Object} incident
 * @returns {string} Summary text
 */
function generateSummary(incident) {
    const { type, severity, location } = incident;
    const typeLabels = {
        pothole: 'Road pothole issue',
        traffic: 'Traffic congestion',
        flooding: 'Flooding/waterlogging',
        streetlight: 'Street light malfunction',
        garbage: 'Garbage/waste issue',
        accident: 'Road accident',
        'water-leak': 'Water supply issue',
        'road-damage': 'Road damage',
        'public-safety': 'Public safety concern',
        noise: 'Noise disturbance',
        'illegal-parking': 'Illegal parking',
        sewage: 'Sewage/drainage issue',
        other: 'General city issue'
    };

    return `${typeLabels[type] || 'City issue'} reported in ${location?.area || location?.address || 'the area'}. Severity: ${severity?.toUpperCase() || 'MEDIUM'}.`;
}

module.exports = {
    classifyIncident,
    generateSummary
};
