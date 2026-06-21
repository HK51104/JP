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


print("Products received:", len(data))

conn = get_connection()
cursor = conn.cursor()

updated_count = 0
skipped_count = 0

try:
    for product in data:

        product_id = product.get("id")
        current_price = product.get("current_price")

        # safety check
        if product_id is None or current_price is None:
            skipped_count += 1
            continue

        current_price = float(current_price)

        # check existence
        cursor.execute(
            "SELECT 1 FROM products WHERE id = %s",
            (product_id,)
        )

        if cursor.fetchone() is None:
            print(f"Skipping product {product_id} (not found)")
            skipped_count += 1
            continue

        # update price
        cursor.execute("""
            UPDATE products
            SET current_price = %s
            WHERE id = %s
        """, (current_price, product_id))

        # insert history
        cursor.execute("""
            INSERT INTO price_history (product_id, price)
            VALUES (%s, %s)
        """, (product_id, current_price))

        updated_count += 1

    conn.commit()

except Exception as e:
    print("❌ DB ERROR:", e)
    conn.rollback()

finally:
    cursor.close()
    conn.close()


print(f"Updated: {updated_count}")
print(f"Skipped: {skipped_count}")
print("✅ Prices updated successfully")