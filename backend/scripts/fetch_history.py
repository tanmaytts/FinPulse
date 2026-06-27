"""
Fetch daily OHLCV price history for a single NSE ticker via yfinance.

Usage:
    python3 fetch_history.py RELIANCE.NS 1y
    python3 fetch_history.py TCS.NS 6mo

Period accepts any yfinance period string (e.g. 1mo, 6mo, 1y, 2y, max).

Output:
    A JSON array printed to stdout, one object per trading day:
    {date, open, high, low, close, volume}
"""

import sys
import json

import yfinance as yf


def fetch_history(ticker, period):
    """Return a list of daily OHLCV rows for `ticker` over `period`."""
    frame = yf.Ticker(ticker).history(period=period, interval="1d")

    rows = []
    for index, row in frame.iterrows():
        rows.append(
            {
                "date": index.strftime("%Y-%m-%d"),
                "open": round(float(row["Open"]), 2),
                "high": round(float(row["High"]), 2),
                "low": round(float(row["Low"]), 2),
                "close": round(float(row["Close"]), 2),
                "volume": int(row["Volume"]),
            }
        )
    return rows


def main(argv):
    if len(argv) < 2:
        print("usage: fetch_history.py <TICKER> [PERIOD]", file=sys.stderr)
        return 2

    ticker = argv[1]
    period = argv[2] if len(argv) > 2 else "1y"

    json.dump(fetch_history(ticker, period), sys.stdout)
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
