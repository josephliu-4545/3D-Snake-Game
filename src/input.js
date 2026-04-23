// ==========================================
// INPUT MODULE
// Handles keyboard controls for the snake
// ==========================================

import { CONTROLS } from './constants.js';

// Direction constants (x, z) on the grid
export const DIRECTIONS = {
    UP:    { x: 0, z: -1 },  // Negative Z is "up" in our camera view
    DOWN:  { x: 0, z: 1 },  // Positive Z is "down"
    LEFT:  { x: -1, z: 0 }, // Negative X is left
    RIGHT: { x: 1, z: 0 }   // Positive X is right
};

/**
 * InputHandler Class
 * Listens for keyboard events and tracks current direction
 */
export class InputHandler {
    constructor(onDirectionChange) {
        // Callback function to call when direction changes
        this.onDirectionChange = onDirectionChange;
        
        // Track current input state
        this.currentDirection = null;
        
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
        console.log('Input handler started');
    }
    
    /**
     * Stop listening for keyboard events
     */
    stopListening() {
        window.removeEventListener('keydown', this.handleKeyDown);
    }
    
    /**
     * Handle keyboard input
     */
    handleKeyDown(event) {
        let newDirection = null;
        
        // Arrow keys (always enabled)
        if (CONTROLS.ARROW_KEYS) {
            switch (event.key) {
                case 'ArrowUp':
                    newDirection = DIRECTIONS.UP;
                    event.preventDefault(); // Prevent scrolling
                    break;
                case 'ArrowDown':
                    newDirection = DIRECTIONS.DOWN;
                    event.preventDefault();
                    break;
                case 'ArrowLeft':
                    newDirection = DIRECTIONS.LEFT;
                    event.preventDefault();
                    break;
                case 'ArrowRight':
                    newDirection = DIRECTIONS.RIGHT;
                    event.preventDefault();
                    break;
            }
        }
        
        // WASD keys (optional)
        if (CONTROLS.WASD && !newDirection) {
            switch (event.key.toLowerCase()) {
                case 'w':
                    newDirection = DIRECTIONS.UP;
                    break;
                case 's':
                    newDirection = DIRECTIONS.DOWN;
                    break;
                case 'a':
                    newDirection = DIRECTIONS.LEFT;
                    break;
                case 'd':
                    newDirection = DIRECTIONS.RIGHT;
                    break;
            }
        }
        
        // If we got a valid direction, notify the game
        if (newDirection) {
            this.currentDirection = newDirection;
            this.onDirectionChange(newDirection);
        }
    }
    
    /**
     * Get the current direction input
     */
    getCurrentDirection() {
        return this.currentDirection;
    }
}

/**
 * Factory function to create input handler
 * Usage: const input = createInputHandler((dir) => snake.setDirection(dir));
 */
export function createInputHandler(onDirectionChange) {
    return new InputHandler(onDirectionChange);
}
