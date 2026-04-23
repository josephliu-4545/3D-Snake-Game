// ==========================================
// GAME MODULE
// Manages game state, collision detection, and game over
// ==========================================

import { GRID_SIZE, GAME_RULES } from './constants.js';

/**
 * Game Class
 * Tracks game state and handles collision detection
 */
export class Game {
    constructor(onGameOver) {
        this.isRunning = false;
        this.isGameOver = false;
        this.onGameOver = onGameOver;  // Callback when game ends
        
        console.log('Game initialized');
    }
    
    /**
     * Start the game
     */
    start() {
        this.isRunning = true;
        this.isGameOver = false;
        console.log('Game started!');
    }
    
    /**
     * Stop the game (pause or game over)
     */
    stop() {
        this.isRunning = false;
        console.log('Game stopped');
    }
    
    /**
     * Check if the game is currently running
     */
    isActive() {
        return this.isRunning && !this.isGameOver;
    }
    
    /**
     * Check if it's game over
     */
    isOver() {
        return this.isGameOver;
    }
    
    /**
     * Check for wall collision
     * Returns true if snake hit a wall
     * 
     * @param {Object} headPos - {x, z} snake head position
     */
    checkWallCollision(headPos) {
        if (!GAME_RULES.WALL_COLLISION) {
            return false; // Wall collision disabled in rules
        }
        
        // Check if head is outside grid bounds
        const hitWall = headPos.x < 0 || 
                       headPos.x >= GRID_SIZE || 
                       headPos.z < 0 || 
                       headPos.z >= GRID_SIZE;
        
        if (hitWall) {
            console.log('Wall collision! Head at:', headPos);
        }
        
        return hitWall;
    }
    
    /**
     * Check for self collision
     * Returns true if snake hit its own body
     * 
     * @param {Object} headPos - {x, y, face} snake head position
     * @param {Array} body - Array of body segments (excluding head)
     */
    checkSelfCollision(headPos, body) {
        if (!GAME_RULES.SELF_COLLISION) {
            return false; // Self collision disabled in rules
        }
        
        // Check if head position matches any body segment
        // Must be on same face and same x,y coordinates
        // Start from index 1 because index 0 is the head itself
        for (let i = 1; i < body.length; i++) {
            if (headPos.x === body[i].x && 
                headPos.y === body[i].y && 
                headPos.face === body[i].face) {
                console.log('Self collision! Head hit body segment at:', body[i]);
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Check all collisions after snake moves
     * Returns true if game should end
     * 
     * @param {Object} snake - Snake instance to check
     */
    checkCollisions(snake) {
        if (this.isGameOver) {
            return true; // Already game over
        }
        
        const headPos = snake.getHeadPosition();
        const body = snake.getBodyPositions();
        
        // Check wall collision (disabled in cube mode)
        if (this.checkWallCollision(headPos)) {
            this.triggerGameOver('hit the wall');
            return true;
        }
        
        // Check self collision (includes face check)
        if (this.checkSelfCollision(headPos, body)) {
            this.triggerGameOver('hit itself');
            return true;
        }
        
        return false;
    }
    
    /**
     * Trigger game over
     * 
     * @param {string} reason - Why the game ended
     */
    triggerGameOver(reason) {
        this.isGameOver = true;
        this.isRunning = false;
        
        console.log(`GAME OVER! Snake ${reason}`);
        
        // Call the callback if provided
        if (this.onGameOver) {
            this.onGameOver(reason);
        }
    }
    
    /**
     * Reset game state for restart
     */
    reset() {
        this.isRunning = false;
        this.isGameOver = false;
        console.log('Game reset, ready to start');
    }
}

/**
 * Factory function to create game instance
 * Usage: const game = createGame((reason) => console.log('Game over:', reason));
 */
export function createGame(onGameOver) {
    return new Game(onGameOver);
}
