export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(number, decimals = 2) {
  return Number(number).toFixed(decimals);
}

export function formatPercentage(number, decimals = 2) {
  return `${Number(number).toFixed(decimals)}%`;
}

export function formatMultiplier(multiplier) {
  return `${Number(multiplier).toFixed(4)}x`;
}

export function formatTime(date) {
  if (!date) return '--:--:--';
  try {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(new Date(date));
  } catch {
    return '--:--:--';
  }
}

export function truncateString(str, length = 10) {
  if (str.length <= length) return str;
  return `${str.slice(0, length)}...`;
}