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
        // Geometry: larger for visibility (80% of cell size)
        const geometry = new THREE.BoxGeometry(CELL_SIZE * 0.8, CELL_SIZE * 0.8, CELL_SIZE * 0.8);
        
        // Material: bright glowing red
        const material = new THREE.MeshStandardMaterial({
            color: COLORS.FOOD,
            emissive: COLORS.FOOD,
            emissiveIntensity: 0.8,
            roughness: 0.2,
            metalness: 0.3
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.meshGroup.add(this.mesh);
    }
    
    /**
     * Get the mesh group (for scene management)
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
     * Spawn food at a random position on any face
     * Avoids spawning on the snake's body
     * 
     * @param {Array} snakeBody - Array of {x, y, face} positions to avoid
     */
    spawn(snakeBody) {
        let validPosition = false;
        let attempts = 0;
        const maxAttempts = 100;
        
        // Array of all face values
        const faces = [
            CUBE_FACES.FRONT, CUBE_FACES.BACK,
            CUBE_FACES.LEFT, CUBE_FACES.RIGHT,
            CUBE_FACES.TOP, CUBE_FACES.BOTTOM
        ];
        
        while (!validPosition && attempts < maxAttempts) {
            // Generate random grid position on any face
            const newPos = {
                x: Math.floor(Math.random() * GRID_SIZE),
                y: Math.floor(Math.random() * GRID_SIZE),
                face: faces[Math.floor(Math.random() * faces.length)]
            };
            
            // Check if position is on snake body
            const onSnake = snakeBody.some(segment => 
                segment.x === newPos.x && segment.y === newPos.y && segment.face === newPos.face
            );
            
            if (!onSnake) {
                this.position = newPos;
                validPosition = true;
                
                // Update mesh position with face (gridToWorld now handles protrusion)
                const worldPos = gridToWorld(newPos.x, newPos.y, newPos.face);
                this.mesh.position.set(worldPos.x, worldPos.y, worldPos.z);
                
                // Align food to face orientation
                this.alignToFace(newPos.face);
            }
            
            attempts++;
        }
        
        if (!validPosition) {
            console.warn('Could not find valid food spawn position');
        }
        
        console.log('Food spawned at:', this.position);
    }
    
    /**
     * Align food to face orientation (Rotation only)
     * 
     * @param {number} face - Face value to align to
     */
    alignToFace(face) {
        this.mesh.rotation.set(0, 0, 0);
        
        switch (face) {
            case CUBE_FACES.FRONT:
                break;
            case CUBE_FACES.BACK:
                this.mesh.rotation.y = Math.PI;
                break;
            case CUBE_FACES.LEFT:
                this.mesh.rotation.y = -Math.PI / 2;
                break;
            case CUBE_FACES.RIGHT:
                this.mesh.rotation.y = Math.PI / 2;
                break;
            case CUBE_FACES.TOP:
                this.mesh.rotation.x = -Math.PI / 2;
                break;
            case CUBE_FACES.BOTTOM:
                this.mesh.rotation.x = Math.PI / 2;
                break;
        }
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
