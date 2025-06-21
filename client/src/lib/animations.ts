// CSS-based animation system replacing animejs
export interface AnimationOptions {
  duration?: number;
  delay?: number;
  easing?: string;
  loop?: boolean | number;
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
}

class AnimationController {
  private activeAnimations: Map<string, Animation> = new Map();

  public createElement(element: string | HTMLElement): HTMLElement | null {
    if (typeof element === 'string') {
      return document.querySelector(element);
    }
    return element;
  }

  private createKeyframe(name: string, keyframes: Record<string, any>): void {
    const styleSheet = document.styleSheets[0] || (() => {
      const style = document.createElement('style');
      document.head.appendChild(style);
      return style.sheet!;
    })();

    const keyframeRule = `@keyframes ${name} { ${Object.entries(keyframes)
      .map(([percent, styles]) => {
        const styleString = Object.entries(styles)
          .map(([prop, value]) => `${prop}: ${value}`)
          .join('; ');
        return `${percent} { ${styleString} }`;
      })
      .join(' ')} }`;

    try {
      styleSheet.insertRule(keyframeRule, styleSheet.cssRules.length);
    } catch (e) {
      // Rule might already exist
    }
  }

  animate(
    elementOrSelector: string | HTMLElement | HTMLElement[] | NodeListOf<Element>,
    options: AnimationOptions & { keyframes?: any }
  ): Promise<void> {
    return new Promise((resolve) => {
      const elements: HTMLElement[] = [];
      
      if (typeof elementOrSelector === 'string') {
        const found = document.querySelectorAll(elementOrSelector);
        elements.push(...Array.from(found) as HTMLElement[]);
      } else if (elementOrSelector instanceof HTMLElement) {
        elements.push(elementOrSelector);
      } else if (Array.isArray(elementOrSelector)) {
        elements.push(...elementOrSelector);
      } else if (elementOrSelector instanceof NodeList) {
        elements.push(...Array.from(elementOrSelector) as HTMLElement[]);
      }

      if (elements.length === 0) {
        resolve();
        return;
      }

      const {
        duration = 300,
        delay = 0,
        easing = 'ease',
        keyframes,
        ...animationProps
      } = options;

      elements.forEach((el, index) => {
        const elementDelay = delay + (index * 50); // Stagger animations
        
        if (keyframes) {
          const animationName = `anim-${Date.now()}-${index}`;
          this.createKeyframe(animationName, keyframes);
          
          el.style.animation = `${animationName} ${duration}ms ${easing} ${elementDelay}ms`;
        } else {
          // Apply CSS properties directly
          Object.entries(animationProps).forEach(([prop, value]) => {
            (el.style as any)[prop] = value;
          });
        }

        // Set a timeout to resolve after the longest animation
        if (index === elements.length - 1) {
          setTimeout(() => resolve(), duration + elementDelay);
        }
      });
    });
  }

  // Text animation utilities
  typewriter(element: string | HTMLElement, text: string, speed: number = 50): void {
    const el = this.createElement(element);
    if (!el) return;

    el.textContent = '';
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        el.textContent += text.charAt(i);
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);
  }

  scramble(element: string | HTMLElement, finalText: string, duration: number = 1000): void {
    const el = this.createElement(element);
    if (!el) return;

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    const steps = 20;
    const stepDuration = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      if (currentStep >= steps) {
        el.textContent = finalText;
        clearInterval(timer);
        return;
      }

      let scrambledText = '';
      for (let i = 0; i < finalText.length; i++) {
        if (Math.random() < currentStep / steps) {
          scrambledText += finalText[i];
        } else {
          scrambledText += chars[Math.floor(Math.random() * chars.length)];
        }
      }
      
      el.textContent = scrambledText;
      currentStep++;
    }, stepDuration);
  }

  // Matrix rain effect
  matrixRain(element: string | HTMLElement | HTMLElement[] | NodeListOf<Element>): Promise<unknown> {
    return new Promise((resolve) => {
      const elements: HTMLElement[] = [];
      
      if (typeof element === 'string') {
        const found = document.querySelectorAll(element);
        elements.push(...Array.from(found) as HTMLElement[]);
      } else if (element instanceof HTMLElement) {
        elements.push(element);
      } else if (Array.isArray(element)) {
        elements.push(...element);
      } else if (element instanceof NodeList) {
        elements.push(...Array.from(element) as HTMLElement[]);
      }

      elements.forEach(el => {
        el.classList.add('matrix-rain');
        el.style.animation = 'matrixRain 2s ease-in-out';
      });

      setTimeout(() => {
        elements.forEach(el => {
          el.classList.remove('matrix-rain');
          el.style.animation = '';
        });
        resolve(true);
      }, 2000);
    });
  }

  // Glitch effect
  glitch(element: string | HTMLElement): void {
    const el = this.createElement(element);
    if (!el) return;

    el.classList.add('glitch-effect');
    el.style.animation = 'glitch 0.5s ease-in-out';
    
    setTimeout(() => {
      el.classList.remove('glitch-effect');
      el.style.animation = '';
    }, 500);
  }

  // Hacker-style animations
  accessGranted(element: string | HTMLElement): void {
    const el = this.createElement(element);
    if (!el) return;

    el.classList.add('access-granted');
    el.style.animation = 'accessGranted 1s ease-in-out';
    
    setTimeout(() => {
      el.classList.remove('access-granted');
      el.style.animation = '';
    }, 1000);
  }

  accessDenied(element: string | HTMLElement): void {
    const el = this.createElement(element);
    if (!el) return;

    el.classList.add('access-denied');
    el.style.animation = 'accessDenied 1s ease-in-out';
    
    setTimeout(() => {
      el.classList.remove('access-denied');
      el.style.animation = '';
    }, 1000);
  }

  networkScan(elements: string | HTMLElement | HTMLElement[] | NodeListOf<Element>): void {
    const elementArray: HTMLElement[] = [];
    
    if (typeof elements === 'string') {
      const found = document.querySelectorAll(elements);
      elementArray.push(...Array.from(found) as HTMLElement[]);
    } else if (elements instanceof HTMLElement) {
      elementArray.push(elements);
    } else if (Array.isArray(elements)) {
      elementArray.push(...elements);
    } else if (elements instanceof NodeList) {
      elementArray.push(...Array.from(elements) as HTMLElement[]);
    }

    elementArray.forEach((el, index) => {
      setTimeout(() => {
        el.classList.add('network-scan');
        el.style.animation = 'networkScan 0.8s ease-in-out';
        
        setTimeout(() => {
          el.classList.remove('network-scan');
          el.style.animation = '';
        }, 800);
      }, index * 100);
    });
  }

  // Window animations
  windowOpen(element: string | HTMLElement): void {
    const el = this.createElement(element);
    if (!el) return;

    el.style.animation = 'scale-in 0.3s ease-out';
  }

  minimize(element: string | HTMLElement): void {
    const el = this.createElement(element);
    if (!el) return;

    el.style.animation = 'scale-out 0.2s ease-in';
  }

  restore(element: string | HTMLElement): void {
    const el = this.createElement(element);
    if (!el) return;

    el.style.animation = 'scale-in 0.2s ease-out';
  }

  close(element: string | HTMLElement): void {
    const el = this.createElement(element);
    if (!el) return;

    el.style.animation = 'fade-out 0.2s ease-in';
  }

  bounceIn(element: string | HTMLElement): void {
    const el = this.createElement(element);
    if (!el) return;

    el.style.animation = 'bounceIn 0.6s ease-out';
  }

  pulse(element: string | HTMLElement): void {
    const el = this.createElement(element);
    if (!el) return;

    el.style.animation = 'pulse 1s ease-in-out infinite';
  }

  spin(element: string | HTMLElement): void {
    const el = this.createElement(element);
    if (!el) return;

    el.style.animation = 'spin 1s linear infinite';
  }
}

// Create animation instances for different categories
const animationController = new AnimationController();

export const windowAnim = {
  windowOpen: (element: string | HTMLElement) => animationController.windowOpen(element),
  minimize: (element: string | HTMLElement) => animationController.minimize(element),
  restore: (element: string | HTMLElement) => animationController.restore(element),
  close: (element: string | HTMLElement) => animationController.close(element),
};

export const loading = {
  matrix: (element: string | HTMLElement | HTMLElement[] | NodeListOf<Element>) => animationController.matrixRain(element),
  pulse: (element: string | HTMLElement) => animationController.pulse(element),
  spin: (element: string | HTMLElement) => animationController.spin(element),
};

export const hacker = {
  glitch: (element: string | HTMLElement) => animationController.glitch(element),
  matrixRain: (element: string | HTMLElement | HTMLElement[] | NodeListOf<Element>) => animationController.matrixRain(element),
  accessGranted: (element: string | HTMLElement) => animationController.accessGranted(element),
  accessDenied: (element: string | HTMLElement) => animationController.accessDenied(element),
  networkScan: (elements: string | HTMLElement | HTMLElement[] | NodeListOf<Element>) => animationController.networkScan(elements),
};

export const text = {
  typewriter: (element: string | HTMLElement, text: string, speed?: number) => animationController.typewriter(element, text, speed),
  scramble: (element: string | HTMLElement, finalText: string, duration?: number) => animationController.scramble(element, finalText, duration),
};

export const entrance = {
  bounceIn: (element: string | HTMLElement) => animationController.bounceIn(element),
  scale: (element: string | HTMLElement) => animationController.windowOpen(element),
};

// Legacy window animations for compatibility
export const windowAnimations = {
  windowOpen: (element: string | HTMLElement) => {
    animationController.windowOpen(element);
    return Promise.resolve();
  },
  close: (element: string | HTMLElement) => {
    animationController.close(element);
    return { finished: Promise.resolve() };
  },
  minimize: (element: string | HTMLElement) => {
    animationController.minimize(element);
    return Promise.resolve();
  },
  restore: (element: string | HTMLElement) => {
    animationController.restore(element);
    return Promise.resolve();
  }
};

// Animation utilities
export const animationUtils = {
  removeAnimations: (element: string | HTMLElement) => {
    const el = typeof element === 'string' ? document.querySelector(element) as HTMLElement : element;
    if (el) {
      el.style.animation = '';
      el.style.transition = '';
    }
  }
};

// Export all animation groups for compatibility
export const animations = {
  fade: {
    fadeIn: (element: string | HTMLElement) => {
      const el = animationController.createElement(element);
      if (el) el.style.opacity = '1';
    },
    fadeOut: (element: string | HTMLElement) => {
      const el = animationController.createElement(element);
      if (el) el.style.opacity = '0';
    }
  },
  scale: {
    scaleIn: (element: string | HTMLElement) => animationController.windowOpen(element),
    scaleOut: (element: string | HTMLElement) => animationController.close(element)
  },
  slide: {
    slideInLeft: (element: string | HTMLElement) => {
      const el = animationController.createElement(element);
      if (el) {
        el.style.transform = 'translateX(0)';
        el.style.opacity = '1';
      }
    },
    slideInRight: (element: string | HTMLElement) => {
      const el = animationController.createElement(element);
      if (el) {
        el.style.transform = 'translateX(0)';
        el.style.opacity = '1';
      }
    }
  },
  window: windowAnimations,
  ui: {
    bounceIn: (element: string | HTMLElement) => animationController.bounceIn(element),
    pulse: (element: string | HTMLElement) => animationController.pulse(element)
  },
  utils: animationUtils
};

// Default export
export default animationController;