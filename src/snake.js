// ==========================================
// SNAKE MODULE
// Creates and manages the snake
// ==========================================

import * as THREE from 'three';
import { 
    INITIAL_SNAKE_LENGTH, 
    SNAKE_START_X, 
    SNAKE_START_Z, 
    SNAKE_START_DIRECTION,
    CELL_SIZE,
    COLORS 
} from './constants.js';
import { gridToWorld, CUBE_FACES } from './grid.js';

/**
 * Snake Class
 * Manages the snake's body, position, and rendering
 */
export class Snake {
    constructor() {
        // Array storing grid positions of each body segment
        // Each element is {x, y, face} on the cube surface
        this.body = [];
        
        // Current movement direction
        this.direction = { ...SNAKE_START_DIRECTION };
        
        // Current face the snake is on
        this.currentFace = CUBE_FACES.FRONT;
        
        // 3D objects (meshes) for each segment
        this.segments = [];
        
        // Group to hold all snake meshes
        this.meshGroup = new THREE.Group();
        
        // Initialize the snake
        this.init();
    }
    
    /**
     * Initialize snake body at starting position
     */
    init() {
        // Create initial body segments on FRONT face
        // Snake starts at center and extends "backwards" opposite to direction
        for (let i = 0; i < INITIAL_SNAKE_LENGTH; i++) {
            const segment = {
                x: SNAKE_START_X - (this.direction.x * i),
                y: SNAKE_START_Z - (this.direction.z * i),
                face: CUBE_FACES.FRONT
            };
            this.body.push(segment);
        }
        
        this.currentFace = CUBE_FACES.FRONT;
        
        // Create 3D meshes for each segment
        this.createMeshes();
        
        console.log('Snake initialized:', this.body);
    }
    
    /**
     * Create 3D cube meshes for each body segment
     */
    createMeshes() {
        // Geometry shared by all segments (a cube)
        const geometry = new THREE.BoxGeometry(CELL_SIZE, CELL_SIZE, CELL_SIZE);
        
        // Create each segment mesh
        this.body.forEach((segment, index) => {
            // Head gets different color than body
            const isHead = index === 0;
            const color = isHead ? COLORS.SNAKE_HEAD : COLORS.SNAKE_BODY;
            
            // Material for this segment
            const material = new THREE.MeshStandardMaterial({
                color: color,
                roughness: 0.3,
                metalness: 0.1
            });
            
            // Create the mesh
            const mesh = new THREE.Mesh(geometry, material);
            
            // Position on the grid with face
            const worldPos = gridToWorld(segment.x, segment.y, segment.face);
            mesh.position.set(worldPos.x, worldPos.y, worldPos.z);
            
            // Align to face
            this.alignSegmentToFace(mesh, segment.face);
            
            // Store reference to mesh
            this.segments.push(mesh);
            
            // Add to the group
            this.meshGroup.add(mesh);
        });
    }
    
    /**
     * Get the snake's mesh group (for adding to scene)
     */
    getMesh() {
        return this.meshGroup;
    }
    
    /**
     * Get head position (for collision detection, etc.)
     */
    getHeadPosition() {
        return { ...this.body[0], face: this.currentFace };
    }
    
    /**
     * Get all body positions (for collision with self)
     */
    getBodyPositions() {
        return this.body.map(segment => ({ ...segment }));
    }
    
    /**
     * Get current face snake is on
     */
    getCurrentFace() {
        return this.currentFace;
    }
    
    /**
     * Get the length of the snake
     */
    getLength() {
        return this.body.length;
    }
    
    /**
     * Change the snake's direction
     * Prevents 180-degree turns (can't go directly backwards)
     * 
     * @param {Object} newDirection - {x, z} where x/z are -1, 0, or 1
     */
    setDirection(newDirection) {
        // Check if the new direction is opposite to current
        const isOpposite = 
            (newDirection.x === -this.direction.x && newDirection.x !== 0) ||
            (newDirection.z === -this.direction.z && newDirection.z !== 0);
        
        // Only change if not trying to reverse
        if (!isOpposite) {
            this.direction = { ...newDirection };
        }
    }
    
    /**
     * Move the snake one step in the current direction
     * Handles face wrapping when snake goes off cube edge
     * Returns the new head position
     */
    move() {
        // Calculate new head position on current face
        let newHead = {
            x: this.body[0].x + this.direction.x,
            y: this.body[0].y + this.direction.z,  // z direction maps to y on face
            face: this.currentFace
        };
        
        // Check if we went off the edge and need to wrap to another face
        const wrapped = this.wrapToNewFace(newHead);
        newHead = wrapped.position;
        this.currentFace = newHead.face;
        
        // Add new head to front of body
        this.body.unshift(newHead);
        
        // Remove tail (last segment) - snake moves forward!
        this.body.pop();
        
        // Update 3D mesh positions
        this.updateMeshes();
        
        return { x: newHead.x, y: newHead.y, face: newHead.face };
    }
    
    /**
     * Handle face wrapping when snake goes off edge
     * Maps coordinates from one face to adjacent face
     * Complete logic for all 6 faces of the cube
     */
    wrapToNewFace(position) {
        const GRID_SIZE = 15;
        let { x, y, face } = position;
        
        // Check if still on current face
        if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
            return { position: { x, y, face } };
        }
        
        // Helper to clamp to valid range
        const clamp = (val) => Math.max(0, Math.min(GRID_SIZE - 1, val));
        
        // ==========================================
        // FRONT face (z+) - faces toward +Z
        // ==========================================
        if (face === CUBE_FACES.FRONT) {
            if (x < 0) { // Left edge -> LEFT face
                return { position: { x: GRID_SIZE - 1, y: y, face: CUBE_FACES.LEFT } };
            } else if (x >= GRID_SIZE) { // Right edge -> RIGHT face
                return { position: { x: 0, y: y, face: CUBE_FACES.RIGHT } };
            } else if (y < 0) { // Bottom edge -> BOTTOM face
                return { position: { x: x, y: GRID_SIZE - 1, face: CUBE_FACES.BOTTOM } };
            } else if (y >= GRID_SIZE) { // Top edge -> TOP face
                return { position: { x: x, y: 0, face: CUBE_FACES.TOP } };
            }
        }
        
        // ==========================================
        // BACK face (z-) - faces toward -Z
        // Note: x is reversed on back face
        // ==========================================
        if (face === CUBE_FACES.BACK) {
            if (x < 0) { // Left edge (toward -x) -> RIGHT face
                return { position: { x: 0, y: y, face: CUBE_FACES.RIGHT } };
            } else if (x >= GRID_SIZE) { // Right edge (toward +x) -> LEFT face
                return { position: { x: GRID_SIZE - 1, y: y, face: CUBE_FACES.LEFT } };
            } else if (y < 0) { // Bottom edge -> BOTTOM face
                return { position: { x: x, y: GRID_SIZE - 1, face: CUBE_FACES.BOTTOM } };
            } else if (y >= GRID_SIZE) { // Top edge -> TOP face
                return { position: { x: x, y: 0, face: CUBE_FACES.TOP } };
            }
        }
        
        // ==========================================
        // LEFT face (x-) - faces toward -X
        // Left face local x = world z, but reversed
        // ==========================================
        if (face === CUBE_FACES.LEFT) {
            if (x < 0) { // Left edge (toward -z in world) -> BACK face
                return { position: { x: y, y: 0, face: CUBE_FACES.BACK } };
            } else if (x >= GRID_SIZE) { // Right edge (toward +z) -> FRONT face
                return { position: { x: y, y: 0, face: CUBE_FACES.FRONT } };
            } else if (y < 0) { // Bottom edge -> BOTTOM face
                return { position: { x: GRID_SIZE - 1, y: x, face: CUBE_FACES.BOTTOM } };
            } else if (y >= GRID_SIZE) { // Top edge -> TOP face
                return { position: { x: 0, y: x, face: CUBE_FACES.TOP } };
            }
        }
        
        // ==========================================
        // RIGHT face (x+) - faces toward +X
        // Right face local x = world z
        // ==========================================
        if (face === CUBE_FACES.RIGHT) {
            if (x < 0) { // Left edge (toward -z) -> FRONT face
                return { position: { x: GRID_SIZE - 1 - y, y: 0, face: CUBE_FACES.FRONT } };
            } else if (x >= GRID_SIZE) { // Right edge (toward +z) -> BACK face
                return { position: { x: GRID_SIZE - 1 - y, y: 0, face: CUBE_FACES.BACK } };
            } else if (y < 0) { // Bottom edge -> BOTTOM face
                return { position: { x: 0, y: x, face: CUBE_FACES.BOTTOM } };
            } else if (y >= GRID_SIZE) { // Top edge -> TOP face
                return { position: { x: GRID_SIZE - 1, y: x, face: CUBE_FACES.TOP } };
            }
        }
        
        // ==========================================
        // TOP face (y+) - faces toward +Y
        // Top face: local x = world x, local y = -world z
        // ==========================================
        if (face === CUBE_FACES.TOP) {
            if (x < 0) { // Left edge -> LEFT face
                return { position: { x: 0, y: GRID_SIZE - 1, face: CUBE_FACES.LEFT } };
            } else if (x >= GRID_SIZE) { // Right edge -> RIGHT face
                return { position: { x: GRID_SIZE - 1, y: 0, face: CUBE_FACES.RIGHT } };
            } else if (y < 0) { // Bottom edge (toward +z) -> FRONT face
                return { position: { x: x, y: 0, face: CUBE_FACES.FRONT } };
            } else if (y >= GRID_SIZE) { // Top edge (toward -z) -> BACK face
                return { position: { x: x, y: GRID_SIZE - 1, face: CUBE_FACES.BACK } };
            }
        }
        
        // ==========================================
        // BOTTOM face (y-) - faces toward -Y
        // Bottom face: local x = world x, local y = world z
        // ==========================================
        if (face === CUBE_FACES.BOTTOM) {
            if (x < 0) { // Left edge -> LEFT face
                return { position: { x: 0, y: 0, face: CUBE_FACES.LEFT } };
            } else if (x >= GRID_SIZE) { // Right edge -> RIGHT face
                return { position: { x: GRID_SIZE - 1, y: GRID_SIZE - 1, face: CUBE_FACES.RIGHT } };
            } else if (y < 0) { // Bottom edge (toward -z) -> BACK face
                return { position: { x: x, y: GRID_SIZE - 1, face: CUBE_FACES.BACK } };
            } else if (y >= GRID_SIZE) { // Top edge (toward +z) -> FRONT face
                return { position: { x: x, y: 0, face: CUBE_FACES.FRONT } };
            }
        }
        
        // Fallback: clamp to valid range (shouldn't reach here if logic is complete)
        return { position: { x: clamp(x), y: clamp(y), face } };
    }
    
    /**
     * Update 3D mesh positions to match body array
     * Uses face-aware gridToWorld
     */
    updateMeshes() {
        this.body.forEach((segment, index) => {
            const worldPos = gridToWorld(segment.x, segment.y, segment.face);
            this.segments[index].position.set(worldPos.x, worldPos.y, worldPos.z);
            
            // Rotate segment to align with face normal
            this.alignSegmentToFace(this.segments[index], segment.face);
        });
    }
    
    /**
     * Align a segment mesh to face normal
     */
    alignSegmentToFace(mesh, face) {
        mesh.rotation.set(0, 0, 0);
        
        switch (face) {
            case CUBE_FACES.FRONT:
                // Default orientation
                break;
            case CUBE_FACES.BACK:
                mesh.rotation.y = Math.PI;
                break;
            case CUBE_FACES.LEFT:
                mesh.rotation.y = -Math.PI / 2;
                break;
            case CUBE_FACES.RIGHT:
                mesh.rotation.y = Math.PI / 2;
                break;
            case CUBE_FACES.TOP:
                mesh.rotation.x = -Math.PI / 2;
                break;
            case CUBE_FACES.BOTTOM:
                mesh.rotation.x = Math.PI / 2;
                break;
        }
    }
    
    /**
     * Grow the snake by adding a new segment at the tail
     * Called when the snake eats food
        
        // Rotate segment to align with face normal
        this.alignSegmentToFace(this.segments[index], segment.face);
    });
}

/**
 * Align a segment mesh to face normal
 */
alignSegmentToFace(mesh, face) {
    mesh.rotation.set(0, 0, 0);
    
    switch (face) {
        case CUBE_FACES.FRONT:
            // Default orientation
            break;
        case CUBE_FACES.BACK:
            mesh.rotation.y = Math.PI;
            break;
        case CUBE_FACES.LEFT:
            mesh.rotation.y = -Math.PI / 2;
            break;
        case CUBE_FACES.RIGHT:
            mesh.rotation.y = Math.PI / 2;
            break;
        case CUBE_FACES.TOP:
            mesh.rotation.x = -Math.PI / 2;
            break;
        case CUBE_FACES.BOTTOM:
            mesh.rotation.x = Math.PI / 2;
            break;
    }
}

/**
 * Grow the snake by adding a new segment at the tail
 * Called when the snake eats food
 */
grow() {
    // Get the current tail position
    const tail = this.body[this.body.length - 1];
    
    // Create a new segment at the tail position
    // It will follow the tail when the snake moves
    const newSegment = { ...tail };
    this.body.push(newSegment);
    
    // Create 3D mesh for the new segment
    const geometry = new THREE.BoxGeometry(CELL_SIZE, CELL_SIZE, CELL_SIZE);
    const material = new THREE.MeshStandardMaterial({
        color: COLORS.SNAKE_BODY,
        roughness: 0.3,
        metalness: 0.1
    });
    const mesh = new THREE.Mesh(geometry, material);
    
    // Position the mesh with face
    const worldPos = gridToWorld(newSegment.x, newSegment.y, newSegment.face);
    mesh.position.set(worldPos.x, worldPos.y, worldPos.z);
    
    // Align to face
    this.alignSegmentToFace(mesh, newSegment.face);
    
    // Add to arrays and group
    this.segments.push(mesh);
    this.meshGroup.add(mesh);
    
    console.log('Snake grew! New length:', this.body.length);
}

}

/**
 * Factory function to create a new snake
 * Usage: const snake = createSnake();
 */
export function createSnake() {
    return new Snake();
}
