# FinPulse

FinPulse is a stock-market monitoring platform that tracks 20+ listed Indian companies. It aggregates live and historical market data along with fundamental metrics (price, market cap, P/E, EPS) into a single, interactive dashboard.

Built for AlgoLabs Assignment-1, Society of Finance and Investing (SoFI) Core Inductions.

## Architecture

```
React (Vite) dashboard  -->  Express REST API  -->  Python (yfinance)
     (Vercel)                   (Render)             quotes / OHLCV
                                   |
                                   +-->  Supabase (Postgres)
                                         companies, fundamentals, price_history
```

* Frontend: React + Vite + Tailwind, charts via Recharts / lightweight-charts.
* Backend: Express (Node) REST API. It spawns Python child processes that use yfinance to fetch market data, then stores it in Supabase.
* Database: Supabase (Postgres).
* Data source: yfinance (NSE tickers, with the `.NS` suffix).

## Project structure

```
backend/    Express API and Python data scripts
frontend/   React dashboard
db/         Postgres schema
docs/       Project report
```

## Status

Under active development. Setup, usage, and API documentation will be completed as the build progresses.
