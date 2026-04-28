import { Link } from 'react-router-dom'
import { Heart, ShoppingBag, X } from 'lucide-react'
import useStore from '../../store/useStore'
import { getFirstProductImage, handleImageError } from '../../utils/imageUtils'

const Wishlist = () => {
  const wishlist = useStore((state) => state.wishlist)
  const removeFromWishlist = useStore((state) => state.removeFromWishlist)
  const addToCart = useStore((state) => state.addToCart)

  const handleRemoveFromWishlist = (productId: string) => {
    removeFromWishlist(productId)
  }

  const handleAddToCart = (product: any) => {
    // Default to first available size or 'M'
    const defaultSize = product.sizes?.[0] || 'M'
    addToCart(product, defaultSize, 1)
  }

  if (wishlist.length === 0) {
    return (
      <main className="min-h-screen bg-[#F5F5F5]">
        <div className="max-w-screen-xl mx-auto px-5 md:px-10 py-16">
          <h1 className="text-2xl md:text-3xl font-normal text-black mb-12">My Favorites</h1>

          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
              <Heart size={32} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-medium text-black mb-4">Your wishlist is empty</h2>
            <p className="text-black/60 mb-8">Save your favorite items to purchase later</p>

            <Link
              to="/products"
              className="inline-flex h-12 px-8 items-center bg-black text-white text-sm font-medium tracking-wide uppercase hover:bg-black/80 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#F5F5F5]">
      <div className="max-w-screen-xl mx-auto px-5 md:px-10 py-8 md:py-16">
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-2xl md:text-3xl font-normal text-black">My Favorites</h1>
          <p className="text-sm text-black/60">
            {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map((product) => (
            <div key={product.id} className="bg-white border border-black/10 group">
              <div className="relative">
                <Link to={`/products/${product.id}`} className="block">
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={getFirstProductImage(product)}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={handleImageError}
                    />
                  </div>
                </Link>

                <button
                  onClick={() => handleRemoveFromWishlist(product.id)}
                  className="absolute top-4 right-4 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                  aria-label="Remove from wishlist"
                >
                  <X size={16} />
                </button>

                <button
                  onClick={() => handleRemoveFromWishlist(product.id)}
                  className="absolute top-4 left-4 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                  aria-label="Remove from wishlist"
                >
                  <Heart size={16} className="text-red-500" fill="currentColor" />
                </button>
              </div>

              <div className="p-4">
                <Link to={`/products/${product.id}`}>
                  <h3 className="text-sm font-medium text-black mb-2 line-clamp-2 hover:text-black/70 transition-colors">
                    {product.name}
                  </h3>
                </Link>

                <p className="text-sm font-medium text-black mb-4">
                  ₩{product.price?.toLocaleString()}
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="flex-1 h-10 bg-black text-white text-xs font-medium tracking-wide uppercase hover:bg-black/80 transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingBag size={14} />
                    Add to Cart
                  </button>

                  <Link
                    to={`/products/${product.id}`}
                    className="h-10 px-4 border border-black/20 text-black text-xs font-medium tracking-wide uppercase hover:border-black transition-colors flex items-center justify-center"
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <Link
            to="/products"
            className="inline-flex h-12 px-8 items-center border border-black/20 text-black text-sm font-medium tracking-wide uppercase hover:border-black transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  )
}

export default Wishlist