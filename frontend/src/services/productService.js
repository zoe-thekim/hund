import api, { productAPI } from '../api'
import {
  findMockProductById,
  findMockProductImagesByProductId,
  MOCK_PRODUCTS,
  MOCK_PRODUCT_IMAGES
} from '../data/mockProducts'

const normalizeImageRow = (row) => ({
  id: row.id ?? row.pk ?? row.imageId ?? null,
  productId: String(row.productId ?? row.product_id ?? ''),
  imageUrl: row.imageUrl ?? row.image_url ?? row.url ?? row.src ?? '',
  sortOrder: Number(row.sortOrder ?? row.sort_order ?? row.order ?? 0),
})

const toImageMap = (imageRows) => {
  return imageRows.reduce((acc, row) => {
    const normalized = normalizeImageRow(row)
    if (!normalized.productId || !normalized.imageUrl) {
      return acc
    }

    if (!acc[normalized.productId]) {
      acc[normalized.productId] = []
    }
    acc[normalized.productId].push(normalized)
    return acc
  }, {})
}

const joinProductsWithImages = (products, imageRows) => {
  const imageMap = toImageMap(imageRows)

  return products.map((product) => {
    const productId = String(product.id ?? '')
    const relatedImages = (imageMap[productId] ?? [])
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((row) => row.imageUrl)

    return {
      ...product,
      images: relatedImages,
    }
  })
}

const fetchProductImageRows = async () => {
  try {
    const response = await api.get('/product-images')
    if (Array.isArray(response.data)) {
      return response.data
    }
  } catch {
    // Fallback to next endpoint.
  }

  try {
    const response = await api.get('/product_images')
    if (Array.isArray(response.data)) {
      return response.data
    }
  } catch {
    // Fallback to local mock table.
  }

  return MOCK_PRODUCT_IMAGES
}

export const getProductsWithImages = async () => {
  try {
    const productsResponse = await productAPI.getAll()
    const products = Array.isArray(productsResponse.data) ? productsResponse.data : []
    return products
  } catch {
    return MOCK_PRODUCTS
  }
}

export const getProductWithImages = async (id) => {
  try {
    const productResponse = await productAPI.getById(id)
    return productResponse?.data ?? null
  } catch {
    const mockProduct = findMockProductById(id)
    if (!mockProduct) {
      return null
    }

    return {
      ...mockProduct,
      images: findMockProductImagesByProductId(mockProduct.id).map(
          (row) => row.imageUrl
      ),
    }
  }
}