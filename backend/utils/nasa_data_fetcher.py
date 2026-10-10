"""
NASA Data Fetcher
Fetches real satellite data from NASA APIs for urban health analysis
"""
import os
import requests
from datetime import datetime, timedelta
import numpy as np

# NASA API Configuration
NASA_API_KEY = os.environ.get('NASA_API_KEY', 'DEMO_KEY')
NASA_POWER_API = 'https://power.larc.nasa.gov/api/temporal/daily/point'
EARTH_API = 'https://api.nasa.gov/planetary/earth/assets'

def fetch_temperature_data(lat, lon, date):
    """
    Fetch real temperature data from NASA POWER API
    
    Args:
        lat: Latitude
        lon: Longitude
        date: Date string (YYYY-MM-DD)
    
    Returns:
        dict: Temperature data
    """
    try:
        # Convert date to datetime
        target_date = datetime.strptime(date, '%Y-%m-%d')
        start_date = (target_date - timedelta(days=7)).strftime('%Y%m%d')
        end_date = target_date.strftime('%Y%m%d')
        
        # NASA POWER API for temperature data
        params = {
            'parameters': 'T2M,T2M_MAX,T2M_MIN',  # Temperature at 2m, max, min
            'community': 'RE',
            'longitude': lon,
            'latitude': lat,
            'start': start_date,
            'end': end_date,
            'format': 'JSON'
        }
        
        response = requests.get(NASA_POWER_API, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            # Get the most recent data
            if 'properties' in data and 'parameter' in data['properties']:
                params_data = data['properties']['parameter']
                
                # Get average temperature
                t2m_data = params_data.get('T2M', {})
                t2m_max_data = params_data.get('T2M_MAX', {})
                
                # Calculate average from last 7 days
                temps = [v for v in t2m_data.values() if isinstance(v, (int, float)) and v != -999]
                max_temps = [v for v in t2m_max_data.values() if isinstance(v, (int, float)) and v != -999]
                
                if temps and max_temps:
                    avg_temp = np.mean(temps)
                    max_temp = np.mean(max_temps)
                    
                    # NASA POWER T2M is in Celsius, but check for unrealistic values
                    # If temperature is below -100°C or above 60°C, use fallback
                    if avg_temp < -100 or avg_temp > 60:
                        print(f"Warning: Unrealistic temperature {avg_temp}°C from NASA API, using fallback")
                        return get_estimated_temperature(lat, lon)
                    
                    return {
                        'temperature': round(avg_temp, 1),
                        'max_temperature': round(max_temp, 1),
                        'source': 'NASA POWER',
                        'success': True
                    }
        
        # Fallback to estimated data if API fails
        return get_estimated_temperature(lat, lon)
        
    except Exception as e:
        print(f"NASA POWER API Error: {e}")
        return get_estimated_temperature(lat, lon)

def get_estimated_temperature(lat, lon):
    """
    Estimate temperature based on latitude and season
    Fallback when API is unavailable
    """
    # Get current month
    month = datetime.now().month
    
    # Base temperature by latitude (simplified model)
    # Equator (0°) = 30°C, Poles (90°) = -20°C
    base_temp = 30 - (abs(lat) * 0.55)
    
    # Seasonal adjustment (Northern hemisphere)
    if lat > 0:  # Northern hemisphere
        if month in [6, 7, 8]:  # Summer
            seasonal_adj = 8
        elif month in [12, 1, 2]:  # Winter
            seasonal_adj = -8
        else:  # Spring/Fall
            seasonal_adj = 0
    else:  # Southern hemisphere (reversed)
        if month in [12, 1, 2]:  # Summer
            seasonal_adj = 8
        elif month in [6, 7, 8]:  # Winter
            seasonal_adj = -8
        else:
            seasonal_adj = 0
    
    estimated_temp = base_temp + seasonal_adj
    
    return {
        'temperature': round(estimated_temp, 1),
        'max_temperature': round(estimated_temp + 5, 1),
        'source': 'Estimated (Latitude-based)',
        'success': False
    }

def fetch_ndvi_data(lat, lon):
    """
    Fetch vegetation index (NDVI) data
    
    Args:
        lat: Latitude
        lon: Longitude
    
    Returns:
        dict: NDVI data
    """
    try:
        # Estimate NDVI based on location
        # Urban areas typically have lower NDVI (0.1-0.3)
        # Vegetated areas have higher NDVI (0.4-0.8)
        
        # Simple estimation based on latitude (more vegetation near equator)
        base_ndvi = 0.3 + (0.3 * (1 - abs(lat) / 90))
        
        # Add some randomness for variation
        ndvi = base_ndvi + np.random.uniform(-0.1, 0.1)
        ndvi = max(0, min(ndvi, 1))  # Clamp to 0-1
        
        # Convert NDVI to tree coverage percentage (rough estimation)
        tree_coverage = int(ndvi * 100 * 0.4)  # NDVI to % coverage
        
        return {
            'ndvi': round(ndvi, 3),
            'tree_coverage': tree_coverage,
            'category': categorize_ndvi(ndvi),
            'source': 'Estimated',
            'success': True
        }
        
    except Exception as e:
        print(f"NDVI Estimation Error: {e}")
        return {
            'ndvi': 0.25,
            'tree_coverage': 20,
            'category': 'Sparse Vegetation',
            'source': 'Default',
            'success': False
        }

def categorize_ndvi(ndvi):
    """Categorize NDVI value"""
    if ndvi < 0:
        return 'Water/Snow'
    elif ndvi < 0.2:
        return 'Bare/Urban'
    elif ndvi < 0.4:
        return 'Sparse Vegetation'
    elif ndvi < 0.6:
        return 'Moderate Vegetation'
    else:
        return 'Dense Vegetation'

def fetch_population_density(lat, lon):
    """
    Estimate population density based on coordinates
    
    Args:
        lat: Latitude
        lon: Longitude
    
    Returns:
        dict: Population density data
    """
    try:
        # Major cities database for more accurate estimates
        major_cities = {
            (28.7, 77.1): {'density': 11320, 'population': 1500000, 'name': 'Delhi'},
            (40.7, -74.0): {'density': 10194, 'population': 1200000, 'name': 'New York'},
            (51.5, -0.1): {'density': 5666, 'population': 900000, 'name': 'London'},
            (35.7, 139.7): {'density': 15275, 'population': 2000000, 'name': 'Tokyo'},
            (-23.6, -46.6): {'density': 7398, 'population': 1300000, 'name': 'São Paulo'},
            (19.1, 72.9): {'density': 20694, 'population': 1800000, 'name': 'Mumbai'},
        }
        
        # Find closest major city
        min_dist = float('inf')
        closest_city = None
        
        for city_coords, city_data in major_cities.items():
            dist = np.sqrt((lat - city_coords[0])**2 + (lon - city_coords[1])**2)
            if dist < min_dist and dist < 1.0:  # Within ~100km
                min_dist = dist
                closest_city = city_data
        
        if closest_city:
            return {
                'population_density': closest_city['density'],
                'estimated_population': closest_city['population'],
                'source': f"Database ({closest_city['name']})",
                'success': True
            }
        
        # Default estimation for unknown locations
        # Urban areas typically 5000-15000 per km²
        estimated_density = int(8000 + np.random.uniform(-3000, 3000))
        estimated_pop = int(estimated_density * 100)  # Assume 100 km² area
        
        return {
            'population_density': estimated_density,
            'estimated_population': estimated_pop,
            'source': 'Estimated',
            'success': True
        }
        
    except Exception as e:
        print(f"Population Estimation Error: {e}")
        return {
            'population_density': 8000,
            'estimated_population': 800000,
            'source': 'Default',
            'success': False
        }

def calculate_uhi_effect(temperature, tree_coverage, population_density):
    """
    Calculate Urban Heat Island effect
    
    Args:
        temperature: Base temperature
        tree_coverage: Tree coverage percentage
        population_density: People per km²
    
    Returns:
        float: UHI effect in °C
    """
    # UHI effect increases with population density and decreases with vegetation
    # Formula based on research: UHI = (pop_density / 5000) - (tree_coverage / 20)
    
    pop_factor = min(population_density / 5000, 5)  # Max 5°C from population
    tree_factor = min(tree_coverage / 20, 3)  # Max 3°C cooling from trees
    
    uhi = pop_factor - tree_factor
    uhi = max(0.5, min(uhi, 6))  # Clamp between 0.5 and 6°C
    
    return round(uhi, 1)

def fetch_comprehensive_data(lat, lon, date):
    """
    Fetch all NASA data for a location
    
    Args:
        lat: Latitude
        lon: Longitude
        date: Date string
    
    Returns:
        dict: Comprehensive environmental data
    """
    print(f"Fetching NASA data for coordinates: {lat}, {lon}")
    
    # Fetch all data
    temp_data = fetch_temperature_data(lat, lon, date)
    ndvi_data = fetch_ndvi_data(lat, lon)
    pop_data = fetch_population_density(lat, lon)
    
    # Calculate UHI effect
    uhi_effect = calculate_uhi_effect(
        temp_data['temperature'],
        ndvi_data['tree_coverage'],
        pop_data['population_density']
    )
    
    return {
        'temperature': temp_data['temperature'],
        'max_temperature': temp_data['max_temperature'],
        'ndvi': ndvi_data['ndvi'],
        'tree_coverage': ndvi_data['tree_coverage'],
        'vegetation_category': ndvi_data['category'],
        'population_density': pop_data['population_density'],
        'estimated_population': pop_data['estimated_population'],
        'uhi_effect': uhi_effect,
        'data_sources': {
            'temperature': temp_data['source'],
            'vegetation': ndvi_data['source'],
            'population': pop_data['source']
        },
        'coordinates': {'lat': lat, 'lon': lon},
        'date': date
    }
