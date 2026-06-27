import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchStock } from '../api/client';
import PriceChart from '../components/PriceChart';
import { Loading, ErrorView } from '../components/StateViews';
import {
  formatPrice,
  formatPct,
  formatMarketCap,
  formatNum,
  formatVolume,
  changePctColor,
} from '../utils/format';

function FundamentalsRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-500 font-medium">{label}</span>
      <span className="text-sm font-semibold text-gray-800 font-mono">{value}</span>
    </div>
  );
}

export default function StockDetail() {
  const { ticker } = useParams();
  const navigate = useNavigate();
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const decodedTicker = decodeURIComponent(ticker);

  useEffect(() => {
    if (!decodedTicker) return;
    setLoading(true);
    setError(null);
    fetchStock(decodedTicker)
      .then((data) => {
        setStock(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, [decodedTicker]);

  if (loading) {
    return (
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Loading message={`Loading ${decodedTicker}...`} />
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-blue-600 hover:underline mb-4 inline-block"
        >
          Back
        </button>
        <ErrorView error={error} endpoint={`/api/stocks/${decodedTicker}`} />
      </main>
    );
  }

  if (!stock) return null;

  const changeColor = changePctColor(stock.day_change_pct);

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-blue-600 hover:underline mb-5 inline-block"
      >
        Back to Dashboard
      </button>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-bold text-gray-900">{stock.name}</h1>
              <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded">
                {stock.ticker}
              </span>
              {stock.exchange && (
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                  {stock.exchange}
                </span>
              )}
            </div>
            {stock.sector && (
              <p className="text-sm text-gray-500">
                {stock.sector}
                {stock.industry ? ` - ${stock.industry}` : ''}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900 font-mono">
              {formatPrice(stock.price)}
            </p>
            <p className={`text-sm font-semibold font-mono ${changeColor}`}>
              {formatPct(stock.day_change_pct)} today
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PriceChart ticker={decodedTicker} />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Fundamentals
          </h2>
          <FundamentalsRow label="Market Cap" value={formatMarketCap(stock.market_cap)} />
          <FundamentalsRow label="P/E Ratio" value={formatNum(stock.pe_ratio)} />
          <FundamentalsRow label="EPS" value={formatNum(stock.eps)} />
          <FundamentalsRow label="Volume" value={formatVolume(stock.volume)} />
          <FundamentalsRow label="52W High" value={formatPrice(stock.week52_high)} />
          <FundamentalsRow label="52W Low" value={formatPrice(stock.week52_low)} />
        </div>
      </div>
    </main>
  );
}
