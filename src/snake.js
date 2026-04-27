// ==========================================
// SNAKE MODULE
// Creates and manages the snake
// ==========================================

import * as THREE from 'three';
import { 
    INITIAL_SNAKE_LENGTH, 
    SNAKE_START_X, 
    SNAKE_START_Z, 
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
        
        // Current movement direction (face-relative: 0=UP, 1=RIGHT, 2=DOWN, 3=LEFT)
        this.faceDirection = 0; // Start moving UP
        
        // Input direction buffer (for next move)
        this.nextDirection = 0;
        
        // 3D objects (meshes) for each segment
        this.segments = [];
        
        // Group to hold all snake meshes
        this.meshGroup = new THREE.Group();
        
        this.currentFace = CUBE_FACES.FRONT;
        
        // Initialize the snake
        this.init();
    }
    
    /**
     * Initialize snake body at starting position
     */
    init() {
        const delta = this.getDirectionDelta(this.faceDirection);
        
        // Create initial body segments on FRONT face
        for (let i = 0; i < INITIAL_SNAKE_LENGTH; i++) {
            const segment = {
                x: SNAKE_START_X - (delta.dx * i),
                y: SNAKE_START_Z - (delta.dy * i),
                face: CUBE_FACES.FRONT
            };
            this.body.push(segment);
        }
        
        // Create 3D meshes for each segment
        this.createMeshes();
    }
    
    /**
     * Get the snake's mesh group (for adding to scene)
     */
    getMesh() {
        return this.meshGroup;
    }
    
    /**
     * Get head position
     */
    getHeadPosition() {
        return { ...this.body[0] };
    }
    
    /**
     * Get all body positions
     */
    getBodyPositions() {
        return this.body.map(segment => ({ ...segment }));
    }
    
    /**
     * Get current face snake head is on
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
     * Create 3D cube meshes for each body segment
     */
    createMeshes() {
        this.body.forEach((segment, index) => {
            const isHead = index === 0;
            const color = isHead ? COLORS.SNAKE_HEAD : COLORS.SNAKE_BODY;
            
            // Head is slightly larger for visual distinction
            const segmentSize = isHead ? CELL_SIZE * 0.95 : CELL_SIZE * 0.8;
            const geometry = new THREE.BoxGeometry(segmentSize, segmentSize, segmentSize);
            
            const material = new THREE.MeshStandardMaterial({
                color: color,
                roughness: 0.3,
                metalness: 0.2,
                emissive: color,
                emissiveIntensity: isHead ? 0.6 : 0.3
            });
            
            const mesh = new THREE.Mesh(geometry, material);
            
            // worldPos now includes protrusion baked in from gridToWorld
            const worldPos = gridToWorld(segment.x, segment.y, segment.face);
            mesh.position.set(worldPos.x, worldPos.y, worldPos.z);
            
            // Align to face (rotation only)
            this.alignSegmentToFace(mesh, segment.face);
            
            this.segments.push(mesh);
            this.meshGroup.add(mesh);
        });
    }
    
    /**
     * Change the snake's direction
     */
    setDirection(newDirection) {
        const isOpposite = (Math.abs(newDirection - this.faceDirection) === 2);
        if (!isOpposite) {
            this.nextDirection = newDirection;
        }
    }
    
    /**
     * Move the snake one step
     */
    move() {
        this.faceDirection = this.nextDirection;
        const delta = this.getDirectionDelta(this.faceDirection);
        
        let nextX = this.body[0].x + delta.dx;
        let nextY = this.body[0].y + delta.dy;
        const currentFace = this.body[0].face;
        
        // Wrap coordinates FIRST
        const wrapped = this.wrapToNewFace({ x: nextX, y: nextY, face: currentFace }, this.faceDirection);
        const newHead = wrapped.position;
        const newDirection = wrapped.newDirection;
        
        // Step 1: Track explicitly immediately after wrapping
        this.currentFace = newHead.face;

        if (newDirection !== undefined) {
            this.faceDirection = newDirection;
            this.nextDirection = newDirection;
        }
        
        this.body.unshift(newHead);
        this.body.pop();
        
        this.updateMeshes();
        
        return { x: newHead.x, y: newHead.y, face: newHead.face };
    }
    
    /**
     * Get movement delta for a face direction
     */
    getDirectionDelta(dir) {
        const deltas = [
            { dx: 0, dy: -1 },  // UP
            { dx: 1, dy: 0 },   // RIGHT
            { dx: 0, dy: 1 },   // DOWN
            { dx: -1, dy: 0 }   // LEFT
        ];
        return deltas[dir];
    }
    
    /**
     * Handle face wrapping logic
     */
    wrapToNewFace(position, direction) {
        const G = 15;
        let { x, y, face } = position;
        if (x >= 0 && x < G && y >= 0 && y < G) {
            return { position: { x, y, face }, newDirection: undefined };
        }
        switch(face) {
            case CUBE_FACES.FRONT:
                if (x < 0)    return { position: { x: 0,   y, face: CUBE_FACES.LEFT  }, newDirection: 3 };
                if (x >= G)   return { position: { x: G-1, y, face: CUBE_FACES.RIGHT }, newDirection: 1 };
                if (y < 0)    return { position: { x,   y: G-1, face: CUBE_FACES.TOP    }, newDirection: 0 };
                if (y >= G)   return { position: { x,   y: 0,   face: CUBE_FACES.BOTTOM }, newDirection: 2 };
                break;
            case CUBE_FACES.LEFT:
                if (x < 0)    return { position: { x: 0,   y, face: CUBE_FACES.BACK  }, newDirection: 3 };
                if (x >= G)   return { position: { x: G-1, y, face: CUBE_FACES.FRONT }, newDirection: 1 };
                if (y < 0)    return { position: { x,   y: G-1, face: CUBE_FACES.TOP    }, newDirection: 0 };
                if (y >= G)   return { position: { x,   y: 0,   face: CUBE_FACES.BOTTOM }, newDirection: 2 };
                break;
            case CUBE_FACES.BACK:
                if (x < 0)    return { position: { x: G-1, y, face: CUBE_FACES.RIGHT }, newDirection: 3 };
                if (x >= G)   return { position: { x: 0,   y, face: CUBE_FACES.LEFT  }, newDirection: 1 };
                if (y < 0)    return { position: { x,   y: G-1, face: CUBE_FACES.TOP    }, newDirection: 0 };
                if (y >= G)   return { position: { x,   y: 0,   face: CUBE_FACES.BOTTOM }, newDirection: 2 };
                break;
            case CUBE_FACES.RIGHT:
                if (x < 0)    return { position: { x: 0,   y, face: CUBE_FACES.FRONT }, newDirection: 3 };
                if (x >= G)   return { position: { x: G-1, y, face: CUBE_FACES.BACK  }, newDirection: 1 };
                if (y < 0)    return { position: { x,   y: G-1, face: CUBE_FACES.TOP    }, newDirection: 0 };
                if (y >= G)   return { position: { x,   y: 0,   face: CUBE_FACES.BOTTOM }, newDirection: 2 };
                break;
            case CUBE_FACES.TOP:
                if (x < 0)    return { position: { x: G-1, y, face: CUBE_FACES.LEFT  }, newDirection: 3 };
                if (x >= G)   return { position: { x: 0,   y, face: CUBE_FACES.RIGHT }, newDirection: 1 };
                if (y < 0)    return { position: { x,   y: G-1, face: CUBE_FACES.FRONT }, newDirection: 0 };
                if (y >= G)   return { position: { x,   y: 0,   face: CUBE_FACES.BACK  }, newDirection: 2 };
                break;
            case CUBE_FACES.BOTTOM:
                if (x < 0)    return { position: { x: G-1, y, face: CUBE_FACES.LEFT  }, newDirection: 3 };
                if (x >= G)   return { position: { x: 0,   y, face: CUBE_FACES.RIGHT }, newDirection: 1 };
                if (y < 0)    return { position: { x,   y: G-1, face: CUBE_FACES.BACK  }, newDirection: 0 };
                if (y >= G)   return { position: { x,   y: 0,   face: CUBE_FACES.FRONT }, newDirection: 2 };
                break;
        }
        return { position: { x: Math.max(0,Math.min(G-1,x)), y: Math.max(0,Math.min(G-1,y)), face }, newDirection: undefined };
    }
    
    /**
     * Update 3D mesh positions
     */
    updateMeshes() {
        this.body.forEach((segment, index) => {
            const worldPos = gridToWorld(segment.x, segment.y, segment.face);
            this.segments[index].position.set(worldPos.x, worldPos.y, worldPos.z);
            this.alignSegmentToFace(this.segments[index], segment.face);
        });
    }
    
    /**
     * Align a mesh to face orientation (Rotation only)
     */
    alignSegmentToFace(mesh, face) {
        mesh.rotation.set(0, 0, 0);
        
        switch (face) {
            case CUBE_FACES.FRONT:
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
     * Grow the snake
     */
    grow() {
        const tail = this.body[this.body.length - 1];
        const newSegment = { ...tail };
        this.body.push(newSegment);
        
        const segmentSize = CELL_SIZE * 0.8; // Use body size
        const geometry = new THREE.BoxGeometry(segmentSize, segmentSize, segmentSize);
        const material = new THREE.MeshStandardMaterial({
            color: COLORS.SNAKE_BODY,
            roughness: 0.3,
            metalness: 0.2,
            emissive: COLORS.SNAKE_BODY,
            emissiveIntensity: 0.3
        });
        const mesh = new THREE.Mesh(geometry, material);
        
        const worldPos = gridToWorld(newSegment.x, newSegment.y, newSegment.face);
        mesh.position.set(worldPos.x, worldPos.y, worldPos.z);
        this.alignSegmentToFace(mesh, newSegment.face);
        
        this.segments.push(mesh);
        this.meshGroup.add(mesh);
    }
}

export function createSnake() {
    return new Snake();
}
