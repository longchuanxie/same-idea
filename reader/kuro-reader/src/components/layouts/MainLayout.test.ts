import { describe, expect, it } from 'vitest';

import { resolveNav } from '@/components/layouts/mainLayoutChrome';

describe('resolveNav 底栏高亮归属', () => {
  it('一级路由归属各自的底栏 tab', () => {
    expect(resolveNav('/')).toBe('home');
    expect(resolveNav('/library')).toBe('library');
    expect(resolveNav('/knowledge-hub')).toBe('knowledge');
    expect(resolveNav('/import')).toBe('import');
    expect(resolveNav('/settings')).toBe('settings');
  });

  it('知识库域的次级页（问藏书/跨书图谱）亮知识库而非首页', () => {
    expect(resolveNav('/ask')).toBe('knowledge');
    expect(resolveNav('/atlas')).toBe('knowledge');
  });

  it('学习闭环三页从首页 more 菜单进入，显式归属首页', () => {
    expect(resolveNav('/notes')).toBe('home');
    expect(resolveNav('/review')).toBe('home');
    expect(resolveNav('/vocabulary')).toBe('home');
  });

  it('统计归属首页、检索归属书库（就近入口域）', () => {
    expect(resolveNav('/stats')).toBe('home');
    expect(resolveNav('/search')).toBe('library');
  });
});
