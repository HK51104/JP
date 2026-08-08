# Conclusion
# Retrieved product information from the CredCo API and extracted each product's API ID, name, and grade for processing.
# Connected the Python application to the PostgreSQL database and searched for matching products using their name and grade.
# Updated the api_id field in the products table to establish a direct mapping between local database records and CredCo API records.
# Counted the number of successfully matched products and identified products that could not be found in the database.
# Committed all updates, safely closed the database connection, and generated a summary of matched and unmatched products after execution.


import requests
# Used to call the CredCo API.
import psycopg2
# psycopg2 → Used to communicate with the PostgreSQL database.

def get_connection():
    # database connection
    conn = psycopg2.connect(
    host="ep-royal-wildflower-azc5frkj.c-3.ap-southeast-1.aws.neon.tech",
    database="neondb",
    user="neondb_owner",
    password="***REMOVED***",
    sslmode="require"
)

url = "https://api.credcosourcing.com/api/products/bycategory?category_id=62&state_id=DL&city_id=1&interval=2&public_pricing=1"
# Stores the API endpoint inside the variable url.
# This endpoint returns all products for category 62.

data = requests.get(url).json()
# Makes an HTTP GET request
# Converts the JSON response into Python objects.

conn = get_connection()
# Creates the database connection.
cursor = conn.cursor()
# Creates the cursor used to execute SQL.

matched = 0
not_found = 0

for p in data:
    # Loop through every product returned by the API.

    api_id = p["id"]
    name = p["product_name"]
    grade = p["product_grade"]

    cursor.execute("""
        UPDATE products
        SET api_id = %s
        WHERE product_name = %s
        AND product_grade = %s
    """, (api_id, name, grade))

    # rowcount means
    # "How many rows were affected?"
    if cursor.rowcount > 0:
        matched += 1
    else:
        not_found += 1

conn.commit()
cursor.close()
conn.close()

print("Matched:", matched)
print("Not found:", not_found)