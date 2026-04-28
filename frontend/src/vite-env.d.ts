declare module '*.png' {
  const src: string
  export default src
}

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_TOSS_CLIENT_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
