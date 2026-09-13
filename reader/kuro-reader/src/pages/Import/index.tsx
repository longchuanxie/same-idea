import React, { useMemo, useRef, useState, useCallback } from 'react';

import { Capacitor } from '@capacitor/core';
import { useLocation, useNavigate } from 'react-router-dom';

import { APP_CONFIG } from '@/constants/config';
import { COPY } from '@/constants/copy';
import { ROUTES, bookDetailPath, customCloudPath, subLibraryPath } from '@/constants/routes';
import { FilePicker } from '@/plugins/FilePickerPlugin';
import { useLibraryStore } from '@/stores/useLibraryStore';
import { sanitizeFileName } from '@/utils/annotationExport';
import { isNativePlatform } from '@/utils/capacitor';
import { extractArchiveChapterInfo } from '@/utils/comicChapterSplit';
import { toast } from '@/utils/toast';

const SUPPORTED_EXTENSIONS = APP_CONFIG.supportedFormats;
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.img'];

function getFileExtension(name: string): string {
  const dot = name.lastIndexOf('.');
  return dot >= 0 ? name.substring(dot).toLowerCase() : '';
}

function isSupportedFile(name: string): boolean {
  return (SUPPORTED_EXTENSIONS as readonly string[]).includes(getFileExtension(name));
}

function isImageFile(name: string): boolean {
  return IMAGE_EXTENSIONS.includes(getFileExtension(name));
}

async function pathToFile(path: string, name: string, mimeType: string): Promise<File> {
  let accessiblePath = path;
  if (isNativePlatform() && (path.startsWith('/') || path.startsWith('file://'))) {
    accessiblePath = Capacitor.convertFileSrc(path);
  }
  const response = await fetch(accessiblePath);
  const blob = await response.blob();
  return new File([blob], name, { type: mimeType });
}

export const ImportPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const {
    importFile,
    importFolder,
    importArchivesAsBook,
    importArchivesAsSubLibrary,
    isImporting,
    importProgress,
    error,
    batchImportTotal,
    batchImportCurrent,
    batchImportCurrentFile,
  } = useLibraryStore();

  // 特藏室目标模式：从特藏室页「导入」进入（路由 state 携带目标），新书直接归入该特藏室
  const importTarget = (location.state ?? {}) as { targetSubLibraryId?: string; targetSubLibraryName?: string };
  const targetSubLibraryId = importTarget.targetSubLibraryId;
  const targetSubLibraryName = importTarget.targetSubLibraryName ?? '';
  const importOpts = useMemo(
    () => (targetSubLibraryId ? { subLibraryId: targetSubLibraryId } : undefined),
    [targetSubLibraryId]
  );

  const [importResult, setImportResult] = useState<{
    type: 'book' | 'sublibrary';
    title: string;
    id: string;
    count?: number;
  } | null>(null);

  // 剪报台：粘贴的文章（标题 + 正文）包装成 Markdown 文件走文本书管线
  const [clipTitle, setClipTitle] = useState('');
  const [clipContent, setClipContent] = useState('');
  const [isClipping, setIsClipping] = useState(false);

  const handleClipImport = async () => {
    const title = clipTitle.trim();
    const content = clipContent.trim();
    if (!title || !content) {
      toast(COPY.clip.emptyToast);
      return;
    }
    setIsClipping(true);
    setImportResult(null);
    try {
      // 正文前置一级标题：textParser 的标题提取按内容走，标题兜底由它处理
      const file = new File([`# ${title}\n\n${content}`], `${sanitizeFileName(title)}.md`, {
        type: 'text/markdown',
      });
      const book = await importFile(file, importOpts);
      if (book) {
        setImportResult({ type: 'book', title: book.title, id: book.id });
        setClipTitle('');
        setClipContent('');
        toast(`《${book.title}》已入藏`);
      } else {
        toast(COPY.clip.failedToast);
      }
    } catch {
      toast(COPY.clip.failedToast);
    } finally {
      setIsClipping(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setImportResult(null);

    if (files.length === 1) {
      const file = files[0];
      if (file.size > APP_CONFIG.maxFileSize) return;
      const ext = getFileExtension(file.name);
      if (!(SUPPORTED_EXTENSIONS as readonly string[]).includes(ext)) return;
      const book = await importFile(file, importOpts);
      if (book) setImportResult({ type: 'book', title: book.title, id: book.id });
    } else {
      const imageFiles = Array.from(files).filter((f) => isImageFile(f.name));
      if (imageFiles.length === 0) return;
      const folderName = imageFiles[0].webkitRelativePath?.split('/')[0] || '未命名文件夹';
      const book = await importFolder(imageFiles, folderName, importOpts);
      if (book) setImportResult({ type: 'book', title: book.title, id: book.id });
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFolderSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setImportResult(null);

    const allFiles = Array.from(files);
    const bookFiles = allFiles.filter((f) => isSupportedFile(f.name));
    const imageFiles = allFiles.filter((f) => isImageFile(f.name));

    const folderName = allFiles[0]?.webkitRelativePath?.split('/')[0] || '未命名文件夹';

    if (bookFiles.length > 0 && bookFiles.length >= imageFiles.length) {
      const validArchives = bookFiles.filter((f) => f.size <= APP_CONFIG.maxFileSize);
      if (validArchives.length === 0) return;

      // 文件名全部命中章节模式（第01话.cbz…）→ 合并为一本书多章
      const mergeable =
        validArchives.length >= 2 &&
        validArchives.every((f) => extractArchiveChapterInfo(f.name) !== null);

      if (mergeable) {
        const book = await importArchivesAsBook(validArchives, folderName, importOpts);
        if (book) setImportResult({ type: 'book', title: book.title, id: book.id });
        return;
      }

      const subLibrary = await importArchivesAsSubLibrary(validArchives, folderName, importOpts);
      if (subLibrary) {
        setImportResult({
          type: 'sublibrary',
          title: subLibrary.name,
          id: subLibrary.id,
          count: subLibrary.bookIds.length,
        });
      }
    } else {
      if (imageFiles.length === 0) return;
      const book = await importFolder(imageFiles, folderName, importOpts);
      if (book) setImportResult({ type: 'book', title: book.title, id: book.id });
    }

    if (folderInputRef.current) folderInputRef.current.value = '';
  };

  const handleNativeFilePick = useCallback(async () => {
    if (!isNativePlatform()) {
      fileInputRef.current?.click();
      return;
    }

    try {
      setImportResult(null);
      const result = await FilePicker.pickFiles({
        multiple: false,
        mimeTypes: [
          'application/zip',
          'application/x-zip-compressed',
          // 现代 Android 为漫画包分配的标准 MIME，缺失会导致文件在选择器中被禁用
          'application/vnd.comicbook+zip',
          'application/x-cbz',
          'application/x-rar-compressed',
          'application/vnd.rar',
          'application/vnd.comicbook-rar',
          'application/x-cbr',
          'application/pdf',
          'text/plain',
          'text/markdown',
          'text/x-markdown',
          'application/epub+zip',
        ],
      });

      if (result.files.length === 0) return;

      const pickedFile = result.files[0];
      const file = await pathToFile(pickedFile.path, pickedFile.name, pickedFile.mimeType);

      if (file.size > APP_CONFIG.maxFileSize) {
        return;
      }

      const book = await importFile(file, importOpts);
      if (book) setImportResult({ type: 'book', title: book.title, id: book.id });
    } catch {
      // User cancelled or error
    }
  }, [importFile, importOpts]);

  const handleNativeFolderPick = useCallback(async () => {
    if (!isNativePlatform()) {
      folderInputRef.current?.click();
      return;
    }

    try {
      setImportResult(null);
      const result = await FilePicker.pickFolder();

      if (result.files.length === 0) {
        return;
      }

      const fileResults = await Promise.allSettled(
        result.files.map((f) => pathToFile(f.path, f.name, f.mimeType))
      );

      const allFiles = fileResults
        .filter((r): r is PromiseFulfilledResult<File> => r.status === 'fulfilled')
        .map((r) => r.value);

      if (allFiles.length === 0) return;

      const bookFiles = allFiles.filter((f) => isSupportedFile(f.name));
      const imageFiles = allFiles.filter((f) => isImageFile(f.name));
      const validArchives = bookFiles.filter((f) => f.size <= APP_CONFIG.maxFileSize);

      if (validArchives.length > 0) {
        const subLibrary = await importArchivesAsSubLibrary(validArchives, result.name, importOpts);
        if (subLibrary) {
          setImportResult({
            type: 'sublibrary',
            title: subLibrary.name,
            id: subLibrary.id,
            count: subLibrary.bookIds.length,
          });
        }
      }

      if (imageFiles.length > 0) {
        const book = await importFolder(imageFiles, validArchives.length > 0 ? `${result.name} - 图片` : result.name, importOpts);
        if (book && !importResult) {
          setImportResult({ type: 'book', title: book.title, id: book.id });
        }
      }
    } catch {
      // User cancelled or error
    }
  }, [importFolder, importArchivesAsSubLibrary, importResult, importOpts]);

  const formatList = APP_CONFIG.supportedFormats.join(', ').toUpperCase();

  return (
    <div className="w-full max-w-max-width-content px-margin-mobile md:px-margin-desktop pt-12 md:pt-24 flex flex-col gap-12">
      <input
        ref={fileInputRef}
        type="file"
        accept={APP_CONFIG.supportedFormats.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />
      <input
        ref={folderInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.gif,.webp,.bmp,.zip,.cbz,.rar,.cbr,.pdf,.txt,.md,.markdown,.epub"
        onChange={handleFolderSelect}
        {...({ webkitdirectory: '', directory: '' } as Record<string, string>)}
        className="hidden"
      />

      <section className="flex flex-col gap-2">
        <h2 className="font-display text-display-lg-mobile md:text-display-lg text-primary tracking-tight">导入中心</h2>
        <p className="font-body text-body-md text-on-surface-variant">从本地或 NAS 添加您的书籍资源。</p>
      </section>

      {targetSubLibraryId && (
        <section className="flex items-center justify-between gap-3 border border-primary/40 bg-primary/5 rounded-lg px-4 py-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="material-symbols-outlined text-primary">bookmarks</span>
            <p className="font-label text-label-md text-primary truncate">
              导入至特藏室「{targetSubLibraryName}」，新书将直接归入
            </p>
          </div>
          <button
            aria-label="退出特藏室导入"
            data-ui-control
            className="w-8 h-8 flex-shrink-0 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
            onClick={() => navigate(ROUTES.IMPORT, { replace: true, state: {} })}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </section>
      )}

      {isImporting && (
        <section className="border border-outline-variant rounded-card-lg p-6 bg-surface-bright shadow-paper">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-primary animate-spin">progress_activity</span>
            <h3 className="font-display text-headline-md text-primary">
              {batchImportTotal > 0 ? `正在导入 (${batchImportCurrent}/${batchImportTotal})` : '正在导入...'}
            </h3>
          </div>
          {batchImportTotal > 0 && batchImportCurrentFile && (
            <p className="font-label text-label-sm text-on-surface-variant mb-3 truncate">
              {batchImportCurrentFile}
            </p>
          )}
          <div className="w-full h-2 bg-surface-variant rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${importProgress}%` }}
            />
          </div>
          <p className="font-label text-label-sm text-on-surface-variant mt-2">{importProgress}%</p>
        </section>
      )}

      {error && (
        <section className="border border-error rounded-card-lg p-6 bg-surface-bright shadow-paper">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-error">error</span>
            <p className="font-body text-body-md text-error">{error}</p>
          </div>
        </section>
      )}

      {importResult && !isImporting && (
        <section className="border border-primary rounded-card-lg p-6 bg-surface-bright shadow-paper">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            <h3 className="font-display text-headline-md text-primary">导入成功</h3>
          </div>
          {targetSubLibraryId ? (
            <>
              <p className="font-body text-body-md text-on-surface-variant mb-4">
                已导入至特藏室「{targetSubLibraryName}」
              </p>
              <div className="flex gap-4">
                <button
                  className="btn-seal px-6 py-2"
                  onClick={() => navigate(subLibraryPath(targetSubLibraryId))}
                >
                  返回特藏室
                </button>
                <button
                  className="border border-outline-variant text-primary font-label text-label-md px-6 py-2 rounded hover:bg-surface-variant transition-colors"
                  onClick={() => setImportResult(null)}
                >
                  继续导入
                </button>
              </div>
            </>
          ) : importResult.type === 'sublibrary' ? (
            <>
              <p className="font-body text-body-md text-on-surface-variant mb-1">
                子书库「{importResult.title}」
              </p>
              <p className="font-label text-label-sm text-on-surface-variant mb-4">
                共导入 {importResult.count} 本书籍
              </p>
              <div className="flex gap-4">
                <button
                  className="btn-seal px-6 py-2"
                  onClick={() => navigate(subLibraryPath(importResult.id))}
                >
                  查看子书库
                </button>
                <button
                  className="border border-outline-variant text-primary font-label text-label-md px-6 py-2 rounded hover:bg-surface-variant transition-colors"
                  onClick={() => navigate(ROUTES.LIBRARY)}
                >
                  去书架
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="font-body text-body-md text-on-surface-variant mb-4">{importResult.title}</p>
              <div className="flex gap-4">
                <button
                  className="btn-seal px-6 py-2"
                  onClick={() => navigate(bookDetailPath(importResult.id))}
                >
                  查看详情
                </button>
                <button
                  className="border border-outline-variant text-primary font-label text-label-md px-6 py-2 rounded hover:bg-surface-variant transition-colors"
                  onClick={() => navigate(ROUTES.LIBRARY)}
                >
                  去书架
                </button>
              </div>
            </>
          )}
        </section>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="col-span-1 md:col-span-2 border border-outline-variant rounded-lg p-6 flex flex-col gap-6 bg-surface-bright">
          <div className="flex items-center gap-3 border-b border-outline-variant pb-4">
            <span className="material-symbols-outlined text-primary">folder</span>
            <h3 className="font-display text-headline-md text-primary">本地导入</h3>
          </div>
          <div className="flex flex-col gap-4">
            <button
              className="btn-seal w-full py-3 px-4"
              onClick={handleNativeFilePick}
              disabled={isImporting}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>document_scanner</span>
              选择文件
            </button>
            <button
              className="w-full bg-transparent text-primary py-3 px-4 rounded border border-primary font-label text-label-md flex items-center justify-center gap-2 hover:bg-surface-variant transition-colors"
              onClick={handleNativeFolderPick}
              disabled={isImporting}
            >
              <span className="material-symbols-outlined">snippet_folder</span>
              从文件夹导入
            </button>
          <p className="font-label text-label-sm text-on-surface-variant mt-2 text-center normal-case tracking-normal">
              {targetSubLibraryId
                ? `支持 ${formatList} 格式，最大 ${Math.round(APP_CONFIG.maxFileSize / (1024 * 1024))}MB；本次导入的书籍将归入特藏室「${targetSubLibraryName}」`
                : `支持 ${formatList} 格式，最大 ${Math.round(APP_CONFIG.maxFileSize / (1024 * 1024))}MB；文件夹导入将自动识别支持的文件并创建子书库`}
          </p>
          </div>
        </section>

        {/* 剪报台：粘贴文章按文本书入藏（划线/批注/知识库/复习全套服务） */}
        <section className="col-span-1 md:col-span-2 border border-outline-variant rounded-lg p-6 flex flex-col gap-4 bg-surface-bright">
          <div className="flex items-center gap-3 border-b border-outline-variant pb-4">
            <span className="material-symbols-outlined text-primary">content_cut</span>
            <h3 className="font-display text-headline-md text-primary">{COPY.clip.sectionTitle}</h3>
          </div>
          <p className="font-label text-label-sm text-on-surface-variant">{COPY.clip.hint}</p>
          <div className="flex flex-col gap-3">
            <div>
              <label className="font-label text-label-sm text-on-surface-variant mb-1 block">{COPY.clip.titleLabel}</label>
              <input
                type="text"
                value={clipTitle}
                onChange={(e) => setClipTitle(e.target.value)}
                placeholder={COPY.clip.titlePlaceholder}
                className="w-full border border-outline-variant rounded px-3 py-2 font-body text-body-md text-on-surface bg-surface focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="font-label text-label-sm text-on-surface-variant mb-1 block">{COPY.clip.contentLabel}</label>
              <textarea
                value={clipContent}
                onChange={(e) => setClipContent(e.target.value)}
                placeholder={COPY.clip.contentPlaceholder}
                rows={6}
                className="input-field resize-y"
              />
            </div>
            <button
              className="self-start bg-transparent text-primary py-2 px-5 rounded border border-primary font-label text-label-md hover:bg-surface-variant transition-colors disabled:opacity-40"
              onClick={() => void handleClipImport()}
              disabled={isImporting || isClipping}
            >
              {COPY.clip.submit}
            </button>
          </div>
        </section>

        <section className="col-span-1 md:col-span-2 border border-outline-variant rounded-lg p-6 flex flex-col gap-6 bg-surface-bright">
          <div className="flex items-center gap-3 border-b border-outline-variant pb-4">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>cloud</span>
            <h3 className="font-display text-headline-md text-primary">云端来源</h3>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              className="flex-1 flex items-center gap-4 p-4 border border-dashed border-primary rounded-lg hover:bg-surface-variant transition-colors cursor-pointer"
              onClick={() => navigate(customCloudPath())}
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-2xl">storage</span>
              </div>
              <div className="text-left">
                <span className="font-label text-label-md text-on-surface block">连接 NAS / WebDAV</span>
                <span className="font-body text-body-sm text-on-surface-variant">群晖、QNAP、威联通等</span>
              </div>
            </button>
          </div>
          <p className="font-label text-label-sm text-on-surface-variant text-center">
            通过 WebDAV 协议连接您的 NAS 或私有云存储，直接浏览并导入书籍文件
          </p>
        </section>
      </div>
    </div>
  );
};
