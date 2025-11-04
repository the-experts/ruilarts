
from flask import Flask, jsonify, request
import psycopg2
import os

app = Flask(__name__)

DB_HOST = os.getenv("POSTGRES_HOST", "db")
DB_NAME = os.getenv("POSTGRES_DB", "huisartsen")
DB_USER = os.getenv("POSTGRES_USER", "admin")
DB_PASS = os.getenv("POSTGRES_PASSWORD", "secret")

conn = psycopg2.connect(host=DB_HOST, dbname=DB_NAME, user=DB_USER, password=DB_PASS)
cursor = conn.cursor()

@app.route('/huisartsen', methods=['GET'])
def get_huisartsen():
    naam = request.args.get('naam')
    locatie = request.args.get('locatie')

    query = "SELECT naam, adres, latitude, longitude, link FROM huisartsen"
    filters = []
    params = []

    if naam:
        filters.append("naam ILIKE %s")
        params.append(f"%{naam}%")
    if locatie:
        filters.append("adres ILIKE %s")
        params.append(f"%{locatie}%")

    if filters:
        query += " WHERE " + " AND ".join(filters)

    cursor.execute(query, params)
    rows = cursor.fetchall()

    results = [
        {
            "naam": row[0],
            "adres": row[1],
            "latitude": row[2],
            "longitude": row[3],
            "link": row[4]
        } for row in rows
    ]
    return jsonify(results)

from math import radians, cos, sin, asin, sqrt

def haversine(lat1, lon1, lat2, lon2):
    # Convert decimal degrees to radians
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    # Haversine formula
    dlat = lat2 - lat1 
    dlon = lon2 - lon1 
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a)) 
    r = 6371000  # Radius of Earth in meters
    return c * r

@app.route('/huisartsen/closest', methods=['GET'])
def get_closest_huisartsen():
    lat = request.args.get('lat', type=float)
    lon = request.args.get('lon', type=float)

    if lat is None or lon is None:
        return jsonify({"error": "Please provide both 'lat' and 'lon' query parameters."}), 400

    cursor.execute("SELECT naam, adres, latitude, longitude, link FROM huisartsen")
    rows = cursor.fetchall()

    distances = []
    for row in rows:
        naam, adres, latitude, longitude, link = row
    
        if latitude is not None and longitude is not None:
            distance = haversine(lat, lon, latitude, longitude)
            distances.append({
                "naam": naam,
                "adres": adres,
                "latitude": latitude,
                "longitude": longitude,
                "link": link,
                "distance_m": round(distance)  # distance in meters
            })

    # Sort by distance and take the closest 3
    closest = sorted(distances, key=lambda x: x["distance_m"])[:3]
  

    return jsonify(closest)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
