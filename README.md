# ⚡ POLYMETRIC

### Plastic Raw Material Price Intelligence Platform

**POLYMETRIC** is a price intelligence platform built for the plastic raw-material trading industry.

It brings plastic material prices, grades, historical movements, watchlists, and alerts into a single dashboard — turning raw market pricing data into something traders can actually monitor and use.

The project was inspired by a real-world problem: **making plastic raw-material price tracking easier for traders who deal with polymers every day.**

---

## 🌐 Live Demo

**[POLYMETRIC — Live Website](https://jp-psi-sandy.vercel.app/)**

> The frontend is deployed on Vercel, while the backend API is deployed independently on Render.

---

## 📌 About

Plastic raw-material trading involves constantly changing prices across different materials and grades.

POLYMETRIC is designed to provide a centralized interface where users can:

* Browse plastic raw materials
* View material and grade-wise prices
* Inspect individual product details
* Track price history
* Monitor products through a personal watchlist
* Set up price alerts
* Observe price movements over time
* Automatically synchronize prices from an external pricing source

The long-term vision is to evolve POLYMETRIC from a price-tracking platform into a **complete ERP ecosystem for plastic raw-material trading.**

---

# ✨ Key Features

### 📊 Price Dashboard

A centralized dashboard for monitoring plastic raw-material prices and market information.

### 🧪 Material & Grade Tracking

Browse products according to their respective plastic material and grade.

### 📈 Historical Price Tracking

POLYMETRIC stores historical prices rather than only displaying the latest value.

This makes it possible to observe how prices move over time.

### 🔎 Product Search & Browsing

Browse the available products and inspect individual product information through dedicated product pages.

### ⭐ Watchlist

Users can maintain a personal watchlist of products they want to monitor regularly.

### 🔔 Price Alerts

The application includes an alerts section for monitoring relevant price changes.

### 🔄 Automated Price Synchronization

POLYMETRIC automatically retrieves updated prices from the external pricing source and synchronizes them with the application's database.

The synchronization process:

1. Fetches product data from the external API
2. Reads the latest available price
3. Matches products using their API ID
4. Updates the current price
5. Updates the `last_updated` timestamp
6. Inserts the new price into `price_history`

### 🤖 Scheduled Automation

Price synchronization is automated using **GitHub Actions**.

A scheduled workflow sends a request to the backend's `/sync-prices` endpoint, allowing the database to receive fresh pricing data without manually running the sync script.

### 🌙 Theme Support

The frontend includes a theme toggle for switching between light and dark visual modes.

### ⚡ Independent Frontend & Backend Deployment

The frontend and backend are deployed independently.

This keeps the client application and API layer separated and allows each service to be developed and deployed independently.

---

# 🏗️ System Architecture

```text
                    ┌──────────────────────┐
                    │      CredCo API      │
                    │ External Price Data  │
                    └──────────┬───────────┘
                               │
                               │ Price Data
                               ▼
                    ┌──────────────────────┐
                    │     FastAPI API      │
                    │      Render          │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │   PostgreSQL / Neon  │
                    │                      │
                    │ products             │
                    │ categories           │
                    │ price_history        │
                    └──────────┬───────────┘
                               │
                               │ REST API
                               ▼
                    ┌──────────────────────┐
                    │   React + Vite       │
                    │      Vercel          │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   POLYMETRIC UI      │
                    │                      │
                    │ Dashboard            │
                    │ Products             │
                    │ Product Details      │
                    │ Watchlist             │
                    │ Alerts               │
                    └──────────────────────┘


        GitHub Actions
              │
              │ Scheduled request
              ▼
       POST /sync-prices
              │
              ▼
         FastAPI Backend
              │
              ▼
       Database Price Update
```

---

# 🔄 Automated Price Synchronization

One of the core parts of POLYMETRIC is its automated price-ingestion pipeline.

The backend exposes:

```http
POST /sync-prices
```

The endpoint retrieves the latest product pricing data from the external source.

For every product:

```text
External API
     ↓
Read API ID
     ↓
Read current price
     ↓
Find matching product in DB
     ↓
Update current_price
     ↓
Update last_updated
     ↓
Insert price_history record
```

Products without a valid current price are skipped.

Products that cannot be matched to an existing database record are also skipped rather than being inserted unexpectedly.

The synchronization is wrapped in a database transaction so that an error can trigger a rollback instead of leaving a partially updated synchronization.

---

# ⏰ GitHub Actions Automation

POLYMETRIC uses GitHub Actions to trigger the synchronization automatically.

Workflow:

```text
GitHub Actions
      │
      │ Scheduled execution
      ▼
POST /sync-prices
      │
      ▼
Render FastAPI backend
      │
      ▼
External pricing API
      │
      ▼
PostgreSQL
```

The workflow can also be triggered manually through GitHub Actions.

Example workflow:

```yaml
name: POLYMETRIC Price Sync

on:
  schedule:
    - cron: "30 3 * * *"
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest

    steps:
      - name: Sync plastic prices
        run: curl --fail --max-time 120 -X POST https://jp-pfin.onrender.com/sync-prices
```

This means the price update process does not depend on manually running a Python script every day.

---

# 🛠️ Tech Stack

## Frontend

* React
* Vite
* JavaScript
* Tailwind CSS
* React Router
* CSS
* JavaScript local storage for watchlist functionality

## Backend

* Python
* FastAPI
* Uvicorn
* Requests

## Database

* PostgreSQL
* Neon

## Automation

* GitHub Actions

## Deployment

* Vercel — Frontend
* Render — Backend API
* Neon — PostgreSQL database

## External Data

* CredCo pricing API

---

# 📂 Project Structure

```text
HK/
│
├── .github/
│   └── workflows/
│       └── price-sync.yml
│
├── frontend/
│   │
│   ├── public/
│   │   ├── logo.png
│   │   └── _redirects
│   │
│   └── src/
│       ├── assets/
│       │   ├── hero.png
│       │   ├── react.svg
│       │   └── vite.svg
│       │
│       ├── components/
│       │   ├── APIerror.jsx
│       │   ├── AppShell.jsx
│       │   └── ThemeToggle.jsx
│       │
│       ├── lib/
│       │   └── watchlist.js
│       │
│       ├── pages/
│       │   ├── Alerts.jsx
│       │   ├── Dashboard.jsx
│       │   ├── Notfound.jsx
│       │   ├── Productdetails.jsx
│       │   ├── Products.jsx
│       │   └── Watchlist.jsx
│       │
│       ├── api.js
│       ├── App.css
│       ├── App.jsx
│       ├── index.css
│       └── main.jsx
│
├── plasticprice/
│   │
│   ├── allcategories.py
│   ├── app.py
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

# 🗄️ Data Model

POLYMETRIC uses PostgreSQL to maintain current product information as well as historical pricing data.

### Products

Stores the currently tracked products and their latest prices.

Important information includes:

* Product ID
* External API ID
* Product information
* Current price
* Last updated timestamp

### Categories

Stores the product categories used by the application.

### Price History

Stores historical price observations.

Conceptually:

```text
products
   │
   │ 1
   │
   │
   │ many
   ▼
price_history
```

Every successful price synchronization can create a historical price record, allowing POLYMETRIC to track price movement instead of only showing the latest price.

---

# 📡 API

The FastAPI backend exposes endpoints used by the React frontend and automation pipeline.

## Health / Root

```http
GET /
```

Used to verify that the API is running.

---

## Products

```http
GET /products
```

Returns product information used by the frontend.

---

## Categories

```http
GET /categories
```

Returns available product categories.

---

## Price Synchronization

```http
POST /sync-prices
```

Triggers the automated price synchronization process.

The endpoint:

* Calls the external pricing API
* Matches products using API IDs
* Updates current prices
* Records price history
* Commits the transaction
* Returns synchronization statistics

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

# 🚀 Getting Started

## Prerequisites

Make sure you have:

* Python 3.13+
* Node.js
* npm
* PostgreSQL database
* Git

---

## 1. Clone the Repository

```bash
git clone https://github.com/HK51104/JP.git
cd JP
```

---

# 🐍 Backend Setup

Navigate to the backend:

```bash
cd plasticprice
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```powershell
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run FastAPI:

```bash
py -m uvicorn app:app --reload
```

The API will normally be available at:

```text
http://127.0.0.1:8000
```

FastAPI documentation will be available at:

```text
http://127.0.0.1:8000/docs
```

---

# ⚛️ Frontend Setup

Open another terminal and navigate to:

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

The backend requires a database connection configuration.

Example:

```env
DATABASE_URL=your_postgresql_connection_string
```

Do **not** commit real credentials, database passwords, API keys, or other secrets to GitHub.

For production deployments, configure secrets through the respective hosting platform's environment-variable settings.

---

# 🌍 Deployment

POLYMETRIC is designed as a multi-service application.

### Frontend

The React/Vite frontend is deployed using:

**Vercel**

### Backend

The FastAPI backend is deployed using:

**Render**

### Database

The PostgreSQL database is hosted using:

**Neon**

### Automation

Daily price synchronization is handled using:

**GitHub Actions**

This separation allows the frontend, backend, database, and scheduled automation to operate independently.

---

# 📊 Application Flow

A typical user flow looks like:

```text
User
 │
 ▼
POLYMETRIC Dashboard
 │
 ├── Browse Products
 │
 ├── View Product Details
 │
 ├── Track Price History
 │
 ├── Add Products to Watchlist
 │
 └── Monitor Alerts
```

Meanwhile, the data pipeline operates independently:

```text
Scheduled GitHub Action
          │
          ▼
    POST /sync-prices
          │
          ▼
     FastAPI Backend
          │
          ▼
   External Price API
          │
          ▼
     PostgreSQL
          │
          ▼
  Updated POLYMETRIC Data
```

---

# 🔮 Roadmap

POLYMETRIC is intended to grow beyond price tracking.

Potential future modules include:

* 📈 Advanced price analytics
* 🔔 More sophisticated price alerts
* 📊 Market trend dashboards
* 📉 Price movement analysis
* 📦 Inventory management
* 🧾 Purchase & sales management
* 👥 Customer management
* 💰 Trading and margin analysis
* 📋 Supplier management
* 📑 Quotations and invoicing
* 🏭 Business workflow management
* 🔐 Multi-user business accounts
* 🏢 Complete ERP functionality

The long-term objective is to build **a dedicated ERP ecosystem for plastic raw-material traders.**

---

# 🎯 Vision

POLYMETRIC started with a simple problem:

> **Make plastic raw-material prices easier to understand and track.**

The larger vision is much bigger.

From:

```text
Price Tracking
```

to:

```text
Price Intelligence
       ↓
Market Monitoring
       ↓
Trading Workflows
       ↓
Business Management
       ↓
Complete Plastic Trading ERP
```

---

# 💡 Why POLYMETRIC?

Plastic raw-material trading is heavily dependent on constantly changing market prices.

A trader shouldn't have to rely entirely on scattered sources, manual updates, and historical memory to understand what is happening in the market.

POLYMETRIC aims to turn that information into a centralized, accessible and continuously updated system.

---

# 👨‍💻 Author

### Himanshu Khureja

B.Tech Computer Science Engineering

Interested in building software that solves real-world business problems.

GitHub:

**https://github.com/HK51104**

---

## ⭐ Project

If you find POLYMETRIC interesting, consider giving the repository a ⭐.

---

### Built with code, curiosity, and a real-world problem. ⚡
