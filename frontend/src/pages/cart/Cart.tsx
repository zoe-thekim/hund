import { Link, useNavigate } from 'react-router-dom'
import useStore from '../../store/useStore'
import CartItem from '../../components/CartItem'

const Cart = () => {
  const navigate = useNavigate()
  const { cart, getTotalPrice, clearCart, isLoggedIn } = useStore()
  const totalPrice = getTotalPrice()

  const handleClearCart = () => {
    if (confirm('Clear all items from your cart?')) {
      clearCart()
    }
  }

  const handleCheckout = () => {
    if (!isLoggedIn) {
      alert('You need to sign in to checkout.')
      navigate('/login')
      return
    }

    navigate('/checkout')
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-october-bg py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Shopping Bag</h1>

          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
              <svg width="48" height="48" className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13v6a2 2 0 002 2h6a2 2 0 002-2v-6" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Add items to start your order</p>

            <div className="flex justify-center">
              <Link
                to="/products"
                className="bg-october-orange text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-opacity-90 transition-colors duration-200"
              >
                Browse Products
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-october-bg py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Shopping Bag</h1>
          <button
            onClick={handleClearCart}
            className="text-gray-500 hover:text-red-500 transition-colors duration-200"
          >
            Clear All
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item, index) => (
              <CartItem key={`${item.id}-${item.size}-${index}`} item={item} />
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Total items</span>
                  <span>{cart.reduce((total, item) => total + item.quantity, 0)} items</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Items subtotal</span>
                  <span>₩{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{totalPrice >= 50000 ? 'FREE' : '₩3,000'}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-xl font-bold text-gray-900">
                    <span>Order total</span>
                    <span className="text-october-orange">
                      ₩{(totalPrice + (totalPrice >= 50000 ? 0 : 3000)).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {totalPrice < 50000 && (
                <div className="bg-october-bg p-4 rounded-lg mb-6">
                <p className="text-sm text-gray-700 text-center">
                    Add ₩{(50000 - totalPrice).toLocaleString()} more for
                    <span className="font-semibold text-october-orange"> free shipping</span>
                  </p>
                </div>
              )}

              <button
                onClick={handleCheckout}
                className="w-full bg-october-orange text-white py-4 rounded-lg text-lg font-semibold hover:bg-opacity-90 transition-colors duration-200"
                aria-label="Proceed to checkout"
              >
                Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
