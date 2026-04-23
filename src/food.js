// ==========================================
// FOOD MODULE
// Creates and manages food spawning
// ==========================================

import * as THREE from 'three';
import { GRID_SIZE, CELL_SIZE, COLORS } from './constants.js';
import { gridToWorld, isValidGridPosition, CUBE_FACES } from './grid.js';

/**
 * Food Class
 * Manages the food position and rendering
 */
export class Food {
    constructor() {
        this.position = { x: 0, y: 0, face: CUBE_FACES.FRONT };
        this.mesh = null;
        this.meshGroup = new THREE.Group();
        
        // Create the food mesh (but don't position yet)
        this.createMesh();
    }
    
    /**
     * Create the 3D food mesh
     */
    createMesh() {
        // Food is a smaller cube than the snake
        const geometry = new THREE.BoxGeometry(CELL_SIZE * 0.6, CELL_SIZE * 0.6, CELL_SIZE * 0.6);
        
        // Bright red color to contrast with green snake
        const material = new THREE.MeshStandardMaterial({
            color: COLORS.FOOD,
            roughness: 0.2,
            metalness: 0.3,
            emissive: COLORS.FOOD,
            emissiveIntensity: 0.2  // Slight glow effect
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.meshGroup.add(this.mesh);
    }
    
    /**
     * Get the food's mesh group
     */
    getMesh() {
        return this.meshGroup;
    }
    
    /**
     * Get current food position
     */
    getPosition() {
        return { ...this.position };
    }
    
    /**
     * Spawn food at a random position
     * Avoids spawning on the snake's body
     * 
     * @param {Array} snakeBody - Array of {x, y, face} positions to avoid
     */
    spawn(snakeBody) {
        let validPosition = false;
        let attempts = 0;
        const maxAttempts = 100;
        
        while (!validPosition && attempts < maxAttempts) {
            // Generate random grid position on front face (for now)
            const newPos = {
                x: Math.floor(Math.random() * GRID_SIZE),
                y: Math.floor(Math.random() * GRID_SIZE),
                face: CUBE_FACES.FRONT
            };
            
            // Check if position is on snake body
            const onSnake = snakeBody.some(segment => 
                segment.x === newPos.x && segment.y === newPos.y && segment.face === newPos.face
            );
            
            if (!onSnake) {
                this.position = newPos;
                validPosition = true;
                
                // Update mesh position with face
                const worldPos = gridToWorld(newPos.x, newPos.y, newPos.face);
                this.mesh.position.set(worldPos.x, worldPos.y, worldPos.z);
            }
            
            attempts++;
        }
        
        if (!validPosition) {
            console.warn('Could not find valid food spawn position');
        }
        
        console.log('Food spawned at:', this.position);
    }
    
    /**
     * Check if snake head collides with food
     * 
     * @param {Object} headPos - Snake head position {x, y, face}
     * @returns {boolean} true if collision detected
     */
    checkCollision(headPos) {
        return headPos.x === this.position.x && 
               headPos.y === this.position.y && 
               headPos.face === this.position.face;
    }
    
    /**
     * Get current food position
     */
    getPosition() {
        return { ...this.position };
    }
}

/**
 * Factory function to create food
 * Usage: const food = createFood();
 */
export function createFood() {
    return new Food();
}
