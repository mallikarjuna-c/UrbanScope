from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys
from datetime import datetime


from models.heat_risk_enhanced import calculate_heat_risk
from models.green_space_enhanced import calculate_green_exposure
from models.healthcare_enhanced import calculate_healthcare_access
from models.prediction import predict_future_trends

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

def get_city_and_coordinates(data):
    """Validate the request body and return (city, [lat, lon])"""
    if not isinstance(data, dict):
        raise ValueError('Request body must be JSON')
    coordinates = data.get('coordinates')
    if not isinstance(coordinates, (list, tuple)) or len(coordinates) != 2:
        raise ValueError("'coordinates' must be [lat, lon]")
    lat, lon = float(coordinates[0]), float(coordinates[1])
    if not (-90 <= lat <= 90 and -180 <= lon <= 180):
        raise ValueError("'coordinates' are out of range")
    return data.get('city') or 'Unknown', [lat, lon]

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'message': 'UrbanScope AI Backend is running',
        'timestamp': datetime.now().isoformat()
    })

# Heat Risk Analysis
@app.route('/api/heat-risk', methods=['POST'])
def analyze_heat_risk():
    try:
        data = request.get_json(silent=True)
        city, coordinates = get_city_and_coordinates(data)
        date = data.get('date', datetime.now().strftime('%Y-%m-%d'))
        
        result = calculate_heat_risk(city, coordinates, date)
        
        return jsonify({
            'success': True,
            'data': result
        })
    except ValueError as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Green Space Analysis
@app.route('/api/green-space', methods=['POST'])
def analyze_green_space():
    try:
        data = request.get_json(silent=True)
        city, coordinates = get_city_and_coordinates(data)
        buffer_distance = data.get('bufferDistance', 500)
        
        result = calculate_green_exposure(city, coordinates, buffer_distance)
        
        return jsonify({
            'success': True,
            'data': result
        })
    except ValueError as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Healthcare Access Analysis
@app.route('/api/healthcare-access', methods=['POST'])
def analyze_healthcare():
    try:
        data = request.get_json(silent=True)
        city, coordinates = get_city_and_coordinates(data)
        population = data.get('population', 1000000)
        drive_time_threshold = data.get('driveTimeThreshold', 15)
        
        result = calculate_healthcare_access(city, coordinates, population, drive_time_threshold)
        
        return jsonify({
            'success': True,
            'data': result
        })
    except ValueError as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Integrated Analysis (All 3 models)
@app.route('/api/integrated-analysis', methods=['POST'])
def integrated_analysis():
    try:
        data = request.get_json(silent=True)
        city, coordinates = get_city_and_coordinates(data)
        
        # Run all 3 analyses
        heat_result = calculate_heat_risk(city, coordinates, datetime.now().strftime('%Y-%m-%d'))
        green_result = calculate_green_exposure(city, coordinates, 500)
        healthcare_result = calculate_healthcare_access(city, coordinates, 1000000, 15)
        
        # Generate integrated recommendations
        recommendations = generate_recommendations(heat_result, green_result, healthcare_result)
        
        return jsonify({
            'success': True,
            'data': {
                'heatRisk': heat_result,
                'greenSpace': green_result,
                'healthcare': healthcare_result,
                'recommendations': recommendations,
                'overallScore': calculate_overall_score(heat_result, green_result, healthcare_result)
            }
        })
    except ValueError as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# 5-Year Prediction
@app.route('/api/predict-future', methods=['POST'])
def predict_future():
    try:
        data = request.get_json(silent=True)
        city, coordinates = get_city_and_coordinates(data)
        years = data.get('years', 5)
        
        # Get current data
        heat_result = calculate_heat_risk(city, coordinates, datetime.now().strftime('%Y-%m-%d'))
        green_result = calculate_green_exposure(city, coordinates, 500)
        healthcare_result = calculate_healthcare_access(city, coordinates, 1000000, 15)
        
        current_data = {
            'heatRisk': heat_result,
            'greenSpace': green_result,
            'healthcare': healthcare_result
        }
        
        # Run prediction model
        prediction_result = predict_future_trends(city, coordinates, current_data, years)
        
        return jsonify({
            'success': True,
            'data': prediction_result
        })
    except ValueError as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def generate_recommendations(heat, green, healthcare):
    """Generate actionable recommendations based on all 3 analyses"""
    recommendations = []
    
    if heat.get('riskLevel') == 'Critical' and green.get('greenspaceCoverage', 0) < 15:
        recommendations.append({
            'priority': 'High',
            'action': 'Add green infrastructure immediately',
            'impact': 'Reduces heat by 3-5°C and improves air quality',
            'cost': 'Medium'
        })
    
    if green.get('distanceToNearestPark', 0) > 500:
        recommendations.append({
            'priority': 'High',
            'action': 'Create new park within 500m',
            'impact': 'Improves accessibility for 10,000+ residents',
            'cost': 'High'
        })
    
    if healthcare.get('populationWithoutAccess', 0) > 30:
        recommendations.append({
            'priority': 'Critical',
            'action': 'Build new healthcare facility',
            'impact': 'Serves 30%+ underserved population',
            'cost': 'Very High'
        })
    
    return recommendations

def calculate_overall_score(heat, green, healthcare):
    """Calculate overall urban health score (0-100)"""
    heat_score = max(0, 100 - (heat.get('riskIndex', 5) * 10))
    green_score = green.get('greenspaceCoverage', 0) * 2
    healthcare_score = healthcare.get('populationWithAccess', 50)
    
    overall = (heat_score + green_score + healthcare_score) / 3
    return round(overall, 2)

if __name__ == '__main__':
    # Windows consoles default to cp1252, which can't print the emoji below
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')

    print("=" * 60)
    print("🚀 UrbanScope AI Backend - Enhanced Edition")
    print("=" * 60)
    print("\n📊 Enhanced AI Models Loaded:")
    print("  ✅ Urban Heat Risk Index (Enhanced)")
    print("     - Land Surface Temperature Analysis")
    print("     - Urban Heat Island Effect Calculation")
    print("     - Population Vulnerability Assessment")
    print("\n  ✅ GreenEx_Py Integration (Enhanced)")
    print("     - NDVI Vegetation Analysis")
    print("     - Green Space Availability & Accessibility")
    print("     - Visibility Index Calculation")
    print("\n  ✅ Healthcare Access Analysis (Enhanced)")
    print("     - Drive-time Isoline Generation")
    print("     - Population Coverage Analysis")
    print("     - Optimal Facility Location Recommendations")
    print("\n  ✅ 5-Year Prediction Model")
    print("     - Future Trend Forecasting")
    print("     - Intervention Impact Analysis")
    print("\n" + "=" * 60)
    print("🌐 Server Status: RUNNING")
    print("📡 Endpoint: http://localhost:5000")
    print("🔗 Frontend: http://localhost:5173")
    print("=" * 60)
    print("\n✨ Ready to analyze urban health data!\n")
    
    # Get port from environment variable (for production) or use 5000 for local
    port = int(os.environ.get('PORT', 5000))
    debug_mode = os.environ.get('FLASK_ENV') != 'production'
    
    app.run(host='0.0.0.0', port=port, debug=debug_mode)
