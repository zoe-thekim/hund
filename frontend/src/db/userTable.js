const USER_DB_KEY = 'october_user_table_v1'

const USER_TABLE_SCHEMA = {
  table: 'users',
  version: 1,
  columns: {
    id: 'string',
    name: 'string',
    email: 'string(unique)',
    password: 'string',
    phoneNumber: 'string|null',
    address: 'string|null',
    birthDate: 'string|null(YYYY-MM-DD)',
    createdAt: 'string(ISO datetime)',
    updatedAt: 'string(ISO datetime)'
  }
}

const readStore = () => {
  if (typeof window === 'undefined') {
    return { version: USER_TABLE_SCHEMA.version, users: [] }
  }

  const raw = window.localStorage.getItem(USER_DB_KEY)
  if (!raw) {
    return { version: USER_TABLE_SCHEMA.version, users: [] }
  }

  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed.users)) {
      return { version: USER_TABLE_SCHEMA.version, users: [] }
    }

    return {
      version: parsed.version ?? USER_TABLE_SCHEMA.version,
      users: parsed.users,
    }
  } catch {
    return { version: USER_TABLE_SCHEMA.version, users: [] }
  }
}

const writeStore = (store) => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(USER_DB_KEY, JSON.stringify(store))
}

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phoneNumber: user.phoneNumber ?? null,
  address: user.address ?? null,
  birthDate: user.birthDate ?? null,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
})

export const getUserTableSchema = () => USER_TABLE_SCHEMA

export const findUserByEmail = (email) => {
  const store = readStore()
  return store.users.find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? null
}

export const findUserById = (id) => {
  const store = readStore()
  const user = store.users.find((item) => item.id === id)
  return user ? sanitizeUser(user) : null
}

export const createUser = ({ name, email, password }) => {
  const store = readStore()
  const exists = store.users.some((user) => user.email.toLowerCase() === email.toLowerCase())
  if (exists) {
    throw new Error('DUPLICATE_EMAIL')
  }

  const timestamp = new Date().toISOString()
  const user = {
    id: crypto.randomUUID(),
    name,
    email,
    password,
    phoneNumber: null,
    address: null,
    birthDate: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  }

  store.users.push(user)
  writeStore(store)

  return sanitizeUser(user)
}

export const verifyUserCredentials = (email, password) => {
  const user = findUserByEmail(email)
  if (!user) {
    return null
  }

  if (user.password !== password) {
    return null
  }

  return sanitizeUser(user)
}

export const updateUserOptionalProfile = (userId, { phoneNumber, address, birthDate }) => {
  const store = readStore()
  const userIndex = store.users.findIndex((user) => user.id === userId)
  if (userIndex < 0) {
    throw new Error('USER_NOT_FOUND')
  }

  const user = store.users[userIndex]
  store.users[userIndex] = {
    ...user,
    phoneNumber: phoneNumber || null,
    address: address || null,
    birthDate: birthDate || null,
    updatedAt: new Date().toISOString(),
  }

  writeStore(store)
  return sanitizeUser(store.users[userIndex])
}
