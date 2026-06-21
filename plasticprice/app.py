import requests
import psycopg2
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
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
    return psycopg2.connect(
        host="localhost",
        database="HK",
        user="postgres",
        password="HK12345"
    )

# ----------------------------
# HOME
# ----------------------------
@app.get("/")
def home():
    return {"message": "Plastic Price API Running"}

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
            c.category_name
        FROM products p
        LEFT JOIN categories c
            ON p.category_id = c.id
        ORDER BY p.id
    """)

    rows = cursor.fetchall()

    cursor.close()
    conn.close()

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

    return {
        "message": "Sync completed",
        "updated": updated,
        "skipped": skipped,
        "total": len(data)
    }