import { create } from 'zustand'

const AUTH_STORAGE_KEY = 'october_auth'
const AUTH_SESSION_KEY = 'october_auth_session'

const useStore = create((set, get) => ({
  products: [],
  cart: [],
  loading: false,
  authUser: null,
  authToken: null,
  isLoggedIn: false,
  authInitialized: false,

  setProducts: (products) => set({ products }),

  setLoading: (loading) => set({ loading }),

  addToCart: (product, size, quantity) => {
    const { cart } = get()
    const existingItem = cart.find(item => item.id === product.id && item.size === size)

    if (existingItem) {
      set({
        cart: cart.map(item =>
          item.id === product.id && item.size === size
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      })
    } else {
      set({
        cart: [...cart, { ...product, size, quantity }]
      })
    }
  },

  removeFromCart: (productId, size) => {
    const { cart } = get()
    set({
      cart: cart.filter(item => !(item.id === productId && item.size === size))
    })
  },

  updateCartQuantity: (productId, size, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(productId, size)
      return
    }

    const { cart } = get()
    set({
      cart: cart.map(item =>
        item.id === productId && item.size === size
          ? { ...item, quantity }
          : item
      )
    })
  },

  clearCart: () => set({ cart: [] }),

  getTotalPrice: () => {
    const { cart } = get()
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  },

  getTotalItems: () => {
    const { cart } = get()
    return cart.reduce((total, item) => total + item.quantity, 0)
  },

  login: (user, token, rememberMe = true) => {
    const authState = {
      authUser: user,
      authToken: token,
      isLoggedIn: true,
    }

    set(authState)

    if (typeof window !== 'undefined') {
      if (rememberMe) {
        window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState))
        window.sessionStorage.removeItem(AUTH_SESSION_KEY)
      } else {
        window.sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(authState))
        window.localStorage.removeItem(AUTH_STORAGE_KEY)
      }
    }
  },

  updateAuthUser: (nextUser) => {
    const { authToken, isLoggedIn } = get()
    const authState = {
      authUser: nextUser,
      authToken,
      isLoggedIn,
    }

    set({ authUser: nextUser })

    if (typeof window !== 'undefined') {
      const hasLocal = window.localStorage.getItem(AUTH_STORAGE_KEY)
      const hasSession = window.sessionStorage.getItem(AUTH_SESSION_KEY)

      if (hasLocal) {
        window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState))
      } else if (hasSession) {
        window.sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(authState))
      } else if (isLoggedIn) {
        window.sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(authState))
      }
    }
  },

  logout: () => {
    set({
      authUser: null,
      authToken: null,
      isLoggedIn: false,
    })

    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(AUTH_STORAGE_KEY)
      window.sessionStorage.removeItem(AUTH_SESSION_KEY)
    }
  },

  initializeAuth: () => {
    if (typeof window === 'undefined') {
      set({ authInitialized: true })
      return
    }

    const storedAuth =
      window.localStorage.getItem(AUTH_STORAGE_KEY) ??
      window.sessionStorage.getItem(AUTH_SESSION_KEY)
    if (!storedAuth) {
      set({ authInitialized: true })
      return
    }

    try {
      const parsedAuth = JSON.parse(storedAuth)
      if (parsedAuth?.authUser && parsedAuth?.isLoggedIn) {
        set({
          authUser: parsedAuth.authUser,
          authToken: parsedAuth.authToken ?? null,
          isLoggedIn: true,
          authInitialized: true,
        })
        return
      }
    } catch {
      window.localStorage.removeItem(AUTH_STORAGE_KEY)
    }

    set({ authInitialized: true })
  },
}))

export default useStore
