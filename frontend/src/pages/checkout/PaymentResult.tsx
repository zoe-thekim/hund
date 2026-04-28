import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { CheckCircle, AlertTriangle } from 'lucide-react'
import { orderAPI } from '../../api'
import useStore from '../../store/useStore'

type ResultState = 'loading' | 'success' | 'error' | 'cancelled'

const toAmount = (value: string | null): number => {
  if (!value) {
    return 0
  }
  const normalized = value.replace(/,/g, '').trim()
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? Math.round(parsed) : 0
}

const PaymentResult = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const authToken = useStore((state) => state.authToken)
  const clearCart = useStore((state) => state.clearCart)
  const initializeAuth = useStore((state) => state.initializeAuth)

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  const [status, setStatus] = useState<ResultState>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(location.search)
      const orderId = params.get('orderId')
      const paymentKey = params.get('paymentKey')
      const failCode = params.get('code')
      const failMessage = params.get('message')
      const amount = toAmount(params.get('amount'))

      if (!orderId) {
        setStatus('error')
        setMessage('Missing order reference from payment result.')
        return
      }

      if (failCode) {
        setStatus('cancelled')
        setMessage(failMessage || 'Payment was cancelled or failed.')
        return
      }

      if (!paymentKey || !amount) {
        setStatus('error')
        setMessage('Payment result was incomplete.')
        return
      }

      if (!authToken) {
        setStatus('error')
        setMessage('Missing login session. Please sign in and retry from your cart.')
        return
      }

      try {
        const confirmResponse = await orderAPI.confirmOrderByNumber(orderId, {
          paymentKey,
          amount
        }, authToken)

        if (confirmResponse.data?.success === false) {
          throw new Error(confirmResponse.data?.message || 'Payment confirmation failed.')
        }

        const pendingRaw = sessionStorage.getItem(`pending-order-${orderId}`)
        if (pendingRaw) {
          try {
            const pendingData = JSON.parse(pendingRaw)
            if (pendingData?.shouldClearCart) {
              clearCart()
            }
          } catch {
            // Ignore malformed pending data.
          }
          sessionStorage.removeItem(`pending-order-${orderId}`)
        }

        setStatus('success')
        setMessage('Payment completed successfully.')
        navigate('/order-confirmation', {
          replace: true,
          state: {
            orderId
          }
        })
      } catch (error) {
        const responseData = (error as { response?: { status?: number; data?: unknown } })?.response ?? null
        console.error('Payment confirmation failed', {
          status: responseData?.status,
          data: responseData?.data,
          error
        })
        setStatus('error')
        setMessage(
          (error as { response?: { data?: { message?: string; error?: string } } })?.response?.data?.message
          || error?.message
          || 'We could not verify your payment.'
        )
      }
    }

    run()
  }, [location.search, authToken, clearCart, navigate])

  if (status === 'loading') {
    return (
      <main className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <p className="text-sm text-black/60">Checking payment result...</p>
      </main>
    )
  }

  if (status === 'success') {
    return (
      <main className="min-h-screen bg-[#F5F5F5] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white border border-black/10 p-8 text-center">
          <CheckCircle size={36} className="mx-auto text-green-600" />
          <h1 className="text-xl font-medium mt-4 mb-2">Payment Complete</h1>
          <p className="text-sm text-black/70">{message}</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#F5F5F5] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white border border-black/10 p-8 text-center">
        <AlertTriangle size={36} className="mx-auto text-black" />
        <h1 className="text-xl font-medium mt-4 mb-2">
          {status === 'cancelled' ? 'Payment Cancelled' : 'Payment Failed'}
        </h1>
        <p className="text-sm text-black/70 mb-6">{message}</p>
        <div className="space-y-2">
          <button
            onClick={() => navigate('/cart')}
            className="w-full h-10 border border-black/20 text-sm font-medium hover:bg-black hover:text-white transition-colors"
          >
            Return to Cart
          </button>
          <Link
            to="/checkout"
            className="block h-10 border border-black/20 text-sm font-medium leading-10 hover:bg-black hover:text-white transition-colors"
          >
            Retry Checkout
          </Link>
        </div>
      </div>
    </main>
  )
}

export default PaymentResult
