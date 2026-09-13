import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/** tailwind-merge 不认识本项目自定义的色名/字号档（on-seal、label-md 等），
 *  会把「字色 + 字号」误判为冲突组而吞掉字色类（判例：朱砂按钮文字变墨色，§0.6 类似）。
 *  这里把自定义字号档显式注册进 font-size 组，其余未知 text-* 自然落入 text-color 组。 */
const customTwMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        {
          text: [
            'display-xl', 'display-lg', 'display-lg-mobile',
            'headline-md', 'headline-sm', 'headline-xs',
            'body-lg', 'body-md', 'body-sm', 'body-xs',
            'label-lg', 'label-md', 'label-sm', 'label-xs',
            'icon-sm', 'icon-md', 'icon-lg',
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return customTwMerge(clsx(inputs));
}
