import React, { useEffect, useState, useRef, useCallback } from 'react';

import { useLocation } from 'react-router-dom';

import { cn } from '@/utils/cn';

type TransitionDirection = 'forward' | 'back' | 'none';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

const TRANSITION_DURATION = 280;
const HISTORY_MAX_LENGTH = 20;
const EXIT_ENTER_GAP = 30;

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className,
}) => {
  const location = useLocation();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [phase, setPhase] = useState<'enter' | 'exit' | 'idle'>('idle');
  const [direction, setDirection] = useState<TransitionDirection>('none');
  const historyRef = useRef<string[]>([]);
  const prevPathnameRef = useRef(location.pathname);

  useEffect(() => {
    const prev = prevPathnameRef.current;
    const curr = location.pathname;
    prevPathnameRef.current = curr;

    if (prev === curr) return;

    const prevIdx = historyRef.current.lastIndexOf(prev);
    const currIdx = historyRef.current.lastIndexOf(curr);

    let dir: TransitionDirection = 'forward';
    if (currIdx >= 0 && currIdx < prevIdx) {
      dir = 'back';
    } else if (curr === '/') {
      dir = 'back';
    }

    historyRef.current.push(curr);
    if (historyRef.current.length > HISTORY_MAX_LENGTH) {
      historyRef.current = historyRef.current.slice(-HISTORY_MAX_LENGTH);
    }

    if (displayChildren !== children) {
      setDirection(dir);
      setPhase('exit');

      const timer = setTimeout(() => {
        setDisplayChildren(children);
        setPhase('enter');

        const enterTimer = setTimeout(() => {
          setPhase('idle');
        }, TRANSITION_DURATION);

        return () => clearTimeout(enterTimer);
      }, TRANSITION_DURATION - EXIT_ENTER_GAP);

      return () => clearTimeout(timer);
    }
  }, [children, displayChildren, location.pathname]);

  const getAnimationClass = useCallback(() => {
    if (phase === 'idle') return '';

    if (phase === 'exit') {
      return direction === 'back'
        ? 'animate-slide-in-right'
        : 'animate-slide-in-left';
    }

    if (phase === 'enter') {
      return direction === 'back'
        ? 'animate-slide-in-left'
        : 'animate-slide-in-right';
    }

    return '';
  }, [phase, direction]);

  const getOpacityStyle = useCallback((): React.CSSProperties => {
    if (phase === 'exit') {
      return { opacity: 0, willChange: 'opacity, transform' };
    }
    if (phase === 'enter') {
      return { willChange: 'opacity, transform' };
    }
    return { willChange: 'auto' };
  }, [phase]);

  return (
    <div
      className={cn(getAnimationClass(), className)}
      style={getOpacityStyle()}
    >
      {displayChildren}
    </div>
  );
};

export default PageTransition;
