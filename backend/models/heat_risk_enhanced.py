"""
Enhanced Urban Heat Risk Index Model
Integrates actual heat risk calculations based on temperature, population, and tree coverage
Based on: https://github.com/EsriDE/urban-heat-risk-index
"""
import numpy as np
from datetime import datetime
import sys
import os

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils.nasa_data_fetcher import fetch_comprehensive_data

def calculate_heat_risk_score(temperature, population_density, tree_coverage):
    """
    Calculate heat risk score using weighted formula
    
    Formula: HRI = (0.5 * temp_norm) + (0.3 * pop_norm) - (0.2 * tree_norm)
    Where higher temperature and population increase risk, and trees decrease risk
    
    Args:
        temperature: Temperature in Celsius
        population_density: People per km²
        tree_coverage: Percentage of tree canopy (0-100)
    
    Returns:
        float: Heat Risk Index (0-10)
    """
    # Normalize values to 0-1 scale
    temp_norm = min(temperature / 50, 1.0)  # Normalize to 50°C max
    pop_norm = min(population_density / 20000, 1.0)  # Normalize to 20k per km²
    tree_norm = tree_coverage / 100  # Already in percentage
    
    # Calculate weighted risk index
    risk_index = (0.5 * temp_norm) + (0.3 * pop_norm) - (0.2 * tree_norm)
    
    # Scale to 0-10
    risk_index = max(0, min(risk_index * 10, 10))
    
    return round(risk_index, 2)

def calculate_heat_risk(city, coordinates, date):
    """
    Calculate comprehensive heat risk analysis for a city
    
    This function integrates:
    1. Land Surface Temperature (LST) from NASA POWER API
    2. Population density analysis
    3. Tree canopy coverage assessment (NDVI-based)
    4. Urban Heat Island effect calculation
    
    Args:
        city: City name
        coordinates: [lat, lon]
        date: Date string (YYYY-MM-DD)
    
    Returns:
        dict: Comprehensive heat risk analysis
    """
    
    lat, lon = coordinates
    
    print(f"Analyzing heat risk for {city} at coordinates: {lat}, {lon}")
    
    # Fetch real NASA data for this location
    nasa_data = fetch_comprehensive_data(lat, lon, date)
    
    print(f"NASA Data fetched: Temp={nasa_data['temperature']}°C, Tree Coverage={nasa_data['tree_coverage']}%, Pop Density={nasa_data['population_density']}")
    
    # Use real NASA data
    city_data = {
        'temp': nasa_data['temperature'],
        'population': nasa_data['estimated_population'],
        'pop_density': nasa_data['population_density'],
        'treeCover': nasa_data['tree_coverage'],
        'area_km2': 100,  # Estimated urban area
        'uhi_effect': nasa_data['uhi_effect']
    }
    
    # Calculate heat risk index using enhanced algorithm
    risk_index = calculate_heat_risk_score(
        city_data['temp'],
        city_data['pop_density'],
        city_data['treeCover']
    )
    
    # Determine risk level and color
    if risk_index >= 8:
        risk_level = 'Critical'
        color = '#991b1b'
        alert_level = 'Emergency'
    elif risk_index >= 6:
        risk_level = 'High'
        color = '#ef4444'
        alert_level = 'Warning'
    elif risk_index >= 4:
        risk_level = 'Moderate'
        color = '#f59e0b'
        alert_level = 'Watch'
    else:
        risk_level = 'Low'
        color = '#22c55e'
        alert_level = 'Normal'
    
    # Calculate affected population (vulnerable groups)
    # Vulnerable: elderly (10%), children (15%), outdoor workers (8%)
    vulnerable_percentage = 0.33
    affected_population = int(city_data['population'] * vulnerable_percentage * (risk_index / 10))
    
    # Calculate heat-related health risk
    heat_index = city_data['temp'] + city_data['uhi_effect']
    
    # Generate evidence-based recommendations
    recommendations = generate_heat_recommendations(
        risk_index, 
        city_data['treeCover'],
        city_data['uhi_effect'],
        heat_index
    )
    
    # Calculate potential temperature reduction with interventions
    potential_cooling = calculate_cooling_potential(city_data['treeCover'])
    
    return {
        'city': city,
        'date': date,
        'coordinates': coordinates,
        'temperature': city_data['temp'],
        'heatIndex': round(heat_index, 1),
        'uhiEffect': city_data['uhi_effect'],
        'riskIndex': risk_index,
        'riskLevel': risk_level,
        'riskColor': color,
        'alertLevel': alert_level,
        'treeCoverage': city_data['treeCover'],
        'populationDensity': city_data['pop_density'],
        'affectedPopulation': affected_population,
        'vulnerableGroups': {
            'elderly': int(city_data['population'] * 0.10),
            'children': int(city_data['population'] * 0.15),
            'outdoorWorkers': int(city_data['population'] * 0.08)
        },
        'potentialCooling': potential_cooling,
        'recommendations': recommendations,
        'metrics': {
            'heatIntensity': city_data['temp'],
            'populationDensity': city_data['pop_density'],
            'vegetationCover': city_data['treeCover'],
            'urbanHeatIsland': city_data['uhi_effect'],
            'areaKm2': city_data['area_km2']
        },
        'dataSource': f"NASA POWER ({nasa_data['data_sources']['temperature']}), NDVI ({nasa_data['data_sources']['vegetation']}), Population ({nasa_data['data_sources']['population']})"
    }

def generate_heat_recommendations(risk_index, tree_cover, uhi_effect, heat_index):
    """Generate evidence-based heat mitigation recommendations"""
    recommendations = []
    
    if risk_index >= 7:
        recommendations.extend([
            'Establish emergency cooling centers in public buildings',
            'Issue heat health warnings to vulnerable populations',
            'Urgent: Increase tree canopy by 15-20% in next 2 years',
            'Install cool/reflective roofing on 30% of buildings',
            'Create water misting stations in high-traffic areas'
        ])
    elif risk_index >= 5:
        recommendations.extend([
            'Add green infrastructure: 5,000 new trees annually',
            'Create urban parks and green corridors',
            'Implement cool pavement technology on major roads',
            'Improve ventilation corridors through urban planning'
        ])
    else:
        recommendations.extend([
            'Maintain current green space levels',
            'Continue monitoring heat patterns',
            'Gradual tree planting program (1,000 trees/year)'
        ])
    
    # Additional recommendations based on tree coverage
    if tree_cover < 20:
        recommendations.append(f'Critical: Tree coverage at {tree_cover}% (target: 30%)')
    
    # UHI-specific recommendations
    if uhi_effect > 4:
        recommendations.append(f'High UHI effect ({uhi_effect}°C): Focus on urban design changes')
    
    return recommendations

def calculate_cooling_potential(current_tree_cover):
    """
    Calculate potential temperature reduction from increasing tree coverage
    Based on research: 10% increase in tree cover = 1-2°C cooling
    """
    target_tree_cover = 30  # WHO recommendation
    tree_gap = max(0, target_tree_cover - current_tree_cover)
    
    # Each 10% increase provides 1.5°C cooling on average
    potential_cooling = (tree_gap / 10) * 1.5
    
    return {
        'currentCover': current_tree_cover,
        'targetCover': target_tree_cover,
        'gap': round(tree_gap, 1),
        'potentialReduction': round(potential_cooling, 1),
        'timeframe': '3-5 years with aggressive planting'
    }
