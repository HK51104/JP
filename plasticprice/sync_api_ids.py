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

try:
    response = requests.get(url, timeout=10)
    response.raise_for_status()
    data = response.json()

except Exception as e:
    print("❌ API ERROR:", e)
    exit()


conn = get_connection()
cursor = conn.cursor()

matched = 0
not_found = 0

for p in data:

    api_id = p.get("id")
    name = p.get("product_name")
    grade = p.get("product_grade")

    if not api_id or not name or not grade:
        continue

    # safer matching (case insensitive + trim)
    cursor.execute("""
        UPDATE products
        SET api_id = %s
        WHERE LOWER(TRIM(product_name)) = LOWER(TRIM(%s))
        AND LOWER(TRIM(product_grade)) = LOWER(TRIM(%s))
    """, (api_id, name, grade))

    if cursor.rowcount > 0:
        matched += 1
    else:
        not_found += 1

conn.commit()
cursor.close()
conn.close()

print("✅ Matched:", matched)
print("❌ Not found:", not_found)