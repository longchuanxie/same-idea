import React, { useEffect, useRef, useState } from 'react';

/** 浮动批注按钮/批注弹窗共用的选区信息形态 */
export interface TextSelectionInfo {
  text: string;
  position: { x: number; y: number };
  contentOffset?: number;
  contentEndOffset?: number;
}

const MIN_SELECTION_TEXT_LENGTH = 2;
const LONG_PRESS_DURATION = 500;
const LONG_PRESS_THRESHOLD = 15;
const SELECTION_CHANGE_DEBOUNCE_MS = 100;
/** 二分中点 / 选区弹窗中心点 */
const HALF_DIVISOR = 2;

export interface UseTextSelectionParams {
  /** 批注编辑弹窗的 ref 镜像：弹窗打开期间 selectionchange 不干扰 */
  selectionPopupRef: React.MutableRefObject<TextSelectionInfo | null>;
  /** 滚动容器 ref：其存在与否决定触摸选词的触发策略（见 handleTouchEnd） */
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * 文本选区检测（TextReader 专用）：
 * - 鼠标拖选（mouseup 后一帧采样）与触摸长按选词（caretRangeFromPoint + 词边界扩展）
 * - selectionchange 防抖兜底：任何来源（含原生选区手柄）的稳定选区都会点亮浮动按钮
 * - 选区偏移计算：优先 Markdown 源码 data-source-start 锚，回退正文 Range 长度
 *
 * 页面通过 isSelectingTextRef 抑制选区后的合成 click，通过 lastTouchEndTimeRef
 * 抑制触摸后的点击翻页。
 */
export function useTextSelection({
  selectionPopupRef,
  scrollContainerRef,
}: UseTextSelectionParams) {
  const [selectionInfo, setSelectionInfo] = useState<TextSelectionInfo | null>(null);
  const selectionInfoRef = useRef<TextSelectionInfo | null>(null);
  selectionInfoRef.current = selectionInfo;
  /** 正在/刚刚进行文本选中（抑制随后的合成 click 与菜单） */
  const isSelectingTextRef = useRef(false);
  /** 最近一次 touchend 时刻：抑制其后的 click 翻页 */
  const lastTouchEndTimeRef = useRef<number>(0);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartPosRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    // mousedown 仅用于记录起始位置，不设置选中标记
    // 避免简单点击被误判为文本选中从而拦截菜单/翻页
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      const target = e.target as HTMLElement;
      if (!target.closest('[data-reader-article]')) return;
      // 点击文章区域时清除之前的选区标记，让 click 能正常处理
      isSelectingTextRef.current = false;
    };

    const handleMouseUp = () => {
      // 延迟一帧检测选区，确保浏览器已完成选区更新
      requestAnimationFrame(() => {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed || !sel.toString().trim()) {
          isSelectingTextRef.current = false;
          return;
        }
        const text = sel.toString().trim();
        if (text.length < MIN_SELECTION_TEXT_LENGTH) {
          isSelectingTextRef.current = false;
          return;
        }

        const anchorNode = sel.anchorNode;
        if (!anchorNode) return;
        let node: Node | null = anchorNode.nodeType === Node.TEXT_NODE
          ? anchorNode.parentElement
          : anchorNode as HTMLElement;
        while (node) {
          if (node instanceof Element && node.hasAttribute('data-reader-article')) break;
          node = node.parentNode;
        }
        if (!node || !(node instanceof Element)) {
          isSelectingTextRef.current = false;
          return;
        }

        isSelectingTextRef.current = true;
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const selectionOffsets = computeSelectionOffsets(sel);
        let contentOffset = selectionOffsets.start;
        let contentEndOffset = selectionOffsets.end;

        // 修正 trim 造成的偏移：sel.toString() 可能含前导空白，trim 后 text 起始位置后移
        if (contentOffset >= 0) {
          const rawSelText = sel.toString();
          const trimShift = rawSelText.indexOf(text);
          if (trimShift > 0) contentOffset += trimShift;
          const trailingTrim = rawSelText.length - trimShift - text.length;
          if (contentEndOffset >= 0 && trailingTrim > 0) contentEndOffset -= trailingTrim;
        }

        setSelectionInfo({
          text,
          position: { x: rect.left + rect.width / HALF_DIVISOR, y: rect.top },
          contentOffset: contentOffset >= 0 ? contentOffset : undefined,
          contentEndOffset: contentEndOffset >= 0 ? contentEndOffset : undefined,
        });
      });
    };

    // 检查选区是否在文章内容区域内
    const isSelectionInArticle = (): boolean => {
      const sel = window.getSelection();
      if (!sel || !sel.anchorNode) return false;
      let node: Node | null = sel.anchorNode.nodeType === Node.TEXT_NODE
        ? sel.anchorNode.parentElement
        : sel.anchorNode as HTMLElement;
      while (node) {
        if (node instanceof Element && node.hasAttribute('data-reader-article')) return true;
        node = node.parentNode;
      }
      return false;
    };

    const showFloatingButton = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !sel.toString().trim()) return;
      const text = sel.toString().trim();
      if (text.length < MIN_SELECTION_TEXT_LENGTH) return;
      if (!isSelectionInArticle()) return;

      isSelectingTextRef.current = true;
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const selectionOffsets = computeSelectionOffsets(sel);
      let contentOffset = selectionOffsets.start;
      let contentEndOffset = selectionOffsets.end;

      // 修正 trim 造成的偏移：sel.toString() 可能含前导空白，trim 后 text 起始位置后移
      if (contentOffset >= 0) {
        const rawSelText = sel.toString();
        const trimShift = rawSelText.indexOf(text);
        if (trimShift > 0) contentOffset += trimShift;
        const trailingTrim = rawSelText.length - trimShift - text.length;
        if (contentEndOffset >= 0 && trailingTrim > 0) contentEndOffset -= trailingTrim;
      }

      setSelectionInfo({
        text,
        position: { x: rect.left + rect.width / HALF_DIVISOR, y: rect.top },
        contentOffset: contentOffset >= 0 ? contentOffset : undefined,
        contentEndOffset: contentEndOffset >= 0 ? contentEndOffset : undefined,
      });
    };

    // 在文本节点中从 offset 向两侧搜索最近的非空白字符位置
    const findNearestNonWS = (text: string, offset: number): number => {
      for (let d = 0; d < text.length; d++) {
        if (offset + d < text.length && !/\s/.test(text[offset + d])) return offset + d;
        if (offset - d >= 0 && !/\s/.test(text[offset - d])) return offset - d;
      }
      return -1;
    };

    // 在文本节点中选中从 pos 开始的词/字
    const selectFromPos = (node: Text, text: string, pos: number): boolean => {
      const isCJK = (ch: string) => /[\u4e00-\u9fff\u3400-\u4dbf\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/.test(ch);
      const isWordChar = (ch: string) => !/\s/.test(ch);
      let start = pos, end = pos + 1;
      if (isCJK(text[start])) {
        end = start + 1;
      } else {
        while (start > 0 && isWordChar(text[start - 1]) && !isCJK(text[start - 1])) start--;
        while (end < text.length && isWordChar(text[end]) && !isCJK(text[end])) end++;
      }
      if (start >= end) return false;
      const sel = window.getSelection();
      if (!sel) return false;
      const r = document.createRange();
      r.setStart(node, start);
      r.setEnd(node, end);
      sel.removeAllRanges();
      sel.addRange(r);
      return true;
    };

    // 回退方案：通过 elementFromPoint 找到元素，再在其中找文本节点
    const selectFromElement = (x: number, y: number): boolean => {
      const el = document.elementFromPoint(x, y);
      if (!el || !el.closest('[data-reader-article]')) return false;
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
      let node: Text | null;
      while ((node = walker.nextNode() as Text | null)) {
        const t = node.textContent || '';
        const p = t.search(/\S/);
        if (p >= 0 && selectFromPos(node, t, p)) return true;
      }
      return false;
    };

    // 在指定坐标创建文本选区（长按选词）
    const selectWordAtPoint = (x: number, y: number): boolean => {
      const range = document.caretRangeFromPoint?.(x, y) ?? null;

      if (range && range.startContainer && range.startContainer.nodeType === Node.TEXT_NODE) {
        const node = range.startContainer as Text;
        const text = node.textContent || '';
        let offset = range.startOffset;
        if (offset >= text.length) offset = Math.max(0, text.length - 1);
        if (offset >= 0 && offset < text.length) {
          if (/\s/.test(text[offset])) {
            // 偏移落在空白（如换行符）上，搜索最近的非空白字符
            const nearest = findNearestNonWS(text, offset);
            if (nearest >= 0) return selectFromPos(node, text, nearest);
          } else {
            return selectFromPos(node, text, offset);
          }
        }
      }

      // caretRangeFromPoint 失败或无法定位文本，使用 elementFromPoint 回退
      return selectFromElement(x, y);
    };

    // 清除长按定时器
    const clearLongPress = () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    };

    // ===== 触摸事件 =====
    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-reader-article]')) return;

      // 如果已有文本选区，用户很可能在拖拽原生选区手柄进行扩选，
      // 不干扰浏览器原生行为，让 selectionchange 统一处理
      const existingSel = window.getSelection();
      if (existingSel && !existingSel.isCollapsed && existingSel.toString().trim().length >= MIN_SELECTION_TEXT_LENGTH) {
        isSelectingTextRef.current = true;
        clearLongPress();
        return;
      }

      const touch = e.touches[0];
      touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };
      isSelectingTextRef.current = false;

      // 启动长按定时器
      clearLongPress();
      longPressTimerRef.current = setTimeout(() => {
        longPressTimerRef.current = null;
        if (touchStartPosRef.current) {
          selectWordAtPoint(touchStartPosRef.current.x, touchStartPosRef.current.y);
          showFloatingButton();
        }
      }, LONG_PRESS_DURATION);
    };

    const handleTouchMove = (e: TouchEvent) => {
      // 移动超过阈值则取消长按
      if (longPressTimerRef.current && touchStartPosRef.current) {
        const touch = e.touches[0];
        const dx = touch.clientX - touchStartPosRef.current.x;
        const dy = touch.clientY - touchStartPosRef.current.y;
        if (Math.sqrt(dx * dx + dy * dy) > LONG_PRESS_THRESHOLD) {
          clearLongPress();
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-reader-article]')) return;

      // 保存触摸坐标（供下方 selectWordAtPoint 使用）
      const savedPos = touchStartPosRef.current;
      clearLongPress();
      touchStartPosRef.current = null;

      // 记录 touchend 时间戳，用于抑制合成 click
      lastTouchEndTimeRef.current = Date.now();

      // 判断是否为滚动模式
      const isScrollMode = !!scrollContainerRef.current;

      setTimeout(() => {
        if (isSelectingTextRef.current) return; // 长按定时器已处理

        // 1. 先检查是否已有选区（真机原生长按选词）
        const sel = window.getSelection();
        if (sel && !sel.isCollapsed && sel.toString().trim().length >= MIN_SELECTION_TEXT_LENGTH) {
          showFloatingButton();
          return;
        }

        // 2. 没有现成选区时，主动在触摸点选词
        //    - 滚动模式：任何触摸都触发（无翻页冲突）
        //    - 分页模式：仅长按（定时器已超时）才触发，避免与翻页冲突
        if (savedPos && isScrollMode) {
          if (selectWordAtPoint(savedPos.x, savedPos.y)) {
            showFloatingButton();
          }
        }
      }, SELECTION_CHANGE_DEBOUNCE_MS);
    };

    // selectionchange：通用批注触发器 — 检测文章区域内任何文本选区变化
    // 当用户完成选中（释放鼠标 / 松开选择手柄）后，选区趋于稳定，触发浮动批注按钮
    const SELECTION_STABLE_DELAY = 600;
    let selectionChangeDebounce: ReturnType<typeof setTimeout> | null = null;
    const handleSelectionChange = () => {
      if (selectionChangeDebounce) clearTimeout(selectionChangeDebounce);
      selectionChangeDebounce = setTimeout(() => {
        selectionChangeDebounce = null;
        // 批注编辑弹窗已打开时不干扰
        if (selectionPopupRef.current) return;
        const sel = window.getSelection();
        const hasSelection = sel && !sel.isCollapsed && sel.toString().trim().length >= MIN_SELECTION_TEXT_LENGTH;
        if (hasSelection) {
          // 有效选区 → 等选区稳定后显示浮动批注按钮
          showFloatingButton();
        } else if (selectionInfoRef.current) {
          // 无有效选区但浮动按钮仍在显示 → 清除
          setSelectionInfo(null);
          isSelectingTextRef.current = false;
        }
      }, SELECTION_STABLE_DELAY);
    };

    // 阻止阅读区域内的系统上下文菜单（避免 Google Lens / OCR 图片识别等原生菜单干扰）
    // 我们通过 selectWordAtPoint + selectionchange 自行管理文本选区，无需依赖原生 ActionMode
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-reader-article]')) {
        e.preventDefault();
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    document.addEventListener('selectionchange', handleSelectionChange);
    document.addEventListener('contextmenu', handleContextMenu);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('selectionchange', handleSelectionChange);
      document.removeEventListener('contextmenu', handleContextMenu);
      clearLongPress();
      if (selectionChangeDebounce) clearTimeout(selectionChangeDebounce);
    };
    // 选区检测只依赖 DOM 与 refs（快照镜像），一次性挂载即终身有效
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    /** 当前选区（浮动按钮数据源；null = 无选区） */
    selectionInfo,
    setSelectionInfo,
    /** selectionInfo 的 ref 镜像（事件回调内读取最新值） */
    selectionInfoRef,
    /** 正在/刚刚选中文本（click 处理器抑制合成点击用） */
    isSelectingTextRef,
    /** 最近 touchend 时刻（抑制触摸后的点击翻页） */
    lastTouchEndTimeRef,
  };
}

/** 计算选区起始位置在章节内容中的字符偏移（排除章节标题等额外 DOM 元素）：
 *  优先 Markdown 源码 data-source-start 锚（还原源文偏移），回退正文 Range 长度 */
function computeSelectionOffsets(sel: Selection): { start: number; end: number } {
  const contentEl = document.querySelector('[data-reader-content]');
  if (!contentEl || !sel.rangeCount) return { start: -1, end: -1 };
  const range = sel.getRangeAt(0);

  const getSourceOffset = (container: Node, offset: number): number | null => {
    const element = container.nodeType === Node.TEXT_NODE
      ? container.parentElement
      : container as Element;
    const sourceElement = element?.closest<HTMLElement>('[data-source-start]');
    if (!sourceElement) return null;

    const sourceStart = Number(sourceElement.dataset.sourceStart);
    if (!Number.isFinite(sourceStart)) return null;
    const localRange = document.createRange();
    localRange.selectNodeContents(sourceElement);
    localRange.setEnd(container, offset);
    return sourceStart + localRange.toString().length;
  };

  const markdownStart = getSourceOffset(range.startContainer, range.startOffset);
  const markdownEnd = getSourceOffset(range.endContainer, range.endOffset);
  if (markdownStart != null && markdownEnd != null) {
    return { start: markdownStart, end: markdownEnd };
  }

  const startRange = document.createRange();
  startRange.selectNodeContents(contentEl);
  startRange.setEnd(range.startContainer, range.startOffset);
  const endRange = document.createRange();
  endRange.selectNodeContents(contentEl);
  endRange.setEnd(range.endContainer, range.endOffset);
  return { start: startRange.toString().length, end: endRange.toString().length };
}
