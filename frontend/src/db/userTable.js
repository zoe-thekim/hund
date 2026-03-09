const USER_DB_KEY = 'october_user_table_v1'

const USER_TABLE_SCHEMA = {
  table: 'users',
  version: 2,
  columns: {
    id: 'string',
    name: 'string',
    email: 'string(unique)',
    password: 'string',
    phoneNumber: 'string|null',
    address: 'string|null',
    birthDate: 'string|null(YYYY-MM-DD)',
    emailVerified: 'boolean',
    emailVerificationCode: 'string|null',
    emailVerificationSentAt: 'string|null(ISO datetime)',
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
  emailVerified: user.emailVerified ?? false,
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
    emailVerified: false,
    emailVerificationCode: null,
    emailVerificationSentAt: null,
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

export const updateUserPassword = (userId, currentPassword, newPassword) => {
  const store = readStore()
  const userIndex = store.users.findIndex((user) => user.id === userId)
  if (userIndex < 0) {
    throw new Error('USER_NOT_FOUND')
  }

  const user = store.users[userIndex]
  if (user.password !== currentPassword) {
    throw new Error('INVALID_CURRENT_PASSWORD')
  }

  store.users[userIndex] = {
    ...user,
    password: newPassword,
    updatedAt: new Date().toISOString(),
  }

  writeStore(store)
  return sanitizeUser(store.users[userIndex])
}

export const generateEmailVerificationCode = (userId) => {
  const store = readStore()
  const userIndex = store.users.findIndex((user) => user.id === userId)
  if (userIndex < 0) {
    throw new Error('USER_NOT_FOUND')
  }

  const verificationCode = Math.random().toString().slice(2, 8)
  store.users[userIndex] = {
    ...store.users[userIndex],
    emailVerificationCode: verificationCode,
    emailVerificationSentAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  writeStore(store)
  return verificationCode
}

export const verifyEmailCode = (userId, code) => {
  const store = readStore()
  const userIndex = store.users.findIndex((user) => user.id === userId)
  if (userIndex < 0) {
    throw new Error('USER_NOT_FOUND')
  }

  const user = store.users[userIndex]
  if (user.emailVerificationCode !== code) {
    throw new Error('INVALID_CODE')
  }

  const sentAt = new Date(user.emailVerificationSentAt)
  const now = new Date()
  const diffMinutes = (now - sentAt) / (1000 * 60)

  if (diffMinutes > 10) {
    throw new Error('CODE_EXPIRED')
  }

  store.users[userIndex] = {
    ...user,
    emailVerified: true,
    emailVerificationCode: null,
    emailVerificationSentAt: null,
    updatedAt: new Date().toISOString(),
  }

  writeStore(store)
  return sanitizeUser(store.users[userIndex])
}

export const isEmailVerified = (userId) => {
  const user = findUserById(userId)
  return user?.emailVerified || false
}
