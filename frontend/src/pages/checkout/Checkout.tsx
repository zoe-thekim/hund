import {
  ANONYMOUS,
  loadTossPayments,
  type TossPaymentsWidgets
} from '@tosspayments/tosspayments-sdk'
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, CreditCard, Truck, Shield, MapPin } from 'lucide-react'
import useStore from '../../store/useStore'
import { orderAPI } from '../../api'
import { getFirstProductImage, handleImageError } from '../../utils/imageUtils'

interface CheckoutItem {
  id: string
  legacyId?: number | string
  name: string
  price: number
  size: string
  quantity: number
  unitPrice?: number | string
  images?: string[]
}

interface ShippingAddress {
  name: string
  phone: string
  postalCode: string
  address: string
  detailAddress: string
}

interface TossAmount {
  currency: 'KRW'
  value: number
}

const toAmountValue = (value: unknown): number => {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 0
  }
  return Math.round(parsed)
}

const normalizePhoneNumber = (value: string): string => {
  return value.replace(/[^0-9]/g, '')
}

const resolveProductId = (item: CheckoutItem): number | null => {
  const candidateValues: unknown[] = [
    item.legacyId,
    item.id
  ]

  for (const candidate of candidateValues) {
    const raw = String(candidate ?? '').trim()
    if (!raw) {
      continue
    }

    const trailingNumbers = raw.match(/(\d+)$/)
    if (!trailingNumbers) {
      const parsed = Number.parseInt(raw, 10)
      if (Number.isInteger(parsed) && parsed > 0) {
        return parsed
      }
      continue
    }

    const parsedTrailing = Number.parseInt(trailingNumbers[1], 10)
    if (Number.isInteger(parsedTrailing) && parsedTrailing > 0) {
      return parsedTrailing
    }
  }

  return null
}

const Checkout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const cart = useStore((state) => state.cart)
  const authUser = useStore((state) => state.authUser)
  const authToken = useStore((state) => state.authToken)
  const clearCart = useStore((state) => state.clearCart)
  const initializeAuth = useStore((state) => state.initializeAuth)

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  const items: CheckoutItem[] = useMemo(() => {
    if (location.state?.directPurchase && location.state?.items) {
      return location.state.items
    }
    return cart
  }, [location.state, cart])

  const resolveItemPrice = (item: CheckoutItem): number => {
    const fromPrice = toAmountValue(item.price)
    if (fromPrice > 0) {
      return fromPrice
    }

    return toAmountValue(item.unitPrice)
  }

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    name: authUser?.name || '',
    phone: authUser?.phoneNumber || authUser?.phone || '',
    postalCode: authUser?.address?.postalCode || '',
    address: authUser?.address?.address || '',
    detailAddress: authUser?.address?.detailAddress || ''
  })

  const [isTossWidgetReady, setIsTossWidgetReady] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [sdkError, setSdkError] = useState('')
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [widgets, setWidgets] = useState<TossPaymentsWidgets | null>(null)
  const [isCouponApplied, setIsCouponApplied] = useState(false)

  const subtotal = useMemo(
    () => items.reduce((total, item) => total + (resolveItemPrice(item) * item.quantity), 0),
    [items]
  )

  const shippingFee = subtotal >= 50_000 ? 0 : 3_000
  const baseAmount = useMemo<TossAmount>(
    () => ({ currency: 'KRW', value: subtotal + shippingFee }),
    [subtotal, shippingFee]
  )
  const amount: TossAmount = useMemo(
    () => ({
      currency: 'KRW',
      value: Math.max(0, baseAmount.value - (isCouponApplied ? 5_000 : 0))
    }),
    [baseAmount.value, isCouponApplied]
  )

  const customerKey = useMemo<string>(() => {
    if (authUser?.id) {
      return String(authUser.id)
    }
    return ANONYMOUS
  }, [authUser?.id])

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart')
    }
  }, [items, navigate])

  useEffect(() => {
    async function fetchPaymentWidgets() {
      const tossClientKey = (import.meta as { env?: { VITE_TOSS_CLIENT_KEY?: string } }).env?.VITE_TOSS_CLIENT_KEY

      if (!tossClientKey) {
        setSdkError('Toss client key is missing.')
        return
      }

      try {
        const tossPayments = await loadTossPayments(tossClientKey)
        const widgetsInstance = tossPayments.widgets({
          customerKey
        })

        setWidgets(widgetsInstance)
      } catch (error) {
        console.error('Failed to initialize Toss payment widgets:', error)
        setSdkError('Unable to initialize Toss Payments widgets.')
      }
    }

    fetchPaymentWidgets()
  }, [customerKey])

  useEffect(() => {
    async function renderPaymentWidgets() {
      if (!widgets) {
        return
      }

      try {
        await widgets.setAmount(amount)
        await Promise.all([
          widgets.renderPaymentMethods({
            selector: '#payment-method',
            variantKey: 'DEFAULT'
          }),
          widgets.renderAgreement({
            selector: '#agreement',
            variantKey: 'AGREEMENT'
          })
        ])
        setIsTossWidgetReady(true)
        setSdkError('')
      } catch (error) {
        console.error('Failed to render Toss widget:', error)
        setSdkError('Unable to load Toss payment UI.')
        setIsTossWidgetReady(false)
      }
    }

    renderPaymentWidgets()
  }, [widgets])

  useEffect(() => {
    if (!widgets) {
      return
    }

    widgets.setAmount(amount).catch((error) => {
      console.error('Failed to update Toss widget amount:', error)
    })
  }, [widgets, amount])

  const setShippingField = (field: keyof ShippingAddress, value: string) => {
    if (field === 'phone') {
      value = normalizePhoneNumber(value)
    }

    setShippingAddress((prev) => ({ ...prev, [field]: value }))
  }

  const buildOrderName = () => {
    if (items.length === 0) {
      return 'Order'
    }
    if (items.length === 1) {
      return items[0].name
    }
    return `${items[0].name} and ${items.length - 1} more`
  }

  const savePendingSession = (payload: {
    orderId: number
    orderNumber: string
    shouldClearCart: boolean
    total: number
  }) => {
    const storagePayload = {
      orderId: payload.orderId,
      orderNumber: payload.orderNumber,
      shouldClearCart: payload.shouldClearCart,
      items,
      shippingAddress,
      total: payload.total,
      createdAt: Date.now()
    }
    sessionStorage.setItem(`pending-order-${payload.orderNumber}`, JSON.stringify(storagePayload))
  }

  const clearPendingSession = (orderNumber: string) => {
    sessionStorage.removeItem(`pending-order-${orderNumber}`)
  }

  const requestTossPayment = async (orderNumber: string, customerMobilePhone: string) => {
    if (!widgets) {
      throw new Error('Toss payment widget is not initialized.')
    }

    await widgets.requestPayment({
      orderId: orderNumber,
      orderName: buildOrderName(),
      successUrl: `${window.location.origin}/checkout/payment-result?orderId=${encodeURIComponent(orderNumber)}`,
      failUrl: `${window.location.origin}/checkout/payment-result?orderId=${encodeURIComponent(orderNumber)}`,
      customerEmail: authUser?.email || '',
      customerName: shippingAddress.name,
      customerMobilePhone
    })
  }

  const extractServerErrorMessage = (error: unknown): string | null => {
    const responseData = (error as { response?: { data?: { message?: string; error?: string } } })?.response?.data
    if (typeof responseData?.message === 'string' && responseData.message.trim()) {
      return responseData.message
    }
    if (typeof responseData?.error === 'string' && responseData.error.trim()) {
      return responseData.error
    }
    return null
  }

  const handlePlaceOrder = async () => {
    if (!agreeToTerms) {
      alert('Please agree to the terms and conditions')
      return
    }

    const normalizedPhone = normalizePhoneNumber(shippingAddress.phone)
    if (!shippingAddress.name || !normalizedPhone || !shippingAddress.address) {
      alert('Please fill in all required shipping information')
      return
    }

    if (normalizedPhone.length < 10 || normalizedPhone.length > 11) {
      alert('Please enter a valid phone number (10 or 11 digits, no separators).')
      return
    }

    if (!authUser?.id) {
      alert('User information is missing. Please try logging in again.')
      return
    }

    if (!authToken) {
      alert('Please sign in again and try again.')
      return
    }

    if (!isTossWidgetReady) {
      alert(sdkError || 'Toss Payments widget is not ready. Please try again.')
      return
    }

    setIsProcessing(true)

    let createdOrderId: number | null = null
    let orderNumberForPayment = ''
    let failedStep: 'create-order' | 'add-item' | 'payment-init' | '' = ''
    let failedItemName = ''
    try {
      const orderData = {
        userId: authUser.id,
        postalCode: shippingAddress.postalCode,
        address: shippingAddress.address,
        detailAddress: shippingAddress.detailAddress,
        deliveryMessage: '',
        paymentMethod: 'WIDGET',
        totalAmount: amount.value,
        shippingFee
      }

      failedStep = 'create-order'
      const orderResponse = await orderAPI.createOrder(orderData, authToken)
      const orderId = toAmountValue(orderResponse.data?.orderId)
      const orderNumber = orderResponse.data?.orderNumber
      createdOrderId = orderId || null
      orderNumberForPayment = orderNumber || ''

      if (!orderId || !orderNumberForPayment) {
        throw new Error('Failed to create order')
      }

      for (const item of items) {
        failedStep = 'add-item'
        failedItemName = item.name
        const productId = resolveProductId(item)
        if (!productId) {
          throw new Error(`Invalid product id for item: ${item.name}`)
        }
        const unitPrice = resolveItemPrice(item)
        if (!unitPrice) {
          throw new Error(`가격 정보가 없는 상품입니다: ${item.name}`)
        }

        await orderAPI.addItemToOrder(
          orderId,
          {
            productId,
            size: item.size.trim(),
            quantity: item.quantity,
            unitPrice
          },
          authToken
        )
      }

      savePendingSession({
        orderId,
        orderNumber: orderNumberForPayment,
        shouldClearCart: !location.state?.directPurchase,
        total: amount.value
      })
      failedStep = 'payment-init'
      await requestTossPayment(orderNumberForPayment, normalizedPhone)
    } catch (error: unknown) {
      console.error('Order creation failed:', error)
      if (createdOrderId && orderNumberForPayment) {
        clearPendingSession(orderNumberForPayment)
        await orderAPI.cancelOrderById(
          createdOrderId,
          { reason: 'Payment initiation failed' },
          authToken
        ).catch(() => {})
      }

      const status = (error as { response?: { status?: number } })?.response?.status
      const serverMessage = extractServerErrorMessage(error)
      const detail =
        failedStep === 'add-item' && failedItemName
          ? ` (항목: ${failedItemName})`
          : ''
      const reason =
        status === 400
          ? `[400] ${failedStep || '요청'} API 호출 실패${detail}. ${serverMessage || '요청 값이 유효하지 않습니다.'}`
          : status === 403
            ? '권한이 만료되었거나 인증이 유효하지 않습니다. 다시 로그인 후 결제를 진행해 주세요.'
            : failedStep
              ? `${failedStep} API 호출 실패${detail}. ${serverMessage || (error instanceof Error ? error.message : 'Unknown error.')}`
              : serverMessage || (error instanceof Error ? error.message : 'Unknown error.')

      alert(reason || 'Order failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const openPostalCode = () => {
    if (typeof window !== 'undefined' && window.daum?.Postcode) {
      new window.daum.Postcode({
        oncomplete: (data) => {
          setShippingAddress((prev) => ({
            ...prev,
            postalCode: data.zonecode,
            address: data.address
          }))
        }
      }).open()
    }
  }

  if (items.length === 0) {
    return null
  }

  return (
    <main className="min-h-screen bg-[#F5F5F5]">
      <div className="max-w-6xl mx-auto px-5 md:px-10 py-8 md:py-12">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-black/5 rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl md:text-3xl font-normal text-black">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white border border-black/10 p-6">
              <div className="flex items-center gap-3 mb-6">
                <MapPin size={20} />
                <h2 className="text-lg font-medium text-black">Shipping Address</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black/70 mb-2">Name *</label>
                  <input
                    type="text"
                    value={shippingAddress.name}
                    onChange={(e) => setShippingField('name', e.target.value)}
                    className="w-full px-3 py-2 border border-black/20 text-sm focus:outline-none focus:border-black transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black/70 mb-2">Phone *</label>
                    <input
                      type="tel"
                      value={shippingAddress.phone}
                      onChange={(e) => setShippingField('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-black/20 text-sm focus:outline-none focus:border-black transition-colors"
                      required
                    />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black/70 mb-2">Postal Code *</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={shippingAddress.postalCode}
                      onChange={(e) => setShippingField('postalCode', e.target.value)}
                      className="flex-1 px-3 py-2 border border-black/20 text-sm focus:outline-none focus:border-black transition-colors"
                      required
                      readOnly
                    />
                    <button
                      type="button"
                      onClick={openPostalCode}
                      className="px-4 py-2 border border-black/20 text-sm hover:border-black transition-colors"
                    >
                      Search
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-black/70 mb-2">Address *</label>
                  <input
                    type="text"
                    value={shippingAddress.address}
                    onChange={(e) => setShippingField('address', e.target.value)}
                    className="w-full px-3 py-2 border border-black/20 text-sm focus:outline-none focus:border-black transition-colors"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-black/70 mb-2">Detail Address</label>
                  <input
                    type="text"
                    value={shippingAddress.detailAddress}
                    onChange={(e) => setShippingField('detailAddress', e.target.value)}
                    className="w-full px-3 py-2 border border-black/20 text-sm focus:outline-none focus:border-black transition-colors"
                    placeholder="Apartment, suite, etc."
                  />
                </div>
              </div>
            </div>

            <div className="bg-white border border-black/10 p-6">
              <div className="flex items-center gap-3 mb-6">
                <CreditCard size={20} />
                <h2 className="text-lg font-medium text-black">Payment</h2>
              </div>

              <div id="payment-method" />
              <div id="agreement" />

              <label className="mt-4 flex items-start gap-3 text-sm">
                <input
                  id="coupon-box"
                  type="checkbox"
                  checked={isCouponApplied}
                  disabled={!isTossWidgetReady}
                  onChange={(event) => {
                    setIsCouponApplied(event.target.checked)
                  }}
                  className="w-4 h-4 mt-0.5"
                />
                <span className="text-black/70">5,000원 쿠폰 적용</span>
              </label>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-black/10 p-6">
              <h2 className="text-lg font-medium text-black mb-4">Order Summary</h2>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={`${item.id}-${item.size}-${index}`} className="flex gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      <img
                        src={getFirstProductImage(item)}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={handleImageError}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-black line-clamp-1">
                        {item.name}
                      </h3>
                      <p className="text-xs text-black/60">
                        Size: {item.size} • Qty: {item.quantity}
                      </p>
                      <p className="text-sm font-medium text-black mt-1">
                        ₩{(resolveItemPrice(item) * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-black/10 p-6">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₩{(baseAmount.value + (isCouponApplied ? 5_000 : 0)).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shippingFee === 0 ? 'Free' : `₩${shippingFee.toLocaleString()}`}</span>
                </div>
                <div className="border-t border-black/10 pt-3 flex justify-between font-medium text-base">
                  <span>Total</span>
                  <span>₩{amount.value.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-gray-50 text-xs text-black/60">
                <div className="flex items-center gap-2 mb-1">
                  <Truck size={14} />
                  <span>Free shipping on orders over ₩50,000</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield size={14} />
                  <span>Secure checkout with SSL encryption</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5"
                />
                <span className="text-black/70">
                  I agree to the{' '}
                  <Link to="/terms" className="text-black underline">
                    Terms and Conditions
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-black underline">
                    Privacy Policy
                  </Link>
                </span>
              </label>

              {sdkError ? <p className="text-xs text-red-600">{sdkError}</p> : null}

              <button
                onClick={handlePlaceOrder}
                disabled={isProcessing || !agreeToTerms || !isTossWidgetReady}
                className="w-full h-12 bg-black text-white text-sm font-medium tracking-wide uppercase hover:bg-black/80 disabled:bg-black/40 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Checkout
