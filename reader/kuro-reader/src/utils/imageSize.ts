import type { ImageDimensions } from '@/utils/comicChapterSplit'

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
/** IHDR 数据段内宽/高的字节偏移（自签名 8 字节 + 长度 4 + 类型 4 之后） */
const PNG_IHDR_WIDTH_OFFSET = 16;
const PNG_IHDR_HEIGHT_OFFSET = 20;
const JPEG_SOI = 0xffd8;
/** 需要解析尺寸的 SOF 标记（不含渐进式差异，均含尺寸字段） */
const JPEG_SOF_MARKERS = new Set([
  0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7,
  0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf,
]);
const JPEG_HEIGHT_OFFSET_IN_SEGMENT = 5;
const JPEG_WIDTH_OFFSET_IN_SEGMENT = 7;

function readU16Be(bytes: Uint8Array, offset: number): number {
  return (bytes[offset] << 8) | bytes[offset + 1];
}

/**
 * 从 PNG/JPEG 文件头读取图像尺寸（只解析头部，不解码像素）。
 * 其余格式（WebP/GIF 等）返回 null，调用方按「无尺寸」降级。
 */
export function readImageDimensions(bytes: Uint8Array): ImageDimensions | null {
  if (bytes.length < 24) return null;

  if (PNG_SIGNATURE.every((b, i) => bytes[i] === b)) {
    const width =
      (bytes[PNG_IHDR_WIDTH_OFFSET] << 24) |
      (bytes[PNG_IHDR_WIDTH_OFFSET + 1] << 16) |
      (bytes[PNG_IHDR_WIDTH_OFFSET + 2] << 8) |
      bytes[PNG_IHDR_WIDTH_OFFSET + 3];
    const height =
      (bytes[PNG_IHDR_HEIGHT_OFFSET] << 24) |
      (bytes[PNG_IHDR_HEIGHT_OFFSET + 1] << 16) |
      (bytes[PNG_IHDR_HEIGHT_OFFSET + 2] << 8) |
      bytes[PNG_IHDR_HEIGHT_OFFSET + 3];
    if (width <= 0 || height <= 0) return null;
    return { width, height };
  }

  if (readU16Be(bytes, 0) === JPEG_SOI) {
    let offset = 2;
    while (offset + 9 < bytes.length) {
      if (bytes[offset] !== 0xff) return null;
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
    const header = await blob.slice(0, 256).arrayBuffer();
    return readImageDimensions(new Uint8Array(header));
  } catch {
    return null;
  }
}
