# Take each product from the CredCo API and save its CredCo API ID (api_id) into your existing PostgreSQL products table.
# UPDATED: Any product from CredCo that doesn't already exist in your database gets INSERTED
# (with its api_id set immediately), instead of being silently skipped.

import os
import requests
import psycopg2


def get_connection():
    return psycopg2.connect(
        os.environ["DATABASE_URL"]
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
inserted = 0
skipped_incomplete = 0

for p in data:

    api_id = p.get("id")
    name = p.get("product_name")
    grade = p.get("product_grade")
    price = p.get("current_price")
    category_id = p.get("category_id", 62)  # defaults to 62 (PP) since that's what this endpoint queries

    if not api_id or not name or not grade:
        skipped_incomplete += 1
        continue

    try:
        # ------------------------------------------------
        # TRY TO UPDATE AN EXISTING MATCHING PRODUCT
        # ------------------------------------------------

        cursor.execute("""
            UPDATE products
            SET api_id = %s
            WHERE LOWER(TRIM(product_name)) = LOWER(TRIM(%s))
            AND LOWER(TRIM(SPLIT_PART(product_grade, ' - ', 1)))
                = LOWER(TRIM(SPLIT_PART(%s, ' - ', 1)))
        """, (api_id, name, grade))

        if cursor.rowcount > 0:
            matched += 1
            conn.commit()
            continue

        # ------------------------------------------------
        # NO EXISTING MATCH -> INSERT AS A NEW PRODUCT
        # ------------------------------------------------

        cursor.execute("""
            INSERT INTO products
                (product_name, product_grade, current_price, api_id, category_id, last_updated)
            VALUES
                (%s, %s, %s, %s, %s, NOW())
            ON CONFLICT (product_name, product_grade)
            DO UPDATE SET api_id = EXCLUDED.api_id
        """, (name, grade, price, api_id, category_id))

        inserted += 1
        conn.commit()

        print("➕ Inserted new product:", name, "|", grade)

    except Exception as e:
        conn.rollback()
        print("⚠️  ERROR on product:", name, "|", grade, "->", repr(e))

cursor.close()
conn.close()

print()
print("====================================")
print("✅ Matched (updated existing):", matched)
print("➕ Inserted (new products):", inserted)
print("⏭️  Skipped (incomplete data from CredCo):", skipped_incomplete)
print("====================================")