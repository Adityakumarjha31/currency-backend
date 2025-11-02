🪙 Currency Exchange Backend

A Node.js backend providing real-time USD exchange quotes for Argentina (ARS) and Brazil (BRL).
It fetches data from multiple public sources, calculates average prices, and computes slippage between them.

🌐 Live Base URL:

👉 https://currency-backend-3.onrender.com

📚 API Endpoints
1️⃣ Quotes Endpoint

Fetch live USD quotes from 3 different sources.
Method: GET

URLs:

🇦🇷 Argentina (ARS):
👉 https://currency-backend-3.onrender.com/quotes?country=ARS

🇧🇷 Brazil (BRL):
👉 https://currency-backend-3.onrender.com/quotes?country=BRL

Response Example:

[
  {
    "buy_price": 9,
    "sell_price": 9,
    "source": "https://www.dolarhoy.com"
  },
  {
    "buy_price": 1,
    "sell_price": 2,
    "source": "https://www.cronista.com/MercadosOnline/moneda.html?id=ARSB"
  }
]

2️⃣ Average Endpoint

Computes the average buy and sell prices across all sources.
Method: GET

URLs:

🇦🇷 Argentina (ARS):
👉 https://currency-backend-3.onrender.com/average?country=ARS

🇧🇷 Brazil (BRL):
👉 https://currency-backend-3.onrender.com/average?country=BRL

Response Example:

{
  "average_buy_price": 5,
  "average_sell_price": 5.5
}

3️⃣ Slippage Endpoint

Shows how much each source differs from the average, as a percentage.
Method: GET

URLs:

🇦🇷 Argentina (ARS):
👉 https://currency-backend-3.onrender.com/slippage?country=ARS

🇧🇷 Brazil (BRL):
👉 https://currency-backend-3.onrender.com/slippage?country=BRL

Response Example:

[
  {
    "buy_price_slippage": 0.8,
    "sell_price_slippage": 0.636,
    "source": "https://www.dolarhoy.com"
  },
  {
    "buy_price_slippage": -0.8,
    "sell_price_slippage": -0.636,
    "source": "https://www.cronista.com/MercadosOnline/moneda.html?id=ARSB"
  }
]

4️⃣ Root Info

Quick overview of available endpoints.
👉 https://currency-backend-3.onrender.com/

Response Example:

{
  "message": "Currency Backend API is running ✅",
  "available_endpoints": {
    "quotes": "/quotes?country=ARS or /quotes?country=BRL",
    "average": "/average?country=ARS or /average?country=BRL",
    "slippage": "/slippage?country=ARS or /slippage?country=BRL",
    "health": "/health"
  }
}

5️⃣ Health Check

Simple endpoint to verify API uptime.
👉 https://currency-backend-3.onrender.com/health

Response Example:

{ "status": "ok", "time": "2025-11-02T17:00:00Z" }

🛠️ Tech Stack

Node.js + Express.js

Axios (API requests)

Cheerio (Scraping)

SQLite (Database)

CORS enabled

Hosted on Render

🧠 Logic Summary

Fetches quotes from 3 different live sources for ARS & BRL

Averages buy/sell prices

Calculates slippage % for each source

Auto-refreshes every 60 seconds

Fully deployed & accessible over the internet

👨‍💻 Author

Aditya Kumar Jha
📧 adityajha61120@gmail.com

💻 GitHub: Adityakumarjha31
