// TODO: replace fixed rate with live FX + multi-currency support (USD/INR/EUR/...).
export const INR_PER_USD = 83;

export const usdToInr = (usd: number): number => usd * INR_PER_USD;
export const inrToUsd = (inr: number): number => inr / INR_PER_USD;

export const fmtInr = (n: number): string =>
  "₹" + Math.round(n).toLocaleString("en-IN");

export const fmtInrK = (n: number): string => {
  if (n >= 1000) return "₹" + (n / 1000).toFixed(n >= 10_000 ? 0 : 1) + "k";
  return "₹" + Math.round(n);
};
