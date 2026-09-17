import React, { useEffect, useRef, useState } from 'react';

import {
  alignOffsetsWithTrimmedText,
  isNodeInArticle,
  resolveSelectionScope,
  type SelectionOffsets,
} from '@/utils/selectionScope';

/** 浮动批注按钮/批注弹窗共用的选区信息形态 */
export interface TextSelectionInfo {
  text: string;
  position: { x: number; y: number };
  contentOffset?: number;
  contentEndOffset?: number;
  /** 选区归属章（滚动模式多章同挂时由渲染层标注给出；缺省表示调用方回退当前章） */
  chapterIndex?: number;
}

const MIN_SELECTION_TEXT_LENGTH = 2;

/** CJK 字符判定（汉字/假名/谚文/CJK 标点） */
const CJK_CHAR_RE = /[\u4e00-\u9fff\u3400-\u4dbf\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/;

/** 选区最短有效性：西文至少 2 字符；含 CJK 时单字即放行——
 * 中文长按天然只选中一个字，而原生菜单已被屏蔽，浮动动作条是唯一出口，
 * 若按西文 2 字符门槛拦下单字，表现为"复制/划线整个不可用" */
function isSelectionLongEnough(text: string): boolean {
  return text.length >= MIN_SELECTION_TEXT_LENGTH || (text.length === 1 && CJK_CHAR_RE.test(text));
}
const LONG_PRESS_DURATION = 500;
/** 长按取消位移阈值：慢起滚动前 500ms 内的常见抖动（20px 上下）不该被当成「按住不动」 */
const LONG_PRESS_THRESHOLD = 24;
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
 * - 选区偏移与归属章统一由 selectionScope 解析（章内源文本坐标系 + [data-chapter-index]）
 *
 * 采样只有一条实现路径（captureSelection）：鼠标、长按、selectionchange 三种触发方式
 * 共用同一份「有效性判定 + 偏移对齐 + 坐标采样」，避免规则在多个副本之间漂移。
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
  /** 本次触摸是否发生过超阈值的滑动（滚动/翻页手势），抬指后不再主动选词 */
  const touchMovedRef = useRef(false);

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

    /** 当前原生选区是否可用于批注（正文内 + 长度达标 + 未跨章） */
    const isSelectionUsable = (): boolean => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !sel.toString().trim()) return false;
      if (!isSelectionLongEnough(sel.toString().trim())) return false;
      if (!isNodeInArticle(sel.anchorNode)) return false;
      // 跨章选区无法用单章偏移表达：章内偏移在跨章时不可比，宁可不点亮浮层
      return !resolveSelectionScope(sel).crossChapter;
    };

    /**
     * 采样当前原生选区 → 浮动条数据。
     * 偏移拿不到锚点时**不给偏移**（contentOffset 留空），由落库侧回退 indexOf；
     * 给出一个错位的数字比留空更有害。
     */
    const captureSelection = (): TextSelectionInfo | null => {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return null;

      const rawText = sel.toString();
      const text = rawText.trim();
      if (!isSelectionLongEnough(text)) return null;

      const scope = resolveSelectionScope(sel);
      const offsets: SelectionOffsets | null = alignOffsetsWithTrimmedText(rawText, text, scope.offsets);

      const rect = sel.getRangeAt(0).getBoundingClientRect();
      return {
        text,
        position: { x: rect.left + rect.width / HALF_DIVISOR, y: rect.top },
        contentOffset: offsets ? offsets.start : undefined,
        contentEndOffset: offsets ? offsets.end : undefined,
        chapterIndex: scope.chapterIndex ?? undefined,
      };
    };

    const handleMouseUp = () => {
      // 延迟一帧检测选区，确保浏览器已完成选区更新
      requestAnimationFrame(() => {
        if (!isSelectionUsable()) {
          isSelectingTextRef.current = false;
          return;
        }
        const info = captureSelection();
        if (!info) {
          isSelectingTextRef.current = false;
          return;
        }
        isSelectingTextRef.current = true;
        setSelectionInfo(info);
      });
    };

    /** 采样并点亮浮动动作条；返回是否成功点亮 */
    const showFloatingButton = (): boolean => {
      if (!isSelectionUsable()) return false;
      const info = captureSelection();
      if (!info) return false;
      isSelectingTextRef.current = true;
      setSelectionInfo(info);
      return true;
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
      const isCJK = (ch: string) => CJK_CHAR_RE.test(ch);
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
      if (existingSel && !existingSel.isCollapsed && isSelectionLongEnough(existingSel.toString().trim())) {
        isSelectingTextRef.current = true;
        clearLongPress();
        return;
      }

      const touch = e.touches[0];
      touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };
      touchMovedRef.current = false;
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
      // 移动超过阈值则取消长按，并记下「这是滑动手势」：抬指后不再主动选词
      if (touchStartPosRef.current) {
        const touch = e.touches[0];
        const dx = touch.clientX - touchStartPosRef.current.x;
        const dy = touch.clientY - touchStartPosRef.current.y;
        if (Math.sqrt(dx * dx + dy * dy) > LONG_PRESS_THRESHOLD) {
          touchMovedRef.current = true;
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

        // 滑动手势（滚动/翻页）抬指不主动点亮浮层——带选区滚动时频繁复弹是误触发主诉之一；
        // 原生手柄扩选的浮层由 selectionchange 稳定路径兜底
        if (touchMovedRef.current) return;

        // 1. 先检查是否已有选区（真机原生长按选词）
        if (isSelectionUsable()) {
          showFloatingButton();
          return;
        }

        // 2. 没有现成选区时，主动在触摸点选词——仅限原地按住/点按（未发生滑动）。
        //    滚动手势（touchmove 超阈值）绝不触发，否则上下滚动会频繁误弹批注/复制浮层
        //    - 滚动模式：原地点按即选词（无翻页冲突）
        //    - 分页模式：仅长按（定时器已超时）才触发，避免与翻页冲突
        if (savedPos && isScrollMode && !touchMovedRef.current) {
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
        if (isSelectionUsable()) {
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
