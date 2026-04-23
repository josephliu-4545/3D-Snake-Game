# 3D Snake Game

A browser-based 3D Snake game built with Three.js and Vite.

## Quick Start

### 1. Install Dependencies

Open a terminal in this folder and run:

```bash
npm install
```

This downloads Three.js and Vite.

### 2. Start Development Server

```bash
npm run dev
```

This opens your browser automatically at `http://localhost:5173`

You should see a **rotating green cube** on a dark background.

### 3. Test Your Changes

- The browser **auto-refreshes** when you save files
- Open browser console (F12) to see debug messages
- Resize the window - the game should adapt

### Project Structure

```
3d-snake-game/
├── index.html          # Entry point
├── package.json        # Dependencies
├── style.css           # Styling
├── src/
│   ├── main.js         # Main game code (currently shows a cube)
│   └── constants.js    # Game rules and values
└── PROJECT_PLAN.md     # Full project plan
```

## Next Steps

Once you see the rotating cube:
1. ✅ Phase 0 complete (design decisions in constants.js)
2. ✅ Phase 1 complete (Vite + Three.js working)
3. Next: Phase 2 - Create the game board/grid

## Troubleshooting

**Problem:** `npm command not found`
**Solution:** Install Node.js from https://nodejs.org

**Problem:** Port already in use
**Solution:** Vite will automatically try another port

**Problem:** Blank screen
**Solution:** Check browser console (F12) for red error messages
