import type { CSSProperties } from 'react';

import type { PaperType } from '@/types';

export interface PaperTextureConfig {
  label: string;
  description: string;
  icon: string;
  svgFilter: (opacity: number) => string;
  imageFilter: string;
  bgColor: string;
  blendMode: string;
  /** 纸面文字色（缺省用全局暖墨）——护眼纸用绿墨保持气质 */
  inkColor?: string;
}

// 各纸张类型的纹理叠加透明度系数（与 svgFilter 的 opacity 相乘）
const COATED_TEXTURE_OPACITY = 0.04;
const RICE_TEXTURE_OPACITY = 0.12;
const KRAFT_TEXTURE_OPACITY = 0.3;
const NEWSPRINT_TEXTURE_OPACITY = 0.45;
const MATTE_TEXTURE_OPACITY = 0.06;
const EINK_TEXTURE_OPACITY = 0.05;
const GREEN_TEXTURE_OPACITY = 0.06;
const NIGHT_TEXTURE_OPACITY = 0.04;

const PAPER_TEXTURE_OPACITY: Record<PaperType, number> = {
  coated: COATED_TEXTURE_OPACITY,
  rice: RICE_TEXTURE_OPACITY,
  kraft: KRAFT_TEXTURE_OPACITY,
  newsprint: NEWSPRINT_TEXTURE_OPACITY,
  matte: MATTE_TEXTURE_OPACITY,
  eink: EINK_TEXTURE_OPACITY,
  green: GREEN_TEXTURE_OPACITY,
  night: NIGHT_TEXTURE_OPACITY,
};
const PAPER_TEXTURES: Record<PaperType, PaperTextureConfig> = {
  coated: {
    label: '铜版纸',
    description: '光滑细腻，色彩鲜艳饱满',
    icon: 'photo_prints',
    svgFilter: (opacity) =>
      `url("data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='f'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23f)' opacity='${opacity * COATED_TEXTURE_OPACITY}'/%3E%3C/svg%3E")`,
    imageFilter: 'contrast(1.05) saturate(1.1)',
    bgColor: '#faf9f7',
    blendMode: 'multiply',
  },
  rice: {
    label: '宣纸',
    description: '纤维纹理，墨韵渗透，古朴典雅',
    icon: 'auto_stories',
    svgFilter: (opacity) =>
      `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='f'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.02 0.3' numOctaves='5' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3CfeComponentTransfer%3E%3CfeFuncA type='discrete' tableValues='0 0.3 0.5 0.7 0.85 1'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23f)' opacity='${opacity * RICE_TEXTURE_OPACITY}'/%3E%3C/svg%3E")`,
    imageFilter: 'grayscale(0.15) sepia(0.12) contrast(1.1) brightness(0.97)',
    bgColor: '#f5f0e8',
    blendMode: 'multiply',
  },
  kraft: {
    label: '牛皮纸',
    description: '粗犷纤维，温暖质朴，复古怀旧',
    icon: 'description',
    svgFilter: (opacity) =>
      `url("data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='f'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0.35 0.26 0.08 0 0.04 0.28 0.22 0.07 0 0.03 0.18 0.13 0.05 0 0.01 0 0 0 1 0'/%3E%3CfeComponentTransfer%3E%3CfeFuncA type='discrete' tableValues='0 0.45 0.75 0.9 1'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23f)' opacity='${opacity * KRAFT_TEXTURE_OPACITY}'/%3E%3C/svg%3E")`,
    imageFilter: 'sepia(0.25) contrast(1.05) brightness(0.95) saturate(0.85)',
    bgColor: '#d4b489',
    blendMode: 'multiply',
  },
  newsprint: {
    label: '新闻纸',
    description: '粗糙颗粒，微黄泛灰，报刊质感',
    icon: 'newspaper',
    svgFilter: (opacity) =>
      `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='f'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.012' numOctaves='3' seed='7' stitchTiles='stitch' result='patch'/%3E%3CfeColorMatrix in='patch' type='matrix' values='0.5 0.4 0.12 0 0.06 0.42 0.34 0.11 0 0.04 0.3 0.22 0.08 0 0.02 0 0 0 1 0' result='stain'/%3E%3CfeTurbulence type='turbulence' baseFrequency='0.38' numOctaves='5' seed='3' stitchTiles='stitch' result='scratch'/%3E%3CfeColorMatrix in='scratch' type='saturate' values='0' result='gray'/%3E%3CfeComponentTransfer in='gray' result='scr'%3E%3CfeFuncA type='discrete' tableValues='0 0.45 0.75 1'/%3E%3C/feComponentTransfer%3E%3CfeBlend in='stain' in2='scr' mode='multiply'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23f)' opacity='${opacity * NEWSPRINT_TEXTURE_OPACITY}'/%3E%3C/svg%3E")`,
    imageFilter: 'grayscale(0.3) sepia(0.15) contrast(1.15) brightness(0.95)',
    bgColor: '#f0ece0',
    blendMode: 'multiply',
  },
  green: {
    label: '护眼纸',
    description: '柔和豆绿，舒缓疲劳，久读不刺眼',
    icon: 'spa',
    svgFilter: (opacity) =>
      `url("data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='f'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.35' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23f)' opacity='${opacity * GREEN_TEXTURE_OPACITY}'/%3E%3C/svg%3E")`,
    imageFilter: 'saturate(0.9) brightness(0.99) contrast(1.02)',
    bgColor: '#c7edcc',
    blendMode: 'multiply',
    inkColor: '#2d3a2d',
  },
  night: {
    label: '夜读纸',
    description: '暖黑纸面，柔光浅墨，深夜阅读不扰人',
    icon: 'dark_mode',
    svgFilter: (opacity) =>
      `url("data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='f'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.45' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23f)' opacity='${opacity * NIGHT_TEXTURE_OPACITY}'/%3E%3C/svg%3E")`,
    imageFilter: 'brightness(0.82) saturate(0.85)',
    bgColor: '#1c1915',
    blendMode: 'screen',
    inkColor: '#d6cfc0',
  },
  matte: {
    label: '哑光纸',
    description: '柔和漫反射，低饱和，细腻不刺眼',
    icon: 'filter_none',
    svgFilter: (opacity) =>
      `url("data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='f'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23f)' opacity='${opacity * MATTE_TEXTURE_OPACITY}'/%3E%3C/svg%3E")`,
    imageFilter: 'saturate(0.85) contrast(0.95) brightness(1.02)',
    bgColor: '#f8f6f3',
    blendMode: 'multiply',
  },
  eink: {
    label: '墨水屏',
    description: '高对比度黑白，护眼无蓝光，电纸书质感',
    icon: 'tablet_mac',
    svgFilter: (opacity) =>
      `url("data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='f'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3CfeComponentTransfer%3E%3CfeFuncA type='discrete' tableValues='0 0.5 1'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23f)' opacity='${opacity * EINK_TEXTURE_OPACITY}'/%3E%3C/svg%3E")`,
    imageFilter: 'grayscale(1) contrast(1.35) brightness(1.05)',
    bgColor: '#f4f4f0',
    blendMode: 'multiply',
  },
};

/** 强度滑杆(0-100) → 纹理层不透明度：幂曲线提亮中低档（默认 50% 即可感知纤维），
 *  暗色表面自动减半防纹理发灰。 */
const TEXTURE_GAMMA = 0.6;
const DARK_SURFACE_DAMPING = 0.5;

export function computePaperOpacity(
  intensity: number,
  baseFactor: number,
  isDarkSurface: boolean
): number {
  const t = Math.min(100, Math.max(0, intensity)) / 100;
  return Math.pow(t, TEXTURE_GAMMA) * baseFactor * (isDarkSurface ? DARK_SURFACE_DAMPING : 1);
}

/** 各纸型的纹理基础不透明度（消费方勿自行写死数值） */
export function getPaperBaseOpacity(type: PaperType): number {
  return PAPER_TEXTURE_OPACITY[type];
}

/** 纹理叠层的完整内联样式（背景色 + 可平铺噪声 + 乘法混合）。
 *  消费方统一使用，勿自行拼 svgFilter。 */
export function getPaperLayerStyle(
  type: PaperType,
  intensity: number,
  isDarkSurface: boolean
): CSSProperties {
  const config = getPaperConfig(type);
  const opacity = computePaperOpacity(intensity, PAPER_TEXTURE_OPACITY[type], isDarkSurface);
  return {
    backgroundColor: config.bgColor,
    backgroundImage: config.svgFilter(opacity),
    backgroundRepeat: 'repeat',
    mixBlendMode: config.blendMode as CSSProperties['mixBlendMode'],
  };
}

export function getPaperConfig(type: PaperType): PaperTextureConfig {
  return PAPER_TEXTURES[type];
}

export function getAllPaperTypes(): { type: PaperType; config: PaperTextureConfig }[] {
  return (Object.entries(PAPER_TEXTURES) as [PaperType, PaperTextureConfig][]).map(
    ([type, config]) => ({ type, config })
  );
}
