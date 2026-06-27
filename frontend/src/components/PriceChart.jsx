import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { fetchStockHistory } from '../api/client';
import { Loading, ErrorView, EmptyView } from './StateViews';
import { formatPrice } from '../utils/format';

const RANGES = ['1M', '6M', '1Y'];

function formatDate(dateStr, range) {
  const d = new Date(dateStr);
  if (range === '1M') {
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }
  return d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) return null;
  const val = payload[0].value;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md px-3 py-2 text-sm">
      <p className="text-gray-500 text-xs mb-1">{label}</p>
      <p className="font-semibold text-blue-700">{formatPrice(val)}</p>
    </div>
  );
}

export default function PriceChart({ ticker }) {
  const [range, setRange] = useState('1M');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!ticker) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchStockHistory(ticker, range)
      .then((data) => {
        if (!cancelled) {
          setHistory(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [ticker, range]);

  const chartData = history.map((row) => ({
    date: formatDate(row.date, range),
    close: row.close,
    rawDate: row.date,
  }));

  const minClose =
    chartData.length > 0
      ? Math.min(...chartData.map((d) => d.close).filter((v) => v != null))
      : 0;
  const maxClose =
    chartData.length > 0
      ? Math.max(...chartData.map((d) => d.close).filter((v) => v != null))
      : 0;
  const padding = (maxClose - minClose) * 0.1 || 10;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Price History
        </h2>
        <div className="flex gap-1">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                range === r
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {loading && <Loading message={`Loading ${range} price history...`} />}
      {!loading && error && (
        <ErrorView
          error={error}
          endpoint={`/api/stocks/${ticker}/history?range=${range}`}
        />
      )}
      {!loading && !error && chartData.length === 0 && (
        <EmptyView message="No price history available for this range." />
      )}
      {!loading && !error && chartData.length > 0 && (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart
            data={chartData}
            margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[minClose - padding, maxClose + padding]}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
              width={72}
              tickFormatter={(v) => `Rs ${Number(v).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="close"
              stroke="#2563eb"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#2563eb' }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
