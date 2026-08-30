import type { ImageDimensions } from '@/utils/comicChapterSplit'

/** 十六进制串 → 字节数组（二进制签名的可读写法，避免散落的裸字节字面量） */
function hexToBytes(hex: string): number[] {
  const out: number[] = [];
  for (let i = 0; i < hex.length; i += 2) {
    out.push(parseInt(hex.slice(i, i + 2), 16));
  }
  return out;
}

/** PNG 8 字节签名；IHDR 数据段内宽/高字节偏移（签名 8 + 长度 4 + 类型 4 之后） */
const PNG_SIGNATURE = hexToBytes('89504e470d0a1a0a');
const PNG_IHDR_WIDTH_OFFSET = 16;
const PNG_IHDR_HEIGHT_OFFSET = 20;
const JPEG_SOI = 0xffd8;
/** 段内标记前缀字节 */
const JPEG_MARKER_PREFIX = 0xff;
/** 需要解析尺寸的 SOF 标记（不含渐进式差异，均含尺寸字段） */
const JPEG_SOF_MARKERS = new Set(hexToBytes('c0c1c2c3c5c6c7c9cacbcdcecf'));
const JPEG_HEIGHT_OFFSET_IN_SEGMENT = 5;
const JPEG_WIDTH_OFFSET_IN_SEGMENT = 7;
/** 扫描窗口：段头到宽度字段（标记 1 + 长度 2 + 精度 1 + 高 2 + 宽 2 + 余量 1） */
const JPEG_MIN_SEGMENT_WINDOW = 9;
/** 大端读取的逐字节移位 */
const SHIFT_ONE_BYTE = 8;
/** 大端 32 位 = 高 16 位 × 2^16 + 低 16 位 */
const U16_RADIX = 0x10000;
/** 从 Blob 头部读取的字节数（覆盖 JPEG 段链开头的 IHDR/SOF） */
const HEADER_READ_BYTES = 256;

function readU16Be(bytes: Uint8Array, offset: number): number {
  return (bytes[offset] << SHIFT_ONE_BYTE) | bytes[offset + 1];
}

function readU32Be(bytes: Uint8Array, offset: number): number {
  return readU16Be(bytes, offset) * U16_RADIX + readU16Be(bytes, offset + 2);
}

/**
 * 从 PNG/JPEG 文件头读取图像尺寸（只解析头部，不解码像素）。
 * 其余格式（WebP/GIF 等）返回 null，调用方按「无尺寸」降级。
 */
export function readImageDimensions(bytes: Uint8Array): ImageDimensions | null {
  if (bytes.length < 24) return null;

  if (PNG_SIGNATURE.every((b, i) => bytes[i] === b)) {
    const width = readU32Be(bytes, PNG_IHDR_WIDTH_OFFSET);
    const height = readU32Be(bytes, PNG_IHDR_HEIGHT_OFFSET);
    if (width <= 0 || height <= 0) return null;
    return { width, height };
  }

  if (readU16Be(bytes, 0) === JPEG_SOI) {
    let offset = 2;
    while (offset + JPEG_MIN_SEGMENT_WINDOW < bytes.length) {
      if (bytes[offset] !== JPEG_MARKER_PREFIX) return null;
      const marker = bytes[offset + 1];
      if (JPEG_SOF_MARKERS.has(marker)) {
        const height = readU16Be(bytes, offset + JPEG_HEIGHT_OFFSET_IN_SEGMENT);
        const width = readU16Be(bytes, offset + JPEG_WIDTH_OFFSET_IN_SEGMENT);
        if (width <= 0 || height <= 0) return null;
        return { width, height };
      }
      // 跳过当前段（长度含自身 2 字节）
      const segmentLength = readU16Be(bytes, offset + 2);
      if (segmentLength < 2) return null;
      offset += 2 + segmentLength;
    }
  }

  return null;
}

/** 便捷封装：读 Blob 头部并解析尺寸；任何失败返回 null */
export async function readBlobImageDimensions(blob: Blob): Promise<ImageDimensions | null> {
  try {
    const header = await blob.slice(0, HEADER_READ_BYTES).arrayBuffer();
    return readImageDimensions(new Uint8Array(header));
  } catch {
    return null;
  }
}
