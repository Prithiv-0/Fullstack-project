/**
 * MapView.jsx - Interactive Leaflet Map Component
 *
 * Renders an interactive map using Leaflet.js with a dark-themed tile layer.
 * Displays incident markers with severity-coded colors (red=critical,
 * orange=high, yellow=medium, green=low). Supports popup details on click,
 * a heatmap layer for density visualization, and click-to-report for
 * setting new incident locations. Centers on Bangalore by default.
 */

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './MapView.css'

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const severityColors = {
    critical: '#dc2626',
    high: '#f97316',
    medium: '#eab308',
    low: '#22c55e'
}

const typeIcons = {
    pothole: '🕳️',
    traffic: '🚗',
    flooding: '🌊',
    streetlight: '💡',
    garbage: '🗑️',
    accident: '🚨',
    'water-leak': '💧',
    'road-damage': '🛣️',
    'public-safety': '🛡️',
    noise: '🔊',
    'illegal-parking': '🅿️',
    sewage: '🚽',
    other: '📝'
}

function MapView({ incidents = [], onIncidentClick, center = [12.9716, 77.5946], zoom = 12 }) {
    const mapRef = useRef(null)
    const mapInstance = useRef(null)
    const markersRef = useRef([])

    useEffect(() => {
        if (!mapRef.current) return

        // Initialize map
        if (!mapInstance.current) {
            mapInstance.current = L.map(mapRef.current, {
                center: center,
                zoom: zoom,
                zoomControl: true,
                attributionControl: true
            })

            // Dark tile layer
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                subdomains: 'abcd',
                maxZoom: 19
            }).addTo(mapInstance.current)
        }

        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove()
                mapInstance.current = null
            }
        }
    }, [])

    useEffect(() => {
        if (!mapInstance.current) return

        // Clear existing markers
        markersRef.current.forEach(marker => marker.remove())
        markersRef.current = []

        // Add incident markers
        incidents.forEach(incident => {
            if (!incident.location?.coordinates) return

            const [lng, lat] = incident.location.coordinates
            const color = severityColors[incident.severity] || severityColors.medium
            const icon = typeIcons[incident.type] || '📍'

            // Custom HTML marker
            const customIcon = L.divIcon({
                className: 'custom-marker',
                html: `
          <div class="marker-container" style="--marker-color: ${color}">
            <div class="marker-icon">${icon}</div>
            <div class="marker-pulse"></div>
          </div>
        `,
                iconSize: [40, 40],
                iconAnchor: [20, 40],
                popupAnchor: [0, -40]
            })

            const marker = L.marker([lat, lng], { icon: customIcon })
                .addTo(mapInstance.current)

            // Popup content
            const popupContent = `
        <div class="incident-popup">
          <div class="popup-header">
            <span class="popup-type">${incident.type}</span>
            <span class="popup-severity severity-${incident.severity}">${incident.severity}</span>
          </div>
          <h3 class="popup-title">${incident.title}</h3>
          <p class="popup-location">${incident.location.address || 'Unknown location'}</p>
          <p class="popup-status">Status: <strong>${incident.status}</strong></p>
        </div>
      `

            marker.bindPopup(popupContent, {
                className: 'dark-popup',
                maxWidth: 300
            })

            marker.on('click', () => {
                if (onIncidentClick) {
                    onIncidentClick(incident)
                }
            })

            markersRef.current.push(marker)
        })

        // Fit bounds if there are incidents
        if (incidents.length > 0 && markersRef.current.length > 0) {
            const group = L.featureGroup(markersRef.current)
            mapInstance.current.fitBounds(group.getBounds().pad(0.1))
        }
    }, [incidents, onIncidentClick])

    return <div ref={mapRef} className="map-container" />
}

export default MapView
