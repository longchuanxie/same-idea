import React, { useState, useRef } from 'react';

import { useNavigate } from 'react-router-dom';

import { APP_CONFIG } from '@/constants/config';
import { ROUTES } from '@/constants/routes';
import { useClickOutside } from '@/hooks/useClickOutside';
import { cn } from '@/utils/cn';

export interface TopAppBarProps {
  variant?: 'home' | 'default' | 'back' | 'detail';
  title?: string;
  onBack?: () => void;
  onSearch?: () => void;
  onMore?: () => void;
}

/** 个人中心入口 = 藏书印（建议书「印」语义）：方形小圆角 + 朱砂描边，
 *  与通用圆形头像模板区隔，个人身份在馆内的印记 */
const ProfileSealButton: React.FC = () => {
  const navigate = useNavigate();
  return (
    <button
      className="flex-shrink-0"
      onClick={() => navigate(ROUTES.PROFILE)}
      aria-label="个人中心"
    >
      <div className="w-11 h-11 rounded-card border border-seal/60 flex items-center justify-center hover:bg-seal-soft/60 transition-colors">
        <span className="material-symbols-outlined text-seal text-icon-md">
          person
        </span>
      </div>
    </button>
  );
};

export const TopAppBar: React.FC<TopAppBarProps> = ({
  variant = 'home',
  title,
  onBack,
  onSearch,
  onMore,
}) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  useClickOutside(menuRef, menuOpen, () => setMenuOpen(false));

  const handleMenuAction = (action: () => void) => {
    setMenuOpen(false);
    action();
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full bg-background/85 backdrop-blur-md border-b border-outline-variant',
        'flex justify-between items-center px-margin-mobile py-unit',
        'md:px-margin-desktop',
        'pt-safe'
      )}
    >
      {variant === 'home' && (
        <>
          <ProfileSealButton />
          <div className="flex-1 flex justify-center">
            <h1 className="font-display text-headline-md text-primary font-bold tracking-tight">
              {APP_CONFIG.name}
            </h1>
          </div>
          <div className="flex-shrink-0 flex items-center gap-1">
            <button
              aria-label="搜索"
              className="w-11 h-11 flex items-center justify-center hover:bg-surface-variant rounded-full transition-colors text-seal hover:text-seal-deep"
              onClick={onSearch ?? (() => navigate(ROUTES.SEARCH))}
            >
              <span className="material-symbols-outlined text-icon-lg">search</span>
            </button>
            <button
              aria-label="阅读统计"
              className="w-11 h-11 flex items-center justify-center hover:bg-surface-variant rounded-full transition-colors text-seal hover:text-seal-deep relative"
              onClick={() => navigate(ROUTES.STATS)}
            >
              <span className="material-symbols-outlined text-icon-lg">bar_chart</span>
            </button>
            <div className="relative" ref={menuRef}>
              <button
                aria-label="更多"
                className="w-11 h-11 flex items-center justify-center hover:bg-surface-variant rounded-full transition-colors text-seal hover:text-seal-deep"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <span className="material-symbols-outlined text-icon-lg">more_vert</span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 menu-surface py-1 z-50 animate-scale-in origin-top-right">
                  <button
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-variant transition-colors text-seal hover:text-seal-deep"
                    onClick={() => handleMenuAction(() => navigate(ROUTES.IMPORT))}
                  >
                    <span className="material-symbols-outlined text-icon-md">upload_file</span>
                    <span className="font-label text-label-md">导入书籍</span>
                  </button>
                  <button
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-variant transition-colors text-seal hover:text-seal-deep"
                    onClick={() => handleMenuAction(() => navigate(ROUTES.KNOWLEDGE_HUB))}
                  >
                    <span className="material-symbols-outlined text-icon-md">psychology</span>
                    <span className="font-label text-label-md">知识库</span>
                  </button>
                  {/* 阅读统计入口收敛为顶栏图表 icon（建议书 5.3：删除重复项）；
                      批量管理统一走书库页「管理」按钮，不再绕道菜单 */}
                  <div className="border-t border-outline-variant my-1" />
                  <button
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-variant transition-colors text-seal hover:text-seal-deep"
                    onClick={() => handleMenuAction(() => navigate(ROUTES.SETTINGS))}
                  >
                    <span className="material-symbols-outlined text-icon-md">settings</span>
                    <span className="font-label text-label-md">设置</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {variant === 'back' && (
        <>
          <button
            className="text-primary p-2 -ml-2 hover:bg-surface-variant rounded-full transition-colors"
            onClick={handleBack}
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          {title && (
            <h1 className="font-display text-headline-md text-primary tracking-tight flex-1 text-center">
              {title}
            </h1>
          )}
          <div className="w-10" />
        </>
      )}

      {variant === 'detail' && (
        <>
          <button
            className="text-primary p-2 -ml-2 hover:bg-surface-variant rounded-full transition-colors"
            onClick={handleBack}
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <button
              className="text-seal hover:text-seal-deep transition-colors p-2 rounded-full hover:bg-surface-variant"
              aria-label="more"
              onClick={onMore}
            >
              <span className="material-symbols-outlined">more_vert</span>
            </button>
          </div>
        </>
      )}

      {variant === 'default' && (
        <>
          <ProfileSealButton />
          <div className="flex-1 flex justify-center">
            <h1 className="font-display text-headline-md text-primary tracking-tight">
              {title ?? APP_CONFIG.name}
            </h1>
          </div>
          <button
            className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-surface-variant transition-colors text-seal hover:text-seal-deep"
            onClick={onSearch ?? (() => navigate(ROUTES.SEARCH))}
          >
            <span className="material-symbols-outlined">search</span>
          </button>
        </>
      )}
    </header>
  );
};
