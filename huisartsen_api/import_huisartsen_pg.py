
import os
import pandas as pd
import psycopg2
from time import sleep

# Wacht tot database beschikbaar is
sleep(10)

# Database configuratie
DB_HOST = os.getenv("DB_HOST", "db")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "huisartsen")
DB_USER = os.getenv("DB_USER", "admin")
DB_PASSWORD = os.getenv("DB_PASSWORD", "secret")

# Connectie maken
conn = psycopg2.connect(
    host=DB_HOST,
    port=DB_PORT,
    dbname=DB_NAME,
    user=DB_USER,
    password=DB_PASSWORD
)
cursor = conn.cursor()

cursor.execute("""
DROP TABLE IF EXISTS huisartsen
""")

# Tabel aanmaken
cursor.execute("""
CREATE TABLE IF NOT EXISTS huisartsen (
    id SERIAL PRIMARY KEY,
    naam TEXT,
    adres TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    link TEXT,
    street TEXT,
    postalcode TEXT,
    city TEXT
)
""")

# CSV inlezen
df = pd.read_csv("huisartsen_zorgkaart.csv")

# Data invoegen
for _, row in df.iterrows():
    cursor.execute("""
    INSERT INTO huisartsen (naam, adres, latitude, longitude, link, street, postalcode, city)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """, (row['Naam'], row['Adres'], row['Latitude'], row['Longitude'], row['Link'],row['Street'],row['Postcode'],row['City']))

conn.commit()
cursor.close()
conn.close()
print("✅ Data succesvol ingevoerd in PostgreSQL")
