# Conclusion
# Retrieved the latest product prices from the CredCo API and validated the response before processing the data.
# Connected to the PostgreSQL database, verified that each product existed, and skipped records with missing or unmatched data.
# Updated the current_price of existing products and stored every new price in the price_history table to maintain a complete historical record.
# Implemented robust error handling using try-except-finally, including transaction rollback to preserve database consistency if any SQL operation failed.
# Successfully synchronized the database with the latest market prices, reported the number of updated and skipped products, and safely closed all database resources after execution.




import requests
# requests → fetch data from CredCo API
import psycopg2
# psycopg2 → talk to PostgreSQL.


def get_connection():
    # creates a databse connection
    return  psycopg2.connect(
    host="ep-royal-wildflower-azc5frkj.c-3.ap-southeast-1.aws.neon.tech",
    database="neondb",
    user="neondb_owner",
    password="npg_y8zuWgpAc9Qf",
    sslmode="require"
)


url = "https://api.credcosourcing.com/api/products/bycategory?category_id=62&state_id=DL&city_id=1&interval=2&public_pricing=1"
# Stores the API endpoint from which prices will be downloaded.

try:
    response = requests.get(url, timeout=10)
    # Send an HTTP GET request.
    response.raise_for_status()
    # checks status of error 
    data = response.json()
    # Convert JSON into Python objects.

except Exception as e:
    # error handling
    print("❌ API ERROR:", e)
    exit()


print("Products received:", len(data))

# open databses for connection 
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
            # If API forgot to send either field
            # skip it.
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
    # If any SQL fails 
    # undo all finished work(database returns to previous state)

finally:
    cursor.close()
    conn.close()


print(f"Updated: {updated_count}")
print(f"Skipped: {skipped_count}")
print("✅ Prices updated successfully")