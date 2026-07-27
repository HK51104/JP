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

app.add_middleware
# Adds CORS middleware.
# It tells FastAPI:
# Allow these websites
# ↓
# http://localhost:8080
# because your frontend runs there.
(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------------
# DB CONNECTION
# ----------------------------
def get_connection():
    return psycopg2.connect
    # actually opens the database connection.
    # Python
    #    │  
    #    ▼
    # PostgreSQL
    (
        host="localhost",
        database="HK",
        user="postgres",
        password="HK12345"
    )

# ----------------------------
# HOME
# ----------------------------
@app.get("/")
# This is called a decorator.
# It tells FastAPI:
# "When someone visits /, run the function below."

def home():
    # Function executed for /.
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

    return 
    # builds JSON
    [
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
# Sync Prices endpoint
# This is the most important endpoint.
# POST /sync-prices
# means
# Update prices.
def sync_prices():

    url = "https://api.credcosourcing.com/api/products/bycategory?category_id=62&state_id=DL&city_id=1&interval=2&public_pricing=1"

    data = requests.get(url).json()

    conn = get_connection()
    cursor = conn.cursor()

    updated = 0
    skipped = 0

    for p in data:

        api_id = p["id"]
        price = float(p["current_price"])

        cursor.execute("""
            SELECT id FROM products WHERE id = %s
        """, (api_id,))

        row = cursor.fetchone()

        if not row:
            skipped += 1
            continue

        db_id = row[0]

        cursor.execute("""
            UPDATE products
            SET current_price = %s
            WHERE id = %s
        """, (price, db_id))

        cursor.execute("""
            INSERT INTO price_history (product_id, price)
            VALUES (%s, %s)
        """, (db_id, price))

        updated += 1

    conn.commit()
    cursor.close()
    conn.close()

    return 
    # This return sends the final response back to whoever called the API
    {
        "message": "Sync completed",
        "updated": updated,
        "skipped": skipped,
        "total": len(data)
    }