import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
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
import useStore from './store/useStore'

function App() {
  const initializeAuth = useStore((state) => state.initializeAuth)

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

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
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/mypage" element={<MyPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
