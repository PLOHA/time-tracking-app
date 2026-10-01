# Glass-Neumorphism UI Redesign

## Understanding Summary
- **What is being built:** A visual overhaul combining Neumorphism (extruded shadows) with Glassmorphism (translucent frosted glass).
- **Why it exists:** To create a premium, highly modern, and visually engaging UI.
- **Who it is for:** All system users (Employee & Admin dashboards).
- **Key constraints:** The combination of `backdrop-filter` and animated large blurred shapes is GPU-intensive. 
- **Explicit non-goals:** Do not completely abandon Neumorphic depth (shadows must remain). Do not use WebGL or heavy JS animation libraries.

## Assumptions
- Custom CSS variables and Tailwind utility classes will be used.
- Dark mode will need careful tuning to ensure the floating blobs don't wash out dark text (though blobs will likely be darker in dark mode).
- A simple local state + `localStorage` toggle will suffice for the performance setting.

## Decision Log
1. **Design Direction:** Chose Glass-Neumorphism (Translucent cards + Neumorphic shadows) over solid cards.
   - *Alternative:* Solid cards with gradient background.
   - *Reason:* Solid cards break the illusion of depth against a gradient background. Glassmorphism integrates the background colors naturally.
2. **Animation Technique:** Chose "Floating Orbs" (Pure CSS blurred divs) over Gradient Panning or WebGL.
   - *Alternative:* Canvas/WebGL blob simulation.
   - *Reason:* CSS Orbs provide a stunning premium look (like Siri/Apple UI) with significantly lower overhead and complexity than WebGL.
3. **Performance Management:** Implemented an "Effects Toggle" button.
   - *Alternative:* Reduce blur/motion globally for everyone.
   - *Reason:* Allows high-end devices to enjoy the full premium experience while providing an immediate fallback for older devices.

## Final Design Specification
- **Component `<AnimatedBackground />`**: Renders 3-4 absolute positioned `div` elements with `filter: blur(120px)`. Uses CSS `@keyframes` to slowly translate and scale these elements.
- **Toggle Control**: Add a "Magic Wand" icon button to the top action bar. Toggles a state `effectsEnabled` (saved to localStorage). When disabled, the `<AnimatedBackground />` is not rendered (or hidden), falling back to a solid `bg-neu-bg`.
- **CSS Overrides (`globals.css`)**:
  - Refactor `.neu-flat`, `.neu-pressed`, `.neu-btn`.
  - Add `backdrop-filter: blur(16px);` and `-webkit-backdrop-filter: blur(16px);`.
  - Modify `background` to `rgba(255, 255, 255, 0.4)` (or suitable alpha for dark mode).
  - Maintain the existing `box-shadow` values for depth.
