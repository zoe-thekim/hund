import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import useStore from '../store/useStore'
import { getProductImages } from '../utils/productImages'

const ProductCard = ({ product }) => {
  const addToCart = useStore((state) => state.addToCart)
  const previewImages = useMemo(() => getProductImages(product, 4), [product])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product, 'M', 1)
  }

  const handleImagePrev = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((prev) => (
      prev === 0 ? previewImages.length - 1 : prev - 1
    ))
  }

  const handleImageNext = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((prev) => (
      prev === previewImages.length - 1 ? 0 : prev + 1
    ))
  }

  return (
    <Link to={`/products/${product.id}`} className="product-card-link">
      <div className="card-minimal product-card">
        <div className="product-card-media">
          <img
            src={previewImages[currentImageIndex]}
            alt={`${product.name} ${currentImageIndex + 1}`}
            className="card-image product-card-image"
            loading="lazy"
            onError={(e) => {
              const target = e.currentTarget
              target.src = `https://via.placeholder.com/800x1000/f5f5f5/999999?text=${encodeURIComponent(product.name)}`
            }}
          />
          {previewImages.length > 1 && (
            <>
              <button type="button" className="image-nav-btn image-nav-btn-left" onClick={handleImagePrev} aria-label="Previous image">
                ‹
              </button>
              <button type="button" className="image-nav-btn image-nav-btn-right" onClick={handleImageNext} aria-label="Next image">
                ›
              </button>
              <div className="product-card-media-counter">
                {currentImageIndex + 1} / {previewImages.length}
              </div>
            </>
          )}
        </div>

        <div className="product-card-body">
          <div className="text-micro-label product-card-category">
            {product.category?.replace(/-/g, ' / ') || 'COLLECTION'}
          </div>

          <h3 className="text-product-title product-card-title">
            {product.name}
          </h3>

          <div className="product-card-footer">
            <span className="text-price product-card-price">
              ₩{product.price?.toLocaleString()}
            </span>
            <button
              onClick={handleAddToCart}
              className="product-card-cart-btn"
            >
              ADD TO CART
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default ProductCard
