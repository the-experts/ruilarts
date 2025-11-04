# Claude Project Context

## Project Overview
Ruilarts - A hackathon project that implements a circular matching algorithm to help people who moved homes find a huisarts (general practitioner) in their new location.

## The Problem
When people move to a new home, they need to find a huisarts in their new area. This creates:
- A vacancy at their old huisarts practice
- A need for a spot at a huisarts in their new location

## The Solution
The system detects circular matches (swap cycles) where multiple people can exchange huisarts practices simultaneously. For example:
- Person A moved and wants a spot at huisarts B
- Person B moved and wants a spot at huisarts C
- Person C moved and wants a spot at huisarts D
- Person D moved and wants a spot at huisarts A

When the system detects this circular pattern (A→B→C→D→A), it creates a valid match where everyone gets a new huisarts practice.

## Current Status
- Project initialized with basic README
- Python scraper for huisartsen data from Zorgkaart
- Tech stack: To be determined

## Files
- `scrape_huisartsen.py` - Scraper for huisarts data from Zorgkaart
- `huisartsen_zorgkaart.csv` - Scraped huisarts data
- `README.md` - Project documentation
- `claude.md` - This file

## Goals
- Build a web application with circular matching algorithm
- Allow users to register their old/new locations and desired huisarts
- Detect circular swap opportunities automatically
- Notify users when a match is found
- Leverage scraped huisarts data for location-based matching
- never run npm run build for checking
- texts on the frontend should be in taalniveau B1 in dutch