# Conclusion
# Connected the Python application to the PostgreSQL database and established a cursor to execute SQL operations.
# Retrieved the latest category information from the CredCo API with proper exception handling to ensure reliable data fetching.
# Validated the received category data and skipped incomplete records to maintain database integrity.
# Inserted new categories and updated existing ones using PostgreSQL's ON CONFLICT (UPSERT) feature, preventing duplicate entries.
# Committed all changes to the database, closed the database resources safely, and displayed a summary of inserted, updated, and skipped categories after successful execution.



import requests
# import request library
import psycopg2
# Import PostgreSQL driver.(Allow Python to communicate with PostgreSQL.

# return a connection object
conn = psycopg2.connect(
    host="localhost",
    # localhost means this computer
    database="HK",
    # database name
    user="postgres",
    # database username
    password="HK12345"
    # database password
)

cursor = conn.cursor()
# .cursor returns a cursor object
# cursor is like remote control 
# without cursor connection exists but cannot execute sql
# cursor runs sql

url = "https://api.credcosourcing.com/api/categories/?_start=0&_end=200&_sort=id&_order=ASC"
# stores the credco URl

try:
    response = requests.get(url, timeout=10)
     # Makes an HTTP GET request.
    # timeout at 10 seconds
    # Wait at most 10 seconds.
    # If no response:
    # Error.
    response.raise_for_status()
    # checks HTTPS status
    categories = response.json()
    # save those Python objects into the variable categories.
    # covert the response object to JSON

except Exception as e:
    print("❌ API ERROR:", e)
    exit()


inserted = 0
updated = 0
skipped = 0

for category in categories:
    # # Loop through every category received from the API.

    cat_id = category.get("id")
    # # Read the category ID.
    name = category.get("category_name")
    # # Read the category name.
    desc = category.get("category_description", "")
    # Read the description.
    # If description doesn't exist, use an empty string.


    # Skip incomplete categories.
    if not cat_id or not name:
        skipped += 1
        continue


    # Execute SQL.
    # Insert the category if it doesn't exist.
    # Otherwise update the existing category.
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