# ⚡ POLYMETRIC

### Plastic Raw Material Price Intelligence Platform

> **Track. Compare. Monitor. Automate.**

POLYMETRIC is a price intelligence platform built for the **plastic raw-material trading industry**, designed to bring material prices, grades, historical price movement, watchlists and alerts into one centralized platform.

I grew up watching my father trade plastic raw materials and saw how important — and time-consuming — price tracking is in this industry.

With a background in software development, I wanted to turn that real-world problem into a product.

**POLYMETRIC is the result.**

The current platform focuses on **price intelligence and monitoring**, with the long-term vision of becoming a complete **ERP ecosystem for plastic raw-material traders.**

---

## 🌐 Live Demo

### 🚀 [Visit POLYMETRIC](https://jp-psi-sandy.vercel.app/)

---

# 🛠️ Tech Stack

### Frontend

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge\&logo=react\&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge\&logo=vite\&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge\&logo=javascript\&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge\&logo=tailwindcss\&logoColor=white)

### Backend

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge\&logo=python\&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge\&logo=fastapi\&logoColor=white)
![Uvicorn](https://img.shields.io/badge/Uvicorn-499848?style=for-the-badge\&logo=uvicorn\&logoColor=white)

### Database

![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge\&logo=postgresql\&logoColor=white)
![Neon](https://img.shields.io/badge/Neon-00E599?style=for-the-badge\&logo=neon\&logoColor=black)

### Automation & Deployment

![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge\&logo=githubactions\&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge\&logo=vercel\&logoColor=white)
![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge\&logo=render\&logoColor=black)

### External Data

![REST API](https://img.shields.io/badge/REST_API-005571?style=for-the-badge)
![CredCo API](https://img.shields.io/badge/CredCo-Pricing_API-555555?style=for-the-badge)

---

# 📖 Table of Contents

* [About](#-about)
* [Why POLYMETRIC](#-why-polymetric)
* [Key Features](#-key-features)
* [Architecture](#️-architecture)
* [Automated Price Pipeline](#-automated-price-pipeline)
* [Project Structure](#-project-structure)
* [Installation & Setup](#-installation--setup)
* [Environment Variables](#-environment-variables)
* [API Reference](#-api-reference)
* [Deployment](#-deployment)
* [Roadmap](#-roadmap)
* [Vision](#-vision)
* [Author](#-author)

---

# 📌 About

Plastic raw-material trading depends heavily on constantly changing market prices.

Different materials and grades can move independently, making it important to know not only:

**"What is the price today?"**

but also:

**"Where has the price been?"**

and:

**"Where is it moving?"**

POLYMETRIC is designed around this idea.

Instead of acting as a simple price display, the platform maintains **historical price observations** so that users can understand price movement over time.

The current platform provides:

* Material and grade-wise pricing
* Product discovery
* Product details
* Historical price tracking
* Watchlists
* Alerts
* Automated price synchronization

---

# 💡 Why POLYMETRIC?

This project started from a real-world problem.

My family has been involved in **plastic raw-material trading**, and I've seen firsthand how much of the business revolves around monitoring material prices.

That made me think:

> **What if the same information traders constantly track manually could be turned into a proper software system?**

POLYMETRIC is my attempt to build that system.

What started as a price-tracking application is intended to evolve into something much larger.

---

# ✨ Key Features

## 📊 Price Dashboard

A centralized dashboard for monitoring plastic raw-material pricing information.

---

## 🧪 Materials & Grades

Browse plastic raw materials and their respective grades through a structured product catalog.

---

## 🔎 Product Details

Each product can be opened individually to inspect its available information and pricing.

---

## 📈 Historical Price Tracking

POLYMETRIC doesn't only store the latest price.

Every successful synchronization can create a new historical price observation.

This creates a dataset that can eventually be used for:

* Historical comparisons
* Trend analysis
* Price movement visualization
* Market intelligence

---

## ⭐ Watchlist

Users can add products to a personal watchlist for quick access to the materials they monitor most frequently.

---

## 🔔 Alerts

The application includes an alerts section for monitoring relevant price changes.

---

## 🔄 Automated Price Synchronization

POLYMETRIC automatically retrieves updated pricing information from the external pricing source.

The synchronization process:

```text
External Pricing API
        │
        ▼
   Fetch Products
        │
        ▼
   Match API IDs
        │
        ▼
 Update Current Price
        │
        ▼
 Update Timestamp
        │
        ▼
 Store Price History
```

---

## 🌙 Theme Support

The interface supports light and dark visual modes.

---

# 🏗️ Architecture

POLYMETRIC is deployed as a multi-service application.

```text
                         ┌────────────────────────┐
                         │      CredCo API        │
                         │  External Price Data   │
                         └────────────┬───────────┘
                                      │
                                      │
                                      ▼
                         ┌────────────────────────┐
                         │     FastAPI Backend    │
                         │        Render          │
                         └────────────┬───────────┘
                                      │
                                      │
                                      ▼
                         ┌────────────────────────┐
                         │    PostgreSQL / Neon   │
                         │                        │
                         │  Products              │
                         │  Categories            │
                         │  Price History         │
                         └────────────┬───────────┘
                                      │
                                      │ REST API
                                      ▼
                         ┌────────────────────────┐
                         │     React Frontend     │
                         │         Vercel         │
                         └────────────┬───────────┘
                                      │
                                      ▼
                         ┌────────────────────────┐
                         │       POLYMETRIC       │
                         │                        │
                         │  Dashboard             │
                         │  Products              │
                         │  Product Details       │
                         │  Watchlist             │
                         │  Alerts                │
                         └────────────────────────┘


                         ┌────────────────────────┐
                         │     GitHub Actions     │
                         │   Scheduled Workflow   │
                         └────────────┬───────────┘
                                      │
                                      │ POST /sync-prices
                                      ▼
                                FastAPI Backend
```

---

# ⚙️ Automated Price Pipeline

One of the more important engineering pieces of POLYMETRIC is the automated pricing pipeline.

The backend exposes:

```http
POST /sync-prices
```

When triggered, the endpoint:

1. Calls the external pricing API
2. Retrieves the latest product data
3. Reads the current price
4. Matches products using their external API ID
5. Updates the current price in PostgreSQL
6. Updates the `last_updated` timestamp
7. Inserts a new record into `price_history`
8. Commits the transaction

Products with unavailable prices are skipped.

Products that don't exist in the local database are also skipped rather than being inserted unexpectedly.

Database changes are performed inside a transaction so synchronization errors can trigger a rollback.

---

# 🤖 GitHub Actions Automation

The synchronization process is automated using **GitHub Actions**.

A scheduled workflow sends a request to the deployed backend:

```bash
curl --fail --max-time 120 \
  -X POST \
  https://jp-pfin.onrender.com/sync-prices
```

The complete automation pipeline:

```text
             GitHub Actions
                   │
                   │ Scheduled Trigger
                   ▼
             /sync-prices
                   │
                   ▼
            FastAPI / Render
                   │
                   ▼
            External API
                   │
                   ▼
             PostgreSQL
                   │
                   ▼
          Updated POLYMETRIC
```

The workflow can also be triggered manually when required.

---

# 📂 Project Structure

```text
JP/
│
├── .github/
│   └── workflows/
│       └── price-sync.yml
│
├── frontend/
│   ├── public/
│   │   ├── logo.png
│   │   └── _redirects
│   │
│   ├── src/
│   │   ├── assets/
│   │   │   ├── hero.png
│   │   │   ├── react.svg
│   │   │   └── vite.svg
│   │   │
│   │   ├── components/
│   │   │   ├── APIerror.jsx
│   │   │   ├── AppShell.jsx
│   │   │   └── ThemeToggle.jsx
│   │   │
│   │   ├── lib/
│   │   │   └── watchlist.js
│   │   │
│   │   ├── pages/
│   │   │   ├── Alerts.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Notfound.jsx
│   │   │   ├── Productdetails.jsx
│   │   │   ├── Products.jsx
│   │   │   └── Watchlist.jsx
│   │   │
│   │   ├── api.js
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── plasticprice/
│   ├── app.py
│   ├── allcategories.py
│   ├── fetchprices.py
│   ├── loadcategories.py
│   ├── sync_api_ids.py
│   ├── testapi.py
│   ├── updateprice.py
│   ├── requirements.txt
│   └── HK_backup.dump
│
└── extra/
    ├── .prettierignore
    ├── .prettierrc
    ├── components.json
    └── eslint.config.js
```

---

# 🚀 Installation & Setup

## Prerequisites

* Python 3.13+
* Node.js
* npm
* PostgreSQL
* Git

---

## 1. Clone the Repository

```bash
git clone https://github.com/HK51104/JP.git
cd JP
```

---

## 2. Backend Setup

```bash
cd plasticprice
```

Create a virtual environment:

```bash
python -m venv venv
```

### Windows

```powershell
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the API:

```bash
py -m uvicorn app:app --reload
```

The API will be available at:

```text
http://127.0.0.1:8000
```

Interactive API documentation:

```text
http://127.0.0.1:8000/docs
```

---

## 3. Frontend Setup

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Vite will provide the local development URL in the terminal.

---

# 🔑 Environment Variables

The backend requires a PostgreSQL database connection.

Example:

```env
DATABASE_URL=your_postgresql_connection_string
```

> Never commit real credentials, passwords, API keys or database connection strings to GitHub.

For production deployments, configure environment variables through the respective hosting platform.

---

# 📡 API Reference

| Method | Endpoint       | Description                                 |
| :----: | -------------- | ------------------------------------------- |
|  `GET` | `/`            | API health/root endpoint                    |
|  `GET` | `/products`    | Retrieve available products                 |
|  `GET` | `/categories`  | Retrieve product categories                 |
| `POST` | `/sync-prices` | Synchronize latest prices and store history |

---

## `GET /products`

Returns product information consumed by the frontend.

---

## `GET /categories`

Returns available product categories.

---

## `POST /sync-prices`

Triggers the price synchronization pipeline.

Example:

```bash
curl -X POST https://jp-pfin.onrender.com/sync-prices
```

Example response:

```json
{
  "message": "Sync completed",
  "updated": 100,
  "skipped": 5,
  "total": 105
}
```

---

# ☁️ Deployment

POLYMETRIC uses separate services for the major parts of the application.

| Layer                 | Technology      |
| --------------------- | --------------- |
| Frontend              | Vercel          |
| Backend               | Render          |
| Database              | Neon PostgreSQL |
| Automation            | GitHub Actions  |
| External Pricing Data | CredCo API      |

This separation keeps the frontend, backend, database and automation pipeline independent.

---

# 🗺️ Roadmap

POLYMETRIC is currently focused on **price intelligence**.

The long-term roadmap is significantly broader.

### 📈 Price Intelligence

* Advanced price charts
* Price movement analysis
* Historical comparisons
* Market trend analysis
* More advanced alert conditions

### 📦 Inventory

* Inventory tracking
* Stock levels
* Low-stock alerts
* Material movement

### 🤝 Trading

* Purchase management
* Sales management
* Supplier management
* Customer management
* Margin calculations
* Quotations

### 🧾 Business Management

* Invoicing
* Order management
* Customer accounts
* Supplier accounts
* Trading history
* Business analytics

### 🏢 Long-Term

**A complete ERP platform built specifically around plastic raw-material trading.**

---

# 🎯 Vision

POLYMETRIC started with one question:

> **Can the information traders constantly track manually be turned into software?**

The answer is what this project is becoming.

```text
PRICE TRACKING
       │
       ▼
PRICE INTELLIGENCE
       │
       ▼
MARKET MONITORING
       │
       ▼
TRADING MANAGEMENT
       │
       ▼
INVENTORY MANAGEMENT
       │
       ▼
BUSINESS MANAGEMENT
       │
       ▼
PLASTIC TRADING ERP
```

The goal isn't simply to show today's price.

The goal is to eventually build the **digital infrastructure around the entire plastic raw-material trading workflow.**

---

# 👨‍💻 Author

### Himanshu Khureja

B.Tech Computer Science Engineering

**GitHub:**
https://github.com/HK51104

---

# ⭐ Support

If you find POLYMETRIC interesting, consider giving the repository a ⭐.

---

### Built around a real-world problem. Engineered as a product. ⚡

**Till then, keep watching the market. POLYMETRIC is just getting started.**
