/**
 * 知识件多色域调色板：纸墨审美的八色（朱砂/黛蓝/松绿/藤黄/青碧/紫棠/棕/灰蓝）。
 *
 * 语义与思维导图分支色一脉相承：给「类别/个体」着色以便区分追踪，非交互色
 * （交互强调仍归 seal，见 design-tokens.md §0.4）；域色不随主题换档，
 * 亮暗双底均按此基色调性校过。豁免立项见 design-tokens.md §5。
 */

export const KNOWLEDGE_PALETTE = [
  '#B54529', '#35618E', '#3E7C59', '#C9862B',
  '#2F8F83', '#7C5295', '#8D6E63', '#5C7A99',
] as const

/** 浅底色透明度后缀（同 MindmapView 二级胶囊的纸面调性） */
export const PALETTE_TINT_ALPHA = '2E'

export function knowledgeColor(index: number): string {
  const count = KNOWLEDGE_PALETTE.length
  return KNOWLEDGE_PALETTE[((index % count) + count) % count]
}
