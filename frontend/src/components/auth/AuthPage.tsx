const AuthPage = ({ title, subtitle, footer, children }) => {
  return (
    <div className="auth-page">
      <div className="auth-shell">
        <div className="auth-card">
          <div className="auth-heading">
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>

          {children}

          {footer ? <div className="auth-footer">{footer}</div> : null}
        </div>
      </div>
    </div>
  )
}

export default AuthPage
