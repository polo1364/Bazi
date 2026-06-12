/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BASE_PATH?: string
  readonly VITE_AI_PROXY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
