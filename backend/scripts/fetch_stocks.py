"""
Fetch quote + fundamental data for one or more NSE tickers via yfinance.

Usage:
    python3 fetch_stocks.py RELIANCE.NS TCS.NS INFY.NS

Output:
    A JSON array printed to stdout, one object per ticker. Any per-ticker
    failure is reported inside that object's "error" field rather than
    crashing the whole run, so a single bad ticker never breaks ingestion.
"""

import sys
import json
import time

import yfinance as yf

# Yahoo throttles rapid bursts (HTTP 429). A short pause between tickers keeps
# a full 20-stock ingestion run comfortably under the limit.
DELAY_BETWEEN_TICKERS = 0.5


def _first(info, keys, default=None):
    """Return the first present, non-null value among `keys` in `info`."""
    for key in keys:
        value = info.get(key)
        if value is not None:
            return value
    return default


def fetch_one(ticker):
    """Build a single normalized fundamentals record for `ticker`."""
    info = yf.Ticker(ticker).info

    price = _first(info, ["currentPrice", "regularMarketPrice"])
    prev_close = _first(info, ["regularMarketPreviousClose", "previousClose"])

    # Prefer computing the day change ourselves; it is more reliable than the
    # provider's pre-computed field, whose units (fraction vs. percent) vary.
    day_change_pct = None
    if price is not None and prev_close:
        day_change_pct = round((price - prev_close) / prev_close * 100, 2)

    return {
        "ticker": ticker,
        "name": _first(info, ["longName", "shortName"], ticker),
        "sector": info.get("sector"),
        "industry": info.get("industry"),
        "exchange": info.get("exchange"),
        "price": price,
        "market_cap": info.get("marketCap"),
        "pe_ratio": _first(info, ["trailingPE"]),
        "eps": _first(info, ["trailingEps"]),
        "day_change_pct": day_change_pct,
        "volume": _first(info, ["volume", "regularMarketVolume"]),
        "week52_high": info.get("fiftyTwoWeekHigh"),
        "week52_low": info.get("fiftyTwoWeekLow"),
    }


def main(argv):
    tickers = argv[1:]
    if not tickers:
        print("usage: fetch_stocks.py <TICKER> [TICKER ...]", file=sys.stderr)
        return 2

    results = []
    for index, ticker in enumerate(tickers):
        if index > 0:
            time.sleep(DELAY_BETWEEN_TICKERS)
        try:
            results.append(fetch_one(ticker))
        except Exception as exc:  # noqa: BLE001 - report, never abort the batch
            results.append({"ticker": ticker, "error": str(exc)})

    json.dump(results, sys.stdout)
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
