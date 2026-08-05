# Conclusion
# Connected the Python application to the PostgreSQL database and retrieved all product categories for processing.
# Fetched live product information from the CredCo API, validated the data, and handled API errors gracefully.
# Inserted new products into the database while automatically updating existing records using the ON CONFLICT feature.
# Stored the latest product prices in the price_history table to maintain historical price records for analysis.
# Successfully automated the complete data collection and storage process, ensuring the database remains updated with the latest market prices.


import requests
# import request library
import psycopg2
# Import PostgreSQL driver.(Allow Python to communicate with PostgreSQL.)


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
        # database password
    )


conn = get_connection()
# call the fucntion (leads to connection to postgresql)
cursor = conn.cursor()
# .cursor returns a cursor object
# cursor is like remote control 
# without cursor connection exists but cannot execute sql
# cursor runs sql

# -----------------------------
# GET CATEGORIES FROM DB
# -----------------------------
# cursor.execute() is the function that sends SQL commands from Python to PostgreSQL.
# Run SQL.
cursor.execute("""
    SELECT id, category_name
    FROM categories
""")

categories = cursor.fetchall()
# Fetch every row.


# -----------------------------
# PROCESS EACH CATEGORY
# -----------------------------
for category_id, category_name in categories:

    print(f"\n📦 Fetching {category_name}...")
    # The f stands for formatted string literal, commonly called an f-string.

    # It lets you insert variables or expressions directly inside a string using {}.

    # Create URL.
    # All those f"..." strings are automatically joined together by Python because they are inside the same pair of parentheses.
    url =(
        f"https://api.credcosourcing.com/api/products/bycategory?"
        f"category_id={category_id}"
        f"&state_id=DL"
        f"&city_id=1"
        f"&interval=2"
        f"&public_pricing=1"
    )
    try:
        response = requests.get(url, timeout=10)
        # send GET request
        response.raise_for_status()
        # check HTTPS status
        products = response.json()
        # Convert JSON

        # ↓

        # Python objects.

    except Exception as e:
        # throw error if HTTPS status shows error
        print(f"❌ Failed category {category_name}: {e}")
        continue
        # skip and continue to next


    for product in products:
        #go through every product 

        product_name = product.get("product_name")
        # read product name 
        product_grade = product.get("product_grade")
        # read grade
        current_price = product.get("current_price")
        # read price

        if not product_name or not product_grade or current_price is None:
            # If

            #  Name missing

            # OR

            # Grade missing

            # OR

            # Price missing

            #  ↓

            # Skip.
            continue

        current_price = float(current_price)
        # convert to real number

        # run SQL
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
        """, 
        # %s placeholders
        
        # insert product

        # columns

        # insert values

        # current database time

        # If same product already exists

        # on conflict Don't create duplicate

        # update

        # Replace old price.

        # update timestamp

        # after insert and update gve me product id
        (
            category_id,
            product_name,
            product_grade,
            current_price
        ))

        product_id = cursor.fetchone()[0]
        # read returned id

        # store todays price
        cursor.execute("""
            INSERT INTO price_history
            (product_id, price)
            VALUES (%s,%s)
        """, (
            product_id,
            current_price
        ))


conn.commit()
# Without commit

# Database

# ❌ doesn't permanently save.

# Commit

# ↓

# Save everything.
cursor.close()
# 
conn.close()

print("\n✅ Finished loading all categories!")

# Start
#    │
#    ▼
# Connect to PostgreSQL
#    │
#    ▼
# Read all categories
#    │
#    ▼
# For each category
#    │
#    ▼
# Call CredCo API
#    │
#    ▼
# Receive products
#    │
#    ▼
# For each product
#    │
#    ├── Validate data
#    │
#    ├── Insert or update products table
#    │
#    └── Add one row to price_history
#    │
#    ▼
# Commit changes
#    │
#    ▼
# Close database
#    │
#    ▼
# Finish