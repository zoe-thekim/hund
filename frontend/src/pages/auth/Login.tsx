import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI, getAuthTokenFromResponse } from '../../api'
import AuthPage from '../../components/auth/AuthPage'
import FormField from '../../components/auth/FormField'
import useStore from '../../store/useStore'
import {Mail, Lock, LockOpen, EyeOff, Eye} from "lucide-react";

const Login = () => {
  const navigate = useNavigate()
  const login = useStore((state) => state.login)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false);

  const performLogin = (user, token) => {
    if (!token) {
      setErrorMessage('로그인 처리 중 토큰을 받지 못했습니다.')
      return
    }

    login(user, token, rememberMe)
    navigate('/mypage')
  }

  const handleEmailLogin = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setIsLoading(true)

    try {
      const response = await authAPI.login(email, password)
      const data = response?.data ?? {}
      const user = data.user ?? {
        email,
        name: email.split('@')[0],
      }
      const token = getAuthTokenFromResponse(response)

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

  return (
      <main className="min-h-screen bg-[#F5F5F5] flex items-center justify-center px-5">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-light text-black mb-2">Welcome Back</h1>
            <p className="text-sm text-black/50">
              Sign in to your hund account
            </p>
          </div>

            <form onSubmit={handleEmailLogin} className="flex flex-col gap-5 mb-8">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-black tracking-wide uppercase">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40 pointer-events-none"
                  />
                  <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-12 pl-9 pr-4 bg-white border border-black/20 text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-black transition-colors"
                      placeholder="email@example.com"
                      required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-black tracking-wide uppercase">
                  Password
                </label>
                <div className="relative">
                  <Lock
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40 pointer-events-none"
                  />
                  <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-12 pl-9 pr-4 bg-white border border-black/20 text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-black transition-colors"
                      placeholder="********"
                      required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black/60 transition-colors"
                    aria-label="Toggle password visibility"
                  >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/*<div className="auth-options">*/}
              {/*  <label className="remember-wrap">*/}
              {/*    <input*/}
              {/*      type="checkbox"*/}
              {/*      checked={rememberMe}*/}
              {/*      onChange={(e) => setRememberMe(e.target.checked)}*/}
              {/*    />*/}
              {/*    <span>stay log in</span>*/}
              {/*  </label>*/}
              {/*</div>*/}

              {/* Submit Button */}
              <button
                  type="submit"
                  disabled={isLoading}
                  className="h-12 bg-black text-white text-sm font-medium tracking-wide uppercase hover:bg-black/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-2"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </button>
              {errorMessage ? <p className="auth-error">{errorMessage}</p> : null}

            </form>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex-1 h-px bg-black/10"></div>
            <span className="text-xs text-black/40">OR</span>
            <div className="flex-1 h-px bg-black/10"></div>
          </div>

          {/* Social Login */}
          <button className="w-full h-12 border border-black/20 text-black text-sm font-medium tracking-wide uppercase hover:bg-black hover:text-white transition-colors mb-4">
            Sign in with Google
          </button>
          <button className="w-full h-12 border border-black/20 text-black text-sm font-medium tracking-wide uppercase hover:bg-black hover:text-white transition-colors mb-4">
          Sign in with Kakao
        </button>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-black/60">
            Don't have an account?{" "}
            <Link
                to="/register"
                className="text-black font-medium hover:opacity-70 transition-opacity"
            >
              Sign up here
            </Link>
          </p>

          {/* Footer Info */}
          <div className="mt-12 pt-8 border-t border-black/10 text-center text-xs text-black/40">
            <p>
              By signing in, you agree to our{" "}
              <Link to="/" className="underline underline-offset-2 hover:text-black/60">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/" className="underline underline-offset-2 hover:text-black/60">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
    </main>
  )
}

export default Login
