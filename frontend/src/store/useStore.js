import { create } from 'zustand'
import { normalizeProfileImageFromApi } from '../api'

const AUTH_STORAGE_KEY = 'october_auth'
const AUTH_SESSION_KEY = 'october_auth_session'

const normalizeImageUrl = (value) => {
  if (typeof value === 'string' && value.trim()) {
    return normalizeProfileImageFromApi(value.trim())
  }
  return null
}

const extractImageUrl = (imageValue) => {
  if (!imageValue) {
    return null
  }

  if (typeof imageValue === 'string') {
    return normalizeImageUrl(imageValue)
  }

  if (typeof imageValue === 'object') {
    return normalizeImageUrl(imageValue.imageUrl)
  }

  return null
}

const normalizeCartProduct = (product) => {
  if (!product || typeof product !== 'object') {
    return product
  }

  const imageCandidates = []

  if (Array.isArray(product.images)) {
    product.images.forEach((imageValue) => {
      const normalizedImage = extractImageUrl(imageValue)
      if (normalizedImage) {
        imageCandidates.push(normalizedImage)
      }
    })
  }

  const legacyImage = extractImageUrl(product.image)
  if (legacyImage) {
    imageCandidates.push(legacyImage)
  }

  const uniqueImages = [...new Set(imageCandidates)]
  if (uniqueImages.length === 0) {
    return product
  }

  return {
    ...product,
    images: uniqueImages,
  }
}

const useStore = create((set, get) => ({
  products: [],
  cart: [],
  cartPulseKey: 0,
  wishlist: [],
  loading: false,
  authUser: null,
  authToken: null,
  isLoggedIn: false,
  authInitialized: false,

  normalizeAuthUser: (user) => {
    if (!user || typeof user !== 'object') {
      return user
    }

    return {
      ...user,
      profileImageUrl: normalizeProfileImageFromApi(user.profileImageUrl),
    }
  },

  setProducts: (products) => set({ products }),

  setLoading: (loading) => set({ loading }),

  addToCart: (product, size, quantity) => {
    const { cart, cartPulseKey } = get()
    const normalizedProduct = normalizeCartProduct(product)
    const normalizedId = normalizedProduct?.id ?? product?.id
    const existingItem = cart.find(item => item.id === normalizedId && item.size === size)

    if (existingItem) {
      set({
        cartPulseKey: cartPulseKey + 1,
        cart: cart.map(item =>
          item.id === normalizedId && item.size === size
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      })
    } else {
      set({
        cartPulseKey: cartPulseKey + 1,
        cart: [...cart, { ...normalizedProduct, size, quantity }]
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

  // Wishlist functions
  addToWishlist: (product) => {
    const { wishlist } = get()
    const normalizedProduct = normalizeCartProduct(product)
    const normalizedId = normalizedProduct?.id ?? product?.id
    const exists = wishlist.find(item => item.id === normalizedId)

    if (!exists) {
      set({
        wishlist: [...wishlist, normalizedProduct]
      })
    }
  },

  removeFromWishlist: (productId) => {
    const { wishlist } = get()
    set({
      wishlist: wishlist.filter(item => item.id !== productId)
    })
  },

  isInWishlist: (productId) => {
    const { wishlist } = get()
    return wishlist.some(item => item.id === productId)
  },

  clearWishlist: () => set({ wishlist: [] }),

  login: (user, token, rememberMe = true) => {
    const normalizedUser = get().normalizeAuthUser(user)
    const authState = {
      authUser: normalizedUser,
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
    const normalizedUser = get().normalizeAuthUser(nextUser)
    const authState = {
      authUser: normalizedUser,
      authToken,
      isLoggedIn,
    }

    set({ authUser: normalizedUser })

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
      const token = typeof parsedAuth?.authToken === 'string' ? parsedAuth.authToken.trim() : ''
      if (parsedAuth?.authUser && parsedAuth?.isLoggedIn && token) {
        const normalizedUser = get().normalizeAuthUser(parsedAuth.authUser)
        set({
          authUser: normalizedUser,
          authToken: token,
          isLoggedIn: true,
          authInitialized: true,
        })
        return
      }

      window.localStorage.removeItem(AUTH_STORAGE_KEY)
      window.sessionStorage.removeItem(AUTH_SESSION_KEY)
    } catch {
      window.localStorage.removeItem(AUTH_STORAGE_KEY)
    }

    set({ authInitialized: true })
  },
}))

export default useStore
