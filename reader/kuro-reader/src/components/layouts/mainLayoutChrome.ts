import type { NavItem } from '@/types';

/** 底栏高亮显式映射（建议书 5.2）：按路由前缀匹配。
 *  无专属 tab 的页面就近归属其入口域：问藏书/跨书图谱从知识库进入；
 *  手记/复习席/生词本从首页（more 菜单/门厅）进入；统计与检索从首页/书库顶栏进入。 */
export const resolveNav = (pathname: string): NavItem => {
  if (pathname.startsWith('/library')) return 'library';
  if (pathname.startsWith('/knowledge') || pathname.startsWith('/ask') || pathname.startsWith('/atlas')) {
    return 'knowledge';
  }
  if (pathname.startsWith('/import')) return 'import';
  if (pathname.startsWith('/settings') || pathname.startsWith('/profile')) return 'settings';
  if (pathname.startsWith('/notes') || pathname.startsWith('/review') || pathname.startsWith('/vocabulary')) {
    return 'home';
  }
  if (pathname.startsWith('/stats')) return 'home';
  if (pathname.startsWith('/search')) return 'library';
  return 'home';
};

export interface AppBarConfig {
  /** none = 页面自绘页头（子书库页有带重命名编辑的专属页头，不叠加通用顶栏） */
  variant: 'home' | 'default' | 'back' | 'detail' | 'none';
  title?: string;
}

export const getAppBarConfig = (pathname: string): AppBarConfig => {
  if (pathname === '/') {
    return { variant: 'home' };
  }
  if (pathname === '/library') {
    return { variant: 'default', title: '书库' };
  }
  if (pathname.startsWith('/library/')) {
    return { variant: 'none' };
  }
  if (pathname === '/import') {
    return { variant: 'back', title: '导入书籍' };
  }
  if (pathname === '/import/custom-cloud') {
    return { variant: 'back', title: '自定义云盘' };
  }
  if (pathname === '/settings') {
    return { variant: 'back', title: '设置' };
  }
  if (pathname === '/profile') {
    return { variant: 'back', title: '个人中心' };
  }
  if (pathname === '/stats') {
    return { variant: 'back', title: '阅读统计' };
  }
  if (pathname === '/search') {
    return { variant: 'back', title: '搜索' };
  }
  if (pathname === '/notes') {
    return { variant: 'back', title: '手记' };
  }
  if (pathname === '/knowledge-hub') {
    return { variant: 'back', title: '知识库' };
  }
  if (pathname === '/tags') {
    return { variant: 'back', title: '分类目录' };
  }
  return { variant: 'back' };
};
