import useStore from '../store/useStore'

const CartItem = ({ item }) => {
  const { updateCartQuantity, removeFromCart } = useStore()

  const handleQuantityChange = (newQuantity) => {
    updateCartQuantity(item.id, item.size, newQuantity)
  }

  const handleRemove = () => {
    removeFromCart(item.id, item.size)
  }

  return (
    <div className="card-modern p-8 flex items-center space-x-8">
      <div className="w-24 h-24 bg-october-bg rounded-2xl overflow-hidden flex-shrink-0">
        <img
          src={item.images?.[0] || `data:image/svg+xml;charset=UTF-8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" fill="#ececec"/></svg>')}`}
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1">
        <div className="text-sm font-medium text-october-text-light mb-1 uppercase tracking-wider">
          {item.category?.replace('-', ' / ') || 'COLLECTION'}
        </div>
        <h3 className="text-xl font-semibold text-october-text mb-2">{item.name}</h3>
        <p className="text-october-text-light mb-3">Size: {item.size}</p>
        <p className="text-2xl font-bold text-october-text">
          ₩{item.price?.toLocaleString()}
        </p>
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => handleQuantityChange(item.quantity - 1)}
            className="w-10 h-10 rounded-full border-2 border-october-text-light flex items-center justify-center hover:border-october-orange hover:text-october-orange transition-all duration-300 font-medium"
            disabled={item.quantity <= 1}
          >
            −
          </button>
          <span className="w-12 text-center font-semibold text-lg text-october-text">{item.quantity}</span>
          <button
            onClick={() => handleQuantityChange(item.quantity + 1)}
            className="w-10 h-10 rounded-full border-2 border-october-text-light flex items-center justify-center hover:border-october-orange hover:text-october-orange transition-all duration-300 font-medium"
          >
            +
          </button>
        </div>

        <button
          onClick={handleRemove}
          className="p-3 text-october-text-light hover:text-october-orange transition-colors duration-300"
        >
          <svg width="24" height="24" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>

      <div className="text-right">
        <div className="text-sm text-october-text-light mb-1">TOTAL</div>
        <p className="text-2xl font-bold text-october-text">
          ₩{(item.price * item.quantity).toLocaleString()}
        </p>
      </div>
    </div>
  )
}

export default CartItem
