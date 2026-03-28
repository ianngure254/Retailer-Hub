export const formatCurrency = (
  amount,
  currency = 'KES',
  locale = 'en-KE'
) => {
  if (typeof amount !== 'number' || isNaN(amount)) return '—';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
};
