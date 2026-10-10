import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './SatelliteMap.css';

function SatelliteMap({ city, coordinates, dataset, date }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const heatLayerRef = useRef(null);
  const [layerLoaded, setLayerLoaded] = useState(false);

  // Fallback coordinates if not provided
  const defaultCoordinates = {
    'New York': [40.7128, -74.0060],
    'London': [51.5074, -0.1278],
    'Tokyo': [35.6762, 139.6503],
    'Delhi': [28.7041, 77.1025],
    'São Paulo': [-23.5505, -46.6333],
    'Mumbai': [19.0760, 72.8777]
  };

  // NASA GIBS Layer configurations with proper parameters
  const gibsLayers = {
    heat: {
      layer: 'MODIS_Terra_Land_Surface_Temp_Day',
      format: 'png',
      tileMatrixSet: 'GoogleMapsCompatible_Level9',
      time: true
    },
    greenspace: {
      layer: 'MODIS_Terra_NDVI_8Day',
      format: 'png',
      tileMatrixSet: 'GoogleMapsCompatible_Level9',
      time: true
    },
    airquality: {
      layer: 'MODIS_Combined_MAIAC_L2G_AerosolOpticalDepth',
      format: 'png',
      tileMatrixSet: 'GoogleMapsCompatible_Level9',
      time: true
    }
  };

  // Generate hexagonal heatmap data
  const generateHexagonalHeatData = (centerCoords, dataset) => {
    const hexagons = [];
    const radius = 0.05; // ~5km hexagon radius
    const gridSize = 5;
    
    for (let i = -gridSize; i <= gridSize; i++) {
      for (let j = -gridSize; j <= gridSize; j++) {
        const lat = centerCoords[0] + (i * radius * 1.5);
        const lon = centerCoords[1] + (j * radius * Math.sqrt(3));
        
        // Simulate heat/green/health data (in production, fetch from NASA API)
        let value;
        if (dataset === 'heat') {
          value = 25 + Math.random() * 20; // Temperature 25-45°C
        } else if (dataset === 'greenspace') {
          value = Math.random(); // NDVI 0-1
        } else {
          value = Math.random() * 100; // Percentage
        }
        
        hexagons.push({
          center: [lat, lon],
          value: value
        });
      }
    }
    return hexagons;
  };

  // Get color based on value and dataset
  const getHexColor = (value, dataset) => {
    if (dataset === 'heat') {
      // Temperature color scale
      if (value > 40) return '#8B0000'; // Dark red
      if (value > 35) return '#DC143C'; // Crimson
      if (value > 30) return '#FF6347'; // Tomato
      if (value > 25) return '#FFA500'; // Orange
      return '#FFD700'; // Gold
    } else if (dataset === 'greenspace') {
      // NDVI color scale
      if (value > 0.6) return '#006400'; // Dark green
      if (value > 0.4) return '#228B22'; // Forest green
      if (value > 0.2) return '#90EE90'; // Light green
      return '#F0E68C'; // Khaki
    } else {
      // Generic percentage scale
      if (value > 75) return '#4169E1'; // Royal blue
      if (value > 50) return '#87CEEB'; // Sky blue
      if (value > 25) return '#ADD8E6'; // Light blue
      return '#E0FFFF'; // Light cyan
    }
  };

  // Create hexagon polygon
  const createHexagon = (center, radius) => {
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const lat = center[0] + radius * Math.sin(angle);
      const lon = center[1] + radius * Math.cos(angle);
      points.push([lat, lon]);
    }
    return points;
  };

  useEffect(() => {
    if (!mapRef.current) return;

    // Use provided coordinates, fallback to city lookup, or default to Delhi
    const coords = coordinates || defaultCoordinates[city] || [28.7041, 77.1025];
    
    // Initialize map if not already created
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current, {
        center: coords,
        zoom: 11,
        zoomControl: true,
        attributionControl: true
      });

      // Add base layer (CartoDB for better contrast)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap, © CartoDB',
        maxZoom: 19
      }).addTo(mapInstanceRef.current);
    } else {
      // Update map center
      mapInstanceRef.current.setView(coords, 11);
    }

    // Remove existing overlays
    if (heatLayerRef.current) {
      mapInstanceRef.current.removeLayer(heatLayerRef.current);
    }

    // Get NASA GIBS configuration
    const gibsConfig = gibsLayers[dataset] || gibsLayers.heat;
    const gibsUrl = `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/${gibsConfig.layer}/default/${date}/${gibsConfig.tileMatrixSet}/{z}/{y}/{x}.${gibsConfig.format}`;

    // Add NASA GIBS layer with error handling
    const gibsLayer = L.tileLayer(gibsUrl, {
      attribution: 'NASA GIBS',
      opacity: 0.6,
      className: 'gibs-layer',
      maxZoom: 9,
      errorTileUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
    });

    gibsLayer.on('load', () => {
      setLayerLoaded(true);
    });

    gibsLayer.on('tileerror', (error) => {
      console.warn('GIBS tile load error:', error);
    });

    gibsLayer.addTo(mapInstanceRef.current);

    // Generate and add hexagonal heatmap overlay
    const hexData = generateHexagonalHeatData(coords, dataset);
    const hexagonGroup = L.layerGroup();

    hexData.forEach(hex => {
      const hexPoints = createHexagon(hex.center, 0.02);
      const polygon = L.polygon(hexPoints, {
        color: getHexColor(hex.value, dataset),
        fillColor: getHexColor(hex.value, dataset),
        fillOpacity: 0.5,
        weight: 1,
        opacity: 0.7
      });

      // Add tooltip with value
      let tooltipText;
      if (dataset === 'heat') {
        tooltipText = `Temperature: ${hex.value.toFixed(1)}°C`;
      } else if (dataset === 'greenspace') {
        tooltipText = `NDVI: ${hex.value.toFixed(2)}`;
      } else {
        tooltipText = `Value: ${hex.value.toFixed(1)}%`;
      }
      
      polygon.bindTooltip(tooltipText, {
        permanent: false,
        direction: 'top'
      });

      hexagonGroup.addLayer(polygon);
    });

    hexagonGroup.addTo(mapInstanceRef.current);
    heatLayerRef.current = hexagonGroup;

    // Cleanup
    return () => {
      if (mapInstanceRef.current && heatLayerRef.current) {
        mapInstanceRef.current.removeLayer(heatLayerRef.current);
      }
      if (mapInstanceRef.current && gibsLayer) {
        mapInstanceRef.current.removeLayer(gibsLayer);
      }
    };
  }, [city, coordinates, dataset, date]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="satellite-map-container">
      <div ref={mapRef} className="satellite-map"></div>
      <div className="map-overlay">
        <div className="overlay-info">
          <span className="overlay-label">🛰️ NASA GIBS + Hexagonal Heatmap</span>
          <span className="overlay-city">{city}</span>
          {!layerLoaded && <span className="loading-indicator">Loading satellite data...</span>}
        </div>
        <div className="legend">
          <h4>Legend</h4>
          {dataset === 'heat' && (
            <div className="legend-items">
              <div className="legend-item"><span className="legend-color" style={{background: '#8B0000'}}></span> &gt;40°C (Critical)</div>
              <div className="legend-item"><span className="legend-color" style={{background: '#DC143C'}}></span> 35-40°C (High)</div>
              <div className="legend-item"><span className="legend-color" style={{background: '#FF6347'}}></span> 30-35°C (Moderate)</div>
              <div className="legend-item"><span className="legend-color" style={{background: '#FFA500'}}></span> 25-30°C (Low)</div>
            </div>
          )}
          {dataset === 'greenspace' && (
            <div className="legend-items">
              <div className="legend-item"><span className="legend-color" style={{background: '#006400'}}></span> Dense Vegetation</div>
              <div className="legend-item"><span className="legend-color" style={{background: '#228B22'}}></span> Moderate Vegetation</div>
              <div className="legend-item"><span className="legend-color" style={{background: '#90EE90'}}></span> Sparse Vegetation</div>
              <div className="legend-item"><span className="legend-color" style={{background: '#F0E68C'}}></span> Bare/Urban</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SatelliteMap;
