import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../../api'
import AuthPage from '../../components/auth/AuthPage'
import FormField from '../../components/auth/FormField'
import { verifyUserCredentials } from '../../db/userTable'
import useStore from '../../store/useStore'

const Login = () => {
  const navigate = useNavigate()
  const login = useStore((state) => state.login)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const performLogin = (user, token) => {
    login(user, token, rememberMe)
    navigate('/mypage')
  }

  const handleEmailLogin = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setIsLoading(true)

    const localUser = verifyUserCredentials(email, password)
    if (localUser) {
      performLogin(localUser, null)
      setIsLoading(false)
      return
    }

    try {
      const response = await authAPI.login(email, password)
      const data = response?.data ?? {}
      const user = data.user ?? {
        email,
        name: email.split('@')[0],
      }
      const token = data.token ?? data.accessToken ?? null

      performLogin(user, token)
    } catch (error) {
      const status = error?.response?.status
      if (status === 401) {
        setErrorMessage('이메일 또는 비밀번호를 확인해주세요.')
      } else {
        setErrorMessage('로그인에 실패했습니다. 잠시 후 다시 시도해주세요.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = (provider) => {
    setErrorMessage(`${provider} 로그인은 준비 중입니다.`)
  }

  return (
    <AuthPage
      title="로그인"
      subtitle="October에 오신 것을 환영합니다"
      footer={(
        <p>
          아직 계정이 없으신가요? <Link to="/register">회원가입</Link>
        </p>
      )}
    >
      <div className="auth-socials">
        <button type="button" onClick={() => handleSocialLogin('Google')} className="neo-btn">
          <svg width="20" height="20" className="w-5 h-5 mr-3" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Google로 로그인
        </button>

        <button type="button" onClick={() => handleSocialLogin('카카오')} className="neo-btn neo-btn-kakao">
          <svg width="20" height="20" className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 01-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z" />
          </svg>
          카카오로 로그인
        </button>
      </div>

      <div className="auth-divider">
        <span>또는 이메일로 로그인</span>
      </div>

      <form onSubmit={handleEmailLogin} className="auth-form">
        <FormField label="이메일" htmlFor="email">
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="glass-input"
            placeholder="이메일을 입력하세요"
            required
          />
        </FormField>

        <FormField label="비밀번호" htmlFor="password">
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="glass-input"
            placeholder="비밀번호를 입력하세요"
            required
          />
        </FormField>

        <div className="auth-options">
          <label className="remember-wrap">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <span>로그인 상태 유지</span>
          </label>
        </div>

        {errorMessage ? <p className="auth-error">{errorMessage}</p> : null}

        <button type="submit" disabled={isLoading} className="neo-btn neo-btn-primary">
          {isLoading ? '로그인 중...' : '로그인'}
        </button>
      </form>
    </AuthPage>
  )
}

export default Login
