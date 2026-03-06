import { Link } from 'react-router-dom'
import useStore from '../store/useStore'

const Header = () => {
  const isLoggedIn = useStore((state) => state.isLoggedIn)
  const logout = useStore((state) => state.logout)

  return (
    <header className="site-header">
      <nav className="site-nav" aria-label="Global">
        <Link to="/" className="site-logo logo-font">
          hund
        </Link>

        <div className="site-menu">
          <Link to="/products" className="site-menu-link">
            Products
          </Link>
          <Link to="/about" className="site-menu-link">
            About
          </Link>
          <Link to="/contact" className="site-menu-link">
            Contact
          </Link>
        </div>

        <div className="site-actions">
          {isLoggedIn ? (
            <>
              <Link to="/mypage" className="site-cta">
                My Page
              </Link>
              <button type="button" className="site-cta site-logout-btn" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-none border border-black bg-black px-6 py-2 text-sm font-semibold uppercase tracking-[0.08em] text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 active:translate-y-0"
            >
              Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}

export default Header
