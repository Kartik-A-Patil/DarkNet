# 🎬 Anime.js Animation System

## Overview

This project now includes a comprehensive animation system built with [Anime.js](https://animejs.com/) v4.0.2. The animation engine provides smooth, performant animations throughout the DarkNet OS interface with a hacker-themed aesthetic.

## Features

### ✨ Animation Types
- **Fade Animations**: Smooth opacity transitions with directional movement
- **Window Animations**: Specialized animations for OS windows (open, close, minimize, restore)
- **Loading Animations**: Pulse, spin, and matrix-style loading indicators
- **Glitch Effects**: Cyberpunk-style glitch animations for the hacker theme
- **Text Animations**: Typewriter and scramble effects for dynamic text

### 🎯 Integration Points
- **Window Manager**: Automatic animations for window operations
- **React Hooks**: Easy-to-use hooks for component animations
- **Global Configuration**: Centralized animation settings and timing

## Quick Start

### Basic Usage

```typescript
import { useAnimations } from '@/hooks/useAnimations';

const MyComponent = () => {
  const { fade, window, glitch } = useAnimations();
  
  const handleClick = () => {
    fade.fadeInUp('.my-element');
  };
  
  return <div className="my-element">Animated content</div>;
};
```

### React Hooks

```typescript
import { useEntranceAnimation, useHoverAnimation } from '@/hooks/useAnimations';

const AnimatedComponent = () => {
  // Automatic entrance animation
  const ref = useEntranceAnimation('fadeInUp', 200);
  
  // Hover effects
  const hoverRef = useHoverAnimation('scale');
  
  return (
    <div ref={ref}>
      <button ref={hoverRef}>Hover me!</button>
    </div>
  );
};
```

## Animation Categories

### 1. Fade Animations (`fadeAnimations`)
- `fadeIn(element, duration?)` - Fade in from transparent
- `fadeOut(element, duration?)` - Fade out to transparent
- `fadeInUp(element, distance?)` - Fade in while moving up
- `fadeInDown(element, distance?)` - Fade in while moving down

### 2. Window Animations (`windowAnimations`)
- `open(element)` - Window opening with elastic scale
- `close(element)` - Window closing with smooth scale down
- `minimize(element)` - Minimize to taskbar with scale and translate
- `restore(element)` - Restore from minimized state with bounce

### 3. Loading Animations (`loadingAnimations`)
- `pulse(element)` - Rhythmic scaling animation
- `spin(element)` - Continuous rotation
- `matrix(element)` - Matrix-style flickering effect

### 4. Glitch Effects (`glitchAnimations`)
- `glitch(element)` - Cyberpunk glitch with translation and opacity
- `scanlines(element)` - Moving scanline effect

### 5. Text Animations (`textAnimations`)
- `typewriter(element, text)` - Character-by-character typing effect
- `scramble(element, finalText)` - Text scrambling into final form

## Configuration

### Animation Timing
```typescript
export const ANIMATION_CONFIG = {
  duration: {
    fast: 200,
    normal: 400,
    slow: 800,
    verySlow: 1200
  },
  easing: {
    easeInOut: 'easeInOutCubic',
    easeOut: 'easeOutCubic',
    easeIn: 'easeInCubic',
    elastic: 'easeOutElastic(1, .8)',
    bounce: 'easeOutBounce'
  }
};
```

## Demo Application

A comprehensive demo application is available through the Application Menu:
1. Open the Application Menu (bottom-left)
2. Navigate to "System Tools"
3. Click "Animation Demo"

The demo showcases:
- All animation types in action
- Interactive triggers
- Performance examples
- Matrix-style effects
- Hacker-themed demonstrations

## Advanced Usage

### Custom Timelines
```typescript
import { animationUtils } from '@/lib/animations';

const tl = animationUtils.createTimeline({
  autoplay: false,
  direction: 'alternate',
  loop: true
});

tl.add({
  targets: '.element1',
  translateX: 100,
  duration: 500
}).add({
  targets: '.element2',
  scale: 1.2,
  duration: 300
}, '-=200'); // Start 200ms before previous animation ends
```

### Staggered Animations
```typescript
import { fadeAnimations, animationUtils } from '@/lib/animations';

anime({
  targets: '.stagger-item',
  opacity: [0, 1],
  translateY: [30, 0],
  delay: animationUtils.stagger(100), // 100ms delay between elements
  duration: 600
});
```

### Performance Controls
```typescript
import { animationUtils } from '@/lib/animations';

// Pause all running animations
animationUtils.pauseAll();

// Resume all animations
animationUtils.resumeAll();

// Remove animations from specific element
animationUtils.remove('.my-element');
```

## Performance Considerations

- ✅ Hardware-accelerated transforms (translate, scale, rotate)
- ✅ Optimized for 60fps performance
- ✅ Automatic cleanup on component unmount
- ✅ Minimal DOM manipulation
- ⚠️ Avoid animating layout properties (width, height, margin)
- ⚠️ Use `will-change` CSS property for frequently animated elements

## Browser Support

- ✅ Chrome 49+
- ✅ Firefox 45+
- ✅ Safari 10+
- ✅ Edge 17+

## File Structure

```
src/
├── lib/
│   └── animations.ts           # Core animation utilities
├── hooks/
│   └── useAnimations.ts        # React hooks for animations
├── components/
│   ├── apps/
│   │   └── AnimationDemo.tsx   # Demo application
│   └── Window.tsx              # Window component with animations
└── main.tsx                    # Animation engine initialization
```

## Troubleshooting

### Common Issues

**Q: Animations not working?**
A: Ensure the animation engine is initialized in `main.tsx` and the element exists in the DOM.

**Q: Performance issues?**
A: Check if you're animating layout properties. Use transforms instead.

**Q: TypeScript errors?**
A: Make sure `@types/animejs` is installed and anime.js is properly imported.

### Debug Mode
```typescript
// Enable anime.js debugging
anime.set({
  debug: true
});
```

## Contributing

When adding new animations:
1. Add them to the appropriate category in `animations.ts`
2. Update the React hooks in `useAnimations.ts`
3. Add examples to the demo application
4. Update this documentation

## Resources

- [Anime.js Documentation](https://animejs.com/documentation/)
- [Easing Functions](https://easings.net/)
- [CSS Transforms Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/transform)

## 📱 Featured Applications

### DarkNet Social
A hacker-themed social media platform with the following features:
- **User Profiles**: Reputation-based system with hacker handles
- **Real-time Posts**: Share security research, CVEs, and findings
- **Interactive Actions**: Like, repost, and comment on posts
- **Trending Topics**: Track popular security topics and tags
- **Animated UI**: Smooth entrance animations and interaction feedback
- **Mock Data**: Pre-populated with realistic security researcher content

The social feed integrates seamlessly with the animation system, providing:
- Staggered post entrance animations
- Animated like/repost interactions using `hacker.accessGranted()` and `hacker.networkScan()`
- Smooth hover effects and transitions

### Animation Demo
1. Open the Application Menu (bottom-left)
2. Navigate to "System Tools"
3. Click "Animation Demo"

The demo showcases:
- All animation types in action
- Interactive triggers
- Performance examples
- Matrix-style effects
- Hacker-themed demonstrations
