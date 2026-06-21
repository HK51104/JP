import requests
import psycopg2


def get_connection():
    return psycopg2.connect(
        host="localhost",
        database="HK",
        user="postgres",
        password="HK12345"
    )


conn = get_connection()
cursor = conn.cursor()

# -----------------------------
# GET CATEGORIES FROM DB
# -----------------------------
cursor.execute("""
    SELECT id, category_name
    FROM categories
""")

categories = cursor.fetchall()


# -----------------------------
# PROCESS EACH CATEGORY
# -----------------------------
for category_id, category_name in categories:

    print(f"\n📦 Fetching {category_name}...")

    url = (
        f"https://api.credcosourcing.com/api/products/bycategory?"
        f"category_id={category_id}"
        f"&state_id=DL"
        f"&city_id=1"
        f"&interval=2"
        f"&public_pricing=1"
    )

    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        products = response.json()

    except Exception as e:
        print(f"❌ Failed category {category_name}: {e}")
        continue


    for product in products:

        product_name = product.get("product_name")
        product_grade = product.get("product_grade")
        current_price = product.get("current_price")

        if not product_name or not product_grade or current_price is None:
            continue

        current_price = float(current_price)

        cursor.execute("""
            INSERT INTO products
            (
                category_id,
                product_name,
                product_grade,
                current_price,
                last_updated
            )
            VALUES
            (%s,%s,%s,%s,NOW())

            ON CONFLICT
            (product_name, product_grade)

            DO UPDATE SET
                current_price = EXCLUDED.current_price,
                last_updated = NOW()

            RETURNING id
        """, (
            category_id,
            product_name,
            product_grade,
            current_price
        ))

        product_id = cursor.fetchone()[0]

        cursor.execute("""
            INSERT INTO price_history
            (product_id, price)
            VALUES (%s,%s)
        """, (
            product_id,
            current_price
        ))


conn.commit()
cursor.close()
conn.close()

print("\n✅ Finished loading all categories!")