import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../../components/ProductCard'
import { useScrollAnimation } from '../../hooks/useScrollAnimation'
import { getProductsWithImages } from '../../services/productService'
import { ArrowRight } from "lucide-react";

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const [heroRef, heroVisible] = useScrollAnimation()
  const [categoryRef, categoryVisible] = useScrollAnimation()
  const [productsRef, productsVisible] = useScrollAnimation()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const joinedProducts = await getProductsWithImages()
        setFeaturedProducts(joinedProducts.slice(0, 4))
      } catch (error) {
        console.error('Failed to fetch featured products with images:', error)
        setFeaturedProducts([])
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  return (
    <main className="min-h-screen bg-[#F5F5F5]">
      {/* Hero Section */}
      <section className="max-w-screen-xl mx-auto px-5 md:px-10 py-16 md:py-28 flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 flex flex-col gap-6">
          <h1 className="text-5xl md:text-6xl lg:text-7xl tracking-tighter text-black leading-tight">
            for all hairy friends
          </h1>
          <p className="text-lg text-black/60 leading-relaxed max-w-md">
            Stop crying over your long body. It's okay belly wet first on rainy day.
            You're not alone. Let's show our speciality.
          </p>
          <div className="flex flex-wrap gap-3 mt-4">
            <Link
                to="/products"
                className="inline-flex items-center justify-center h-12 px-8 bg-black text-white text-sm font-medium tracking-wide uppercase hover:bg-black/80 transition-colors gap-2"
            >
              Shop Now
              <ArrowRight size={16} />
            </Link>
            <button className="inline-flex items-center justify-center h-12 px-8 border border-black text-black text-sm font-medium tracking-wide uppercase hover:bg-black hover:text-white transition-colors">
              View Collection
            </button>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="aspect-square overflow-hidden">
            <img
                src="https://api.builder.io/api/v1/image/assets/TEMP/2800c2d0295248600dbdd2a0d0ccb6bddc1b0267?width=600"
                alt="Premium pet fashion hero"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </section>


      {/* Divider */}
      <div className="max-w-screen-xl mx-auto px-5 md:px-10 py-8 border-b border-black/10"></div>


      {/* Collections Section */}
      <section className="section-spacing bg-white">
        <div
          ref={categoryRef}
          className={`container-minimal ${
            categoryVisible ? 'fade-in-up visible' : 'fade-in-up'
          }`}
        >
            <div className="text-center mb-32">
            <div className="text-micro-label mb-6">OUR COLLECTIONS</div>
            <h2 className="text-section-title mb-12">Style for Every<br />Seasonal Shift</h2>
            <p className="text-body-large max-w-lg mx-auto">
              Discover a look for every moment
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <Link to="/products?category=spring-summer" className="group text-center">
              <div className="mb-8">
                <div className="text-micro-label mb-4">01</div>
                <h3 className="text-product-title mb-6">SPRING / SUMMER</h3>
                <p className="text-body">Lightweight fabrics for a breezy look</p>
              </div>
            </Link>

            <Link to="/products?category=fall-winter" className="group text-center">
              <div className="mb-8">
                <div className="text-micro-label mb-4">02</div>
                <h3 className="text-product-title mb-6">FALL / WINTER</h3>
                <p className="text-body">Cozy silhouettes with added warmth</p>
              </div>
            </Link>

            <Link to="/products?category=accessories" className="group text-center">
              <div className="mb-8">
                <div className="text-micro-label mb-4">03</div>
                <h3 className="text-product-title mb-6">ACCESSORIES</h3>
                <p className="text-body">Accessories that finish the look</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="section-spacing bg-october-bg">
        <div
          ref={productsRef}
          className={`container-minimal ${
            productsVisible ? 'fade-in-up visible' : 'fade-in-up'
          }`}
        >
          <div className="text-center mb-32">
            <div className="text-micro-label mb-6">BEST SELLERS</div>
            <h2 className="text-section-title mb-12">Customer Favorites<br />You Need Now</h2>
            <p className="text-body-large max-w-lg mx-auto">
              Explore our top picks for quality comfort and standout styling
            </p>
          </div>

          {loading ? (
            <div className="product-grid">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="card-minimal">
                  <div className="aspect-[5/6] bg-gray-200 animate-pulse"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-1/3"></div>
                    <div className="h-5 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="product-grid">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="text-center mt-24">
            <Link
              to="/products"
              className="inline-block px-8 py-3 bg-orange-500 text-white font-medium text-sm tracking-wider hover:bg-gray-900 transition-all duration-300"
              style={{ letterSpacing: '0.1em' }}
            >
              VIEW ALL PRODUCTS
            </Link>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="section-spacing bg-white pb-32">
        <div className="container-minimal text-center">
          <div className="text-micro-label mb-6">ABOUT</div>
          <h2 className="text-section-title mb-16">
            With your lovable dog<br />
            Make the story happen
          </h2>
          <div className="max-w-2xl mx-auto">
            <p className="text-body-large leading-relaxed">
              hund is not a simple clothes. We provide special moment that you make with your dog.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Home
