import os
import oracledb
import pandas as pd
import numpy as np
from dotenv import load_dotenv
import random
import sys
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder

load_dotenv()

# Database configuration
db_user = os.getenv('DB_USER', 'projectdb')
db_password = os.getenv('DB_PASSWORD', '1234')
db_connect_string = os.getenv('DB_CONNECT_STRING', 'localhost:1521/ORCLPDB')

def generate_predictions():
    print("🚀 AI Prediction Engine: Random Forest Analysis Starting...")
    
    try:
        # 1. Load and Analyze Data
        script_dir = os.path.dirname(os.path.abspath(__file__))
        data_path = os.path.join(script_dir, 'Updated Data 1.csv')
        df = pd.read_csv(data_path)
        
        # Data Cleaning: Drop rows with missing essential info
        df = df.dropna(subset=['Latitude', 'Longitude', 'Category_title'])
        
        # 2. Train Random Forest Model
        print(f"📊 Training model on {len(df)} historical records...")
        
        # Features: Latitude, Longitude
        X = df[['Latitude', 'Longitude']]
        
        # Target: Category_title
        le = LabelEncoder()
        y = le.fit_transform(df['Category_title'])
        
        # Initialize and train the classifier
        rf = RandomForestClassifier(n_estimators=50, random_state=42)
        rf.fit(X, y)
        
        # 3. Connect to Oracle
        conn = oracledb.connect(user=db_user, password=db_password, dsn=db_connect_string)
        cursor = conn.cursor()
        
        # Clear old predictions
        cursor.execute("DELETE FROM predictions")
        
        # 4. Generate Predictions
        num_predictions = 20
        
        # To simulate "future" disasters, we sample existing locations 
        # and add a small amount of "jitter" to create new prediction points
        sample_data = df.sample(num_predictions)
        
        conditions_pool = {
            "Wildfires": ["Anomalous Heat Signature Detected", "Critical Fuel Load in Vegetation"],
            "Severe Storms": ["Atmospheric Pressure Drop > 15mb", "Sustained Wind Speeds > 50kts"],
            "Floods": ["Ground Saturation Level @ 92%", "Urban Drainage Bottleneck Identified"],
            "Earthquakes": ["Tectonic Micro-vibrations Detected"],
            "Volcanoes": ["Increased Seismic Activity", "Sulfur Dioxide Emission Detected"],
            "Sea and Lake Ice": ["Rapid Temperature Drop", "Anomalous Ice Drift Pattern"],
            "Default": ["Power Grid Thermal Overload", "Satellite Imaging Anomaly"]
        }
        
        for i, (index, row) in enumerate(sample_data.iterrows()):
            # Create a "prediction point" near a historical location
            lat = row['Latitude'] + random.uniform(-0.1, 0.1)
            lng = row['Longitude'] + random.uniform(-0.1, 0.1)
            
            # Use the model to predict the most likely disaster for this location
            input_features = pd.DataFrame([[lat, lng]], columns=['Latitude', 'Longitude'])
            prediction_idx = rf.predict(input_features)[0]
            probabilities = rf.predict_proba(input_features)[0]
            
            p_type = le.inverse_transform([prediction_idx])[0]
            confidence = int(max(probabilities) * 100)
            
            # Keep confidence within a realistic range for the UI
            confidence = max(65, min(98, confidence))
            
            location = row['Title']
            if not location or str(location) == 'nan':
                location = f"Zone {lat:.2f}, {lng:.2f}"
            
            time_h = random.randint(1, 12)
            time_m = random.randint(0, 59)
            timeframe = f"{time_h}h {time_m}m"
            
            # Smart condition mapping
            mapped_conditions = conditions_pool.get(p_type, conditions_pool["Default"])
            conditions = random.choice(mapped_conditions)
            
            # Severity based on type and confidence
            if any(word in p_type for word in ["Fire", "Flood", "Quake", "Volcano"]):
                severity = "critical" if confidence > 85 else "high"
            else:
                severity = "high" if confidence > 80 else "medium"
            
            cursor.execute("""
                INSERT INTO predictions (type, confidence, timeframe, conditions, location, severity, latitude, longitude) 
                VALUES (:1, :2, :3, :4, :5, :6, :7, :8)
            """, (p_type, confidence, timeframe, conditions, location, severity, lat, lng))
            
        conn.commit()
        print(f"✅ Success: {num_predictions} Random Forest predictions synced to Oracle.")
        
    except Exception as e:
        print(f"❌ Error in prediction engine: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    generate_predictions()
