import { useEffect, useMemo, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Search, ShoppingBag, User, Heart } from "lucide-react"
import useStore from "../store/useStore"

const Header = () => {
  const isLoggedIn = useStore((state) => state.isLoggedIn)
  const authUser = useStore((state) => state.authUser)
  const logout = useStore((state) => state.logout)
  const cartCount = useStore((state) => state.getTotalItems())
  const cartPulseKey = useStore((state) => state.cartPulseKey)
  const wishlistCount = useStore((state) => state.wishlist.length)
  const profileImageUrl = authUser?.profileImageUrl
  const hasCustomAvatar = typeof profileImageUrl === "string" && profileImageUrl.trim().length > 0
  const [isCartBouncing, setIsCartBouncing] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const navigate = useNavigate()
  const profileMenuRef = useRef<HTMLDivElement | null>(null)
  const profileMenuButtonRef = useRef<HTMLButtonElement | null>(null)

  const profileAlt = useMemo(() => {
    if (typeof authUser?.name === "string" && authUser.name.trim()) {
      return authUser.name.charAt(0).toUpperCase()
    }
    return "P"
  }, [authUser?.name])

  useEffect(() => {
    if (cartPulseKey <= 0) {
      return
    }

    setIsCartBouncing(true)
    const timer = window.setTimeout(() => {
      setIsCartBouncing(false)
    }, 600)

    return () => window.clearTimeout(timer)
  }, [cartPulseKey])

  useEffect(() => {
    const handlePointerEvent = (event: MouseEvent) => {
      const target = event.target as Node | null
      if (!target) {
        return
      }

      if (
        profileMenuRef.current?.contains(target) ||
        profileMenuButtonRef.current?.contains(target)
      ) {
        return
      }

      setIsProfileMenuOpen(false)
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsProfileMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handlePointerEvent)
    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("mousedown", handlePointerEvent)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [])

  const closeProfileMenu = () => setIsProfileMenuOpen(false)

  const handleLogout = () => {
    logout()
    closeProfileMenu()
    navigate("/")
  }

  return (
    <header className="sticky top-0 z-50 bg-[#F5F5F5] border-b border-black/10">
      <div className="max-w-screen-xl mx-auto px-5 md:px-10 flex items-center justify-between h-14">
        <Link
          to="/"
          className="site-logo logo-font"
        >
          hund
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-normal text-black/70 flex-1 justify-center">
          <Link to="/new" className="hover:text-black transition-colors">New</Link>
          <Link to="/about" className="hover:text-black transition-colors">About</Link>
          <Link to="/products" className="hover:text-black transition-colors">Accessories</Link>
          <Link to="/products" className="hover:text-black transition-colors">Sale</Link>
        </nav>

        <div className="flex items-center gap-4 text-black">
          <button
            type="button"
            className="hover:opacity-70 transition-opacity"
            aria-label="Search"
            onClick={() => {
              // TODO: connect to product search modal or page
            }}
          >
            <Search size={18} strokeWidth={1.5} />
          </button>

          <Link
            to="/wishlist"
            className="hover:opacity-70 transition-opacity relative"
            aria-label={`Wishlist ${wishlistCount} items`}
          >
            <Heart size={18} strokeWidth={1.5} />
            {wishlistCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-black text-white text-xs font-medium flex items-center justify-center rounded-full">
                {wishlistCount}
              </span>
            )}
          </Link>

          {isLoggedIn ? (
            <div className="relative">
              <button
                ref={profileMenuButtonRef}
                type="button"
                onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                className="hover:opacity-70 transition-opacity flex items-center justify-center gap-1 text-sm font-normal hidden sm:flex relative"
                aria-label="Open profile menu"
                aria-expanded={isProfileMenuOpen}
                aria-haspopup="true"
              >
                {hasCustomAvatar ? (
                  <img
                    src={profileImageUrl}
                    alt="Profile"
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <span className="w-6 h-6 rounded-full bg-black text-white text-[11px] flex items-center justify-center">
                    {profileAlt}
                  </span>
                )}
              </button>

              {isProfileMenuOpen ? (
                <div
                  ref={profileMenuRef}
                  className="absolute right-0 top-[calc(100%+0.5rem)] w-52 bg-white border border-black/10 shadow-lg py-2 z-50"
                >
                  <Link
                    to="/mypage"
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-black/5 transition-colors flex items-center gap-2 text-black"
                    onClick={closeProfileMenu}
                  >
                    <User size={14} />
                    <span>Mypage</span>
                  </Link>
                  <Link
                    to="/wishlist"
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-black/5 transition-colors flex items-center gap-2 text-black"
                    onClick={closeProfileMenu}
                  >
                    <Heart size={14} />
                    <span>WishList</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-black/5 transition-colors text-black"
                  >
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <Link
              to="/login"
              className="hover:opacity-70 transition-opacity flex items-center gap-1 text-sm font-normal hidden sm:flex"
              aria-label="Sign in"
            >
              <User size={18} strokeWidth={1.5} />
            </Link>
          )}

          <Link
            to="/cart"
            className={`hover:opacity-70 transition-opacity relative ${isCartBouncing ? "cart-pulse-animation" : ""}`}
            aria-label={`Shopping bag ${cartCount} items`}
          >
            <ShoppingBag size={18} strokeWidth={1.5} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-black text-white text-xs font-medium flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Header
