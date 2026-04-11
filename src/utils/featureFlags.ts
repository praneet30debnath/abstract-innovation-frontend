const ORDERS_ENABLED_GLOBAL = process.env.REACT_APP_ENABLE_ORDERS === 'true';

const ORDERS_WHITELIST: string[] = (process.env.REACT_APP_ORDERS_WHITELIST || '')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean);

export function isOrdersEnabled(email?: string): boolean {
  if (ORDERS_ENABLED_GLOBAL) return true;
  if (email && ORDERS_WHITELIST.includes(email.toLowerCase())) return true;
  return false;
}

export const ORDERS_ENABLED = ORDERS_ENABLED_GLOBAL;

export function isWhitelisted(email?: string): boolean {
  if (!email) return false;
  return ORDERS_WHITELIST.includes(email.toLowerCase());
}
