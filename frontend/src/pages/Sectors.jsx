import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { fetchSectors } from '../api/client';
import { Loading, ErrorView, EmptyView } from '../components/StateViews';
import { formatMarketCap } from '../utils/format';

const SECTOR_COLORS = [
  '#2563eb',
  '#16a34a',
  '#dc2626',
  '#d97706',
  '#7c3aed',
  '#0891b2',
  '#db2777',
  '#65a30d',
  '#ea580c',
  '#6366f1',
];

function SectorTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) return null;
  const val = payload[0].value;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md px-3 py-2 text-sm">
      <p className="text-gray-700 font-semibold mb-1">{label}</p>
      <p className="text-blue-700 font-mono text-xs">{formatMarketCap(val)}</p>
    </div>
  );
}

export default function Sectors() {
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchSectors()
      .then((data) => {
        if (!cancelled) {
          // Sort by total market cap descending for chart readability
          const sorted = [...data].sort((a, b) => b.totalMarketCap - a.totalMarketCap);
          setSectors(sorted);
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
  }, []);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Sector Overview</h1>

      {loading && <Loading message="Loading sector data..." />}
      {!loading && error && (
        <ErrorView error={error} endpoint="/api/market/sectors" />
      )}
      {!loading && !error && sectors.length === 0 && (
        <EmptyView message="No sector data available." />
      )}

      {!loading && !error && sectors.length > 0 && (
        <>
          {/* Bar chart: total market cap by sector */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-8">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
              Total Market Cap by Sector
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={sectors}
                margin={{ top: 4, right: 16, left: 0, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="sector"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                  angle={-35}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                  width={80}
                  tickFormatter={(v) => formatMarketCap(v)}
                />
                <Tooltip content={<SectorTooltip />} />
                <Bar dataKey="totalMarketCap" radius={[4, 4, 0, 0]} isAnimationActive={true}>
                  {sectors.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={SECTOR_COLORS[index % SECTOR_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Sector table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Sector Details
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Sector
                    </th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Companies
                    </th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Total Market Cap
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Tickers
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {sectors.map((s, idx) => (
                    <tr
                      key={s.sector}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-5 py-3 font-medium text-gray-800">
                        <span
                          className="inline-block w-2.5 h-2.5 rounded-full mr-2"
                          style={{
                            backgroundColor:
                              SECTOR_COLORS[idx % SECTOR_COLORS.length],
                          }}
                        />
                        {s.sector}
                      </td>
                      <td className="px-5 py-3 text-right font-mono text-gray-700">
                        {s.count}
                      </td>
                      <td className="px-5 py-3 text-right font-mono text-gray-700">
                        {formatMarketCap(s.totalMarketCap)}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex flex-wrap gap-1">
                          {(s.tickers || []).map((t) => (
                            <span
                              key={t}
                              className="text-xs bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
