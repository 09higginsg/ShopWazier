import csv
import requests
import time

BASE_URL = "https://world.openfoodfacts.net/api/v2/search"
OUTPUT_FILE = "openfoodfacts_products.csv"

all_rows = []
page = 1
max_pages = 5

while page <= max_pages:
    params = {
        "page": page,
        "page_size": 100,
        "fields": "code,product_name"
    }

    response = requests.get(BASE_URL, params=params)
    data = response.json()

    products = data.get("products", [])

    for product in products:
        barcode = str(product.get("code", "")).strip()
        name = str(product.get("product_name", "")).strip()

        if barcode and name:
            all_rows.append({
                "barcode": barcode,
                "name": name
            })

    print(f"Downloaded page {page}")
    page += 1
    time.sleep(1)

unique = {}
for row in all_rows:
    unique[row["barcode"]] = row

final = list(unique.values())

with open(OUTPUT_FILE, "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["barcode", "name"])
    writer.writeheader()
    writer.writerows(final)

print("Done. File saved.")