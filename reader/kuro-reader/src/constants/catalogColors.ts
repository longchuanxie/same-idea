/** 图书馆分类色 —— 8 色低饱和系（纸墨友好），替代旧 20 色 Material 高饱和板（建议书 3.3）。 */
export const CATALOG_COLORS = [
  '#4A6B8A', // 黛蓝
  '#6B7F59', // 苔绿
  '#A9714B', // 赭石
  '#6E5E7E', // 黛紫
  '#4F7D7B', // 烟青
  '#8A5A44', // 栗棕
  '#7A7D6D', // 灰榄
  '#A34E4E', // 绛红
] as const;

/** 旧 20 色板 → 分类色的迁移映射（存量标签渲染时归一，不改写库中数据）。 */
const LEGACY_TAG_COLOR_MIGRATION: Record<string, string> = {
  '#E53935': '#A34E4E',
  '#D81B60': '#A34E4E',
  '#F4511E': '#A34E4E',
  '#8E24AA': '#6E5E7E',
  '#5E35B1': '#6E5E7E',
  '#3949AB': '#4A6B8A',
  '#1E88E5': '#4A6B8A',
  '#039BE5': '#4A6B8A',
  '#546E7A': '#4A6B8A',
  '#00ACC1': '#4F7D7B',
  '#00897B': '#4F7D7B',
  '#78909C': '#4F7D7B',
  '#43A047': '#6B7F59',
  '#7CB342': '#6B7F59',
  '#C0CA33': '#7A7D6D',
  '#757575': '#7A7D6D',
  '#FDD835': '#A9714B',
  '#FFB300': '#A9714B',
  '#FB8C00': '#A9714B',
  '#6D4C41': '#8A5A44',
};

/** 渲染期归一：旧色映射到分类色；未知色（用户自定义/未来扩展）原样返回。 */
export const migrateTagColor = (color: string | undefined): string | undefined => {
  if (!color) return color;
  return LEGACY_TAG_COLOR_MIGRATION[color.toUpperCase()] ?? color;
};

export const getRandomCatalogColor = (): string => {
  return CATALOG_COLORS[Math.floor(Math.random() * CATALOG_COLORS.length)];
};
