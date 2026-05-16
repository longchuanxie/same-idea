import React, { useRef, useEffect } from 'react';
import { cn } from '@/utils/cn';

export interface CollapsibleProps {
  isOpen: boolean;
  children: React.ReactNode;
  className?: string;
}

export const Collapsible: React.FC<CollapsibleProps> = ({
  isOpen,
  children,
  className,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;

    const el = contentRef.current;

    if (isOpen) {
      el.style.maxHeight = '0px';
      el.style.opacity = '0';
      requestAnimationFrame(() => {
        el.style.maxHeight = `${el.scrollHeight}px`;
        el.style.opacity = '1';
      });
    } else {
      el.style.maxHeight = `${el.scrollHeight}px`;
      el.style.opacity = '1';
      requestAnimationFrame(() => {
        el.style.maxHeight = '0px';
        el.style.opacity = '0';
      });
    }
  }, [isOpen]);

  return (
    <div
      ref={contentRef}
      className={cn(
        'overflow-hidden transition-[max-height,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
        className
      )}
      style={{
        maxHeight: isOpen ? undefined : 0,
        opacity: isOpen ? undefined : 0,
      }}
    >
      {children}
    </div>
  );
};

export default Collapsible;
