import { describe, it, expect } from 'vitest'

describe('vitest smoke', () => {
  it('arithmetic works', () => {
    expect(1 + 1).toBe(2)
  })

  it('jsdom is available', () => {
    const el = document.createElement('div')
    el.textContent = 'hello'
    expect(el.textContent).toBe('hello')
  })

  it('fake-indexeddb is wired', () => {
    expect(typeof indexedDB).toBe('object')
    expect(indexedDB).not.toBeUndefined()
  })
})
