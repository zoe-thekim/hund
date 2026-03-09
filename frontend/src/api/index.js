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

const withAuthHeader = (token) => (
  token
    ? { headers: { Authorization: `Bearer ${token}` } }
    : {}
)

const requestFirstSuccessful = async (requests) => {
  let lastError = null

  console.log('requestFirstSuccessful 시작, 요청 개수:', requests.length);

  for (const request of requests) {
    try {
      console.log('요청 시도 중...');
      const result = await request();
      console.log('요청 성공:', result);
      return result;
    } catch (error) {
      console.log('요청 실패:', error);
      lastError = error
    }
  }

  console.error('모든 요청 실패, 마지막 에러:', lastError);
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
    console.log('authAPI.register 호출됨:', payload);
    console.log('단순화된 API 호출: POST /auth/register');
    return api.post('/auth/register', payload);
  },
  me: (token) => requestFirstSuccessful([
    () => api.get('/users/me', withAuthHeader(token)),
    () => api.get('/auth/me', withAuthHeader(token)),
    () => api.get('/me', withAuthHeader(token)),
  ]),
  updateProfile: (payload, token, userId = null) => requestFirstSuccessful([
    () => api.patch('/users/me', payload, withAuthHeader(token)),
    () => api.put('/users/me', payload, withAuthHeader(token)),
    () => api.patch('/auth/me', payload, withAuthHeader(token)),
    () => api.put('/auth/me', payload, withAuthHeader(token)),
    ...(userId
      ? [
        () => api.patch(`/users/${userId}`, payload, withAuthHeader(token)),
        () => api.put(`/users/${userId}`, payload, withAuthHeader(token)),
      ]
      : []),
  ]),
  changePassword: (payload, token, userId = null) => requestFirstSuccessful([
    () => api.patch('/auth/password', payload, withAuthHeader(token)),
    () => api.post('/auth/change-password', payload, withAuthHeader(token)),
    () => api.patch('/users/me/password', payload, withAuthHeader(token)),
    () => api.post('/users/me/password', payload, withAuthHeader(token)),
    ...(userId
      ? [
        () => api.patch(`/users/${userId}/password`, payload, withAuthHeader(token)),
        () => api.post(`/users/${userId}/password`, payload, withAuthHeader(token)),
      ]
      : []),
  ]),
}

export default api
