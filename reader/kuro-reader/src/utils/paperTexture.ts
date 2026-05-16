import type { PaperType } from '@/types';

export interface PaperTextureConfig {
  label: string;
  description: string;
  icon: string;
  svgFilter: (opacity: number) => string;
  imageFilter: string;
  bgColor: string;
  blendMode: string;
}

const PAPER_TEXTURES: Record<PaperType, PaperTextureConfig> = {
  coated: {
    label: '铜版纸',
    description: '光滑细腻，色彩鲜艳饱满',
    icon: 'photo_prints',
    svgFilter: (opacity) =>
      `url("data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='f'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23f)' opacity='${opacity * 0.04}'/%3E%3C/svg%3E")`,
    imageFilter: 'contrast(1.05) saturate(1.1)',
    bgColor: '#faf9f7',
    blendMode: 'multiply',
  },
  rice: {
    label: '宣纸',
    description: '纤维纹理，墨韵渗透，古朴典雅',
    icon: 'auto_stories',
    svgFilter: (opacity) =>
      `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='f'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.02 0.3' numOctaves='5' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3CfeComponentTransfer%3E%3CfeFuncA type='discrete' tableValues='0 0.3 0.5 0.7 0.85 1'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23f)' opacity='${opacity * 0.12}'/%3E%3C/svg%3E")`,
    imageFilter: 'grayscale(0.15) sepia(0.12) contrast(1.1) brightness(0.97)',
    bgColor: '#f5f0e8',
    blendMode: 'multiply',
  },
  kraft: {
    label: '牛皮纸',
    description: '粗犷纤维，温暖质朴，复古怀旧',
    icon: 'description',
    svgFilter: (opacity) =>
      `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='f'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.04 0.25' numOctaves='5' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0.4 0.3 0.1 0 0.05 0.3 0.25 0.1 0 0.02 0.2 0.15 0.1 0 0.01 0 0 0 1 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23f)' opacity='${opacity * 0.15}'/%3E%3C/svg%3E")`,
    imageFilter: 'sepia(0.25) contrast(1.05) brightness(0.95) saturate(0.85)',
    bgColor: '#e8dcc8',
    blendMode: 'multiply',
  },
  newsprint: {
    label: '新闻纸',
    description: '粗糙颗粒，微黄泛灰，报刊质感',
    icon: 'newspaper',
    svgFilter: (opacity) =>
      `url("data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='f'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.5' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3CfeComponentTransfer%3E%3CfeFuncA type='discrete' tableValues='0 0.4 0.6 0.8 1'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23f)' opacity='${opacity * 0.08}'/%3E%3C/svg%3E")`,
    imageFilter: 'grayscale(0.3) sepia(0.15) contrast(1.15) brightness(0.95)',
    bgColor: '#f0ece0',
    blendMode: 'multiply',
  },
  matte: {
    label: '哑光纸',
    description: '柔和漫反射，低饱和，细腻不刺眼',
    icon: 'filter_none',
    svgFilter: (opacity) =>
      `url("data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='f'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23f)' opacity='${opacity * 0.06}'/%3E%3C/svg%3E")`,
    imageFilter: 'saturate(0.85) contrast(0.95) brightness(1.02)',
    bgColor: '#f8f6f3',
    blendMode: 'multiply',
  },
  eink: {
    label: '墨水屏',
    description: '高对比度黑白，护眼无蓝光，电纸书质感',
    icon: 'tablet_mac',
    svgFilter: (opacity) =>
      `url("data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='f'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3CfeComponentTransfer%3E%3CfeFuncA type='discrete' tableValues='0 0.5 1'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23f)' opacity='${opacity * 0.05}'/%3E%3C/svg%3E")`,
    imageFilter: 'grayscale(1) contrast(1.35) brightness(1.05)',
    bgColor: '#f4f4f0',
    blendMode: 'multiply',
  },
};

export function getPaperConfig(type: PaperType): PaperTextureConfig {
  return PAPER_TEXTURES[type];
}

export function getAllPaperTypes(): { type: PaperType; config: PaperTextureConfig }[] {
  return (Object.entries(PAPER_TEXTURES) as [PaperType, PaperTextureConfig][]).map(
    ([type, config]) => ({ type, config })
  );
}
