import { describe, expect, it } from 'vitest'
import { cors } from './cors'

describe('AI Edge Function CORS', () => {
  it('allows the existing Cloudflare and local origins', () => {
    expect(cors('https://business-os-a5w.pages.dev')['Access-Control-Allow-Origin']).toBe('https://business-os-a5w.pages.dev')
    expect(cors('http://localhost:5173')['Access-Control-Allow-Origin']).toBe('http://localhost:5173')
  })

  it('allows explicitly configured Vercel/custom origins', () => {
    expect(cors('https://app.example.com', ['https://app.example.com'])['Access-Control-Allow-Origin']).toBe('https://app.example.com')
  })

  it('does not reflect an unlisted origin', () => {
    expect(cors('https://untrusted.example.com')['Access-Control-Allow-Origin']).toBe('https://business-os-a5w.pages.dev')
  })
})
