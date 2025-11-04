
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY /api_huisartsen.py .

COPY import_huisartsen_pg.py .
COPY huisartsen_zorgkaart.csv .

CMD ["/bin/sh", "-c", "python import_huisartsen_pg.py && python api_huisartsen.py"]
