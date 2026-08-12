# Conclusion
# Developed a FastAPI backend that provides multiple REST API endpoints for products, categories, dashboard statistics, price history, and price synchronization.
# Established a secure connection between the FastAPI application and the PostgreSQL database using the psycopg2 library, enabling efficient data retrieval and updates.
# Configured CORS middleware to allow seamless communication between the React frontend and the FastAPI backend without browser security restrictions.
# Implemented database queries to fetch product information, historical prices, categories, and dashboard summaries, while returning structured JSON responses for frontend consumption.
# Integrated the CredCo API with the /sync-prices endpoint to automatically update product prices, maintain historical price records, and keep the database synchronized with the latest market data.



import os

import requests
# Used for calling another website's API. 
import psycopg2
# Lets Python connect to PostgreSQL.
from fastapi import FastAPI
# Imports the FastAPI framework.(this lets you create a webserver)
from fastapi.middleware.cors import CORSMiddleware
# Imports CORS support.

# Without this:

# React (localhost:8080)
    #    │
    #    ▼
# FastAPI (localhost:8000)

# ❌ Browser blocks request


# With CORS:

# React
#    │
#    ▼
# FastAPI

# ✅ Allowed
app = FastAPI()
# Creates the FastAPI application.
# Everything below belongs to this app.
# app
# │
# ├── /
# ├── /products
# ├── /dashboard
# ├── /categories
# ├── /stats
# └── /sync-prices

# CORS = Cross-Origin Resource Sharing
# Cross = Across
# Origin = Website/App
# Resource = Data/API/File
# Sharing = Allowing access

# A browser security mechanism that decides whether one website is allowed to access resources from another website. 


# middleware It sits in the middle of the request and response.
# Middleware is software that runs before and/or after a request reaches a route handler, allowing you to perform common tasks such as CORS handling, authentication, logging, rate limiting, and modifying requests or responses without duplicating code in every endpoint.

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Adds CORS middleware.
# It tells FastAPI:
# Allow these websites
# ↓
# http://localhost:8080
# because your frontend runs there.

# ----------------------------
# DB CONNECTION
# ----------------------------
def get_connection():
    return psycopg2.connect(
        os.environ["DATABASE_URL"]
    )

# ----------------------------
# HOME
# ----------------------------
@app.get("/")
# This is called a decorator.
# It tells FastAPI:
# "When someone visits /, run the function below."

    # Function executed for /.
def home():
    return {"message": "Plastic Price API Running"}
    # FastAPI automatically converts this into JSON.
# ----------------------------
# ALL PRODUCTS
# ----------------------------
@app.get("/products")
def get_products():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            p.id,
            p.product_name,
            p.product_grade,
            p.current_price,
            p.last_updated,
            c.category_name,

            (
                SELECT ph.price
                FROM price_history ph
                WHERE ph.product_id = p.id
                ORDER BY ph.recorded_at DESC
                OFFSET 1
                LIMIT 1
            ) AS previous_price,

            (
                SELECT ph.price
                FROM price_history ph
                WHERE ph.product_id = p.id
                  AND ph.recorded_at <= NOW() - INTERVAL '24 hours'
                ORDER BY ph.recorded_at DESC
                LIMIT 1
            ) AS price_24h_ago,

            (
                SELECT ph.price
                FROM price_history ph
                WHERE ph.product_id = p.id
                  AND ph.recorded_at <= NOW() - INTERVAL '7 days'
                ORDER BY ph.recorded_at DESC
                LIMIT 1
            ) AS price_7d_ago

        FROM products p

        LEFT JOIN categories c
            ON p.category_id = c.id

        ORDER BY p.id
    """)

    rows = cursor.fetchall()

    cursor.close()
    conn.close()

    products = []

    for r in rows:

        current_price = float(r[3]) if r[3] is not None else 0

        previous_price = (
            float(r[6])
            if r[6] is not None
            else None
        )

        price_24h_ago = (
            float(r[7])
            if r[7] is not None
            else None
        )

        price_7d_ago = (
            float(r[8])
            if r[8] is not None
            else None
        )

        # --------------------------------
        # Previous price change
        # --------------------------------

        if previous_price is not None:
            price_change = round(
                current_price - previous_price,
                2
            )

            change_pct = round(
                ((current_price - previous_price) / previous_price) * 100,
                2
            ) if previous_price != 0 else 0

        else:
            price_change = 0
            change_pct = 0

        # --------------------------------
        # 24 hour change
        # --------------------------------

        if price_24h_ago is not None and price_24h_ago != 0:

            change_24h = round(
                ((current_price - price_24h_ago) / price_24h_ago) * 100,
                2
            )

        else:
            change_24h = 0

        # --------------------------------
        # 7 day change
        # --------------------------------

        if price_7d_ago is not None and price_7d_ago != 0:

            change_7d = round(
                ((current_price - price_7d_ago) / price_7d_ago) * 100,
                2
            )

        else:
            change_7d = 0

        products.append({
            "id": r[0],
            "product_name": r[1],
            "product_grade": r[2],
            "current_price": current_price,

            "previous_price": previous_price,
            "price_change": price_change,
            "change_pct": change_pct,

            "change_24h": change_24h,
            "change_7d": change_7d,

            "last_updated": r[4],
            "category": r[5]
        })

    return products
# ----------------------------
# PRICE HISTORY
# ----------------------------

@app.get("/products/{product_id}/history")
# History endpoint
def get_product_history(product_id: int):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT price, recorded_at
        FROM price_history
        WHERE product_id = %s
        ORDER BY recorded_at ASC
    """, (product_id,))

    rows = cursor.fetchall()

    cursor.close()
    conn.close()

    return [
        {
            "price": float(r[0]),
            "time": r[1]
        }
        for r in rows
    ]

# ----------------------------
# STATS
# ----------------------------
@app.get("/stats")
# Stats endpoint
def get_stats():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM products")
    total_products = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM categories")
    categories = cursor.fetchone()[0]

    cursor.close()
    conn.close()

    return {
        "total_products": total_products,
        "categories": categories
    }

# ----------------------------
# TOP MOVERS (BASIC FOR NOW)
# ----------------------------
# ----------------------------
# TOP MOVERS
# ----------------------------

@app.get("/top-movers")
def get_top_movers():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            id,
            product_name,
            product_grade,
            current_price,
            change_pct,
            last_updated
        FROM products
        WHERE change_pct IS NOT NULL
        ORDER BY change_pct DESC
        LIMIT 5
    """)

    gainers = cursor.fetchall()

    cursor.execute("""
        SELECT
            id,
            product_name,
            product_grade,
            current_price,
            change_pct,
            last_updated
        FROM products
        WHERE change_pct IS NOT NULL
        ORDER BY change_pct ASC
        LIMIT 5
    """)

    losers = cursor.fetchall()

    cursor.close()
    conn.close()

    return {
        "gainers": [
            {
                "id": r[0],
                "name": r[1],
                "grade": r[2],
                "price": float(r[3]),
                "changePct": float(r[4]),
                "lastUpdated": r[5]
            }
            for r in gainers
        ],

        "losers": [
            {
                "id": r[0],
                "name": r[1],
                "grade": r[2],
                "price": float(r[3]),
                "changePct": float(r[4]),
                "lastUpdated": r[5]
            }
            for r in losers
        ]
    }
# ----------------------------
# SYNC PRICES
# ----------------------------


@app.post("/sync-prices")
def sync_prices():

    print("SYNC STARTED", flush=True)

    url = "https://api.credcosourcing.com/api/products/bycategory?category_id=62&state_id=DL&city_id=1&interval=2&public_pricing=1"

    print("Calling CredCo...", flush=True)

    response = requests.get(url, timeout=20)
    print("CredCo status:", response.status_code, flush=True)

    response.raise_for_status()

    data = response.json()

    print("CredCo products:", len(data), flush=True)

    conn = get_connection()
    cursor = conn.cursor()

    print("Database connected", flush=True)

    updated = 0
    skipped = 0

    try:

        for p in data:

            api_id = p.get("id")
            current_price = p.get("current_price")

            # Skip products where CredCo has no price
            if current_price is None:
                print(
                    "Skipping product with no price:",
                    api_id,
                    flush=True
                )
                skipped += 1
                continue

            price = float(current_price)

            cursor.execute(
                """
                SELECT id
                FROM products
                WHERE api_id = %s
                """,
                (api_id,)
            )

            row = cursor.fetchone()

            # Product does not exist in our database
            if not row:
                print(
                    "Product not found:",
                    api_id,
                    flush=True
                )
                skipped += 1
                continue

            db_id = row[0]

            # Update current price
            cursor.execute(
                """
                UPDATE products
                SET current_price = %s,
                    last_updated = NOW()
                WHERE id = %s
                """,
                (price, db_id)
            )

            # Save price history
            cursor.execute(
                """
                INSERT INTO price_history
                (
                    product_id,
                    price
                )
                VALUES (%s, %s)
                """,
                (db_id, price)
            )

            updated += 1

        conn.commit()

    except Exception as e:

        conn.rollback()

        print(
            "SYNC ERROR:",
            e,
            flush=True
        )

        raise

    finally:

        cursor.close()
        conn.close()

    print(
        "SYNC FINISHED:",
        updated,
        "updated,",
        skipped,
        "skipped",
        flush=True
    )

    return {
        "message": "Sync completed",
        "updated": updated,
        "skipped": skipped,
        "total": len(data)
    }

    # ----------------------------
# SUPPLIER COMPARISON
# ----------------------------

@app.get("/products/{product_id}/comparison")
def get_product_comparison(product_id: int):
    conn = get_connection()
    cursor = conn.cursor()

    # First find the selected product's grade
    cursor.execute("""
        SELECT
            id,
            product_name,
            product_grade,
            current_price,
            change_pct,
            last_updated
        FROM products
        WHERE id = %s
    """, (product_id,))

    selected = cursor.fetchone()

    if not selected:
        cursor.close()
        conn.close()

        return {
            "product": None,
            "suppliers": []
        }

    selected_id = selected[0]
    selected_name = selected[1]
    selected_grade = selected[2]

    # Find products with the same grade.
    #
    # The idea is:
    #
    # PP IOCL      1060MG - 6 MFI
    # PP Reliance  1060MG - 6 MFI
    # PP HMEL      1060MG - 6 MFI
    #
    # These can then be compared.
    cursor.execute("""
        SELECT
            id,
            product_name,
            product_grade,
            current_price,
            change_pct,
            last_updated
        FROM products
        WHERE product_grade = %s
        ORDER BY current_price ASC
    """, (selected_grade,))

    rows = cursor.fetchall()

    cursor.close()
    conn.close()

    suppliers = []

    for row in rows:
        suppliers.append({
            "id": row[0],
            "supplier": row[1],
            "grade": row[2],
            "price": float(row[3]),
            "changePct": float(row[4]) if row[4] is not None else 0,
            "lastUpdated": row[5]
        })

    lowest_price = None

    if suppliers:
        lowest_price = min(
            supplier["price"]
            for supplier in suppliers
        )

    return {
        "product": {
            "id": selected_id,
            "name": selected_name,
            "grade": selected_grade,
            "price": float(selected[3]),
            "changePct": (
                float(selected[4])
                if selected[4] is not None
                else 0
            ),
            "lastUpdated": selected[5]
        },

        "suppliers": suppliers,

        "lowestPrice": lowest_price,

        "supplierCount": len(suppliers)
    }