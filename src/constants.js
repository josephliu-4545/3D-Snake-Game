// ==========================================
// PHASE 0: GAME DESIGN DECISIONS
// These values control how the game plays and looks
// Change these to tweak the game feel
// ==========================================

// --- GRID SETTINGS ---
// Size of the playing field (grid is GRID_SIZE x GRID_SIZE)
// 15x15 is a good balance: not too small, not overwhelming
export const GRID_SIZE = 15;

// Size of each grid cell in 3D units
// 1 unit = 1 cube. This makes math simple.
export const CELL_SIZE = 1;

// --- SNAKE SETTINGS ---
// How many body segments the snake starts with
// 3 is classic: head + 2 body segments
export const INITIAL_SNAKE_LENGTH = 3;

// Starting position (center of the grid)
// Math.floor(GRID_SIZE / 2) puts the snake in the middle
export const SNAKE_START_X = Math.floor(GRID_SIZE / 2);
export const SNAKE_START_Z = Math.floor(GRID_SIZE / 2);

// Initial direction the snake moves
// 'z' axis means moving forward/back in 3D space
export const SNAKE_START_DIRECTION = { x: 0, z: -1 }; // Moving "up" (negative Z)

// --- GAME SPEED ---
// Milliseconds between each snake movement
// 200ms = 5 moves per second (moderate speed)
// Lower = faster, Higher = slower
export const MOVE_INTERVAL = 200;

// --- COLORS ---
// Using hex colors (same format as CSS: #RRGGBB)
export const COLORS = {
    // Snake colors - BRIGHTER for visibility
    SNAKE_HEAD: 0x00ff44,    // Bright neon green (the head) - highly visible
    SNAKE_BODY: 0x00cc33,    // Bright green (body segments)
    
    // Food color
    FOOD: 0xff3333,          // Bright red (contrasts with green snake)
    
    // Board colors
    BOARD: 0x2a2a3e,         // Slightly lighter dark gray for contrast
    BOARD_GRID: 0x444455,    // More visible grid lines
    
    // Background
    BACKGROUND: 0x1a1a2e,     // Slightly lighter background
};

// --- CAMERA SETTINGS ---
// Camera position for isometric-like view
// Higher numbers = further away, lower = closer
export const CAMERA_POSITION = {
    x: 20,   // To the side
    y: 25,   // Height above board
    z: 20    // Back from board
};

// Point the camera looks at (center of the grid)
export const CAMERA_TARGET = {
    x: (GRID_SIZE * CELL_SIZE) / 2 - CELL_SIZE / 2,
    y: 0,
    z: (GRID_SIZE * CELL_SIZE) / 2 - CELL_SIZE / 2
};

// --- CONTROLS ---
// Supported input methods
export const CONTROLS = {
    ARROW_KEYS: true,
    WASD: true
};

// --- GAME RULES ---
// What ends the game?
export const GAME_RULES = {
    WALL_COLLISION: false,   // No walls - snake moves on cube surface
    SELF_COLLISION: true,    // Hit yourself = game over
    WRAP_AROUND: true       // Snake wraps around cube faces
};

// --- UI TEXT ---
export const TEXT = {
    TITLE: '3D Snake',
    SCORE_LABEL: 'Score: ',
    GAME_OVER: 'Game Over!',
    RESTART: 'Press R to Restart',
    PAUSE: 'Paused - Press Space'
};
