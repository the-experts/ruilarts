FROM python:3.11-slim

# Install Node.js (LTS version)
RUN apt-get update && \
    apt-get install -y curl gnupg && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# --- Python setup ---
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY import_huisartsen_pg.py .
COPY huisartsen_zorgkaart.csv .

# --- Node.js setup ---
COPY package.json tsconfig.json ./
COPY src ./src

RUN npm install
RUN npm run build

# --- Start both services ---
CMD ["/bin/sh", "-c", "python import_huisartsen_pg.py && node dist/app.js"]