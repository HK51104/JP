import json
import os
from typing import Optional

import requests
import psycopg2

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# ============================================================
# APP
# ============================================================

app = FastAPI(
    title="JP — Jagdish Polymers API",
    version="1.0.0",
)


# ============================================================
# CORS
# ============================================================

# ============================================================
# CORS
# ============================================================

PRODUCTION_ORIGINS = [
    "https://jagdishpolymers.me",
    "https://www.jagdishpolymers.me",
]

FRONTEND_URL = os.getenv("FRONTEND_URL")

allowed_origins = PRODUCTION_ORIGINS.copy()

if FRONTEND_URL and FRONTEND_URL not in allowed_origins:
    allowed_origins.append(FRONTEND_URL)

allowed_origins.extend(
    [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:8080",
    ]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# DATABASE
# ============================================================


def get_connection():
    """
    Create a PostgreSQL connection.

    DATABASE_URL must be configured in Render
    environment variables.
    """

    database_url = os.getenv("DATABASE_URL")

    if not database_url:
        raise RuntimeError("DATABASE_URL environment variable is not configured.")

    return psycopg2.connect(database_url)


# ============================================================
# HELPERS
# ============================================================


def close_connection(conn, cursor=None):
    """
    Safely close cursor and database connection.
    """

    try:
        if cursor:
            cursor.close()
    except Exception:
        pass

    try:
        if conn:
            conn.close()
    except Exception:
        pass


def safe_float(value):
    """
    Convert database/API numeric values into JSON-safe floats.
    """

    if value is None:
        return None

    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def calculate_percentage_change(
    current: Optional[float],
    previous: Optional[float],
):
    """
    Calculate percentage change safely.
    """

    if current is None or previous is None:
        return 0.0

    if previous == 0:
        return 0.0

    return round(
        ((current - previous) / previous) * 100,
        2,
    )


# ============================================================
# HOME
# ============================================================


@app.get("/")
def home():
    return {
        "message": "Plastic Price API Running",
        "service": "JP — Jagdish Polymers",
        "status": "online",
    }


# ============================================================
# HEALTH CHECK
# ============================================================


@app.get("/health")
def health():
    """
    Check whether the API and PostgreSQL are reachable.
    """

    conn = None
    cursor = None

    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT 1")
        cursor.fetchone()

        return {
            "status": "healthy",
            "database": "connected",
        }

    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "error",
            "error": str(e),
        }

    finally:
        close_connection(
            conn,
            cursor,
        )


# ============================================================
# ALL PRODUCTS
# ============================================================


@app.get("/products")
def get_products():

    conn = None
    cursor = None

    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT
                p.id,
                p.product_name,
                p.product_grade,
                p.current_price,
                p.last_updated,
                c.id AS category_id,
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

        products = []

        for row in rows:

            (
                product_id,
                product_name,
                product_grade,
                current_price_raw,
                last_updated,
                category_id,
                category_name,
                previous_price_raw,
                price_24h_raw,
                price_7d_raw,
            ) = row

            current_price = safe_float(current_price_raw) or 0.0

            previous_price = safe_float(previous_price_raw)

            price_24h_ago = safe_float(price_24h_raw)

            price_7d_ago = safe_float(price_7d_raw)

            # ------------------------------------------------
            # PREVIOUS RECORD CHANGE
            # ------------------------------------------------

            if previous_price is not None:

                price_change = round(
                    current_price - previous_price,
                    2,
                )

                change_pct = calculate_percentage_change(
                    current_price,
                    previous_price,
                )

            else:

                price_change = 0.0
                change_pct = 0.0

            # ------------------------------------------------
            # 24H CHANGE
            # ------------------------------------------------

            change_24h = calculate_percentage_change(
                current_price,
                price_24h_ago,
            )

            # ------------------------------------------------
            # 7D CHANGE
            # ------------------------------------------------

            change_7d = calculate_percentage_change(
                current_price,
                price_7d_ago,
            )

            products.append(
                {
                    "id": product_id,
                    "product_name": product_name,
                    "product_grade": (product_grade or ""),
                    "current_price": current_price,
                    "previous_price": previous_price,
                    "price_change": price_change,
                    "change_pct": change_pct,
                    "change_24h": change_24h,
                    "change_7d": change_7d,
                    "last_updated": last_updated,
                    "category_id": category_id,
                    "category": (category_name or "Uncategorized"),
                }
            )

        return products

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Unable to fetch products: {str(e)}",
        )

    finally:
        close_connection(
            conn,
            cursor,
        )


# ============================================================
# SINGLE PRODUCT
# ============================================================


@app.get("/products/{product_id}")
def get_product(product_id: int):

    conn = None
    cursor = None

    try:

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT
                p.id,
                p.product_name,
                p.product_grade,
                p.current_price,
                p.last_updated,
                c.id AS category_id,
                c.category_name
            FROM products p
            LEFT JOIN categories c
                ON p.category_id = c.id
            WHERE p.id = %s
            """,
            (product_id,),
        )

        row = cursor.fetchone()

        if not row:
            raise HTTPException(
                status_code=404,
                detail="Product not found.",
            )

        (
            product_id,
            product_name,
            product_grade,
            current_price,
            last_updated,
            category_id,
            category_name,
        ) = row

        # ------------------------------------------------
        # PREVIOUS PRICE
        # ------------------------------------------------

        cursor.execute(
            """
            SELECT price
            FROM price_history
            WHERE product_id = %s
            ORDER BY recorded_at DESC
            OFFSET 1
            LIMIT 1
            """,
            (product_id,),
        )

        previous_row = cursor.fetchone()

        previous_price = safe_float(previous_row[0]) if previous_row else None

        current_price = safe_float(current_price) or 0.0

        price_change = (
            round(
                current_price - previous_price,
                2,
            )
            if previous_price is not None
            else 0.0
        )

        change_pct = calculate_percentage_change(
            current_price,
            previous_price,
        )

        # ------------------------------------------------
        # 24H
        # ------------------------------------------------

        cursor.execute(
            """
            SELECT price
            FROM price_history
            WHERE product_id = %s
              AND recorded_at <= NOW() - INTERVAL '24 hours'
            ORDER BY recorded_at DESC
            LIMIT 1
            """,
            (product_id,),
        )

        row_24h = cursor.fetchone()

        price_24h = safe_float(row_24h[0]) if row_24h else None

        change_24h = calculate_percentage_change(
            current_price,
            price_24h,
        )

        # ------------------------------------------------
        # 7D
        # ------------------------------------------------

        cursor.execute(
            """
            SELECT price
            FROM price_history
            WHERE product_id = %s
              AND recorded_at <= NOW() - INTERVAL '7 days'
            ORDER BY recorded_at DESC
            LIMIT 1
            """,
            (product_id,),
        )

        row_7d = cursor.fetchone()

        price_7d = safe_float(row_7d[0]) if row_7d else None

        change_7d = calculate_percentage_change(
            current_price,
            price_7d,
        )

        return {
            "id": product_id,
            "product_name": product_name,
            "product_grade": (product_grade or ""),
            "current_price": current_price,
            "previous_price": previous_price,
            "price_change": price_change,
            "change_pct": change_pct,
            "change_24h": change_24h,
            "change_7d": change_7d,
            "last_updated": last_updated,
            "category_id": category_id,
            "category": (category_name or "Uncategorized"),
        }

    except HTTPException:
        raise

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Unable to fetch product: {str(e)}",
        )

    finally:
        close_connection(
            conn,
            cursor,
        )


# ============================================================
# PRICE HISTORY
# ============================================================


@app.get("/products/{product_id}/history")
def get_product_history(
    product_id: int,
):

    conn = None
    cursor = None

    try:

        conn = get_connection()
        cursor = conn.cursor()

        # Verify product exists
        cursor.execute(
            """
            SELECT id
            FROM products
            WHERE id = %s
            """,
            (product_id,),
        )

        if not cursor.fetchone():

            raise HTTPException(
                status_code=404,
                detail="Product not found.",
            )

        cursor.execute(
            """
            SELECT
                price,
                recorded_at
            FROM price_history
            WHERE product_id = %s
            ORDER BY recorded_at ASC
            """,
            (product_id,),
        )

        rows = cursor.fetchall()

        return [
            {
                "price": (safe_float(row[0]) or 0.0),
                "time": row[1],
            }
            for row in rows
        ]

    except HTTPException:
        raise

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=(f"Unable to fetch price history: {str(e)}"),
        )

    finally:
        close_connection(
            conn,
            cursor,
        )


# ============================================================
# STATS
# ============================================================


@app.get("/stats")
def get_stats():

    conn = None
    cursor = None

    try:

        conn = get_connection()
        cursor = conn.cursor()

        # Total products
        cursor.execute("""
            SELECT COUNT(*)
            FROM products
            """)

        total_products = cursor.fetchone()[0]

        # Categories
        cursor.execute("""
            SELECT COUNT(*)
            FROM categories
            """)

        categories = cursor.fetchone()[0]

        # Products updated recently
        cursor.execute("""
            SELECT COUNT(*)
            FROM products
            WHERE last_updated >= NOW() - INTERVAL '24 hours'
            """)

        products_updated_24h = cursor.fetchone()[0]

        # Last product update
        cursor.execute("""
            SELECT MAX(last_updated)
            FROM products
            """)

        last_updated = cursor.fetchone()[0]

        # History records
        cursor.execute("""
            SELECT COUNT(*)
            FROM price_history
            """)

        history_records = cursor.fetchone()[0]

        return {
            "total_products": total_products,
            "categories": categories,
            "products_updated_24h": (products_updated_24h),
            "last_updated": last_updated,
            "history_records": history_records,
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Unable to fetch stats: {str(e)}",
        )

    finally:
        close_connection(
            conn,
            cursor,
        )


# ============================================================
# TOP MOVERS
# ============================================================


@app.get("/top-movers")
def get_top_movers():

    conn = None
    cursor = None

    try:

        conn = get_connection()
        cursor = conn.cursor()

        # ------------------------------------------------
        # GAINERS
        # ------------------------------------------------

        cursor.execute("""
            SELECT
                p.id,
                p.product_name,
                p.product_grade,
                p.current_price,
                p.change_pct,
                p.last_updated,
                c.category_name
            FROM products p
            LEFT JOIN categories c
                ON p.category_id = c.id
            WHERE p.change_pct > 0
            ORDER BY p.change_pct DESC
            LIMIT 5
            """)

        gainers = cursor.fetchall()

        # ------------------------------------------------
        # LOSERS
        # ------------------------------------------------

        cursor.execute("""
            SELECT
                p.id,
                p.product_name,
                p.product_grade,
                p.current_price,
                p.change_pct,
                p.last_updated,
                c.category_name
            FROM products p
            LEFT JOIN categories c
                ON p.category_id = c.id
            WHERE p.change_pct < 0
            ORDER BY p.change_pct ASC
            LIMIT 5
            """)

        losers = cursor.fetchall()

        def serialize(row):
            last_updated = row[5]

            if hasattr(last_updated, "isoformat"):
                last_updated = last_updated.isoformat()

            return {
                "id": row[0],
                "name": row[1],
                "grade": (row[2] or ""),
                "price": (safe_float(row[3]) or 0.0),
                "changePct": (safe_float(row[4]) or 0.0),
                "lastUpdated": last_updated,
                "category": (row[6] or "Uncategorized"),
            }

        return {
            "gainers": [serialize(row) for row in gainers],
            "losers": [serialize(row) for row in losers],
        }

    except Exception:
        # Return empty data instead of crashing the dashboard when the backend
        # is temporarily unavailable or a single row is malformed.
        return {
            "gainers": [],
            "losers": [],
        }

    finally:
        close_connection(
            conn,
            cursor,
        )


# ============================================================
# CATEGORIES
# ============================================================


@app.get("/categories")
def get_categories():

    conn = None
    cursor = None

    try:

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT
                id,
                category_name
            FROM categories
            ORDER BY category_name ASC
            """)

        rows = cursor.fetchall()

        return [
            {
                "id": row[0],
                "name": row[1],
            }
            for row in rows
        ]

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Unable to fetch categories: {str(e)}",
        )

    finally:
        close_connection(
            conn,
            cursor,
        )


# ============================================================
# SUPPLIER COMPARISON
# ============================================================


@app.get("/products/{product_id}/comparison")
def get_product_comparison(
    product_id: int,
):

    conn = None
    cursor = None

    try:

        conn = get_connection()
        cursor = conn.cursor()

        # ------------------------------------------------
        # SELECTED PRODUCT
        # ------------------------------------------------

        cursor.execute(
            """
            SELECT
                p.id,
                p.product_name,
                p.product_grade,
                p.current_price,
                p.change_pct,
                p.last_updated,
                p.category_id,
                c.category_name
            FROM products p
            LEFT JOIN categories c
                ON p.category_id = c.id
            WHERE p.id = %s
            """,
            (product_id,),
        )

        selected = cursor.fetchone()

        if not selected:

            raise HTTPException(
                status_code=404,
                detail="Product not found.",
            )

        (
            selected_id,
            selected_name,
            selected_grade,
            selected_price,
            selected_change_pct,
            selected_last_updated,
            selected_category_id,
            selected_category_name,
        ) = selected

        # ------------------------------------------------
        # FIND COMPARABLE PRODUCTS
        #
        # Same category + same grade.
        # ------------------------------------------------

        cursor.execute(
            """
            SELECT
                p.id,
                p.product_name,
                p.product_grade,
                p.current_price,
                p.change_pct,
                p.last_updated
            FROM products p
            WHERE p.category_id = %s
              AND p.product_grade = %s
            ORDER BY p.current_price ASC
            """,
            (
                selected_category_id,
                selected_grade,
            ),
        )

        rows = cursor.fetchall()

        suppliers = []

        for row in rows:

            suppliers.append(
                {
                    "id": row[0],
                    "supplier": row[1],
                    "grade": (row[2] or ""),
                    "price": (safe_float(row[3]) or 0.0),
                    "changePct": (safe_float(row[4]) or 0.0),
                    "lastUpdated": row[5],
                }
            )

        lowest_price = (
            min(supplier["price"] for supplier in suppliers) if suppliers else None
        )

        return {
            "product": {
                "id": selected_id,
                "name": selected_name,
                "grade": (selected_grade or ""),
                "price": (safe_float(selected_price) or 0.0),
                "changePct": (safe_float(selected_change_pct) or 0.0),
                "lastUpdated": selected_last_updated,
                "category": (selected_category_name or "Uncategorized"),
            },
            "suppliers": suppliers,
            "lowestPrice": lowest_price,
            "supplierCount": len(suppliers),
        }

    except HTTPException:
        raise

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=("Unable to compare suppliers: " f"{str(e)}"),
        )

    finally:
        close_connection(
            conn,
            cursor,
        )


# ============================================================
# SYNC PRICES FROM CREDCO
# ============================================================


@app.post("/sync-prices")
def sync_prices():

    print("====================================", flush=True)
    print("SYNC STARTED", flush=True)
    print("====================================", flush=True)

    credco_url = (
        "https://api.credcosourcing.com/api/products/bycategory"
        "?category_id=62"
        "&state_id=DL"
        "&city_id=1"
        "&interval=2"
        "&public_pricing=1"
    )

    conn = None
    cursor = None

    updated = 0
    unchanged = 0
    skipped = 0
    failed = 0

    try:

        # ------------------------------------------------
        # CALL CREDCO
        # ------------------------------------------------

        print("Calling CredCo...", flush=True)

        response = requests.get(
            credco_url,
            timeout=30,
            headers={"User-Agent": "JP-JagdishPolymers/1.0"},
        )

        print(
            "CredCo status:",
            response.status_code,
            flush=True,
        )

        response.raise_for_status()

        data = response.json()

        if not isinstance(data, list):
            raise RuntimeError("CredCo returned an unexpected response format.")

        print(
            "CredCo products:",
            len(data),
            flush=True,
        )

        # ------------------------------------------------
        # DATABASE
        # ------------------------------------------------

        conn = get_connection()
        cursor = conn.cursor()

        print("Database connected", flush=True)

        # ------------------------------------------------
        # PROCESS PRODUCTS
        # ------------------------------------------------

        for p in data:

            try:

                api_id = p.get("id")
                current_price = p.get("current_price")

                # ----------------------------------------
                # VALIDATE PRODUCT
                # ----------------------------------------

                if api_id is None:
                    print(
                        "Skipping product without API ID",
                        flush=True,
                    )
                    skipped += 1
                    continue

                if current_price is None:
                    print(
                        "Skipping product with no price:",
                        api_id,
                        flush=True,
                    )
                    skipped += 1
                    continue

                try:
                    new_price = float(current_price)
                except (TypeError, ValueError):

                    print(
                        "Invalid price:",
                        current_price,
                        "for product:",
                        api_id,
                        flush=True,
                    )

                    skipped += 1
                    continue

                # ----------------------------------------
                # FIND PRODUCT
                # ----------------------------------------

                cursor.execute(
                    """
                    SELECT
                        id,
                        current_price
                    FROM products
                    WHERE api_id = %s
                    """,
                    (api_id,),
                )

                product_row = cursor.fetchone()

                if not product_row:

                    print(
                        "Product not found:",
                        api_id,
                        flush=True,
                    )

                    skipped += 1
                    continue

                db_id = product_row[0]

                old_price = (
                    float(product_row[1]) if product_row[1] is not None else None
                )

                # ----------------------------------------
                # NO PRICE CHANGE
                # ----------------------------------------

                if old_price is not None and old_price == new_price:

                    unchanged += 1

                    continue

                # ----------------------------------------
                # CALCULATE CHANGE
                # ----------------------------------------

                price_change = (
                    round(new_price - old_price, 2) if old_price is not None else 0
                )

                change_pct = (
                    round(
                        ((new_price - old_price) / old_price) * 100,
                        2,
                    )
                    if old_price not in (None, 0)
                    else 0
                )

                # ----------------------------------------
                # UPDATE PRODUCT
                # ----------------------------------------

                cursor.execute(
                    """
                    UPDATE products
                    SET
                        current_price = %s,
                        change_pct = %s,
                        last_updated = NOW()
                    WHERE id = %s
                    """,
                    (
                        new_price,
                        change_pct,
                        db_id,
                    ),
                )

                # ----------------------------------------
                # PRICE HISTORY
                # ----------------------------------------

                cursor.execute(
                    """
                    INSERT INTO price_history
                    (
                        product_id,
                        price
                    )
                    VALUES
                    (%s, %s)
                    """,
                    (
                        db_id,
                        new_price,
                    ),
                )


                # ----------------------------------------
                # COMMIT THIS PRODUCT
                # ----------------------------------------
                # Commit per-product so one bad product can't
                # poison/roll back updates already made to others.

                conn.commit()

                updated += 1

                print(
                    f"Updated product {api_id}: "
                    f"{old_price} -> {new_price} "
                    f"({change_pct}%)",
                    flush=True,
                )

            except Exception as product_error:

                # ----------------------------------------
                # ROLLBACK THIS PRODUCT'S FAILED TRANSACTION
                # ----------------------------------------
                # CRITICAL: Without this, Postgres marks the
                # connection's transaction as aborted and every
                # subsequent cursor.execute() call -- even for
                # totally unrelated, valid products -- will fail
                # with "current transaction is aborted, commands
                # ignored until end of transaction block".
                # This is what was causing 43/52 products to show
                # as "failed" even though only one product actually
                # had a real error.

                if conn:
                    conn.rollback()

                failed += 1

                print(
                    "PRODUCT SYNC ERROR:",
                    repr(product_error),
                    "| api_id:",
                    p.get("id"),
                    flush=True,
                )

                # Continue processing remaining products
                continue
        # ------------------------------------------------
        # FINISHED
        # ------------------------------------------------
        # No final conn.commit() needed here anymore since each
        # successful product is committed individually above.
        # ------------------------------------------------
        
        # FINISHED
        # ------------------------------------------------
        print("====================================", flush=True)

        print(
            "SYNC FINISHED",
            flush=True,
        )

        print(
            "Updated:",
            updated,
            flush=True,
        )

        print(
            "Unchanged:",
            unchanged,
            flush=True,
        )

        print(
            "Skipped:",
            skipped,
            flush=True,
        )

        print(
            "Failed:",
            failed,
            flush=True,
        )

        print("====================================", flush=True)

        return {
            "message": "Sync completed",
            "updated": updated,
            "unchanged": unchanged,
            "skipped": skipped,
            "failed": failed,
            "total": len(data),
        }

    # ----------------------------------------------------
    # GLOBAL ERROR
    # ----------------------------------------------------

    except Exception as e:

        print(
            "====================================",
            flush=True,
        )

        print(
            "SYNC FAILED:",
            e,
            flush=True,
        )

        print(
            "====================================",
            flush=True,
        )

        if conn:
            conn.rollback()

        raise

    # ----------------------------------------------------
    # CLEANUP
    # ----------------------------------------------------

    finally:

        if cursor:
            cursor.close()

        if conn:
            conn.close()

        print(
            "Database connection closed",
            flush=True,
        )

# --------------------------------------------------
# PRICE ALERTS
# --------------------------------------------------


@app.get("/alerts")
def get_alerts():
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT
                a.id,
                a.product_id,
                p.product_name,
                p.product_grade,
                p.current_price,
                a.alert_type,
                a.target_value,
                a.is_active,
                a.triggered,
                a.created_at,
                a.triggered_at
            FROM alerts a
            JOIN products p
                ON a.product_id = p.id
            ORDER BY a.created_at DESC
        """)

        rows = cursor.fetchall()

        return [
            {
                "id": row[0],
                "productId": row[1],
                "productName": row[2],
                "productGrade": row[3],
                "currentPrice": float(row[4]) if row[4] is not None else 0,
                "alertType": row[5],
                "targetValue": float(row[6]),
                "isActive": row[7],
                "triggered": row[8],
                "createdAt": row[9],
                "triggeredAt": row[10],
            }
            for row in rows
        ]

    finally:
        cursor.close()
        conn.close()


@app.post("/alerts")
def create_alert(alert: dict):
    product_id = alert.get("productId")
    alert_type = alert.get("alertType")
    target_value = alert.get("targetValue")

    if product_id is None:
        return {"detail": "productId is required"}

    if alert_type not in [
        "price_above",
        "price_below",
        "change_above",
        "change_below",
    ]:
        return {"detail": "Invalid alert type"}

    try:
        target_value = float(target_value)
    except (TypeError, ValueError):
        return {"detail": "targetValue must be a number"}

    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            SELECT id
            FROM products
            WHERE id = %s
            """,
            (product_id,),
        )

        product = cursor.fetchone()

        if not product:
            return {"detail": "Product not found"}

        cursor.execute(
            """
            INSERT INTO alerts
            (
                product_id,
                alert_type,
                target_value
            )
            VALUES (%s, %s, %s)
            RETURNING id
            """,
            (
                product_id,
                alert_type,
                target_value,
            ),
        )

        alert_id = cursor.fetchone()[0]

        conn.commit()

        return {
            "message": "Alert created",
            "id": alert_id,
        }

    except Exception:
        conn.rollback()
        raise

    finally:
        cursor.close()
        conn.close()


@app.delete("/alerts/{alert_id}")
def delete_alert(alert_id: int):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            DELETE FROM alerts
            WHERE id = %s
            RETURNING id
            """,
            (alert_id,),
        )

        deleted = cursor.fetchone()

        if not deleted:
            return {"detail": "Alert not found"}

        conn.commit()

        return {
            "message": "Alert deleted",
            "id": deleted[0],
        }

    except Exception:
        conn.rollback()
        raise

    finally:
        cursor.close()
        conn.close()

    # ============================================================
# ADD THIS TO plasticprice/app.py
# ============================================================
# New imports needed at the top of app.py (add if not already there):
#
#   import os
#   import json
#   import requests
#
# ============================================================

GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent"

@app.get("/market-summary")
def market_summary():

    print("====================================", flush=True)
    print("MARKET SUMMARY REQUEST", flush=True)
    print("====================================", flush=True)

    conn = None
    cursor = None

    try:
        # ------------------------------------------------
        # STEP 1: GET REAL PRICE DATA FROM YOUR DATABASE
        # ------------------------------------------------

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT
                product_name,
                product_grade,
                current_price,
                change_pct
            FROM products
            WHERE change_pct IS NOT NULL
            AND change_pct != 0
            ORDER BY ABS(change_pct) DESC
            LIMIT 15
        """)

        rows = cursor.fetchall()

        if not rows:
            return {
                "summary": "No significant price movements to report today.",
                "top_movers": [],
            }

        # ------------------------------------------------
        # STEP 2: FORMAT DATA FOR THE PROMPT
        # ------------------------------------------------

        price_lines = []
        for name, grade, price, change_pct in rows:
            direction = "up" if change_pct > 0 else "down"
            price_lines.append(
                f"{name} ({grade}): {direction} {abs(change_pct)}%, now ₹{price}"
            )

        price_data_text = "\n".join(price_lines)

        # ------------------------------------------------
        # STEP 3: BUILD THE PROMPT
        # ------------------------------------------------
        # We explicitly ask for JSON output, and are STRICT
        # about format, since LLMs often wrap JSON in markdown
        # fences or add extra commentary.

        prompt = f"""You are summarizing today's polymer (plastic resin) price movements for a trading dashboard.

Here is today's price data (product, direction, % change, current price):
{price_data_text}

Return ONLY valid JSON, with no markdown formatting, no code fences, no extra text.
The JSON must have exactly this shape:
{{
  "summary": "2-3 sentence plain-English summary of the overall market trend today",
  "top_movers": ["product name 1", "product name 2", "product name 3"]
}}
"""

        # ------------------------------------------------
        # STEP 4: CALL GEMINI
        # ------------------------------------------------

        gemini_api_key = os.environ["GEMINI_API_KEY"]

        response = requests.post(
            GEMINI_URL,
            headers={
                "x-goog-api-key": gemini_api_key,
                "Content-Type": "application/json",
            },
            json={
                "contents": [
                    {
                        "parts": [
                            {"text": prompt}
                        ]
                    }
                ]
            },
            timeout=30,  # AI calls are slower than DB queries -- generous timeout
        )

        print("Gemini status:", response.status_code, flush=True)

        response.raise_for_status()

        gemini_data = response.json()

        raw_text = gemini_data["candidates"][0]["content"]["parts"][0]["text"]

        print("Gemini raw response:", raw_text, flush=True)

        # ------------------------------------------------
        # STEP 5: CLEAN UP THE RESPONSE
        # ------------------------------------------------
        # Gemini (like most LLMs) often wraps JSON in markdown
        # code fences even when told not to. Strip them defensively.

        cleaned_text = raw_text.strip()

        if cleaned_text.startswith("```"):
            cleaned_text = cleaned_text.split("```")[1]
            if cleaned_text.startswith("json"):
                cleaned_text = cleaned_text[4:]
            cleaned_text = cleaned_text.strip()

        # ------------------------------------------------
        # STEP 6: PARSE THE JSON
        # ------------------------------------------------

        try:
            parsed = json.loads(cleaned_text)
        except json.JSONDecodeError as e:
            print("JSON PARSE ERROR:", repr(e), flush=True)
            print("Raw text was:", cleaned_text, flush=True)
            # Fallback: return the raw text as the summary so the
            # endpoint doesn't hard-fail just because formatting broke
            return {
                "summary": cleaned_text,
                "top_movers": [],
                "note": "AI response was not valid JSON, showing raw text",
            }

        return parsed

    except requests.exceptions.Timeout:
        print("GEMINI TIMEOUT", flush=True)
        return {
            "summary": "Market summary is temporarily unavailable (AI request timed out). Please try again.",
            "top_movers": [],
        }

    except requests.exceptions.HTTPError as e:
        print("GEMINI HTTP ERROR:", repr(e), flush=True)
        if e.response is not None and e.response.status_code == 429:
            return {
                "summary": "Market summary is temporarily unavailable (rate limit reached). Please try again shortly.",
                "top_movers": [],
            }
        return {
            "summary": "Market summary is temporarily unavailable.",
            "top_movers": [],
        }

    except Exception as e:
        print("MARKET SUMMARY ERROR:", repr(e), flush=True)
        return {
            "summary": "Market summary is temporarily unavailable.",
            "top_movers": [],
        }

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()