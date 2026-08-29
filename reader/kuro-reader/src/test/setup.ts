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
