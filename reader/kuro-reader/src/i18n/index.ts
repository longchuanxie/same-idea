/**
 * i18n 底座（M-i18n.1；zh-Hant 于 2026-10-15 纳入）
 *
 * 约定：key = 中文（简体）文案本身（含 {{插值}} 占位），zh 不需要资源文件（缺翻译即显示 key）。
 * 全局 t（非 hook）：语言切换由 Settings 触发 location.reload() 生效，组件不做响应式订阅。
 * 回退链：ja/ko/zh-Hant 缺 key → zh-Hant → zh → en；en 必须全量覆盖。
 */
import i18next, { type TFunction } from 'i18next';

import en from './locales/en.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';
import zhHant from './locales/zh-Hant.json';
import zh from './locales/zh.json';

export const SUPPORTED_LANGUAGES = ['zh', 'zh-Hant', 'en', 'ja', 'ko'] as const;
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const LANG_STORAGE_KEY = 'kuro.lang';

export const LANGUAGE_LABELS: Record<AppLanguage, string> = {
  zh: '简体中文',
  'zh-Hant': '繁體中文',
  en: 'English',
  ja: '日本語',
  ko: '한국어',
};

/** 系统语言 → 支持语言。zh-TW/zh-HK/zh-MO/zh-Hant 归 zh-Hant，其余 zh* 归 zh；未命中回退 en（SPEC：海外用户默认英语） */
export function resolveSystemLanguage(): AppLanguage {
  const candidates =
    typeof navigator !== 'undefined' && navigator.languages?.length
      ? navigator.languages
      : typeof navigator !== 'undefined' && navigator.language
        ? [navigator.language]
        : [];
  for (const raw of candidates) {
    const tag = raw.toLowerCase();
    if (tag === 'zh-hant' || tag === 'zh-tw' || tag === 'zh-hk' || tag === 'zh-mo' || tag === 'zh-hant-tw' || tag === 'zh-hant-hk') return 'zh-Hant';
    if (tag.startsWith('zh')) return 'zh';
    if (tag.startsWith('ja')) return 'ja';
    if (tag.startsWith('ko')) return 'ko';
    if (tag.startsWith('en')) return 'en';
  }
  return 'en';
}

export function getPersistedLanguage(): AppLanguage | null {
  try {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    return (SUPPORTED_LANGUAGES as readonly string[]).includes(saved ?? '')
      ? (saved as AppLanguage)
      : null;
  } catch {
    return null;
  }
}

function syncDocumentLang(lang: AppLanguage): void {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : lang;
  }
}

/* eslint-disable import/no-named-as-default-member -- 实例成员访问是刻意的：bind 拿到稳定引用，避开 re-export 绑定语义 */
if (!i18next.isInitialized) {
  void i18next.init({
    lng: getPersistedLanguage() ?? resolveSystemLanguage(),
    // zh-Hant 缺 key 先回简中（同文同种）再英文；其余语言直接回英文
    fallbackLng: { 'zh-Hant': ['zh', 'en'], default: ['en'] },
    resources: {
      zh: { translation: zh },
      'zh-Hant': { translation: zhHant },
      en: { translation: en },
      ja: { translation: ja },
      ko: { translation: ko },
    },
    interpolation: { escapeValue: false },
    returnNull: false,
  });
  syncDocumentLang(i18next.language as AppLanguage);
}

/** 切换语言：写偏好 → 换语言 → 整页 reload（全局 t 不做响应式订阅，reload 是既定生效方式） */
export function setAppLanguage(lang: AppLanguage): void {
  try {
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch {
    // 持久化失败不阻断本次会话切换
  }
  void i18next.changeLanguage(lang);
  syncDocumentLang(lang);
  if (typeof location !== 'undefined') {
    location.reload();
  }
}

/* eslint-disable import/no-named-as-default-member -- 实例成员访问是刻意的：bind 拿到稳定引用，避开 re-export 绑定语义 */

/** 模块级全局翻译函数：t(中文文案) 即可，含插值时第二参传绑定值 */
export const t: TFunction = i18next.t.bind(i18next);
/* eslint-enable import/no-named-as-default-member */

/** 当前生效语言（i18next.language 可能是区域变体如 zh-CN，归一到支持集） */
export function getAppLanguage(): AppLanguage {
  const lng = i18next.language ?? '';
  if ((SUPPORTED_LANGUAGES as readonly string[]).includes(lng)) return lng as AppLanguage;
  const prefix = lng.split('-')[0];
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(prefix) ? (prefix as AppLanguage) : 'zh';
}

export default i18next;
