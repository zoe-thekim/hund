import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 5000,
})

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
}

export default api
