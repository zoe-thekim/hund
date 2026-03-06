import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthPage from '../../components/auth/AuthPage'
import FormField from '../../components/auth/FormField'
import {
  createUser,
  findUserByEmail,
  getUserTableSchema,
  updateUserOptionalProfile,
} from '../../db/userTable'
import useStore from '../../store/useStore'

const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,20}$/

const Register = () => {
  const navigate = useNavigate()
  const login = useStore((state) => state.login)

  const [step, setStep] = useState(1)
  const [requiredForm, setRequiredForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [optionalForm, setOptionalForm] = useState({
    phoneNumber: '',
    address: '',
    birthDate: '',
  })
  const [createdUser, setCreatedUser] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const isPasswordMatched = requiredForm.password.length > 0 && requiredForm.password === requiredForm.confirmPassword
  const isPasswordCompared = requiredForm.confirmPassword.length > 0
  const hasOptionalValue = useMemo(() => {
    return Object.values(optionalForm).some((value) => value.trim() !== '')
  }, [optionalForm])

  const updateRequired = (field, value) => {
    setRequiredForm((prev) => ({ ...prev, [field]: value }))
  }

  const updateOptional = (field, value) => {
    setOptionalForm((prev) => ({ ...prev, [field]: value }))
  }

  const validateStep1 = () => {
    if (!requiredForm.name.trim()) {
      return '이름을 입력해주세요.'
    }

    if (!requiredForm.email.trim()) {
      return '이메일을 입력해주세요.'
    }

    if (!requiredForm.password || !requiredForm.confirmPassword) {
      return '비밀번호와 비밀번호 확인을 입력해주세요.'
    }

    if (!PASSWORD_RULE.test(requiredForm.password)) {
      return '비밀번호 규칙을 확인해주세요. (영문/숫자/특수문자 포함 8~20자)'
    }

    if (requiredForm.password !== requiredForm.confirmPassword) {
      return '비밀번호가 일치하지 않습니다.'
    }

    if (findUserByEmail(requiredForm.email)) {
      return '이미 가입된 이메일입니다.'
    }

    return ''
  }

  const handleCreateBaseAccount = (e) => {
    e.preventDefault()
    setErrorMessage('')

    const validationError = validateStep1()
    if (validationError) {
      setErrorMessage(validationError)
      return
    }

    try {
      const user = createUser({
        name: requiredForm.name.trim(),
        email: requiredForm.email.trim(),
        password: requiredForm.password,
      })
      setCreatedUser(user)
      setStep(2)
    } catch (error) {
      if (error instanceof Error && error.message === 'DUPLICATE_EMAIL') {
        setErrorMessage('이미 가입된 이메일입니다.')
      } else {
        setErrorMessage('회원가입에 실패했습니다. 잠시 후 다시 시도해주세요.')
      }
    }
  }

  const moveStep3 = () => {
    setStep(3)
  }

  const handleSaveOptional = () => {
    if (!createdUser) {
      setErrorMessage('가입 정보가 유실되었습니다. 다시 시도해주세요.')
      setStep(1)
      return
    }

    if (!hasOptionalValue) {
      moveStep3()
      return
    }

    setIsLoading(true)
    setErrorMessage('')

    try {
      const updatedUser = updateUserOptionalProfile(createdUser.id, {
        phoneNumber: optionalForm.phoneNumber.trim(),
        address: optionalForm.address.trim(),
        birthDate: optionalForm.birthDate,
      })
      setCreatedUser(updatedUser)
      moveStep3()
    } catch {
      setErrorMessage('추가 정보 저장에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAutoLogin = () => {
    if (!createdUser) {
      setErrorMessage('사용자 정보가 없습니다. 로그인 화면으로 이동해주세요.')
      return
    }

    login(createdUser, null, false)
    navigate('/mypage')
  }

  const handleGoLogin = () => {
    navigate('/login')
  }

  const stepLabels = {
    1: '기본 정보',
    2: '선택 정보',
    3: '가입 완료',
  }

  return (
    <AuthPage
      title="회원가입"
      subtitle={`현재 단계: ${stepLabels[step]}`}
      footer={(
        <p>
          이미 계정이 있으신가요? <Link to="/login">로그인</Link>
        </p>
      )}
    >
      <div className="register-steps">
        {[1, 2, 3].map((stepNumber) => (
          <div key={stepNumber} className="register-step-track">
            <div className={`register-step-dot ${step >= stepNumber ? 'is-active' : ''}`}>
              {stepNumber}
            </div>
            {stepNumber < 3 && (
              <div className={`register-step-line ${step > stepNumber ? 'is-active' : ''}`} />
            )}
          </div>
        ))}
      </div>

      {step === 1 && (
        <form onSubmit={handleCreateBaseAccount} className="auth-form">
          <FormField label="이름" htmlFor="register-name">
            <input
              id="register-name"
              type="text"
              className="glass-input"
              value={requiredForm.name}
              onChange={(e) => updateRequired('name', e.target.value)}
              placeholder="이름을 입력하세요"
              required
            />
          </FormField>

          <FormField label="이메일" htmlFor="register-email">
            <input
              id="register-email"
              type="email"
              className="glass-input"
              value={requiredForm.email}
              onChange={(e) => updateRequired('email', e.target.value)}
              placeholder="이메일을 입력하세요"
              required
            />
          </FormField>

          <FormField label="비밀번호" htmlFor="register-password">
            <input
              id="register-password"
              type="password"
              className="glass-input"
              value={requiredForm.password}
              onChange={(e) => updateRequired('password', e.target.value)}
              placeholder="영어, 숫자, 특수문자를 포함해 최소 8자리에서 20자리"
              required
            />
          </FormField>

          <FormField label="비밀번호 확인" htmlFor="register-confirm-password">
            <input
              id="register-confirm-password"
              type="password"
              className="glass-input"
              value={requiredForm.confirmPassword}
              onChange={(e) => updateRequired('confirmPassword', e.target.value)}
              placeholder="비밀번호를 다시 입력하세요"
              required
            />
          </FormField>

          {isPasswordCompared ? (
            <p className={`password-compare ${isPasswordMatched ? 'is-match' : 'is-mismatch'}`}>
              {isPasswordMatched ? '비밀번호가 일치합니다.' : '비밀번호가 일치하지 않습니다.'}
            </p>
          ) : null}

          {errorMessage ? <p className="auth-error">{errorMessage}</p> : null}

          <button type="submit" className="neo-btn neo-btn-primary">
            다음
          </button>
        </form>
      )}

      {step === 2 && (
        <div className="auth-form">
          <p className="step-helper">선택 입력입니다. 건너뛰어도 회원가입이 완료됩니다.</p>

          <FormField label="주소" htmlFor="register-address">
            <input
              id="register-address"
              type="text"
              className="glass-input"
              value={optionalForm.address}
              onChange={(e) => updateOptional('address', e.target.value)}
              placeholder="주소를 입력하세요 (선택)"
            />
          </FormField>

          <FormField label="전화번호" htmlFor="register-phone">
            <input
              id="register-phone"
              type="tel"
              className="glass-input"
              value={optionalForm.phoneNumber}
              onChange={(e) => updateOptional('phoneNumber', e.target.value)}
              placeholder="전화번호를 입력하세요 (선택)"
            />
          </FormField>

          <FormField label="생일" htmlFor="register-birth-date">
            <input
              id="register-birth-date"
              type="date"
              className="glass-input"
              value={optionalForm.birthDate}
              onChange={(e) => updateOptional('birthDate', e.target.value)}
            />
          </FormField>

          {errorMessage ? <p className="auth-error">{errorMessage}</p> : null}

          <div className="register-actions">
            <button type="button" className="neo-btn" onClick={moveStep3}>
              Skip
            </button>
            <button type="button" className="neo-btn neo-btn-primary" onClick={handleSaveOptional} disabled={isLoading}>
              {isLoading ? '저장 중...' : hasOptionalValue ? '저장' : '다음'}
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="auth-form register-complete">
          <h2>환영합니다, {createdUser?.name ?? '회원'}님!</h2>
          <p>회원가입이 완료되었습니다. 자동 로그인 하시겠습니까?</p>

          <div className="register-actions">
            <button type="button" className="neo-btn" onClick={handleGoLogin}>
              아니오
            </button>
            <button type="button" className="neo-btn neo-btn-primary" onClick={handleAutoLogin}>
              자동 로그인
            </button>
          </div>

          <p className="db-schema-note">저장 테이블: {getUserTableSchema().table} (v{getUserTableSchema().version})</p>
        </div>
      )}
    </AuthPage>
  )
}

export default Register
