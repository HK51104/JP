# Take each product from the CredCo API and save its CredCo API ID (api_id) into your existing PostgreSQL products table.

import requests
# requests → call API
import psycopg2
# psycopg2 → talk to PostgreSQL


def get_connection():
    # database connection
    return psycopg2.connect(
    host="ep-royal-wildflower-azc5frkj.c-3.ap-southeast-1.aws.neon.tech",
    database="neondb",
    user="neondb_owner",
    password="npg_y8zuWgpAc9Qf",
    sslmode="require"
)

url = "https://api.credcosourcing.com/api/products/bycategory?category_id=62&state_id=DL&city_id=1&interval=2&public_pricing=1"
# This requests products from Category 62.

try:
    response = requests.get(url, timeout=10)
    # Downloads products.
    response.raise_for_status()
    # Stops if API returned an error.
    data = response.json()
    # Convert JSON → Python list.

except Exception as e:
    print("❌ API ERROR:", e)
    exit()


conn = get_connection()
cursor = conn.cursor()

matched = 0
not_found = 0
# used only for printing

for p in data:
    # One API product at a time.

    api_id = p.get("id")
    name = p.get("product_name")
    grade = p.get("product_grade")

    if not api_id or not name or not grade:
        continue
        # If anything is missing
        # Skip it.

    # safer matching (case insensitive + trim)
    cursor.execute("""
UPDATE products
SET api_id = %s
WHERE LOWER(TRIM(product_name)) = LOWER(TRIM(%s))
AND LOWER(TRIM(SPLIT_PART(product_grade, ' - ', 1)))
    = LOWER(TRIM(SPLIT_PART(%s, ' - ', 1)))
""", (api_id, name, grade))

    if cursor.rowcount > 0:
        matched += 1
    else:
         print(name, " | ", grade)
    not_found += 1

conn.commit()
cursor.close()
conn.close()

print("✅ Matched:", matched)
print("❌ Not found:", not_found)