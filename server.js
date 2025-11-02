import express from "express"
import axios from "axios"
import cheerio from "cheerio"
import sqlite3 from "sqlite3"
import cors from "cors"
import { open } from "sqlite"

const app = express()
app.use(cors())
const PORT = process.env.PORT || 3000

const dbPromise = open({ filename: "./quotes.db", driver: sqlite3.Database })

function parseNumber(value) {
  if (!value) return null
  const cleaned = value.toString().replace(/[^\d.,-]/g, "").replace(",", ".")
  const num = parseFloat(cleaned)
  return isNaN(num) ? null : num
}

async function fetchQuotes(country) {
  const db = await dbPromise
  await db.run(
    "CREATE TABLE IF NOT EXISTS quotes (id INTEGER PRIMARY KEY AUTOINCREMENT, country TEXT, buy REAL, sell REAL, source TEXT, updated_at INTEGER)"
  )
  const now = Date.now()
  const latest = await db.get("SELECT updated_at FROM quotes WHERE country=? ORDER BY updated_at DESC LIMIT 1", country)
  if (latest && now - latest.updated_at < 60000) return await db.all("SELECT buy AS buy_price, sell AS sell_price, source FROM quotes WHERE country=?", country)

  const urls =
    country === "ARS"
      ? [
          "https://www.ambito.com/contenidos/dolar.html",
          "https://www.dolarhoy.com",
          "https://www.cronista.com/MercadosOnline/moneda.html?id=ARSB"
        ]
      : [
          "https://wise.com/es/currency-converter/brl-to-usd-rate",
          "https://nubank.com.br/taxas-conversao/",
          "https://www.nomadglobal.com"
        ]

  const results = []
  for (const url of urls) {
    try {
      const res = await axios.get(url, { timeout: 10000 })
      const $ = cheerio.load(res.data)
      const text = $("body").text()
      const numbers = text.match(/\d+([.,]\d+)?/g)?.slice(0, 2) || []
      const buy = parseNumber(numbers[0])
      const sell = parseNumber(numbers[1])
      if (buy && sell) results.push({ buy_price: buy, sell_price: sell, source: url })
    } catch {}
  }
  await db.run("DELETE FROM quotes WHERE country=?", country)
  for (const r of results)
    await db.run(
      "INSERT INTO quotes (country, buy, sell, source, updated_at) VALUES (?,?,?,?,?)",
      country,
      r.buy_price,
      r.sell_price,
      r.source,
      now
    )
  return results
}

app.get("/quotes", async (req, res) => {
  const country = (req.query.country || "ARS").toUpperCase()
  const data = await fetchQuotes(country)
  res.json(data)
})

app.get("/average", async (req, res) => {
  const country = (req.query.country || "ARS").toUpperCase()
  const data = await fetchQuotes(country)
  if (!data.length) return res.status(500).json({ error: "no data" })
  const avgBuy = data.reduce((a, b) => a + b.buy_price, 0) / data.length
  const avgSell = data.reduce((a, b) => a + b.sell_price, 0) / data.length
  res.json({ average_buy_price: avgBuy, average_sell_price: avgSell })
})

app.get("/slippage", async (req, res) => {
  const country = (req.query.country || "ARS").toUpperCase()
  const data = await fetchQuotes(country)
  if (!data.length) return res.status(500).json({ error: "no data" })
  const avgBuy = data.reduce((a, b) => a + b.buy_price, 0) / data.length
  const avgSell = data.reduce((a, b) => a + b.sell_price, 0) / data.length
  const slip = data.map((d) => ({
    buy_price_slippage: (d.buy_price - avgBuy) / avgBuy,
    sell_price_slippage: (d.sell_price - avgSell) / avgSell,
    source: d.source
  }))
  res.json(slip)
})

app.get("/health", (req, res) => res.json({ ok: true }))

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
