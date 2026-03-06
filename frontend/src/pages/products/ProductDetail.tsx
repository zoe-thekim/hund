import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import useStore from '../../store/useStore'
import { getProductImages } from '../../utils/productImages'
import { getProductWithImages } from '../../services/productService'
import { ShoppingBag, Heart, X } from "lucide-react";

type Product = {
  id: string
  name: string
  price: number
  category?: string
  description?: string
  detailedDescription?: string
  images?: string[]
  sizes?: string[]
  features?: string[]
}

const DEFAULT_SIZES = ['XS', 'S', 'M', 'L', 'XL']

const ProductDetail = () => {
  const { id } = useParams()
  const addToCart = useStore((state) => state.addToCart)

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [wishlisted, setWishlisted] = useState(false)
  const [activeImage, setActiveImage] = useState(0)

  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductWithImages(id)
        setProduct((data as Product | null) ?? null)
      } catch {
        setProduct(null)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  const images = useMemo(() => getProductImages(product, 8), [product])
  const sizes = useMemo(() => {
    if (Array.isArray(product?.sizes) && product.sizes.length > 0) {
      return product.sizes
    }
    return DEFAULT_SIZES
  }, [product])

  const featureList = useMemo(() => {
    if (Array.isArray(product?.features) && product.features.length > 0) {
      return product.features
    }
    return [

    ]
  }, [product])

  useEffect(() => {
    setSelectedSize(sizes[2] ?? sizes[0] ?? null)
    setActiveImage(0)
  }, [product?.id, sizes])

  const handleAddToCart = () => {
    if (!product || !selectedSize) {
      return
    }

    addToCart(product, selectedSize, quantity)
  }
  if (loading) {
    return (
      <main className="min-h-screen bg-[#F5F5F5] pt-20">
        <div className="max-w-screen-xl mx-auto px-5 md:px-10 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="aspect-square bg-gray-200 animate-pulse" />
            <div className="space-y-4">
              <div className="h-10 bg-gray-200 animate-pulse" />
              <div className="h-5 bg-gray-200 animate-pulse w-2/3" />
              <div className="h-40 bg-gray-200 animate-pulse" />
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-[#F5F5F5] pt-20">
        <div className="max-w-screen-xl mx-auto px-5 md:px-10 py-16 text-center">
          <h1 className="text-3xl font-semibold mb-4">PRODUCT NOT FOUND</h1>
          <p className="text-black/60 mb-8">요청하신 제품을 찾을 수 없습니다.</p>
          <Link to="/products" className="inline-flex h-12 px-6 items-center bg-black text-white text-sm tracking-wide">
            PRODUCTS로 이동
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#F5F5F5]">
      <div className="max-w-screen-xl mx-auto px-5 md:px-10 py-8 md:py-12">
        <nav className="text-xs text-black/50 mb-6 flex gap-2">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/products">Products</Link>
          <span>/</span>
          <span className="text-black">{product.name}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Scrollable Image Grid */}
          <div className="flex-1 min-w-0 overflow-y-auto max-h-screen">
            {/* Mobile: single featured image + thumbnails */}
            <div className="lg:hidden pb-8">
              <div className="aspect-square w-full overflow-hidden mb-3 cursor-pointer"
                   onClick={() => setSelectedImageIndex(activeImage)}>
                <img
                  src={images[activeImage]}
                  alt={`${product.name} ${activeImage + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {images.slice(0, 4).map((img, i) => (
                  <button
                    key={`${product.id}-mobile-${i + 1}`}
                    onClick={() => setActiveImage(i)}
                    className="aspect-square overflow-hidden border-2 border-transparent hover:border-black transition-colors"
                  >
                    <img src={img}
                         alt={`${product.name} thumb ${i + 1}`}
                         className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Desktop: 2x2 grid continuing down */}
            <div className="hidden lg:grid grid-cols-2 gap-3 pb-8">
              {images.slice(0, 10).map((img, i) => (
                <div key={`${product.id}-desktop-${i + 1}`}
                     className="aspect-square overflow-hidden cursor-pointer group"
                     onClick={() => setSelectedImageIndex(i)}>
                  <img
                    src={img}
                    alt={`${product.name} ${i + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right: Sticky Product Info */}
          <div className="lg:w-[380px] xl:w-[420px] flex-shrink-0 flex flex-col">
            <h1 className="text-4xl md:text-5xl font-normal text-black leading-tight mb-6">
              {product.name}
            </h1>

            <p className="text-sm text-black/60 leading-relaxed mb-6">
              {product.description || product.detailedDescription || '상품 설명이 준비 중입니다.'}
            </p>

            <div className="mb-6">
              <span className="text-2xl font-medium text-black">
                ₩{product.price?.toLocaleString()}
              </span>
            </div>

            {/* Size selector */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-black tracking-wide uppercase">Size</span>
                <button className="text-xs text-black/50 underline underline-offset-2 hover:text-black transition-colors">
                  Size Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`h-10 min-w-[44px] px-3 text-sm border transition-colors ${
                      selectedSize === size
                        ? 'bg-black text-white border-black'
                        : 'bg-transparent text-black border-black/30 hover:border-black'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <span className="text-sm font-medium text-black tracking-wide uppercase block mb-3">Quantity</span>
              <div className="inline-flex items-center border border-black/30">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center text-black hover:bg-black hover:text-white transition-colors text-lg"
                >
                  −
                </button>
                <span className="w-12 text-center text-sm">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-10 h-10 flex items-center justify-center text-black hover:bg-black hover:text-white transition-colors text-lg"
                >
                  +
                </button>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex gap-3">
              <button className="flex-1 h-12 bg-black text-white text-sm font-medium tracking-wide uppercase hover:bg-black/80 transition-colors flex items-center justify-center gap-2">
                <ShoppingBag size={16} />
                Add to Cart
              </button>
              <button
                  onClick={() => setWishlisted((w) => !w)}
                  className={`w-12 h-12 border flex items-center justify-center transition-colors ${
                      wishlisted
                          ? "bg-black text-white border-black"
                          : "border-black/30 text-black hover:border-black"
                  }`}
                  aria-label="Wishlist"
              >
                <Heart
                    size={16}
                    fill={wishlisted ? "currentColor" : "none"}
                />
              </button>
            </div>

            <div className="border-t border-black/10">
              <ProductAccordion title="Product Details">
                <ul className="text-sm text-black/60 space-y-1.5 leading-relaxed">
                  {featureList.map((feature, index) => (
                    <li key={`${product.id}-feature-${index + 1}`}>{feature}</li>
                  ))}
                </ul>
              </ProductAccordion>
              <ProductAccordion title="Shipping & Returns">
                <p className="text-sm text-black/60 leading-relaxed">
                  Free shipping on orders over ₩50,000. Standard delivery 3–5 business days.
                  Returns accepted within 14 days of delivery in original condition.
                </p>
              </ProductAccordion>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImageIndex !== null && (
          <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
              onClick={() => setSelectedImageIndex(null)}
          >
            <div
                className="relative max-w-2xl max-h-[90vh] w-full"
                onClick={(e) => e.stopPropagation()}
            >
              <img
                  src={images[selectedImageIndex]}
                  alt={`${product.name} ${selectedImageIndex + 1}`}
                  className="w-full h-full object-contain"
              />
              <button
                  onClick={() => setSelectedImageIndex(null)}
                  className="absolute top-4 right-4 w-10 h-10 bg-white text-black rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-colors shadow-lg"
                  aria-label="Close"
              >
                <X size={20} />
              </button>

              {/* Navigation arrows */}
              {selectedImageIndex > 0 && (
                  <button
                      onClick={() => setSelectedImageIndex(selectedImageIndex - 1)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white text-black rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-colors shadow-lg"
                      aria-label="Previous image"
                  >
                    ←
                  </button>
              )}
              {selectedImageIndex < images.length - 1 && (
                  <button
                      onClick={() => setSelectedImageIndex(selectedImageIndex + 1)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white text-black rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-colors shadow-lg"
                      aria-label="Next image"
                  >
                    →
                  </button>
              )}

              {/* Image counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-3 py-2 rounded">
                {selectedImageIndex + 1} / {images.length}
              </div>
            </div>
          </div>
      )}
    </main>
  )
}

function ProductAccordion({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-black/10">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between py-4 text-sm font-medium text-black text-left"
      >
        {title}
        <span className="text-black/50 ml-4 text-lg leading-none">
          {open ? '−' : '+'}
        </span>
      </button>
      {open && <div className="pb-4">{children}</div>}
    </div>
  )
}

export default ProductDetail
