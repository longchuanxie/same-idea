import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { APP_CONFIG } from '@/constants/config';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/utils/cn';

export interface TopAppBarProps {
  variant?: 'home' | 'default' | 'back' | 'detail';
  title?: string;
  onBack?: () => void;
  onSearch?: () => void;
  onMore?: () => void;
}

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

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const handleMenuAction = (action: () => void) => {
    setMenuOpen(false);
    action();
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full bg-background border-b border-outline-variant',
        'flex justify-between items-center px-margin-mobile py-unit',
        'md:px-margin-desktop',
        'pt-safe'
      )}
    >
      {variant === 'home' && (
        <>
          <button
            className="flex-shrink-0"
            onClick={() => navigate(ROUTES.PROFILE)}
            aria-label="个人中心"
          >
            <div className="w-10 h-10 rounded-full border border-outline-variant overflow-hidden bg-surface-container flex items-center justify-center hover:bg-surface-variant transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
                person
              </span>
            </div>
          </button>
          <div className="flex-1 flex justify-center">
            <h1 className="font-display text-headline-md text-primary font-bold tracking-tight">
              {APP_CONFIG.name}
            </h1>
          </div>
          <div className="flex-shrink-0 flex items-center gap-1">
            <button
              aria-label="搜索"
              className="p-2 hover:bg-surface-variant rounded-full transition-colors text-on-surface-variant hover:text-primary"
              onClick={onSearch ?? (() => navigate(ROUTES.SEARCH))}
            >
              <span className="material-symbols-outlined text-[24px]">search</span>
            </button>
            <button
              aria-label="通知"
              className="p-2 hover:bg-surface-variant rounded-full transition-colors text-on-surface-variant hover:text-primary relative"
              onClick={() => navigate(ROUTES.STATS)}
            >
              <span className="material-symbols-outlined text-[24px]">notifications</span>
            </button>
            <div className="relative" ref={menuRef}>
              <button
                aria-label="更多"
                className="p-2 hover:bg-surface-variant rounded-full transition-colors text-on-surface-variant hover:text-primary"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <span className="material-symbols-outlined text-[24px]">more_vert</span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-lg py-1 z-50 animate-fade-in">
                  <button
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-variant transition-colors text-on-surface-variant hover:text-primary"
                    onClick={() => handleMenuAction(() => navigate(ROUTES.IMPORT))}
                  >
                    <span className="material-symbols-outlined text-[20px]">upload_file</span>
                    <span className="font-label text-label-md">导入漫画</span>
                  </button>
                  <button
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-variant transition-colors text-on-surface-variant hover:text-primary"
                    onClick={() => handleMenuAction(() => navigate(ROUTES.STATS))}
                  >
                    <span className="material-symbols-outlined text-[20px]">bar_chart</span>
                    <span className="font-label text-label-md">阅读统计</span>
                  </button>
                  <button
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-variant transition-colors text-on-surface-variant hover:text-primary"
                    onClick={() => handleMenuAction(() => navigate(ROUTES.LIBRARY, { state: { selectMode: true } }))}
                  >
                    <span className="material-symbols-outlined text-[20px]">checklist</span>
                    <span className="font-label text-label-md">批量管理</span>
                  </button>
                  <div className="border-t border-outline-variant my-1" />
                  <button
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-variant transition-colors text-on-surface-variant hover:text-primary"
                    onClick={() => handleMenuAction(() => navigate(ROUTES.SETTINGS))}
                  >
                    <span className="material-symbols-outlined text-[20px]">settings</span>
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
              className="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-variant"
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
          <button
            className="flex-shrink-0"
            onClick={() => navigate(ROUTES.PROFILE)}
            aria-label="个人中心"
          >
            <div className="w-10 h-10 rounded-full border border-outline-variant overflow-hidden bg-surface-container flex items-center justify-center hover:bg-surface-variant transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
                person
              </span>
            </div>
          </button>
          <div className="flex-1 flex justify-center">
            <h1 className="font-display text-headline-md text-primary tracking-tight">
              {title ?? APP_CONFIG.name}
            </h1>
          </div>
          <button
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant transition-colors text-on-surface-variant hover:text-primary"
            onClick={onSearch ?? (() => navigate(ROUTES.SEARCH))}
          >
            <span className="material-symbols-outlined">search</span>
          </button>
        </>
      )}
    </header>
  );
};
