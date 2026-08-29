import { describe, it, expect } from 'vitest'

import { readImageDimensions, readBlobImageDimensions } from '@/utils/imageSize'

/** 构造最小 PNG 头（签名 + IHDR chunk 头 + 宽高） */
function pngHeader(width: number, height: number): Uint8Array {
  const bytes = new Uint8Array(24)
  bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  const view = new DataView(bytes.buffer)
  view.setUint32(8, 13) // IHDR length
  bytes.set([0x49, 0x48, 0x44, 0x52], 12) // 'IHDR'
  view.setUint32(16, width)
  view.setUint32(20, height)
  return bytes
}

/** 构造最小 JPEG：SOI + 一个 DHT 段（跳过）+ SOF0 段（含尺寸） */
function jpegHeader(width: number, height: number): Uint8Array {
  const bytes = new Uint8Array(64)
  bytes[0] = 0xff; bytes[1] = 0xd8 // SOI
  bytes[2] = 0xff; bytes[3] = 0xc4 // DHT
  bytes[4] = 0x00; bytes[5] = 0x0a // 段长 10（含自身）
  // DHT 数据填充至偏移 2+2+10 = 14
  bytes[14] = 0xff; bytes[15] = 0xc0 // SOF0
  bytes[16] = 0x00; bytes[17] = 0x11 // 段长
  bytes[18] = 0x08 // 精度
  const view = new DataView(bytes.buffer)
  view.setUint16(19, height)
  view.setUint16(21, width)
  return bytes
}

describe('readImageDimensions', () => {
  it('reads PNG dimensions from header', () => {
    expect(readImageDimensions(pngHeader(800, 6000))).toEqual({ width: 800, height: 6000 })
    expect(readImageDimensions(pngHeader(64, 64))).toEqual({ width: 64, height: 64 })
  })

  it('reads JPEG dimensions, skipping non-SOF segments', () => {
    expect(readImageDimensions(jpegHeader(1400, 2000))).toEqual({ width: 1400, height: 2000 })
  })

  it('returns null for unsupported or malformed data', () => {
    expect(readImageDimensions(new Uint8Array(10))).toBeNull()
    expect(readImageDimensions(new TextEncoder().encode('GIF89a....'))).toBeNull()
    expect(readImageDimensions(pngHeader(0, 0))).toBeNull()
  })
})

describe('readBlobImageDimensions', () => {
  it('reads from blob head slice', async () => {
    const blob = new Blob([pngHeader(800, 8000)])
    expect(await readBlobImageDimensions(blob)).toEqual({ width: 800, height: 8000 })
  })

  it('returns null on failure instead of throwing', async () => {
    expect(await readBlobImageDimensions(new Blob(['not an image']))).toBeNull()
  })
})
