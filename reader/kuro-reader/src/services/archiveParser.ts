import { Archive } from 'libarchive.js';

import type { Comic, Chapter } from '@/types';
import { isNativePlatform } from '@/utils/capacitor';

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp']);
const BYTES_PER_KB = 1024;
const BYTES_PER_MB = BYTES_PER_KB * BYTES_PER_KB;
const MAX_EXTRACT_SIZE_MB = 500;
const MAX_EXTRACT_SIZE = MAX_EXTRACT_SIZE_MB * BYTES_PER_MB;
const ARCHIVE_TIMEOUT = 30000;

function getFileExtension(name: string): string {
  const dot = name.lastIndexOf('.');
  return dot >= 0 ? name.substring(dot).toLowerCase() : '';
}

function isImageFile(name: string): boolean {
  return IMAGE_EXTENSIONS.has(getFileExtension(name));
}

function naturalCompare(a: string, b: string): number {
  const ax: (string | number)[] = [];
  const bx: (string | number)[] = [];

  a.replace(/(\d+)|(\D+)/g, (_, num, nonNum) => {
    if (num !== undefined) ax.push(parseInt(num, 10));
    if (nonNum !== undefined) ax.push(nonNum.toLowerCase());
    return '';
  });
  b.replace(/(\d+)|(\D+)/g, (_, num, nonNum) => {
    if (num !== undefined) bx.push(parseInt(num, 10));
    if (nonNum !== undefined) bx.push(nonNum.toLowerCase());
    return '';
  });

  const len = Math.min(ax.length, bx.length);
  for (let i = 0; i < len; i++) {
    const va = ax[i];
    const vb = bx[i];
    if (typeof va === 'number' && typeof vb === 'number') {
      if (va !== vb) return va - vb;
    } else {
      const sa = String(va);
      const sb = String(vb);
      const cmp = sa.localeCompare(sb);
      if (cmp !== 0) return cmp;
    }
  }
  return ax.length - bx.length;
}

function sortImagesByNumber(files: string[]): string[] {
  return [...files].sort((a, b) => {
    const nameA = a.split('/').pop() ?? a;
    const nameB = b.split('/').pop() ?? b;
    return naturalCompare(nameA, nameB);
  });
}

const BRACKET_PATTERN = /[【[](.+?)[】\]]/;
const LEADING_CHARS_PATTERN = /^[[\]【】\s]+/u;

function extractTitleFromFileName(fileName: string): string {
  let title = fileName.replace(/\.[^.]+$/, '');
  const bracketMatch = title.match(BRACKET_PATTERN);
  if (bracketMatch) {
    title = bracketMatch[1].trim();
  } else {
    title = title.replace(LEADING_CHARS_PATTERN, '').trim();
  }
  return title || fileName;
}

export interface ParsedArchive {
  title: string;
  coverBlob: Blob | null;
  pages: Blob[];
  pageNames: string[];
}

function checkFileSize(file: File): void {
  if (file.size > MAX_EXTRACT_SIZE) {
    const fileSizeMB = (file.size / BYTES_PER_MB).toFixed(1);
    const maxSizeMB = (MAX_EXTRACT_SIZE / BYTES_PER_MB).toFixed(1);
    throw new Error(`文件过大: ${fileSizeMB}MB, 最大支持 ${maxSizeMB}MB`);
  }
}

async function extractWithJSZip(file: File): Promise<Record<string, Blob>> {
  const JSZip = (await import('jszip')).default;
  const zip = await JSZip.loadAsync(file);
  const result: Record<string, Blob> = {};

  for (const [path, zipEntry] of Object.entries(zip.files)) {
    if (!zipEntry.dir) {
      const blob = await zipEntry.async('blob');
      result[path] = blob;
    }
  }

  return result;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms);
    promise.then(
      (val) => { clearTimeout(timer); resolve(val); },
      (err) => { clearTimeout(timer); reject(err); }
    );
  });
}

function shouldUseJSZipFirst(fileName: string): boolean {
  if (isNativePlatform()) return true;
  const ext = getFileExtension(fileName);
  return ext === '.zip' || ext === '.cbz';
}

export async function parseArchiveFile(file: File): Promise<ParsedArchive> {
  checkFileSize(file);

  let extracted: Record<string, Blob>;

  if (shouldUseJSZipFirst(file.name)) {
    try {
      extracted = await withTimeout(extractWithJSZip(file), ARCHIVE_TIMEOUT);
    } catch {
      try {
        Archive.init({
          workerUrl: new URL('libarchive.js/dist/worker-bundle.js', import.meta.url).href,
        });
        const archive = await Archive.open(file);
        const files = await archive.extractFiles();
        extracted = flattenArchiveFiles(files as Record<string, unknown>);
      } catch {
        throw new Error('压缩包解析失败，请确保文件格式正确');
      }
    }
  } else {
    try {
      Archive.init({
        workerUrl: new URL('libarchive.js/dist/worker-bundle.js', import.meta.url).href,
      });
      const archive = await withTimeout(Archive.open(file), ARCHIVE_TIMEOUT);
      const files = await withTimeout(archive.extractFiles(), ARCHIVE_TIMEOUT);
      extracted = flattenArchiveFiles(files as Record<string, unknown>);
    } catch {
      throw new Error('压缩包解析失败，请确保文件格式正确');
    }
  }

  const imageFiles: { path: string; blob: Blob }[] = [];

  for (const [path, blob] of Object.entries(extracted)) {
    if (isImageFile(path)) {
      imageFiles.push({ path, blob });
    }
  }

  const sortedPaths = sortImagesByNumber(imageFiles.map((f) => f.path));
  const pathToBlob = new Map(imageFiles.map((f) => [f.path, f.blob]));

  const pages: Blob[] = [];
  const pageNames: string[] = [];
  for (const p of sortedPaths) {
    const blob = pathToBlob.get(p);
    if (blob) {
      pages.push(blob);
      pageNames.push(p.split('/').pop() ?? p);
    }
  }

  const coverBlob = pages.length > 0 ? pages[0] : null;
  const title = extractTitleFromFileName(file.name);

  return { title, coverBlob, pages, pageNames };
}

function flattenArchiveFiles(
  obj: Record<string, unknown>,
  prefix: string = ''
): Record<string, Blob> {
  const result: Record<string, Blob> = {};

  for (const [name, value] of Object.entries(obj)) {
    const fullPath = prefix ? `${prefix}/${name}` : name;
    if (value instanceof Blob) {
      result[fullPath] = value;
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      const nested = flattenArchiveFiles(value as Record<string, unknown>, fullPath);
      Object.assign(result, nested);
    }
  }

  return result;
}

export async function parseImageFiles(files: File[], folderName: string): Promise<ParsedArchive> {
  const imageFiles = files.filter((f) => isImageFile(f.name));

  const sortedFiles = [...imageFiles].sort((a, b) => naturalCompare(a.name, b.name));

  const pages: Blob[] = [];
  const pageNames: string[] = [];
  for (const file of sortedFiles) {
    pages.push(file);
    pageNames.push(file.name);
  }

  const coverBlob = pages.length > 0 ? pages[0] : null;
  const title = extractTitleFromFileName(folderName);

  return { title, coverBlob, pages, pageNames };
}

export function buildComicFromArchive(
  parsed: ParsedArchive,
  fileId: string
): { comic: Comic; chapter: Chapter } {
  const comicId = fileId;
  const chapterId = `${fileId}-ch1`;

  const comic: Comic = {
    id: comicId,
    title: parsed.title,
    author: '',
    cover: '',
    genres: [],
    tags: [],
    description: '',
    status: 'completed',
    totalChapters: 1,
    chapters: [],
    addedAt: new Date(),
    isFavorite: false,
  };

  const chapter: Chapter = {
    id: chapterId,
    comicId,
    number: 1,
    title: parsed.title,
    pages: parsed.pageNames,
    status: 'unread',
  };

  comic.chapters = [chapter];

  return { comic, chapter };
}

export function blobToObjectURL(blob: Blob): string {
  return URL.createObjectURL(blob);
}
