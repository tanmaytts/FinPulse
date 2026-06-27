/**
 * Formats a raw rupee value into Indian number convention using crore.
 * Example: 17815499177984 => "Rs 1,78,155 Cr"
 */
export function formatMarketCap(value) {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  const crore = value / 1e7;
  if (crore >= 1e5) {
    // lakh crore range - show as X.XX L Cr
    const lakhCrore = crore / 1e5;
    return `Rs ${lakhCrore.toFixed(2)} L Cr`;
  }
  // Format with Indian grouping (last 3 digits, then groups of 2)
  const str = Math.round(crore).toString();
  const formatted = formatIndianNumber(str);
  return `Rs ${formatted} Cr`;
}

/**
 * Formats a number string into Indian grouping (e.g. 178155 => "1,78,155").
 */
function formatIndianNumber(str) {
  const len = str.length;
  if (len <= 3) return str;
  // last 3 digits stay grouped
  const last3 = str.slice(len - 3);
  const rest = str.slice(0, len - 3);
  // remaining digits grouped in 2s from the right
  const groups = [];
  for (let i = rest.length; i > 0; i -= 2) {
    groups.unshift(rest.slice(Math.max(0, i - 2), i));
  }
  return groups.join(',') + ',' + last3;
}

/**
 * Formats a price in INR rupees.
 */
export function formatPrice(value) {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  return `Rs ${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Formats a percentage with sign and 2 decimal places.
 */
export function formatPct(value) {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  const num = Number(value);
  const sign = num >= 0 ? '+' : '';
  return `${sign}${num.toFixed(2)}%`;
}

/**
 * Returns Tailwind color classes for a percentage change value.
 * Positive returns green, negative returns red, zero returns gray.
 */
export function changePctColor(value) {
  if (value === null || value === undefined || isNaN(value)) return 'text-gray-400';
  return Number(value) >= 0 ? 'text-green-600' : 'text-red-600';
}

/**
 * Formats a plain number with up to 2 decimal places, or 'N/A'.
 */
export function formatNum(value, decimals = 2) {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  return Number(value).toFixed(decimals);
}

/**
 * Formats volume with K/L/Cr suffix.
 */
export function formatVolume(value) {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  const n = Number(value);
  if (n >= 1e7) return `${(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `${(n / 1e5).toFixed(2)} L`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)} K`;
  return n.toString();
}
