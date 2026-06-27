import { useState, useEffect } from 'react';
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { fetchStockHistory } from '../api/client';
import { Loading, ErrorView, EmptyView } from './StateViews';
import { formatPrice, formatVolume } from '../utils/format';

const RANGES = ['1M', '6M', '1Y'];

function formatDate(dateStr, range) {
  const d = new Date(dateStr);
  if (range === '1M') {
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }
  return d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
}

/**
 * Custom candlestick shape rendered as an SVG rect (body) plus a line (wick).
 * Green when close >= open, red when close < open.
 */
function CandlestickShape(props) {
  const { x, y, width, height, open, close, high, low, index, chartData } = props;

  if (
    x === undefined ||
    y === undefined ||
    width === undefined ||
    height === undefined
  ) {
    return null;
  }

  const row = chartData && chartData[index];
  if (!row) return null;

  const isGreen = row.close >= row.open;
  const color = isGreen ? '#16a34a' : '#dc2626';

  // The Bar renders using the candleRange value (high - low) so y/height cover
  // the full wick range. We recompute body bounds from the yScale via the
  // coordinate values already provided by Recharts.
  // y = top of wick (high), y + height = bottom of wick (low)

  const wickX = x + width / 2;
  const wickTop = y;
  const wickBottom = y + height;

  // Body: spans from open to close within the wick range
  // We need to interpolate open/close positions within the wick
  const wickRange = row.high - row.low;
  if (wickRange <= 0) {
    return <line x1={wickX} y1={wickTop} x2={wickX} y2={wickBottom} stroke={color} strokeWidth={1} />;
  }

  const bodyTop = wickTop + ((row.high - Math.max(row.open, row.close)) / wickRange) * height;
  const bodyBottom = wickTop + ((row.high - Math.min(row.open, row.close)) / wickRange) * height;
  const bodyHeight = Math.max(bodyBottom - bodyTop, 1);

  const bodyWidth = Math.max(width * 0.6, 2);
  const bodyX = x + (width - bodyWidth) / 2;

  return (
    <g>
      {/* Wick */}
      <line
        x1={wickX}
        y1={wickTop}
        x2={wickX}
        y2={wickBottom}
        stroke={color}
        strokeWidth={1.5}
      />
      {/* Body */}
      <rect
        x={bodyX}
        y={bodyTop}
        width={bodyWidth}
        height={bodyHeight}
        fill={color}
        stroke={color}
        strokeWidth={0.5}
      />
    </g>
  );
}

function CandleTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) return null;
  const row = payload[0]?.payload;
  if (!row) return null;
  const isGreen = row.close >= row.open;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md px-3 py-2 text-xs">
      <p className="text-gray-500 mb-1">{label}</p>
      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
        <span className="text-gray-500">Open</span>
        <span className="font-semibold font-mono">{formatPrice(row.open)}</span>
        <span className="text-gray-500">High</span>
        <span className="font-semibold font-mono text-green-700">{formatPrice(row.high)}</span>
        <span className="text-gray-500">Low</span>
        <span className="font-semibold font-mono text-red-700">{formatPrice(row.low)}</span>
        <span className="text-gray-500">Close</span>
        <span className={`font-semibold font-mono ${isGreen ? 'text-green-700' : 'text-red-700'}`}>
          {formatPrice(row.close)}
        </span>
        <span className="text-gray-500">Volume</span>
        <span className="font-semibold font-mono">{formatVolume(row.volume)}</span>
      </div>
    </div>
  );
}

export default function CandlestickChart({ ticker }) {
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
    open: row.open,
    high: row.high,
    low: row.low,
    close: row.close,
    volume: row.volume,
    // candleRange drives the Bar height so it covers the full high-low span
    candleRange: row.high - row.low,
    // candleBase is the low, so the Bar starts at the right position
    candleBase: row.low,
  }));

  const closes = chartData.map((d) => d.close).filter((v) => v != null);
  const highs = chartData.map((d) => d.high).filter((v) => v != null);
  const lows = chartData.map((d) => d.low).filter((v) => v != null);
  const priceMin = lows.length > 0 ? Math.min(...lows) : 0;
  const priceMax = highs.length > 0 ? Math.max(...highs) : 0;
  const pricePad = (priceMax - priceMin) * 0.08 || 10;

  const volumes = chartData.map((d) => d.volume).filter((v) => v != null);
  const volMax = volumes.length > 0 ? Math.max(...volumes) : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Candlestick + Volume
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
        <>
          {/* Candlestick chart */}
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart
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
                domain={[priceMin - pricePad, priceMax + pricePad]}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
                width={76}
                tickFormatter={(v) =>
                  `Rs ${Number(v).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
                }
              />
              <Tooltip content={<CandleTooltip />} />
              <Bar
                dataKey="candleRange"
                stackId="candle"
                shape={(shapeProps) => (
                  <CandlestickShape {...shapeProps} chartData={chartData} />
                )}
                isAnimationActive={false}
              >
                {chartData.map((entry, i) => (
                  <Cell
                    key={`cell-${i}`}
                    fill={entry.close >= entry.open ? '#16a34a' : '#dc2626'}
                  />
                ))}
              </Bar>
            </ComposedChart>
          </ResponsiveContainer>

          {/* Volume bar chart */}
          <div className="mt-3 border-t border-gray-100 pt-3">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Volume</p>
            <ResponsiveContainer width="100%" height={80}>
              <ComposedChart
                data={chartData}
                margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
              >
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={[0, volMax * 1.1]}
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                  width={52}
                  tickFormatter={(v) => formatVolume(v)}
                />
                <Tooltip
                  formatter={(value) => [formatVolume(value), 'Volume']}
                  labelStyle={{ color: '#6b7280', fontSize: 11 }}
                  contentStyle={{
                    border: '1px solid #e5e7eb',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="volume" isAnimationActive={false} radius={[2, 2, 0, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell
                      key={`vol-cell-${i}`}
                      fill={entry.close >= entry.open ? '#bbf7d0' : '#fecaca'}
                    />
                  ))}
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
