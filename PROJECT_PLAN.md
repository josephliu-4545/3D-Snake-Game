# 3D Snake Game - Project Plan

## Overview
A browser-based 3D Snake game with grid-based movement, keyboard controls, and simple visuals.

---

## 1. Recommended Tech Stack

**Core Technologies:**
- **Vite** - Modern build tool and dev server
- **HTML5** - Structure and container
- **CSS3** - UI styling and layout
- **JavaScript (ES6+ with Modules)** - Game logic with proper imports/exports
- **Three.js** - 3D rendering (installed via npm)

**Why Vite + ES Modules?**

| Factor | Why It's Better |
|--------|-----------------|
| **Instant Hot Reload** | Changes appear immediately without manual refresh |
| **Modern JavaScript** | Use `import/export` instead of global variables |
| **Organized Code** | Each file is a module with clear dependencies |
| **Three.js via NPM** | Proper version management, autocomplete in editor |
| **Future-Proof** | Skills transfer to React/Vue/any modern framework |
| **Easy Deployment** | Built-in optimized production build |

**Why Not Plain Script Tags?**
- Global variables become messy as projects grow
- No code autocomplete or error checking
- Harder to reuse code between projects
- Three.js CDN versions can change unexpectedly

**Why Not Other Build Tools?**
- Webpack: Complex configuration, slow
- Parcel: Good but Vite is faster and simpler
- Rollup: Powerful but needs more setup

---

## 2. Development Phases

### Phase 0: Game Design Decisions
**Do this BEFORE writing any code**

- **Grid Size:** How big is the playing field? (e.g., 10x10, 15x15, 20x20)
- **Game Speed:** How fast does the snake move? (e.g., 200ms per move)
- **Initial Snake Length:** How many segments at start? (e.g., 3 segments)
- **Visual Style:** Colors for snake, food, board, background
- **Controls:** Arrow keys, WASD, or both?
- **Camera View:** Top-down, isometric, or perspective?
- **Win Condition:** Is there one, or is it endless?

**Why Phase 0 Matters:**
Having these numbers written down prevents decision fatigue later. You'll reference these constants throughout your code.

### Phase 1: Vite + Three.js Setup
- Initialize project with Vite
- Install Three.js via npm
- Create folder structure with ES modules
- Set up basic HTML and CSS
- Verify Three.js renders a test cube

### Phase 2: 3D World Foundation
- Create the game grid/board (3D platform)
- Add lighting (ambient + directional)
- Set up camera angle (isometric view)
- Add OrbitControls for camera debugging

### Phase 3: Snake System
- Create snake segment (cube geometry)
- Implement snake body (array of segments)
- Set initial spawn position
- Render snake in the scene

### Phase 4: Grid Movement
- Implement grid-based positioning
- Keyboard input handling (WASD/Arrow keys)
- Movement in 4 directions (no turning back)
- Movement tick system (snake moves every X ms)

### Phase 5: Food System
- Create food object (different colored cube)
- Random spawn on grid (not on snake)
- Collision detection (snake head touches food)

### Phase 6: Growth & Collision
- Grow snake when food eaten
- Self-collision detection
- Wall collision detection
- Game over state

### Phase 7: UI & Game Loop
- Score display
- Game over screen
- Restart functionality
- Start/pause controls

### Phase 8: Polish (Optional Future Work)
- Smooth animations between grid cells
- Particle effects when eating
- Sound effects
- Visual themes/skins
- High score storage (localStorage)

---

## 3. Build Order (Feature by Feature)

Build in this exact order - each step gives you a testable milestone:

1. **Empty 3D Scene** - See a rotating cube on screen
2. **Static Game Board** - See the playing platform
3. **Static Snake** - See the snake sitting on the board
4. **Moving Snake** - Snake moves automatically
5. **Controlled Movement** - Control with keyboard
6. **Food Appears** - See food on the board
7. **Eat Food** - Snake grows when touching food
8. **Game Over** - Collisions stop the game
9. **Score + Restart** - Complete game loop
10. **Visual Polish** - Colors, effects, styling

---

## 4. Folder Structure

```
3d-snake-game/
│
├── index.html              # Main HTML file - Vite entry point
├── package.json            # Project dependencies and scripts
├── vite.config.js          # Vite configuration (optional)
│
├── src/
│   ├── main.js             # Entry point, init Three.js scene
│   ├── game.js             # Core game logic (state, loop, rules)
│   ├── snake.js            # Snake class (movement, growth, render)
│   ├── food.js             # Food class (spawn, collision, render)
│   ├── grid.js             # Grid/board setup and rendering
│   ├── input.js            # Keyboard input handling
│   ├── ui.js               # Score display, menus, DOM updates
│   └── constants.js        # Game design values from Phase 0
│
├── style.css               # Global styling
└── PROJECT_PLAN.md         # This file
```

**Why This Structure?**
- **`src/` folder** separates source code from config files
- **ES Modules** (`import/export`) create clear dependencies between files
- **`constants.js`** centralizes all game rules (grid size, speed, colors)
- **Each `.js` file** is a focused module with one responsibility
- **Vite handles bundling** - you just write modern JavaScript

---

## 5. Testing Strategy

### During Development

**Vite Dev Server:**
```bash
npm run dev
```
- Opens browser automatically
- Hot Module Replacement (HMR) - changes appear instantly
- Console errors show in terminal and browser

**VS Code Setup:**
1. Install "ESLint" extension for error checking
2. Install "Prettier" extension for code formatting
3. Use "Auto Import" feature when typing Three.js classes

**Console Debugging:**
```javascript
// Add these to see what's happening:
console.log("Snake position:", snake.getHeadPosition());
console.log("Direction:", currentDirection);
console.log("Food at:", food.position);
```

### Test Checkpoints

| Phase | Test | Expected Result |
|-------|------|-----------------|
| 1 | Run `npm run dev` | Browser opens, see rotating cube |
| 2 | Look at scene | See a flat platform/grid |
| 3 | Check scene | See 3+ cubes (snake) on platform |
| 4 | Wait 1 second | Snake moves one grid space |
| 5 | Press arrow key | Snake changes direction |
| 6 | Look at board | See a different colored cube (food) |
| 7 | Move into food | Snake grows by 1 segment |
| 8 | Hit wall/yourself | Game stops, "Game Over" shows |
| 9 | Press R | Game resets, score = 0 |

---

## 6. Deployment Options

### Option 1: GitHub Pages (FREE)
```bash
npm run build
# Upload dist/ folder to GitHub Pages
```

### Option 2: Netlify (FREE)
```bash
npm run build
# Drag dist/ folder to Netlify Drop
```

### Option 3: Vercel (FREE)
```bash
npm i -g vercel
vercel
# Follow prompts
```

### Build Command
```bash
npm run build
```
Creates an optimized `dist/` folder ready for deployment.

---

## Next Steps

1. **Complete Phase 0** - Write down your game rules in `src/constants.js`
2. **Start Phase 1** - Initialize Vite project and install Three.js

Ready to begin? We'll start with Phase 0 (design decisions), then move to Phase 1 (project setup).
