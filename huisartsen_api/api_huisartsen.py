
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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
