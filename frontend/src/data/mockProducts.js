const BASE_PRODUCTS = [
  { legacyId: 1, id: 'p-001', name: '코지 니트 스웨터', price: 45000, category: 'spring-summer' },
  { legacyId: 2, id: 'p-002', name: '레인보우 레인코트', price: 38000, category: 'spring-summer' },
  { legacyId: 3, id: 'p-003', name: '윈터 패딩 자켓', price: 89000, category: 'fall-winter' },
  { legacyId: 4, id: 'p-004', name: '체크 셔츠', price: 32000, category: 'spring-summer' },
  { legacyId: 5, id: 'p-005', name: '플리스 후드티', price: 52000, category: 'fall-winter' },
  { legacyId: 6, id: 'p-006', name: '실크 스카프', price: 25000, category: 'accessories' },
  { legacyId: 7, id: 'p-007', name: '데님 재킷', price: 67000, category: 'spring-summer' },
  { legacyId: 8, id: 'p-008', name: '울 코트', price: 125000, category: 'fall-winter' },
  { legacyId: 9, id: 'p-009', name: '리본 헤어밴드', price: 18000, category: 'accessories' },
  { legacyId: 10, id: 'p-010', name: '스트라이프 티셔츠', price: 28000, category: 'spring-summer' },
  { legacyId: 11, id: 'p-011', name: '털 부츠', price: 42000, category: 'accessories' },
  { legacyId: 12, id: 'p-012', name: '카디건', price: 58000, category: 'fall-winter' }
]

const MOCK_IMAGE_COLORS = [
  ['#f4ede4', '#d8c4ad'],
  ['#e8edf2', '#c8d4de'],
  ['#efe8f4', '#d8cae9'],
  ['#ebf0e8', '#cbdac5'],
]

const buildMockImage = (seed, index) => {
  const [from, to] = MOCK_IMAGE_COLORS[index % MOCK_IMAGE_COLORS.length]
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1200" viewBox="0 0 1000 1200">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${from}" />
          <stop offset="100%" stop-color="${to}" />
        </linearGradient>
      </defs>
      <rect width="1000" height="1200" fill="url(#g)" />
      <text x="50%" y="50%" text-anchor="middle" font-family="Pretendard, Arial, sans-serif"
        font-size="44" fill="#2f2f2f" opacity="0.74">${seed} / ${index + 1}</text>
    </svg>
  `

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

export const MOCK_PRODUCT_IMAGES = BASE_PRODUCTS.flatMap((product) => (
  Array.from({ length: 6 }, (_, index) => ({
    id: `pi-${product.id}-${index + 1}`,
    productId: product.id,
    imageUrl: buildMockImage(product.id, index),
    sortOrder: index + 1
  }))
))

const withProductMeta = (product) => ({
  ...product,
  description: `${product.name} 제품입니다. 반려견의 편안한 착용감과 활동성을 고려한 디자인입니다.`,
  detailedDescription: `${product.name}은(는) 시월의 시즌 무드를 반영한 아이템으로, 일상 산책부터 특별한 외출까지 폭넓게 매치할 수 있습니다.`,
  features: ['부드러운 착용감', '가벼운 무게감', '활동성 중심 패턴', '손쉬운 관리'],
  colors: [
    { name: 'Cream', value: '#EFE8DD' },
    { name: 'Olive', value: '#7B8561' },
    { name: 'Charcoal', value: '#40444F' },
    { name: 'Rose', value: '#C78C8D' }
  ]
})

export const findMockProductImagesByProductId = (productId) => {
  const rawId = String(productId ?? '')
  return MOCK_PRODUCT_IMAGES
    .filter((image) => String(image.productId) === rawId)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
}

export const MOCK_PRODUCTS = BASE_PRODUCTS.map((product) => ({
  ...withProductMeta(product),
  images: findMockProductImagesByProductId(product.id).map((image) => image.imageUrl)
}))

export const findMockProductById = (id) => {
  const rawId = String(id ?? '')
  const parsed = Number.parseInt(rawId, 10)

  const base = BASE_PRODUCTS.find((product) => (
    String(product.id) === rawId ||
    String(product.legacyId) === rawId ||
    (!Number.isNaN(parsed) && product.legacyId === parsed)
  ))

  if (!base) {
    return null
  }

  return {
    ...withProductMeta(base),
    images: findMockProductImagesByProductId(base.id).map((image) => image.imageUrl)
  }
}
