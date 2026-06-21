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

# -----------------------
# SAFE API CALL
# -----------------------
try:
    response = requests.get(url, timeout=10)
    response.raise_for_status()
    data = response.json()

except Exception as e:
    print("❌ API ERROR:", e)
    exit()


conn = get_connection()
cursor = conn.cursor()

inserted_products = 0
updated_products = 0
history_inserted = 0

for product in data:

    product_name = product.get("product_name")
    product_grade = product.get("product_grade")
    current_price = product.get("current_price")

    if not product_name or not product_grade or current_price is None:
        continue

    current_price = float(current_price)

    # -----------------------
    # UPSERT PRODUCT
    # -----------------------
    cursor.execute("""
        INSERT INTO products
        (product_name, product_grade, current_price, last_updated)
        VALUES (%s, %s, %s, NOW())

        ON CONFLICT (product_name, product_grade)
        DO UPDATE SET
            current_price = EXCLUDED.current_price,
            last_updated = NOW()

        RETURNING id;
    """, (product_name, product_grade, current_price))

    product_id = cursor.fetchone()[0]

    # detect insert vs update (simple heuristic)
    if cursor.rowcount == 1:
        inserted_products += 1
    else:
        updated_products += 1

    # -----------------------
    # PRICE HISTORY
    # -----------------------
    cursor.execute("""
        INSERT INTO price_history
        (product_id, price)
        VALUES (%s, %s)
    """, (product_id, current_price))

    history_inserted += 1


conn.commit()
cursor.close()
conn.close()

print("✅ Products inserted:", inserted_products)
print("♻️ Products updated:", updated_products)
print("📈 History rows added:", history_inserted)
print("🎯 Done successfully")