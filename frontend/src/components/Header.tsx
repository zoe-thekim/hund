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

        <div className="svgRoot-comp-kc83l6g0-icon">
            <svg data-bbox="7 3 36 45" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" height="50" width="50" data-type="shape">
                <g>
                    <path d="M38.473 34.564L43 39.273v2.298H7v-2.298l4.527-4.71V22.959c0-3.662.88-6.82 2.64-9.474 1.797-2.729 4.294-4.504 7.492-5.326V6.532c0-.972.323-1.803.97-2.495C23.275 3.346 24.066 3 25 3c.934 0 1.734.346 2.398 1.037.665.692.997 1.523.997 2.495v1.626c3.162.822 5.64 2.616 7.437 5.382 1.76 2.654 2.641 5.793 2.641 9.418v11.606zM25 48c-1.364 0-2.523-.47-3.477-1.411-.955-.94-1.432-2.078-1.432-3.41h9.818c0 1.332-.487 2.47-1.46 3.41C27.473 47.529 26.324 48 25 48z" fill-rule="evenodd"></path>
                </g>
            </svg>
        </div>

        <div id="defaultAvatar-comp-kc83l6g0" className="aBATL4 wixui-vector-image">
            <div data-testid="svgRoot-defaultAvatar-comp-kc83l6g0" className="VDJedC l4CAhn aBATL4">
                <svg data-bbox="0 0 50 50" data-type="shape" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50">
                    <g>
                        <path d="M25 48.077c-5.924 0-11.31-2.252-15.396-5.921 2.254-5.362 7.492-8.267 15.373-8.267 7.889 0 13.139 3.044 15.408 8.418-4.084 3.659-9.471 5.77-15.385 5.77m.278-35.3c4.927 0 8.611 3.812 8.611 8.878 0 5.21-3.875 9.456-8.611 9.456s-8.611-4.246-8.611-9.456c0-5.066 3.684-8.878 8.611-8.878M25 0C11.193 0 0 11.193 0 25c0 .915.056 1.816.152 2.705.032.295.091.581.133.873.085.589.173 1.176.298 1.751.073.338.169.665.256.997.135.515.273 1.027.439 1.529.114.342.243.675.37 1.01.18.476.369.945.577 1.406.149.331.308.657.472.98.225.446.463.883.714 1.313.182.312.365.619.56.922.272.423.56.832.856 1.237.207.284.41.568.629.841.325.408.671.796 1.02 1.182.22.244.432.494.662.728.405.415.833.801 1.265 1.186.173.154.329.325.507.475l.004-.011A24.886 24.886 0 0 0 25 50a24.881 24.881 0 0 0 16.069-5.861.126.126 0 0 1 .003.01c.172-.144.324-.309.49-.458.442-.392.88-.787 1.293-1.209.228-.232.437-.479.655-.72.352-.389.701-.78 1.028-1.191.218-.272.421-.556.627-.838.297-.405.587-.816.859-1.24a26.104 26.104 0 0 0 1.748-3.216c.208-.461.398-.93.579-1.406.127-.336.256-.669.369-1.012.167-.502.305-1.014.44-1.53.087-.332.183-.659.256-.996.126-.576.214-1.164.299-1.754.042-.292.101-.577.133-.872.095-.89.152-1.791.152-2.707C50 11.193 38.807 0 25 0">
                        </path>
                    </g>
                </svg>
            </div>
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
