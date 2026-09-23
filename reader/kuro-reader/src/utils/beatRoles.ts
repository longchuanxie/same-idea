/**
 * 叙事节拍角色的展示元数据：去黑话短标（「高潮」而非「climax」）+ 域色。
 *
 * 颜色即语义（design-tokens §0.4）：色值全部取自知识件域调色板
 * （knowledgePalette，豁免立项见 design-tokens.md §5），按结构位置分配——
 * 高潮=朱砂（全书最高点）、引子/转折=暖色（变局）、推进/开局=冷色（铺垫）、
 * 低谷=棕（沉）、结局=松绿（收束）。目录结构条与节拍查看器共用本表。
 */

import type { StoryBeatRole } from '@/types'
import { KNOWLEDGE_PALETTE, PALETTE_TINT_ALPHA } from '@/utils/knowledgePalette'

export interface BeatRoleMeta {
  /** 去黑话短标（结构条/查看器直接展示） */
  label: string
  /** 域色（十六进制；不随主题换档，与导图分支色同源） */
  color: string
}

export const BEAT_ROLE_META: Record<StoryBeatRole, BeatRoleMeta> = {
  hook: { label: '开局', color: KNOWLEDGE_PALETTE[1] }, // 黛蓝
  inciting: { label: '引子', color: KNOWLEDGE_PALETTE[3] }, // 藤黄
  rising: { label: '推进', color: KNOWLEDGE_PALETTE[7] }, // 灰蓝
  turn: { label: '转折', color: KNOWLEDGE_PALETTE[5] }, // 紫棠
  midpoint: { label: '中点', color: KNOWLEDGE_PALETTE[4] }, // 青碧
  low: { label: '低谷', color: KNOWLEDGE_PALETTE[6] }, // 棕
  climax: { label: '高潮', color: KNOWLEDGE_PALETTE[0] }, // 朱砂
  resolution: { label: '结局', color: KNOWLEDGE_PALETTE[2] }, // 松绿
  custom: { label: '节点', color: KNOWLEDGE_PALETTE[7] }, // 灰蓝（未归类）
}

export function beatRoleMeta(role: StoryBeatRole): BeatRoleMeta {
  return BEAT_ROLE_META[role] ?? BEAT_ROLE_META.custom
}

/** 域色浅底（同导图二级胶囊的透明度），节拍查看器的角色章用 */
export function beatRoleTint(role: StoryBeatRole): string {
  return `${beatRoleMeta(role).color}${PALETTE_TINT_ALPHA}`
}

/** 节拍尺左右留白占比（首尾节拍的点不贴边），与单章退位中点：版式设计常量 */
const RULER_INSET_RATIO = 0.04
const SINGLE_SPAN_RATIO = 0.5

/** 节拍在尺上的比例坐标（0..1）：目录结构条与查看器共用同一把尺子 */
export function beatRulerRatio(chapterIndex: number, chapterCount: number): number {
  if (chapterCount <= 1) return SINGLE_SPAN_RATIO
  return RULER_INSET_RATIO + (chapterIndex / (chapterCount - 1)) * (1 - RULER_INSET_RATIO * 2)
}
