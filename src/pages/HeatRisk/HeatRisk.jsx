import React, { useState, useEffect } from 'react';
import SatelliteMap from '../../components/SatelliteMap/SatelliteMap';
import GoogleMaps3D from '../../components/GoogleMaps3D/GoogleMaps3D';
import CitySearch from '../../components/CitySearch/CitySearch';
import { analyzeHeatRisk } from '../../utils/aiModels';
import './HeatRisk.css';

function HeatRisk() {
  const [selectedCity, setSelectedCity] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [heatResults, setHeatResults] = useState(null);

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    console.log('Selected city:', city);
  };

  const handleAnalyze = async () => {
    if (!selectedCity) {
      alert('Please search and select a city first');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await analyzeHeatRisk(
        selectedCity.name, 
        selectedCity.coordinates, 
        currentDate
      );
      setHeatResults(response.data);
      setShowMap(true);
    } catch (error) {
      console.error('Heat risk analysis failed:', error);
      alert('Analysis failed. Make sure backend is running on http://localhost:5000');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="heat-risk-page">
      {/* Header Section */}
      <section className="heat-header">
        <div className="heat-header-content">
          <h1 className="heat-title">Urban Heat Risk Index</h1>
          <p className="heat-subtitle">
            Advanced AI-powered analysis of urban heat islands using NASA satellite data and machine learning algorithms
          </p>
        </div>
      </section>


      {/* Analysis Controls */}
      <section className="analysis-section">
        <div className="container">
          <h2 className="section-title">Analysis Dashboard</h2>
          
          <div className="analysis-controls">
            <div className="control-group">
              <label>City Selection</label>
              <CitySearch onCitySelect={handleCitySelect} />
              {selectedCity && (
                <div className="selected-city-info">
                  <span>{selectedCity.name}, {selectedCity.country}</span>
                  <span className="coords">({selectedCity.lat.toFixed(4)}, {selectedCity.lon.toFixed(4)})</span>
                </div>
              )}
            </div>

            <div className="control-group">
              <label>Date</label>
              <input
                type="date"
                value={currentDate}
                onChange={(e) => setCurrentDate(e.target.value)}
                max={new Date().toISOString().slice(0, 10)}
                className="control-input"
              />
            </div>

            <button 
              className="analyze-btn"
              onClick={handleAnalyze}
              disabled={loading || !selectedCity}
            >
              {loading ? 'Analyzing...' : 'Analyze Heat Risk'}
            </button>
          </div>

          {/* Results Display */}
          {heatResults && (
            <>
              {/* Risk Overview Cards */}
              <div className="risk-overview">
                <div className="risk-card" style={{ borderColor: heatResults.riskColor }}>
                  <h3>Temperature</h3>
                  <div className="risk-value">{heatResults.temperature}°C</div>
                  <p className="risk-label">Land Surface Temp</p>
                </div>

                <div className="risk-card" style={{ borderColor: heatResults.riskColor }}>
                  <h3>Heat Index</h3>
                  <div className="risk-value">{heatResults.heatIndex}°C</div>
                  <p className="risk-label">Feels Like (with UHI)</p>
                </div>

                <div className="risk-card" style={{ borderColor: heatResults.riskColor }}>
                  <h3>Risk Index</h3>
                  <div className="risk-value">{heatResults.riskIndex}/10</div>
                  <p className="risk-label" style={{ color: heatResults.riskColor }}>
                    {heatResults.riskLevel}
                  </p>
                </div>

                <div className="risk-card" style={{ borderColor: heatResults.riskColor }}>
                  <h3>Affected Population</h3>
                  <div className="risk-value">{(heatResults.affectedPopulation / 1000).toFixed(0)}K</div>
                  <p className="risk-label">Vulnerable Groups</p>
                </div>
              </div>

              {/* 3D Aerial View */}
              <div className="visualization-section">
                <h3>3D Aerial View</h3>
                <GoogleMaps3D 
                  coordinates={selectedCity.coordinates}
                  city={selectedCity.name}
                />
                <p className="viz-description">
                  Google Maps 3D aerial view of the analyzed area showing real terrain and buildings.
                </p>
              </div>

              {/* Satellite Map */}
              {showMap && selectedCity && (
                <div className="map-section">
                  <h3>NASA Satellite Imagery - Land Surface Temperature</h3>
                  <SatelliteMap 
                    city={selectedCity.name}
                    coordinates={selectedCity.coordinates}
                    dataset="heat"
                    date={currentDate}
                  />
                  <p className="map-description">
                    MODIS Land Surface Temperature overlay from NASA GIBS with hexagonal heatmap
                  </p>
                </div>
              )}

              {/* Detailed Metrics */}
              <div className="detailed-metrics">
                <h3>Detailed Analysis</h3>
                <div className="metrics-grid">
                  <div className="metric-item">
                    <span className="metric-label">Urban Heat Island Effect</span>
                    <span className="metric-value">{heatResults.uhiEffect}°C</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Tree Coverage</span>
                    <span className="metric-value">{heatResults.treeCoverage}%</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Population Density</span>
                    <span className="metric-value">{heatResults.populationDensity} per km²</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Alert Level</span>
                    <span className="metric-value" style={{ color: heatResults.riskColor }}>
                      {heatResults.alertLevel}
                    </span>
                  </div>
                </div>
              </div>

              {/* Vulnerable Groups */}
              {heatResults.vulnerableGroups && (
                <div className="vulnerable-section">
                  <h3>Vulnerable Populations</h3>
                  <div className="vulnerable-grid">
                    <div className="vulnerable-card">
                      <h4>Elderly (65+)</h4>
                      <p className="vulnerable-count">{(heatResults.vulnerableGroups.elderly / 1000).toFixed(0)}K people</p>
                      <p className="vulnerable-desc">Higher heat sensitivity</p>
                    </div>
                    <div className="vulnerable-card">
                      <h4>Children (0-5)</h4>
                      <p className="vulnerable-count">{(heatResults.vulnerableGroups.children / 1000).toFixed(0)}K people</p>
                      <p className="vulnerable-desc">Developing thermoregulation</p>
                    </div>
                    <div className="vulnerable-card">
                      <h4>Outdoor Workers</h4>
                      <p className="vulnerable-count">{(heatResults.vulnerableGroups.outdoorWorkers / 1000).toFixed(0)}K people</p>
                      <p className="vulnerable-desc">Extended heat exposure</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Cooling Potential */}
              {heatResults.potentialCooling && (
                <div className="cooling-section">
                  <h3>Cooling Potential Analysis</h3>
                  <div className="cooling-card">
                    <div className="cooling-stat">
                      <span className="cooling-label">Current Tree Cover</span>
                      <span className="cooling-value">{heatResults.potentialCooling.currentCover}%</span>
                    </div>
                    <div className="cooling-stat">
                      <span className="cooling-label">Target Tree Cover (WHO)</span>
                      <span className="cooling-value">{heatResults.potentialCooling.targetCover}%</span>
                    </div>
                    <div className="cooling-stat">
                      <span className="cooling-label">Gap to Close</span>
                      <span className="cooling-value">{heatResults.potentialCooling.gap}%</span>
                    </div>
                    <div className="cooling-stat highlight">
                      <span className="cooling-label">Potential Temperature Reduction</span>
                      <span className="cooling-value">-{heatResults.potentialCooling.potentialReduction}°C</span>
                    </div>
                    <div className="cooling-timeframe">
                      <p>Timeframe: {heatResults.potentialCooling.timeframe}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Recommendations */}
              <div className="recommendations-section">
                <h3>Recommendations</h3>
                <div className="recommendations-list">
                  {heatResults.recommendations.map((rec, index) => (
                    <div key={index} className="recommendation-item">
                      <span className="rec-number">{index + 1}</span>
                      <p>{rec}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data Sources */}
              <div className="data-source-section">
                <h3>Data Sources</h3>
                <p className="data-source-text">{heatResults.dataSource}</p>
              </div>
            </>
          )}
        </div>
      </section>

    </div>
  );
}

export default HeatRisk;
