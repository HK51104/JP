import requests
import psycopg2

def get_connection():
    return psycopg2.connect(
        host="localhost",
        database="HK",
        user="postgres",
        password="HK12345"
    )

url = "https://api.credcosourcing.com/api/products/bycategory?category_id=62&state_id=DL&city_id=1&interval=2&public_pricing=1"

data = requests.get(url).json()

conn = get_connection()
cursor = conn.cursor()

matched = 0
not_found = 0

for p in data:

    api_id = p["id"]
    name = p["product_name"]
    grade = p["product_grade"]

    cursor.execute("""
        UPDATE products
        SET api_id = %s
        WHERE product_name = %s
        AND product_grade = %s
    """, (api_id, name, grade))

    if cursor.rowcount > 0:
        matched += 1
    else:
        not_found += 1

conn.commit()
cursor.close()
conn.close()

print("Matched:", matched)
print("Not found:", not_found)