import { useEffect, useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { CheckCircle, Package, Truck, Home } from 'lucide-react'
import useStore from '../../store/useStore'
import { orderAPI } from '../../api'
import { getFirstProductImage, handleImageError } from '../../utils/imageUtils'

interface ShippingAddress {
  name: string
  phone: string
  postalCode: string
  address: string
  detailAddress: string
}

interface OrderItem {
  id: string
  name: string
  price: number
  size: string
  quantity: number
  images?: string[]
}

interface ApiOrderItem {
  id?: number | string
  productName?: string
  unitPrice?: number | string
  quantity?: number | string
  size?: string
}

interface ApiAddress {
  postalCode?: string
  address?: string
  detailAddress?: string
}

interface ApiOrder {
  id?: number | string
  orderNumber?: string
  totalAmount?: number | string
  deliveryAddress?: ApiAddress
  orderItems?: ApiOrderItem[]
}

const normalizeAddress = (raw: ApiAddress | undefined, fallback?: Partial<ShippingAddress>): ShippingAddress => ({
  name: fallback?.name || '',
  phone: fallback?.phone || '',
  postalCode: raw?.postalCode || '',
  address: raw?.address || '',
  detailAddress: raw?.detailAddress || ''
})

const toNumberValue = (value: unknown): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? Math.round(parsed) : 0
}

const OrderConfirmation = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const authToken = useStore((state) => state.authToken)

  const locationOrderId = location.state?.orderId || location.state?.orderNumber
  const locationItems: OrderItem[] = location.state?.items || []
  const locationTotal = toNumberValue(location.state?.total)
  const locationShipping: ShippingAddress | undefined = location.state?.shippingAddress

  const [loading, setLoading] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(locationOrderId || null)
  const [items, setItems] = useState<OrderItem[]>(locationItems)
  const [total, setTotal] = useState(locationTotal)
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | undefined>(locationShipping)

  useEffect(() => {
    const loadOrderFromServer = async () => {
      if (!orderId || locationItems.length) {
        return
      }

      if (!authToken) {
        navigate('/login')
        return
      }

      setLoading(true)
      try {
        const response = await orderAPI.getByNumber(orderId, authToken)
        const order = response?.data as ApiOrder | undefined
        if (!order) {
          throw new Error('Order data not found.')
        }

        setOrderId(order.orderNumber || String(order.id || orderId))

        const fallbackItems = Array.isArray(order.orderItems)
          ? order.orderItems.map((item, index) => ({
              id: String(item.id || index),
              name: item.productName || 'Product',
              price: toNumberValue(item.unitPrice),
              size: item.size || '-',
              quantity: toNumberValue(item.quantity) || 1
            }))
          : []

        setItems(fallbackItems)
        setTotal(toNumberValue(order.totalAmount))

        setShippingAddress((prev) => {
          if (prev) {
            return { ...prev, ...normalizeAddress(order.deliveryAddress) }
          }
          return normalizeAddress(order.deliveryAddress)
        })
      } catch {
        setOrderId(null)
      } finally {
        setLoading(false)
      }
    }

    loadOrderFromServer()
  }, [authToken, navigate, orderId, locationItems.length])

  useEffect(() => {
    if (!loading && !orderId) {
      navigate('/products')
    }
  }, [loading, orderId, navigate])

  const estimatedDelivery = new Date()
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 3)

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <p className="text-sm text-black/60">Loading order details...</p>
      </main>
    )
  }

  if (!orderId || !items.length) {
    return null
  }

  return (
    <main className="min-h-screen bg-[#F5F5F5]">
      <div className="max-w-4xl mx-auto px-5 md:px-10 py-8 md:py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-normal text-black mb-4">
            Order Confirmed!
          </h1>
          <p className="text-lg text-black/60 mb-2">
            Thank you for your purchase. Your order has been received.
          </p>
          <p className="text-sm text-black/50">
            Order ID: <span className="font-mono font-medium">{orderId}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white border border-black/10 p-6">
              <h2 className="text-lg font-medium text-black mb-6">Order Status</h2>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={16} className="text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-black">Order Confirmed</h3>
                    <p className="text-xs text-black/60">Your order has been received and confirmed</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Package size={16} className="text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-sm text-black/40">Preparing for Shipment</h3>
                    <p className="text-xs text-black/40">We're getting your order ready</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Truck size={16} className="text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-sm text-black/40">In Transit</h3>
                    <p className="text-xs text-black/40">Your order is on the way</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Home size={16} className="text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-sm text-black/40">Delivered</h3>
                    <p className="text-xs text-black/40">
                      Estimated delivery: {estimatedDelivery.toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-black/10 p-6">
              <h2 className="text-lg font-medium text-black mb-6">Order Items</h2>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={`${item.id}-${item.size}-${index}`} className="flex gap-4 pb-4 border-b border-black/5 last:border-b-0 last:pb-0">
                    <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      <img
                        src={getFirstProductImage(item)}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={handleImageError}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-black mb-1">
                        {item.name}
                      </h3>
                      <p className="text-xs text-black/60 mb-2">
                        Size: {item.size} • Quantity: {item.quantity}
                      </p>
                      <p className="text-sm font-medium text-black">
                        ₩{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {shippingAddress && (
              <div className="bg-white border border-black/10 p-6">
                <h2 className="text-lg font-medium text-black mb-4">Shipping Address</h2>
                <div className="text-sm text-black/70 space-y-1">
                  <p className="font-medium text-black">{shippingAddress.name}</p>
                  <p>{shippingAddress.phone}</p>
                  <p>
                    ({shippingAddress.postalCode}) {shippingAddress.address}
                  </p>
                  {shippingAddress.detailAddress && (
                    <p>{shippingAddress.detailAddress}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-black/10 p-6">
              <h2 className="text-lg font-medium text-black mb-4">Order Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₩{total.toLocaleString()}</span>
                </div>
                <div className="border-t border-black/10 pt-3 flex justify-between font-medium text-base">
                  <span>Total</span>
                  <span>₩{total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Link
                to="/products"
                className="block w-full h-12 bg-black text-white text-sm font-medium tracking-wide uppercase hover:bg-black/80 transition-colors flex items-center justify-center"
              >
                Continue Shopping
              </Link>
              <Link
                to="/mypage"
                className="block w-full h-12 border border-black/20 text-black text-sm font-medium tracking-wide uppercase hover:border-black transition-colors flex items-center justify-center"
              >
                View My Orders
              </Link>
            </div>

            <div className="bg-gray-50 border border-black/10 p-4 text-center">
              <h3 className="text-sm font-medium text-black mb-2">Need Help?</h3>
              <p className="text-xs text-black/60 mb-3">
                If you have any questions about your order, we're here to help.
              </p>
              <Link
                to="/support"
                className="text-xs text-black underline hover:no-underline"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default OrderConfirmation
