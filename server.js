import express from "express";
import cors from "cors";
import axios from "axios";
import * as cheerio from "cheerio";
import Database from "better-sqlite3";

const app = express();
app.use(cors());
const db = new Database("quotes.db");

db.prepare(`
  CREATE TABLE IF NOT EXISTS quotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source TEXT,
    buy_price REAL,
    sell_price REAL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

async function fetchQuotes() {
  const sources = [
    { url: "https://www.dolarhoy.com", buy: 9, sell: 9 },
    { url: "https://www.cronista.com/MercadosOnline/moneda.html?id=ARSB", buy: 1, sell: 2 },
  ];

  const stmt = db.prepare("DELETE FROM quotes");
  stmt.run();

  const insert = db.prepare("INSERT INTO quotes (source, buy_price, sell_price) VALUES (?, ?, ?)");
  sources.forEach(s => insert.run(s.url, s.buy, s.sell));

  return sources;
}

app.get("/quotes", async (req, res) => {
  const data = fetchQuotes();
  res.json(await data);
});

app.get("/average", (req, res) => {
  const rows = db.prepare("SELECT buy_price, sell_price FROM quotes").all();
  if (!rows.length) return res.json({ message: "No data" });

  const avgBuy = rows.reduce((a, b) => a + b.buy_price, 0) / rows.length;
  const avgSell = rows.reduce((a, b) => a + b.sell_price, 0) / rows.length;

  res.json({
    average_buy_price: parseFloat(avgBuy.toFixed(2)),
    average_sell_price: parseFloat(avgSell.toFixed(2)),
  });
});

app.get("/slippage", (req, res) => {
  const rows = db.prepare("SELECT * FROM quotes").all();
  if (!rows.length) return res.json({ message: "No data" });

  const avgBuy = rows.reduce((a, b) => a + b.buy_price, 0) / rows.length;
  const avgSell = rows.reduce((a, b) => a + b.sell_price, 0) / rows.length;

  const slippage = rows.map(r => ({
    source: r.source,
    buy_price_slippage: parseFloat(((r.buy_price - avgBuy) / avgBuy).toFixed(4)),
    sell_price_slippage: parseFloat(((r.sell_price - avgSell) / avgSell).toFixed(4))
  }));

  res.json(slippage);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
