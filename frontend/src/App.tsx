import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/home/Home'
import Products from './pages/products/Products'
import ProductDetail from './pages/products/ProductDetail'
import Cart from './pages/cart/Cart'
import About from './pages/about/About'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import MyPage from './pages/user/MyPage'
import Checkout from './pages/checkout/Checkout'
import OrderConfirmation from './pages/checkout/OrderConfirmation'
import PaymentResult from './pages/checkout/PaymentResult'
import Wishlist from './pages/wishlist/Wishlist'
import useStore from './store/useStore'

function App() {
  const initializeAuth = useStore((state) => state.initializeAuth)
  const isLoggedIn = useStore((state) => state.isLoggedIn)
  const authInitialized = useStore((state) => state.authInitialized)

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  if (!authInitialized) {
    return null
  }

  return (
    <Router>
      <div className="min-h-screen bg-october-bg flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/checkout" element={isLoggedIn ? <Checkout /> : <Navigate to="/login" replace />} />
            <Route path="/checkout/payment-result" element={isLoggedIn ? <PaymentResult /> : <Navigate to="/login" replace />} />
            <Route path="/order-confirmation" element={isLoggedIn ? <OrderConfirmation /> : <Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/mypage" element={isLoggedIn ? <MyPage /> : <Navigate to="/login" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
