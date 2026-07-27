# Fetch the latest plastic prices from the CredCo API, save/update them in PostgreSQL, and record each price in the price history table.

import requests
# import request library
import psycopg2
# Import PostgreSQL driver.(Allow Python to communicate with PostgreSQL.


def get_connection():
    return psycopg2.connect(
        # Return a connection object.
        host="localhost",
        # host="localhost"(localhost means this computer)
        database="HK",
        # database name
        user="postgres",
        # database username
        password="HK12345"
        # databse password
    )


url = "https://api.credcosourcing.com/api/products/bycategory?category_id=62&state_id=DL&city_id=1&interval=2&public_pricing=1"
# stores the credco API url

# -----------------------
# SAFE API CALL
# -----------------------
try:
    response = requests.get(url, timeout=10)
    # Makes an HTTP GET request.
    # timeout at 10 seconds
    # Wait at most 10 seconds.
    # If no response:
    # Error.
    response.raise_for_status()
    # Checks HTTP status.
    data = response.json()
    # Converts JSON into Python.

except Exception as e:
    print("❌ API ERROR:", e)
    exit()


conn = get_connection()
# open PostGre SQL
cursor = conn.cursor()
# create SQL cursor

inserted_products = 0
# keep tracks of inserts
updated_products = 0
# counts updates
history_inserted = 0
# counts history rows

for product in data:
# loop over every product from API
    product_name = product.get("product_name")
    # gets values safely
    product_grade = product.get("product_grade")
    current_price = product.get("current_price")

    if not product_name or not product_grade or current_price is None:
        continue
        # Skip incomplete products.

        # Example

        # Missing grade

        # ↓

        # Ignore.

    current_price = float(current_price)
    # converts to number

    # -----------------------
    # UPSERT PRODUCT UPSERT = UPDATE + INSERT
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
    # gets returned ID

    # detect insert vs update (simple heuristic)
    if cursor.rowcount == 1:
        # Returns affected rows.
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