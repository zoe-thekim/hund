import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../../components/ProductCard'
import { useScrollAnimation } from '../../hooks/useScrollAnimation'
import { getProductsWithImages } from '../../services/productService'

const Products = () => {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useSearchParams()

  const [filtersRef, filtersVisible] = useScrollAnimation()
  const [productsRef, productsVisible] = useScrollAnimation()

  const selectedCategory = searchParams.get('category') || 'all'
  const sortBy = searchParams.get('sort') || 'name'

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const joinedProducts = await getProductsWithImages()
        setProducts(joinedProducts)
      } catch (error) {
        console.error('Failed to fetch products with images:', error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  useEffect(() => {
    let filtered = products

    if (selectedCategory !== 'all') {
      filtered = products.filter(product => product.category === selectedCategory)
    }

    if (sortBy === 'price-low') {
      filtered = [...filtered].sort((a, b) => a.price - b.price)
    } else if (sortBy === 'price-high') {
      filtered = [...filtered].sort((a, b) => b.price - a.price)
    } else {
      filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name))
    }

    setFilteredProducts(filtered)
  }, [products, selectedCategory, sortBy])

  const handleCategoryChange = (category) => {
    const newParams = new URLSearchParams(searchParams)
    if (category === 'all') {
      newParams.delete('category')
    } else {
      newParams.set('category', category)
    }
    setSearchParams(newParams)
  }

  const handleSortChange = (sort) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set('sort', sort)
    setSearchParams(newParams)
  }

  const categories = useMemo(() => {
    const distinctCategories = [...new Set(products.map((product) => product.category).filter(Boolean))]
    const dynamicCategories = distinctCategories.map((category) => ({
      key: category,
      label: category.replace(/-/g, ' / ').toUpperCase(),
      name: category
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase())
    }))

    return [
      { key: 'all', label: 'ALL COLLECTIONS', name: 'All Collections' },
      ...dynamicCategories
    ]
  }, [products])

  const sortOptions = [
    { key: 'name', label: 'NAME' },
    { key: 'price-low', label: 'PRICE: LOW TO HIGH' },
    { key: 'price-high', label: 'PRICE: HIGH TO LOW' }
  ]

  return (
    <div className="min-h-screen bg-october-bg pt-20 products-page">
      {/* Hero Section */}
      {/*<section className="section-spacing bg-white">*/}
      {/*  <div*/}
      {/*    ref={heroRef}*/}
      {/*    className={`container-minimal text-center ${*/}
      {/*      heroVisible ? 'fade-in-up visible' : 'fade-in-up'*/}
      {/*    }`}*/}
      {/*  >*/}
      {/*    <div className="text-micro-label mb-6">OUR COLLECTIONS</div>*/}
      {/*    <h1 className="text-display text-october-text mb-12">*/}
      {/*      당신의 반려견을 위한<br />특별한 스타일링*/}
      {/*    </h1>*/}
      {/*    <p className="text-body-large max-w-lg mx-auto mb-16">*/}
      {/*      계절과 순간에 맞는 완벽한 의상을 발견하세요*/}
      {/*    </p>*/}
      {/*    <div className="text-micro-label">*/}
      {/*      {filteredProducts.length} PRODUCTS AVAILABLE*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*</section>*/}

      {/* Current Collection Info */}
      {/*<section className="py-24 bg-october-bg">*/}
      {/*  <div className="container-minimal">*/}
      {/*    <div className="text-micro-label mb-6">CURRENTLY VIEWING</div>*/}
      {/*    <h2 className="text-product-title text-october-text mb-4">*/}
      {/*      {selectedCategoryData.label}*/}
      {/*    </h2>*/}
      {/*  </div>*/}
      {/*</section>*/}

      <div className="container-minimal pb-32 products-page-content">
        {/* Filter Section */}
        <div
          ref={filtersRef}
          className={`mb-32 ${
            filtersVisible ? 'fade-in-up visible' : 'fade-in-up'
          }`}
        >
          <div className="flex flex-col lg:flex-row gap-16 items-start justify-between">
            <div className="flex flex-col gap-8">
              <div className="text-micro-label">FILTER BY CATEGORY</div>
              <div className="products-filter-chips">
                {categories.map((category) => (
                  <button
                    key={category.key}
                    onClick={() => handleCategoryChange(category.key)}
                    className={`product-filter-chip ${
                      selectedCategory === category.key
                        ? 'is-active'
                        : ''
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="text-micro-label">SORT BY</div>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="products-sort-select"
              >
                {sortOptions.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div
          ref={productsRef}
          className={`${
            productsVisible ? 'fade-in-up visible' : 'fade-in-up'
          }`}
        >
          {loading ? (
            <div className="product-grid products-catalog-grid">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="card-minimal products-skeleton-card">
                  <div className="products-skeleton-media"></div>
                  <div className="products-skeleton-body">
                    <div className="products-skeleton-line products-skeleton-line-sm"></div>
                    <div className="products-skeleton-line"></div>
                    <div className="products-skeleton-line products-skeleton-line-md"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="product-grid products-catalog-grid">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-32">
              <div className="text-micro-label mb-6">NO PRODUCTS</div>
              <h3 className="text-product-title text-october-text mb-8">다른 컬렉션을 선택해보세요</h3>
              <button
                onClick={() => handleCategoryChange('all')}
                className="px-6 py-3 border border-gray-900 text-gray-900 font-medium text-sm hover:bg-gray-900 hover:text-white transition-all duration-300"
                style={{ letterSpacing: '0.1em' }}
              >
                VIEW ALL COLLECTIONS
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Products
