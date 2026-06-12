import type { BirthInput } from '../types'

const PARAM = 'share'

function encodeBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let binary = ''
  bytes.forEach((b) => { binary += String.fromCharCode(b) })
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function decodeBase64Url(text: string): string {
  const padded = text.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (text.length % 4)) % 4)
  const binary = atob(padded)
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

export function createShareUrl(input: BirthInput): string {
  const payload = {
    ...input,
    chartImageId: undefined,
  }
  const url = new URL(window.location.href)
  url.searchParams.set(PARAM, encodeBase64Url(JSON.stringify(payload)))
  return url.toString()
}

export function readSharedInput(): BirthInput | null {
  const raw = new URLSearchParams(window.location.search).get(PARAM)
  if (!raw) return null
  try {
    return JSON.parse(decodeBase64Url(raw)) as BirthInput
  } catch {
    return null
  }
}
