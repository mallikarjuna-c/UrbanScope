"""
5-Year Prediction Model
Predicts future urban health trends and provides recommendations
"""
import numpy as np

def predict_future_trends(city, coordinates, current_data, years=5):
    """
    Predict how urban health metrics will change in the future
    
    Args:
        city: City name
        coordinates: [lat, lon]
        current_data: Current analysis results (heat, green, healthcare)
        years: Number of years to predict (default: 5)
    
    Returns:
        dict: Future predictions and recommendations
    """
    
    # Extract current metrics
    current_heat = current_data.get('heatRisk', {}).get('riskIndex', 5)
    current_green = current_data.get('greenSpace', {}).get('greenspaceCoverage', 20)
    current_healthcare = current_data.get('healthcare', {}).get('populationWithAccess', 70)
    
    # Prediction models (simplified linear trends + growth factors)
    # In production, these would use actual ML models (LSTM, Prophet, etc.)
    
    # Heat Island Trend (tends to worsen without intervention)
    heat_growth_rate = 0.08  # 8% increase per year
    predicted_heat = []
    for year in range(years + 1):
        heat_value = current_heat * (1 + heat_growth_rate) ** year
        predicted_heat.append({
            'year': 2024 + year,
            'value': min(heat_value, 10),  # Cap at 10
            'status': get_heat_status(min(heat_value, 10))
        })
    
    # Green Space Trend (tends to decrease with urbanization)
    green_decline_rate = 0.03  # 3% decrease per year
    predicted_green = []
    for year in range(years + 1):
        green_value = current_green * (1 - green_decline_rate) ** year
        predicted_green.append({
            'year': 2024 + year,
            'value': max(green_value, 5),  # Floor at 5%
            'status': get_green_status(max(green_value, 5))
        })
    
    # Healthcare Access Trend (tends to improve slowly)
    healthcare_growth_rate = 0.02  # 2% improvement per year
    predicted_healthcare = []
    for year in range(years + 1):
        healthcare_value = current_healthcare * (1 + healthcare_growth_rate) ** year
        predicted_healthcare.append({
            'year': 2024 + year,
            'value': min(healthcare_value, 100),  # Cap at 100%
            'status': get_healthcare_status(min(healthcare_value, 100))
        })
    
    # Calculate impact scores
    heat_impact = calculate_impact(predicted_heat[0]['value'], predicted_heat[-1]['value'], 'heat')
    green_impact = calculate_impact(predicted_green[0]['value'], predicted_green[-1]['value'], 'green')
    healthcare_impact = calculate_impact(predicted_healthcare[0]['value'], predicted_healthcare[-1]['value'], 'healthcare')
    
    # Generate future-focused recommendations
    recommendations = generate_future_recommendations(
        predicted_heat[-1],
        predicted_green[-1],
        predicted_healthcare[-1],
        city
    )
    
    # Calculate affected population in 5 years
    population_growth = 1.15  # 15% population growth in 5 years
    future_affected_population = int(
        current_data.get('heatRisk', {}).get('affectedPopulation', 100000) * 
        population_growth * 
        (predicted_heat[-1]['value'] / current_heat)
    )
    
    return {
        'city': city,
        'predictionYears': years,
        'currentYear': 2024,
        'futureYear': 2024 + years,
        'predictions': {
            'heat': predicted_heat,
            'greenSpace': predicted_green,
            'healthcare': predicted_healthcare
        },
        'impacts': {
            'heat': heat_impact,
            'greenSpace': green_impact,
            'healthcare': healthcare_impact
        },
        'futureAffectedPopulation': future_affected_population,
        'recommendations': recommendations,
        'urgency': calculate_urgency(heat_impact, green_impact, healthcare_impact),
        'summary': generate_summary(city, years, heat_impact, green_impact, healthcare_impact)
    }

def get_heat_status(value):
    if value >= 8:
        return 'Critical'
    elif value >= 6:
        return 'High'
    elif value >= 4:
        return 'Moderate'
    else:
        return 'Low'

def get_green_status(value):
    if value < 10:
        return 'Critical'
    elif value < 15:
        return 'Poor'
    elif value < 25:
        return 'Moderate'
    else:
        return 'Good'

def get_healthcare_status(value):
    if value >= 85:
        return 'Excellent'
    elif value >= 70:
        return 'Good'
    elif value >= 50:
        return 'Moderate'
    else:
        return 'Critical'

def calculate_impact(current, future, metric_type):
    """Calculate impact score and trend"""
    change = future - current
    percent_change = (change / current) * 100 if current > 0 else 0
    
    if metric_type == 'heat':
        # Higher is worse
        if percent_change > 20:
            severity = 'Severe Worsening'
        elif percent_change > 10:
            severity = 'Significant Worsening'
        elif percent_change > 0:
            severity = 'Moderate Worsening'
        else:
            severity = 'Improving'
    elif metric_type == 'green':
        # Lower is worse
        if percent_change < -20:
            severity = 'Severe Decline'
        elif percent_change < -10:
            severity = 'Significant Decline'
        elif percent_change < 0:
            severity = 'Moderate Decline'
        else:
            severity = 'Improving'
    else:  # healthcare
        # Higher is better
        if percent_change > 20:
            severity = 'Significant Improvement'
        elif percent_change > 10:
            severity = 'Moderate Improvement'
        elif percent_change > 0:
            severity = 'Slight Improvement'
        else:
            severity = 'Declining'
    
    return {
        'current': round(current, 2),
        'future': round(future, 2),
        'change': round(change, 2),
        'percentChange': round(percent_change, 2),
        'severity': severity
    }

def generate_future_recommendations(heat, green, healthcare, city):
    """Generate recommendations based on 5-year predictions"""
    recommendations = []
    
    # Heat-based recommendations
    if heat['status'] in ['Critical', 'High']:
        recommendations.append({
            'priority': 'Critical',
            'timeframe': 'Immediate (0-2 years)',
            'action': 'Implement city-wide cooling infrastructure',
            'details': 'Install reflective pavements, increase tree canopy by 20%, create cooling centers',
            'estimatedCost': '$50-100M',
            'expectedImpact': 'Reduce heat by 3-5°C, prevent 500+ heat-related deaths',
            'category': 'Heat Mitigation'
        })
    
    # Green space recommendations
    if green['status'] in ['Critical', 'Poor']:
        recommendations.append({
            'priority': 'High',
            'timeframe': 'Short-term (1-3 years)',
            'action': 'Develop urban green corridors',
            'details': 'Create 10 new parks, implement rooftop gardens, plant 50,000 trees',
            'estimatedCost': '$30-60M',
            'expectedImpact': 'Increase green space by 10%, improve air quality by 25%',
            'category': 'Green Infrastructure'
        })
    
    # Healthcare recommendations
    if healthcare['status'] in ['Critical', 'Moderate']:
        recommendations.append({
            'priority': 'High',
            'timeframe': 'Medium-term (2-4 years)',
            'action': 'Expand healthcare facility network',
            'details': 'Build 5 new clinics in underserved areas, add mobile health units',
            'estimatedCost': '$40-80M',
            'expectedImpact': 'Increase access from 65% to 85%, serve 300,000 more residents',
            'category': 'Healthcare Access'
        })
    
    # Integrated solution
    recommendations.append({
        'priority': 'Strategic',
        'timeframe': 'Long-term (3-5 years)',
        'action': 'Integrated Urban Health Program',
        'details': 'Combine green infrastructure with healthcare facilities, create health-focused urban zones',
        'estimatedCost': '$150-250M',
        'expectedImpact': 'Holistic improvement: -4°C heat, +15% green space, +20% healthcare access',
        'category': 'Integrated Solution'
    })
    
    return recommendations

def calculate_urgency(heat_impact, green_impact, healthcare_impact):
    """Calculate overall urgency level"""
    heat_score = abs(heat_impact['percentChange']) if heat_impact['percentChange'] > 0 else 0
    green_score = abs(green_impact['percentChange']) if green_impact['percentChange'] < 0 else 0
    healthcare_score = abs(healthcare_impact['percentChange']) if healthcare_impact['percentChange'] < 0 else 0
    
    total_score = heat_score + green_score + healthcare_score
    
    if total_score > 50:
        return 'Critical - Immediate Action Required'
    elif total_score > 30:
        return 'High - Action Needed Within 1 Year'
    elif total_score > 15:
        return 'Moderate - Plan Within 2 Years'
    else:
        return 'Low - Monitor and Maintain'

def generate_summary(city, years, heat_impact, green_impact, healthcare_impact):
    """Generate executive summary"""
    return f"""
    In {years} years, {city} is projected to face:
    
    Heat Risk: {heat_impact['severity']} ({heat_impact['percentChange']:+.1f}% change)
    Green Space: {green_impact['severity']} ({green_impact['percentChange']:+.1f}% change)
    Healthcare Access: {healthcare_impact['severity']} ({healthcare_impact['percentChange']:+.1f}% change)
    
    Without intervention, urban health conditions will deteriorate significantly.
    Recommended investment: $150-250M over 5 years for integrated solutions.
    Expected outcome: Prevent 500+ deaths, improve quality of life for 1M+ residents.
    """.strip()
