import csv

input_file = "openfoodfacts_products.csv"
output_file = "final_clean.csv"

clean_rows = []

with open(input_file, encoding="latin1", errors="ignore") as f:
    content = f.read()

# split safely by lines
lines = content.splitlines()

for line in lines:
    if "," not in line:
        continue

    parts = line.split(",", 1)

    barcode = parts[0].strip().replace('"', '')
    name = parts[1].strip().replace('"', '')

    # keep only valid barcodes
    if barcode.isdigit():
        clean_rows.append([barcode, name])

# write clean file
with open(output_file, "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["barcode", "name"])
    writer.writerows(clean_rows)

print("Created:", output_file, "with", len(clean_rows), "rows")