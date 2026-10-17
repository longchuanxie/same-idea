/// <reference types="vite/client" />

// foliate-js 是纯 JS 库（无类型发布），MOBI 解析的消费面在
// src/services/mobiContent.ts 的 MobiBook/MobiSection 接口里收敛
declare module 'foliate-js/mobi.js' {
  export const isMOBI: (file: Blob) => Promise<boolean>
  export class MOBI {
    constructor(options: { unzlib: (bytes: Uint8Array) => Promise<Uint8Array> })
    open(file: Blob): Promise<unknown>
  }
}

interface ImportMetaEnv {
  readonly VITE_FTP_PROXY_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
