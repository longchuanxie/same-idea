import '@testing-library/jest-dom/vitest'
import 'fake-indexeddb/auto'

// jsdom 未实现 Blob URL API，store 与组件测试会用到，统一提供确定性 stub
let blobUrlCounter = 0

if (typeof URL.createObjectURL !== 'function') {
  URL.createObjectURL = () => `blob:mock-${++blobUrlCounter}`
}

if (typeof URL.revokeObjectURL !== 'function') {
  URL.revokeObjectURL = () => undefined
}

// pdfjs-dist 模块加载时需要 Canvas 相关全局，jsdom 未提供（测试不真正渲染画布）
if (typeof (globalThis as Record<string, unknown>).DOMMatrix === 'undefined') {
  (globalThis as Record<string, unknown>).DOMMatrix = class DOMMatrixStub {};
}
if (typeof (globalThis as Record<string, unknown>).ImageData === 'undefined') {
  (globalThis as Record<string, unknown>).ImageData = class ImageDataStub {};
}
if (typeof (globalThis as Record<string, unknown>).Path2D === 'undefined') {
  (globalThis as Record<string, unknown>).Path2D = class Path2DStub {};
}

// pdfjs 6 使用新的 Uint8Array.prototype.toHex/fromHex（jsdom realm 原型上缺失）
const uint8Proto = Uint8Array.prototype as unknown as Record<string, unknown>;
if (typeof uint8Proto.toHex !== 'function') {
  uint8Proto.toHex = function toHex(this: Uint8Array): string {
    return Array.from(this, (b) => b.toString(16).padStart(2, '0')).join('');
  };
}
if (typeof uint8Proto.fromHex !== 'function') {
  (Uint8Array as unknown as Record<string, unknown>).fromHex = function fromHex(hex: string): Uint8Array {
    const pairs = hex.match(/.{2}/g) ?? [];
    return Uint8Array.from(pairs.map((pair) => parseInt(pair, 16)));
  };
}
