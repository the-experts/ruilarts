import requests
from bs4 import BeautifulSoup
import pandas as pd
import time

BASE_URL = "https://www.zorgkaartnederland.nl"
SEARCH_URL = f"{BASE_URL}/huisarts"

headers = {
    "User-Agent": "Mozilla/5.0"
}

def get_huisartsen(page=1):
    url = f"{SEARCH_URL}/pagina{page}"
    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.text, "html.parser")
    cards = soup.select(".filter-result")
    
    
    print(url)

    huisartsen = []
    for card in cards:
        naam = card.select_one(".filter-result__name").get_text(strip=True)
        adres_block = card.select_one(".filter-result__places")
        adres = adres_block.get_text(strip=True) if adres_block else "Onbekend"
        link = BASE_URL + card.select_one("a")["href"]
        
        
        location = adres_block['data-location']
        # title = adres_block['data-title']
        # text = adres_block.get_text(strip=True)

        # Split geolocatie
        latitude, longitude = location.split(',')

        
        huisartsen.append({
            "Naam": naam,
            "Adres": adres,
            "Latitude": latitude,
            "Longitude": longitude,
            "Link": link
        })
    return huisartsen

def scrape_all(pages=408):
    all_data = []
    for page in range(1, pages + 1):
        print(f"Scraping page {page}...")
        data = get_huisartsen(page)
        all_data.extend(data)
        time.sleep(1)  # Respecteer de server
    return pd.DataFrame(all_data)

# Scrape alle pagina's
df = scrape_all(pages=408)

# Opslaan als CSV
df.to_csv("huisartsen_zorgkaart.csv", index=False)
print("Data opgeslagen in huisartsen_zorgkaart.csv")