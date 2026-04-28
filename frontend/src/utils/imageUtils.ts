// Image utility functions for consistent image handling across the app

export const DEFAULT_PRODUCT_IMAGE = '/api/placeholder/400/400'

export const getProductImageWithFallback = (imageUrl?: string | null): string => {
  if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim() === '') {
    return DEFAULT_PRODUCT_IMAGE
  }

  const trimmed = imageUrl.trim()

  // If it's already a full URL, return as is
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed
  }

  // If it's a relative path starting with /api/, /uploads/, etc.
  if (trimmed.startsWith('/')) {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'
    try {
      const url = new URL(baseUrl)
      return `${url.origin}${trimmed}`
    } catch {
      return trimmed
    }
  }

  // If it's just a filename, assume it's in uploads
  return `/uploads/${trimmed}`
}

export const getFirstProductImage = (product: any): string => {
  // Try to get the first image from images array
  if (Array.isArray(product?.images) && product.images.length > 0) {
    const firstImage = product.images[0]
    if (typeof firstImage === 'string') {
      return getProductImageWithFallback(firstImage)
    }
    // Handle object format like { imageUrl: '...' }
    if (typeof firstImage === 'object' && firstImage?.imageUrl) {
      return getProductImageWithFallback(firstImage.imageUrl)
    }
  }

  // Fallback to single image property
  if (product?.image) {
    return getProductImageWithFallback(product.image)
  }

  // Fallback to imageUrl property
  if (product?.imageUrl) {
    return getProductImageWithFallback(product.imageUrl)
  }

  // Return default image
  return DEFAULT_PRODUCT_IMAGE
}

export const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
  const img = event.currentTarget
  if (img.src !== DEFAULT_PRODUCT_IMAGE) {
    img.src = DEFAULT_PRODUCT_IMAGE
  }
}