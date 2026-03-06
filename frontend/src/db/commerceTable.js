const COMMERCE_DB_KEY = 'october_commerce_table_v1'

const COMMERCE_SCHEMA = {
  version: 1,
  tables: {
    products: {
      pk: 'id',
      columns: {
        id: 'string',
        name: 'string',
        price: 'number',
        category: 'string',
        isActive: 'boolean',
        createdAt: 'string(ISO datetime)',
        updatedAt: 'string(ISO datetime)',
      },
    },
    inventory: {
      pk: 'id',
      columns: {
        id: 'string',
        productId: 'string(FK:products.id)',
        quantity: 'number',
        updatedAt: 'string(ISO datetime)',
      },
    },
    inventoryMovements: {
      pk: 'id',
      columns: {
        id: 'string',
        productId: 'string(FK:products.id)',
        orderId: 'string|null(FK:orders.id)',
        movementType: "'in'|'out'",
        quantity: 'number',
        reason: 'string',
        createdAt: 'string(ISO datetime)',
      },
    },
    orders: {
      pk: 'id',
      columns: {
        id: 'string',
        userId: 'string(FK:users.id)',
        status: "'pending'|'paid'|'shipping'|'done'|'cancelled'",
        orderedAt: 'string(YYYY-MM-DD)',
        totalAmount: 'number',
        createdAt: 'string(ISO datetime)',
      },
    },
    orderItems: {
      pk: 'id',
      columns: {
        id: 'string',
        orderId: 'string(FK:orders.id)',
        productId: 'string(FK:products.id)',
        unitPrice: 'number',
        quantity: 'number',
        createdAt: 'string(ISO datetime)',
      },
    },
  },
}

const seedProducts = [
  { id: 'p-001', name: '코지 니트 스웨터', price: 45000, category: 'spring-summer' },
  { id: 'p-002', name: '레인보우 레인코트', price: 38000, category: 'spring-summer' },
  { id: 'p-003', name: '윈터 패딩 자켓', price: 89000, category: 'fall-winter' },
  { id: 'p-004', name: '체크 셔츠', price: 32000, category: 'spring-summer' },
]

const createEmptyStore = () => ({
  version: COMMERCE_SCHEMA.version,
  products: [],
  inventory: [],
  inventoryMovements: [],
  orders: [],
  orderItems: [],
})

const readStore = () => {
  if (typeof window === 'undefined') {
    return createEmptyStore()
  }

  const raw = window.localStorage.getItem(COMMERCE_DB_KEY)
  if (!raw) {
    return createEmptyStore()
  }

  try {
    const parsed = JSON.parse(raw)
    return {
      ...createEmptyStore(),
      ...parsed,
    }
  } catch {
    return createEmptyStore()
  }
}

const writeStore = (store) => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(COMMERCE_DB_KEY, JSON.stringify(store))
}

const nowIso = () => new Date().toISOString()
const todayDate = () => new Date().toISOString().slice(0, 10)

const statusToLabel = (status) => {
  switch (status) {
    case 'done':
      return '배송 완료'
    case 'shipping':
      return '배송 중'
    case 'paid':
      return '결제 완료'
    case 'pending':
      return '주문 접수'
    case 'cancelled':
      return '주문 취소'
    default:
      return status
  }
}

export const getCommerceSchema = () => COMMERCE_SCHEMA

export const initializeCommerceTables = () => {
  const store = readStore()

  if (store.products.length === 0) {
    const timestamp = nowIso()
    store.products = seedProducts.map((product) => ({
      ...product,
      isActive: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    }))
    store.inventory = seedProducts.map((product) => ({
      id: `inv-${product.id}`,
      productId: product.id,
      quantity: 50,
      updatedAt: timestamp,
    }))
  }

  writeStore(store)
}

const createOrderInternal = (store, { userId, status = 'done', orderedAt = todayDate(), items }) => {
  if (!userId) {
    throw new Error('USER_ID_REQUIRED')
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('ORDER_ITEMS_REQUIRED')
  }

  const timestamp = nowIso()
  const orderId = `ord-${crypto.randomUUID()}`

  const orderItems = items.map((item) => {
    const product = store.products.find((p) => p.id === item.productId)
    if (!product) {
      throw new Error('PRODUCT_NOT_FOUND')
    }

    const inventory = store.inventory.find((inv) => inv.productId === product.id)
    if (!inventory || inventory.quantity < item.quantity) {
      throw new Error('OUT_OF_STOCK')
    }

    inventory.quantity -= item.quantity
    inventory.updatedAt = timestamp

    store.inventoryMovements.push({
      id: `mov-${crypto.randomUUID()}`,
      productId: product.id,
      orderId,
      movementType: 'out',
      quantity: item.quantity,
      reason: 'order_created',
      createdAt: timestamp,
    })

    return {
      id: `oi-${crypto.randomUUID()}`,
      orderId,
      productId: product.id,
      unitPrice: product.price,
      quantity: item.quantity,
      createdAt: timestamp,
    }
  })

  const totalAmount = orderItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)

  const order = {
    id: orderId,
    userId,
    status,
    orderedAt,
    totalAmount,
    createdAt: timestamp,
  }

  store.orders.push(order)
  store.orderItems.push(...orderItems)

  return order
}

export const seedOrdersForUser = (userId) => {
  initializeCommerceTables()

  const store = readStore()
  const alreadyExists = store.orders.some((order) => order.userId === userId)
  if (alreadyExists) {
    return
  }

  createOrderInternal(store, {
    userId,
    status: 'done',
    orderedAt: '2026-02-20',
    items: [
      { productId: 'p-001', quantity: 1 },
    ],
  })

  createOrderInternal(store, {
    userId,
    status: 'shipping',
    orderedAt: '2026-02-15',
    items: [
      { productId: 'p-003', quantity: 1 },
    ],
  })

  writeStore(store)
}

export const getOrdersByUserId = (userId) => {
  initializeCommerceTables()

  const store = readStore()
  const userOrders = store.orders
    .filter((order) => order.userId === userId)
    .sort((a, b) => b.orderedAt.localeCompare(a.orderedAt))

  return userOrders.map((order) => {
    const items = store.orderItems
      .filter((item) => item.orderId === order.id)
      .map((item) => {
        const product = store.products.find((p) => p.id === item.productId)
        return {
          productId: item.productId,
          name: product?.name ?? '알 수 없는 상품',
          price: item.unitPrice,
          quantity: item.quantity,
        }
      })

    return {
      id: order.id,
      date: order.orderedAt,
      status: statusToLabel(order.status),
      items,
      total: order.totalAmount,
    }
  })
}

export const getInventorySnapshot = () => {
  initializeCommerceTables()
  const store = readStore()
  return store.inventory.map((inv) => ({
    ...inv,
    productName: store.products.find((p) => p.id === inv.productId)?.name ?? inv.productId,
  }))
}
