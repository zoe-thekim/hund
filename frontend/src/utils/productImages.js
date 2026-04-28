const FALLBACK_COLORS = [
  ['#f5f1ea', '#d8ccc0'],
  ['#edeff2', '#cfd8e2'],
  ['#f3ece5', '#dccbb9'],
  ['#ece8f2', '#d2c8e6'],
  ['#e8f0ec', '#c4d8cd'],
]

const buildSvgFallback = (seed, index) => {
  const [from, to] = FALLBACK_COLORS[index % FALLBACK_COLORS.length]
  const label = `October ${seed} ${index + 1}`
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${from}" />
          <stop offset="100%" stop-color="${to}" />
        </linearGradient>
      </defs>
      <rect width="1200" height="1200" fill="url(#g)" />
      <text x="50%" y="52%" text-anchor="middle" font-family="Pretendard, Arial, sans-serif"
        font-size="62" fill="#3c3c3c" opacity="0.75">${label}</text>
    </svg>
  `

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

const buildFallbackImages = (seed, count) => {
  return Array.from({ length: count }, (_, index) => buildSvgFallback(seed, index))
}

export const getProductImages = (product, max = 8) => {
  if (!product) {
    console.log('getProductImages: No product provided')
    return []
  }

  const seed = String(product.id ?? 'product')
  const imageCandidates = []

  console.log('getProductImages: Processing product', product.id, product.name)
  console.log('getProductImages: Product images array:', product.images)

  // Use images provided by backend API first.
  if (Array.isArray(product.images) && product.images.length > 0) {
    const apiImages = product.images.map(img => img.imageUrl).filter(Boolean)
    console.log('getProductImages: API images found:', apiImages)
    imageCandidates.push(...apiImages)
  }

  // Also check legacy image field.
  if (product.image) {
    console.log('getProductImages: Legacy image found:', product.image)
    imageCandidates.unshift(product.image)
  }

  // Add fallback images only when the candidate list is short.
  if (imageCandidates.length < max) {
    const fallbackCount = max - imageCandidates.length
    console.log('getProductImages: Adding', fallbackCount, 'fallback images')
    imageCandidates.push(...buildFallbackImages(seed, fallbackCount))
  }

  const result = [...new Set(imageCandidates)].slice(0, max)
  console.log('getProductImages: Final result:', result)
  return result
}
