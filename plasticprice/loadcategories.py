import requests
import psycopg2


conn = psycopg2.connect(
    host="localhost",
    database="HK",
    user="postgres",
    password="HK12345"
)

cursor = conn.cursor()

url = "https://api.credcosourcing.com/api/categories/?_start=0&_end=200&_sort=id&_order=ASC"

try:
    response = requests.get(url, timeout=10)
    response.raise_for_status()
    categories = response.json()

except Exception as e:
    print("❌ API ERROR:", e)
    exit()


inserted = 0
updated = 0
skipped = 0

for category in categories:

    cat_id = category.get("id")
    name = category.get("category_name")
    desc = category.get("category_description", "")

    if not cat_id or not name:
        skipped += 1
        continue

    cursor.execute("""
        INSERT INTO categories
        (id, category_name, category_description)
        VALUES (%s, %s, %s)
        ON CONFLICT (id)
        DO UPDATE SET
            category_name = EXCLUDED.category_name,
            category_description = EXCLUDED.category_description
    """, (cat_id, name, desc))

    if cursor.rowcount == 1:
        inserted += 1
    else:
        updated += 1

conn.commit()

cursor.close()
conn.close()

print("✅ Categories inserted:", inserted)
print("🔄 Categories updated:", updated)
print("⏭ Categories skipped:", skipped) 