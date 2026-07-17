import { ApiResponse, PaginatedResponse } from '@yaharika/shared-types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('yaharika-token');
}

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<ApiResponse<T>> {
  const { params, ...fetchOptions } = options;

  let url = `${API_BASE}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const paramStr = searchParams.toString();
    if (paramStr) url += `?${paramStr}`;
  }

  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
    credentials: 'include', // for refresh token cookie
  });

  const data = await response.json();

  if (!response.ok && response.status === 401) {
    // Try to refresh token
    try {
      const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        const newToken = refreshData.data?.accessToken;
        if (newToken) {
          localStorage.setItem('yaharika-token', newToken);
          headers['Authorization'] = `Bearer ${newToken}`;
          // Retry original request
          const retryRes = await fetch(url, { ...fetchOptions, headers, credentials: 'include' });
          return retryRes.json();
        }
      }
    } catch {
      // Refresh failed — clear token
      localStorage.removeItem('yaharika-token');
    }
  }

  return data;
}

// ─── Typed API Client Methods ─────────────────────────────────────────────────

export const api = {
  get: <T>(endpoint: string, params?: FetchOptions['params']) =>
    apiFetch<T>(endpoint, { method: 'GET', params }),

  post: <T>(endpoint: string, body?: unknown) =>
    apiFetch<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  patch: <T>(endpoint: string, body?: unknown) =>
    apiFetch<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  delete: <T>(endpoint: string) =>
    apiFetch<T>(endpoint, { method: 'DELETE' }),
};

// ─── Convenience Query Key Factories ─────────────────────────────────────────

export const queryKeys = {
  shops: (filters?: Record<string, unknown>) => ['shops', filters],
  shop: (id: string) => ['shop', id],
  shopProducts: (shopId: string) => ['shop-products', shopId],
  products: (filters?: Record<string, unknown>) => ['products', filters],
  product: (id: string) => ['product', id],
  orders: (filters?: Record<string, unknown>) => ['orders', filters],
  order: (id: string) => ['order', id],
  groupBuys: () => ['group-buys'],
  groupBuy: (id: string) => ['group-buy', id],
  dealsRadar: (filters?: Record<string, unknown>) => ['deals-radar', filters],
  zeroWaste: (filters?: Record<string, unknown>) => ['zero-waste', filters],
  notifications: () => ['notifications'],
  vendorInsights: () => ['vendor-insights'],
  adminStats: () => ['admin-stats'],
  adminAnalytics: () => ['admin-analytics'],
  swaps: () => ['stock-swaps'],
  loans: () => ['stock-loans'],
  myShop: () => ['my-shop'],
  me: () => ['me'],
} as const;
