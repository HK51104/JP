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
# GET /products

# ↓

# run get_products()
def get_products():
    conn = get_connection()
    # open database

    cursor = conn.cursor()
    # create SQL cursor

    cursor.execute("""
        SELECT
            p.id,
            p.product_name,
            p.product_grade,
            p.current_price,
            p.last_updated,
            c.category_name
        FROM products p
        LEFT JOIN categories c
            ON p.category_id = c.id
        ORDER BY p.id
    """)

    rows = cursor.fetchall()

    cursor.close()
    conn.close()

    # builds JSON
    return [
        {
            "id": r[0],
            "product_name": r[1],
            "product_grade": r[2],
            "current_price": float(r[3]),
            "last_updated": r[4],
            "category": r[5]
        }
        for r in rows
    ]

# ----------------------------
# SINGLE PRODUCT
# ----------------------------
@app.get("/products/{product_id}")
def get_product(product_id: int):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            p.id,
            p.product_name,
            p.product_grade,
            p.current_price,
            p.last_updated,
            c.category_name
        FROM products p
        LEFT JOIN categories c
            ON p.category_id = c.id
        WHERE p.id = %s
    """, (product_id,))

    row = cursor.fetchone()

    cursor.close()
    conn.close()

    if not row:
        return {"error": "Product not found"}

    return {
        "id": row[0],
        "product_name": row[1],
        "product_grade": row[2],
        "current_price": float(row[3]),
        "last_updated": row[4],
        "category": row[5]
    }

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
@app.get("/top-movers")
def get_top_movers():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            id,
            product_name,
            product_grade,
            current_price
        FROM products
        ORDER BY id
        LIMIT 10
    """)

    rows = cursor.fetchall()

    cursor.close()
    conn.close()

    return [
        {
            "id": r[0],
            "name": r[1],
            "grade": r[2],
            "price": float(r[3])
        }
        for r in rows
    ]

# ----------------------------
# DASHBOARD SUMMARY
# ----------------------------
@app.get("/dashboard")
# Dashboard endpoint
def get_dashboard():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM products")
    total_products = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM categories")
    total_categories = cursor.fetchone()[0]

    cursor.execute("""
        SELECT COUNT(*)
        FROM products
        WHERE DATE(last_updated) = CURRENT_DATE
    """)
    updated_today = cursor.fetchone()[0]

    cursor.close()
    conn.close()

    return {
        "total_products": total_products,
        "total_categories": total_categories,
        "updated_today": updated_today
    }

# ----------------------------
# CATEGORIES
# ----------------------------
@app.get("/categories")
# Categories endpoint
def get_categories():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, category_name
        FROM categories
        ORDER BY category_name
    """)

    rows = cursor.fetchall()

    cursor.close()
    conn.close()

    return [
        {
            "id": r[0],
            "name": r[1]
        }
        for r in rows
    ]

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