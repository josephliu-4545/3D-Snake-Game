// ==========================================
// INPUT MODULE
// Handles keyboard controls for the snake
// ==========================================

import { CUBE_FACES } from './grid.js';

// Face-relative direction constants (0-3)
// These work the same on EVERY face of the cube
// UP = toward top edge, RIGHT = toward right edge, etc.
export const DIRECTIONS = {
    UP:    0,  // Toward TOP edge of current face
    RIGHT: 1,  // Toward RIGHT edge of current face
    DOWN:  2,  // Toward BOTTOM edge of current face
    LEFT:  3   // Toward LEFT edge of current face
};

// Screen direction constants
const SCREEN = {
    UP:    0,
    RIGHT: 1,
    DOWN:  2,
    LEFT:  3
};

/**
 * Maps screen directions to face directions based on which cube face is showing.
 * This ensures screen-relative controls: UP always goes toward top of screen.
 * 
 * Face directions: 0=UP(toward TOP edge), 1=RIGHT, 2=DOWN, 3=LEFT
 * Screen directions: 0=UP(screen up), 1=RIGHT, 2=DOWN, 3=LEFT
 */
const SCREEN_TO_FACE_MAP = {
    [CUBE_FACES.FRONT]:  { 0: 0, 1: 1, 2: 2, 3: 3 },  // identity
    [CUBE_FACES.BACK]:   { 0: 0, 1: 3, 2: 2, 3: 1 },  // L/R flipped
    [CUBE_FACES.LEFT]:   { 0: 0, 1: 3, 2: 2, 3: 1 },  // L/R flipped (axis mirrors on rotation)
    [CUBE_FACES.RIGHT]:  { 0: 0, 1: 3, 2: 2, 3: 1 },  // L/R flipped
    [CUBE_FACES.TOP]:    { 0: 2, 1: 1, 2: 0, 3: 3 },  // U/D flipped
    [CUBE_FACES.BOTTOM]: { 0: 0, 1: 1, 2: 2, 3: 3 },  // identity
};

/**
 * InputHandler Class
 * Listens for keyboard events and tracks current direction
 * Maps screen directions to face directions for consistent controls
 */
export class InputHandler {
    constructor(onDirectionChange, getCurrentFaceFn) {
        // Callback function to call when direction changes
        this.onDirectionChange = onDirectionChange;
        
        // Function to get current cube face
        this.getCurrentFace = getCurrentFaceFn;
        
        // Track current screen direction
        this.currentScreenDirection = null;
        
        // Bind event listener (so 'this' works correctly)
        this.handleKeyDown = this.handleKeyDown.bind(this);
        
        // Start listening
        this.startListening();
    }
    
    /**
     * Start listening for keyboard events
     */
    startListening() {
        window.addEventListener('keydown', this.handleKeyDown);
        console.log('Input handler started (screen-relative)');
    }
    
    /**
     * Stop listening for keyboard events
     */
    stopListening() {
        window.removeEventListener('keydown', this.handleKeyDown);
    }
    
    /**
     * Convert screen direction to face direction based on current cube face
     */
    screenToFaceDirection(screenDir) {
        const currentFace = this.getCurrentFace ? this.getCurrentFace() : CUBE_FACES.FRONT;
        const mapping = SCREEN_TO_FACE_MAP[currentFace] || SCREEN_TO_FACE_MAP[CUBE_FACES.FRONT];
        return mapping[screenDir];
    }
    
    /**
     * Handle keyboard input - SCREEN RELATIVE
     * UP always moves toward top of screen, regardless of which face is showing
     */
    handleKeyDown(event) {
        const key = event.key.toLowerCase();
        
        let screenDir = null;
        
        // Map keys to SCREEN directions (visual directions)
        if (key === 'arrowup' || key === 'w') {
            event.preventDefault();
            screenDir = SCREEN.UP;
        } else if (key === 'arrowdown' || key === 's') {
            event.preventDefault();
            screenDir = SCREEN.DOWN;
        } else if (key === 'arrowleft' || key === 'a') {
            event.preventDefault();
            screenDir = SCREEN.LEFT;
        } else if (key === 'arrowright' || key === 'd') {
            event.preventDefault();
            screenDir = SCREEN.RIGHT;
        }
        
        if (screenDir !== null) {
            this.currentScreenDirection = screenDir;
            // Convert screen direction to face-relative direction
            const faceDir = this.screenToFaceDirection(screenDir);
            this.onDirectionChange(faceDir);
        }
    }
    
    /**
     * Get the current direction input
     */
    getCurrentDirection() {
        return this.currentScreenDirection;
    }
}

/**
 * Factory function to create input handler
 * Usage: const input = createInputHandler((dir) => snake.setDirection(dir), () => snake.getCurrentFace());
 */
export function createInputHandler(onDirectionChange, getCurrentFaceFn) {
    return new InputHandler(onDirectionChange, getCurrentFaceFn);
}
