import axios from 'axios'

const TOKEN_HEADER_CANDIDATES = [
  'authorization',
  'Authorization',
  'x-access-token',
  'X-Access-Token',
  'x-auth-token',
  'X-Auth-Token',
  'token',
  'Token',
]

const normalizeToken = (value) => {
  if (typeof value !== 'string') {
    return null
  }

  const trimmed = value.trim()
  if (!trimmed) {
    return null
  }

  if (/^Bearer\s+/i.test(trimmed)) {
    return trimmed.replace(/^Bearer\s+/i, '').trim() || null
  }

  return trimmed
}

export const getAuthTokenFromResponse = (response) => {
  const data = response?.data ?? {}
  const bodyToken = data.token
    ?? data.accessToken
    ?? data.access_token
    ?? data.jwt
    ?? data.data?.token
    ?? data.data?.accessToken
    ?? data.data?.access_token
    ?? data.data?.jwt
    ?? null

  if (bodyToken) {
    const normalized = normalizeToken(bodyToken)
    if (normalized) {
      return normalized
    }
  }

  const headers = response?.headers ?? {}
  for (const headerName of TOKEN_HEADER_CANDIDATES) {
    const headerValue = headers[headerName]
    if (headerValue) {
      const normalized = normalizeToken(Array.isArray(headerValue) ? headerValue[0] : headerValue)
      if (normalized) {
        return normalized
      }
    }
  }

  return null
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api',
  timeout: 5000,
})

const normalizeProfileImageUrl = (value) => {
  if (typeof value !== 'string') {
    return value
  }

  const trimmed = value.trim()
  if (!trimmed) {
    return trimmed
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed
  }

  if (trimmed.startsWith('/uploads/')) {
    const apiBase = api.defaults.baseURL ?? 'http://localhost:8080/api'
    try {
      const normalizedOrigin = new URL(apiBase).origin
      return `${normalizedOrigin}${trimmed}`
    } catch {
      return trimmed
    }
  }

  return trimmed
}

const normalizeAuthToken = (token) => {
  if (typeof token !== 'string') {
    return null
  }

  const trimmed = token.trim()
  if (!trimmed) {
    return null
  }

  return /^Bearer\s+/i.test(trimmed)
    ? trimmed.replace(/^Bearer\s+/i, '').trim()
    : trimmed
}

const withAuthHeader = (token) => {
  const normalized = normalizeAuthToken(token)
  if (!normalized) {
    return {}
  }

  return { headers: { Authorization: `Bearer ${normalized}` } }
}

const requestFirstSuccessful = async (requests) => {
  let lastError = null

  console.log('requestFirstSuccessful: starting batch, total requests:', requests.length);

  for (const request of requests) {
    try {
      console.log('Attempting request...');
      const result = await request();
      console.log('Request succeeded:', result);
      return result;
    } catch (error) {
      console.log('Request failed:', error);
      lastError = error
    }
  }

  console.error('All requests failed. Last error:', lastError);
  throw lastError ?? new Error('API_REQUEST_FAILED')
}

export const productAPI = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
}

export const cartAPI = {
  getCart: () => api.get('/cart'),
  addToCart: (productId, size, quantity) =>
    api.post('/cart', { productId, size, quantity }),
  removeFromCart: (id) => api.delete(`/cart/${id}`),
}

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (payload) => {
    console.log('authAPI.register called with:', payload);
    console.log('Simplified API call: POST /auth/register');
    return api.post('/auth/register', payload);
  },
  me: (token) => api.get('/users/me', withAuthHeader(token)),
  updateProfile: (payload, token) => api.put('/users/me', payload, withAuthHeader(token)),
  changePassword: (payload, token) => api.post('/users/me/change-password', payload, withAuthHeader(token)),
  uploadProfileImage: (file, token) => {
    const data = new FormData()
    data.append('image', file)
    return api.post('/users/me/avatar', data, withAuthHeader(token))
  },
}

export const orderAPI = {
  getByUserId: (userId, token) => api.get(`/orders/user/${userId}`, withAuthHeader(token)),
  getById: (orderId, token) => api.get(`/orders/${orderId}`, withAuthHeader(token)),
  getByNumber: (orderNumber, token) => api.get(`/orders/number/${encodeURIComponent(orderNumber)}`, withAuthHeader(token)),
  createOrder: (orderData, token) => api.post('/orders/create', orderData, withAuthHeader(token)),
  addItemToOrder: (orderId, itemData, token) => api.post(`/orders/${orderId}/items`, itemData, withAuthHeader(token)),
  confirmOrder: (orderId, token) => api.post(`/orders/${orderId}/confirm`, {}, withAuthHeader(token)),
  confirmOrderByNumber: (orderNumber, payload, token) =>
    api.post(`/orders/number/${encodeURIComponent(orderNumber)}/confirm`, payload, withAuthHeader(token)),
  cancelOrderById: (orderId, payload, token) => api.post(`/orders/${orderId}/cancel`, payload, withAuthHeader(token)),
}

export const normalizeProfileImageFromApi = normalizeProfileImageUrl

export default api
