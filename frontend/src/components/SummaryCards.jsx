import { formatNum } from '../utils/format';

function Card({ label, value, accent }) {
  const accentMap = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
  };
  const cls = accentMap[accent] || accentMap.blue;

  return (
    <div className={`border rounded-xl p-5 flex flex-col gap-1 ${cls}`}>
      <span className="text-xs font-medium uppercase tracking-wide opacity-70">{label}</span>
      <span className="text-2xl font-bold">{value}</span>
    </div>
  );
}

export default function SummaryCards({ summary }) {
  if (!summary) return null;

  const { totalStocks, positiveCount, negativeCount, avgPE } = summary;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      <Card label="Total Stocks" value={totalStocks ?? 'N/A'} accent="blue" />
      <Card label="Gainers" value={positiveCount ?? 'N/A'} accent="green" />
      <Card label="Losers" value={negativeCount ?? 'N/A'} accent="red" />
      <Card label="Avg P/E" value={avgPE != null ? formatNum(avgPE) : 'N/A'} accent="purple" />
    </div>
  );
}
