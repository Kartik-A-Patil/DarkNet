import { useEffect, useRef } from 'react';
import { animations, hacker, text, loading, windowAnim, entrance, animationUtils } from '../lib/animations';

/**
 * React hook for CSS-based animations
 * Provides easy access to pre-configured animations
 */
export const useAnimations = () => {
  return {
    fade: animations.fade,
    scale: animations.scale,
    slide: animations.slide,
    window: animations.window,
    ui: animations.ui,
    utils: animationUtils,
    // Direct exports from animations module
    hacker,
    text,
    loading,
    windowAnim,
    entrance
  };
};

/**
 * Hook for element references with automatic animation cleanup
 */
export const useAnimatedRef = <T extends HTMLElement = HTMLDivElement>() => {
  const ref = useRef<T>(null);

  useEffect(() => {
    return () => {
      // Cleanup animations when component unmounts
      if (ref.current) {
        animationUtils.removeAnimations(ref.current);
      }
    };
  }, []);

  return ref;
};

/**
 * Hook for entrance animations on component mount
 */
export const useEntranceAnimation = (
  animationType: 'fadeIn' | 'scaleIn' | 'slideInLeft' | 'windowOpen' = 'fadeIn',
  delay = 0
) => {
  const ref = useAnimatedRef();

  useEffect(() => {
    if (ref.current) {
      const animationFunctions = {
        fadeIn: () => animations.fade.fadeIn(ref.current!),
        scaleIn: () => animations.scale.scaleIn(ref.current!),
        slideInLeft: () => animations.slide.slideInLeft(ref.current!),
        windowOpen: () => windowAnim.windowOpen(ref.current!)
      };

      // Add delay if specified
      if (delay > 0) {
        setTimeout(() => {
          animationFunctions[animationType]();
        }, delay);
      } else {
        animationFunctions[animationType]();
      }
    }
  }, [animationType, delay]);

  return ref;
};

/**
 * Hook for hover animations
 */
export const useHoverAnimation = (
  hoverAnimation: 'scale' | 'glow' | 'glitch' = 'scale'
) => {
  const ref = useAnimatedRef();

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseEnter = () => {
      switch (hoverAnimation) {
        case 'scale':
          element.style.transform = 'scale(1.05)';
          element.style.transition = 'transform 200ms ease-out';
          break;
        case 'glow':
          element.style.boxShadow = '0 0 20px rgba(0, 255, 0, 0.5)';
          element.style.transition = 'box-shadow 200ms ease-out';
          break;
        case 'glitch':
          element.style.animation = 'glitch 100ms linear';
          setTimeout(() => { element.style.animation = ''; }, 100);
          break;
      }
    };

    const handleMouseLeave = () => {
      element.style.transform = 'scale(1)';
      element.style.boxShadow = 'none';
      element.style.transition = 'all 200ms ease-out';
    };

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [hoverAnimation]);

  return ref;
};

/**
 * Hook for loading animations
 */
export const useLoadingAnimation = (
  isLoading: boolean,
  type: 'pulse' | 'spin' = 'pulse'
) => {
  const ref = useAnimatedRef();

  useEffect(() => {
    if (ref.current) {
      if (isLoading) {
        if (type === 'pulse') {
          animations.ui.pulse(ref.current);
        } else if (type === 'spin') {
          ref.current.style.animation = 'spin 1s linear infinite';
        }
      } else {
        animationUtils.removeAnimations(ref.current);
      }
    }
  }, [isLoading, type]);

  return ref;
};
