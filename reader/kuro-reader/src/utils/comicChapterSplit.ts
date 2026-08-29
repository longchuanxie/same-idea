/**
 * 漫画章节拆分（纯逻辑，按确定性分层）：
 *
 * L1 目录识别：按目录分组，目录名匹配章节模式（第N话/Chapter N/…）时按序号排序；
 *    目录层级过度细分（每目录仅 1 图，如零售扫描包的内页文件夹）时上退一级。
 * L2 文件名序列：扁平包（无目录）按「前缀 + 首数字段」分组，编号重置即章节边界。
 * L3 宽高比：全部为极端竖长图（条漫一图一话）时每图一章。
 *
 * 各层命中即停；全部未命中返回 null（调用方保持单章）。
 */

export interface ComicChapterDraft {
  title: string;
  /** 该章节的完整 zip 路径（已按文件名自然排序） */
  paths: string[];
}

export interface ImageDimensions {
  width: number;
  height: number;
}

/** 目录分组产物：父目录 → 路径列表 */
type DirGroups = Map<string, string[]>;

/** 章节数量模式（顺序即优先级）；捕获组 1 为序号 */
const CHAPTER_NUMBER_PATTERNS: RegExp[] = [
  /第\s*(\d+)\s*[话話章回卷巻]/,
  /(?:chapter|ch|episode|ep|vol|volume)[.\s_-]*(\d+)/i,
  /^(\d+)\s*[话話]$/,
];

/** 纯数字目录（"01"、"12"）视为章节序号 */
const PURE_NUMBER_PATTERN = /^(\d+)$/;

/** 目录过度细分判定：单图目录占比超过该值时上退一级 */
const OVERSPLIT_SINGLETON_RATIO = 0.5;
/** 文件名序列层的每章最少图片数（低于视为噪声，放弃拆分） */
const MIN_IMAGES_PER_SEQUENCE_CHAPTER = 2;
/** 条漫一图一话的宽高比阈值（高/宽） */
const WEBTOON_MIN_ASPECT_RATIO = 3;

function baseName(path: string): string {
  const idx = path.lastIndexOf('/');
  return idx >= 0 ? path.slice(idx + 1) : path;
}

function dirName(path: string): string {
  const idx = path.lastIndexOf('/');
  return idx >= 0 ? path.slice(0, idx) : '';
}

/** 文件名自然比较：数字段按数值比较 */
export function naturalCompare(a: string, b: string): number {
  const tokenize = (s: string): (string | number)[] => {
    const tokens: (string | number)[] = [];
    for (const part of s.match(/\d+|\D+/g) ?? []) {
      const asNumber = Number(part);
      tokens.push(Number.isNaN(asNumber) ? part : asNumber);
    }
    return tokens;
  };
  const ta = tokenize(a);
  const tb = tokenize(b);
  const len = Math.min(ta.length, tb.length);
  for (let i = 0; i < len; i++) {
    const x = ta[i];
    const y = tb[i];
    if (x === y) continue;
    if (typeof x === 'number' && typeof y === 'number') return x - y;
    return String(x) < String(y) ? -1 : 1;
  }
  return ta.length - tb.length;
}

/** 从目录/文件名提取章节序号；无匹配返回 null */
export function matchChapterNumber(name: string): number | null {
  for (const pattern of CHAPTER_NUMBER_PATTERNS) {
    const match = name.match(pattern);
    if (match) return Number(match[1]);
  }
  const pure = name.trim().match(PURE_NUMBER_PATTERN);
  if (pure) return Number(pure[1]);
  return null;
}

function groupByDir(paths: string[], level: (dir: string) => string): DirGroups {
  const groups: DirGroups = new Map();
  for (const path of paths) {
    const key = level(dirName(path));
    const list = groups.get(key);
    if (list) list.push(path);
    else groups.set(key, [path]);
  }
  return groups;
}

/** 单图目录占比过高 → 判定过度细分 */
function isOversplit(groups: DirGroups): boolean {
  let singletons = 0;
  let total = 0;
  for (const [dir, list] of groups) {
    if (dir === '') continue;
    total += 1;
    if (list.length === 1) singletons += 1;
  }
  return total > 0 && singletons / total > OVERSPLIT_SINGLETON_RATIO;
}

function draftsFromDirGroups(groups: DirGroups): ComicChapterDraft[] {
  const entries = [...groups.entries()].filter(([dir]) => dir !== '');
  const rootPaths = groups.get('') ?? [];

  const numbered = entries.map(([dir, list]) => ({
    dir,
    list,
    number: matchChapterNumber(dir.split('/').pop() ?? dir),
  }));
  // 全部目录都能取到序号时按序号排序，否则按目录名自然排序
  if (numbered.every((e) => e.number !== null)) {
    numbered.sort((a, b) => (a.number as number) - (b.number as number));
  } else {
    numbered.sort((a, b) => naturalCompare(a.dir, b.dir));
  }

  const drafts: ComicChapterDraft[] = [];
  if (rootPaths.length > 0) {
    drafts.push({ title: '开篇', paths: [...rootPaths].sort(naturalCompare) });
  }
  for (const { dir, list } of numbered) {
    const lastSegment = dir.split('/').pop() ?? dir;
    const pureNumber = lastSegment.trim().match(PURE_NUMBER_PATTERN);
    drafts.push({
      title: pureNumber ? `第 ${Number(pureNumber[1])} 话` : lastSegment,
      paths: [...list].sort(naturalCompare),
    });
  }
  return drafts;
}

/** L1：按目录分组识别章节；无目录 / 单目录 / 无法可靠分组时返回 null */
export function splitByDirectories(paths: string[]): ComicChapterDraft[] | null {
  if (!paths.some((p) => p.includes('/'))) return null;

  let groups = groupByDir(paths, (dir) => dir);
  if (groups.size < 2) return null;

  // 「全部目录命中章节模式且序号单调递增」视为刻意命名的一话一图等结构，
  // 不做过度细分回退（否则条漫每话 1 图的目录会被误并）
  const entries = [...groups.entries()].filter(([dir]) => dir !== '');
  const allMatched = entries.every(([dir]) => matchChapterNumber(dir.split('/').pop() ?? dir) !== null);
  const monotonic = (() => {
    if (!allMatched) return false;
    const numbers = entries
      .map(([dir]) => matchChapterNumber(dir.split('/').pop() ?? dir) as number)
      .sort((a, b) => a - b);
    return numbers.every((n, i) => i === 0 || n > numbers[i - 1]);
  })();

  if (!monotonic && isOversplit(groups)) {
    // 过度细分（如 Ch.001/0001/001.jpg 的内页文件夹）：上退到一级目录
    groups = groupByDir(paths, (dir) => dir.split('/')[0]);
    if (groups.size < 2 || isOversplit(groups)) return null;
  }
  return draftsFromDirGroups(groups);
}

interface NameTokens {
  /** 首个数字段之前的非数字前缀（c01_001 → "c"；a001 → "a"；001 → ""） */
  head: string;
  /** 首个数字段；文件名无数字时为 null */
  firstNumber: number | null;
  /** 数字段个数（≥2 时首段通常承载话/卷号） */
  runCount: number;
}

function tokenizeBaseName(name: string): NameTokens {
  const stem = name.replace(/\.[^.]+$/, '');
  const runs = stem.match(/\d+/g) ?? [];
  const firstRun = runs[0];
  const head = firstRun !== undefined ? stem.slice(0, stem.indexOf(firstRun)) : stem;
  return {
    head,
    firstNumber: firstRun !== undefined ? Number(firstRun) : null,
    runCount: runs.length,
  };
}

/**
 * L2：扁平包（无目录）按文件名序列识别章节。
 * 章节键 = 前缀 + 首数字段（c01_001 与 c01_002 同章，c02_001 新章）；
 * 单一数字段的文件名（001.jpg）按前缀分组。
 */
export function splitByFilenameSequence(paths: string[]): ComicChapterDraft[] | null {
  const sorted = [...paths].sort(naturalCompare);
  const tokens = sorted.map((p) => tokenizeBaseName(baseName(p)));

  const drafts: ComicChapterDraft[] = [];
  let currentPaths: string[] = [];
  let currentKey = '';
  let chapterIndex = 0;

  const flush = () => {
    if (currentPaths.length >= MIN_IMAGES_PER_SEQUENCE_CHAPTER) {
      chapterIndex += 1;
      drafts.push({ title: `第 ${chapterIndex} 话`, paths: currentPaths });
    } else if (drafts.length > 0) {
      // 少于阈值的尾巴并入前一章（编号噪声/缺页）
      drafts[drafts.length - 1].paths.push(...currentPaths);
    } else {
      drafts.push({ title: '正文', paths: currentPaths });
    }
    currentPaths = [];
  };

  for (let i = 0; i < sorted.length; i++) {
    const { head, firstNumber, runCount } = tokens[i];
    // 双段文件名（ch01_p001）按「前缀+首段」分章；单段（001.jpg）按前缀分章
    const key = runCount >= 2 && firstNumber !== null ? `${head}#${firstNumber}` : head;
    if (key !== currentKey && currentPaths.length > 0) flush();
    currentKey = key;
    currentPaths.push(sorted[i]);
  }
  flush();

  if (drafts.length < 2) return null;
  // 尾部并入后可能只剩一章吞并一切（无信号），校验每章仍满足最小页数
  if (drafts.some((d) => d.paths.length < MIN_IMAGES_PER_SEQUENCE_CHAPTER)) return null;
  return drafts;
}

/**
 * L3：条漫检测——全部为极端竖长图时每图一章（一图一话）。
 */
export function splitByImageAspect(
  paths: string[],
  sizes: (ImageDimensions | null)[]
): ComicChapterDraft[] | null {
  if (!sizes || sizes.length !== paths.length || paths.length < 2) return null;
  const allTall = sizes.every(
    (s) => s !== null && s.height / Math.max(1, s.width) >= WEBTOON_MIN_ASPECT_RATIO
  );
  if (!allTall) return null;
  const sorted = [...paths].sort(naturalCompare);
  return sorted.map((path, i) => ({
    title: `第 ${i + 1} 话`,
    paths: [path],
  }));
}

/** 判定链入口（不含宽高比层，尺寸需异步读取后单独调用 splitByImageAspect） */
export function splitComicChapters(paths: string[]): ComicChapterDraft[] | null {
  return splitByDirectories(paths) ?? splitByFilenameSequence(paths);
}
