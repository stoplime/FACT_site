import * as THREE from 'three';

// Helper for materials
const lineMaterial = (color) => new THREE.LineBasicMaterial({ color: color });

// --- Elemental Shapes ---

/** 1: A simple line */
export function createLine({ start, end, color = 0x000000 }) {
    const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
    return new THREE.Line(geometry, lineMaterial(color));
}

/** 2: A disk (radial lines) */
export function createDisk({ radius = 1, lineCount = 12, color = 0x000000 }) {
    const group = new THREE.Group();
    const center = new THREE.Vector3(0, 0, 0);
    for (let i = 0; i < lineCount; i++) {
        const angle = (i / lineCount) * Math.PI * 2;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        const edge = new THREE.Vector3(x, y, 0);
        group.add(createLine({ start: center, end: edge, color }));
    }
    return group;
}

/** 3: A plane (grid of lines) */
export function createPlane({ size = 2, divisions = 10, color = 0x000000 }) {
    const group = new THREE.Group();
    const halfSize = size / 2;
    for (let i = 0; i <= divisions; i++) {
        const pos = -halfSize + (i / divisions) * size;
        // Vertical lines
        group.add(createLine({ start: new THREE.Vector3(pos, -halfSize, 0), end: new THREE.Vector3(pos, halfSize, 0), color }));
        // Horizontal lines
        group.add(createLine({ start: new THREE.Vector3(-halfSize, pos, 0), end: new THREE.Vector3(halfSize, pos, 0), color }));
    }
    return group;
}

/** 4: A plane of parallel lines */
export function createPlaneOfParallelLines({ size = 2, divisions = 10, color = 0x000000 }) {
    const group = new THREE.Group();
    const halfSize = size / 2;
    for (let i = 0; i <= divisions; i++) {
        const pos = -halfSize + (i / divisions) * size;
        group.add(createLine({ start: new THREE.Vector3(pos, -halfSize, 0), end: new THREE.Vector3(pos, halfSize, 0), color }));
    }
    return group;
}

/** 5: A box of parallel lines */
export function createBoxOfParallelLines({ size = 2, divisions = 10, color = 0x000000 }) {
    const group = new THREE.Group();
    const halfSize = size / 2;
    for (let i = 0; i <= divisions; i++) {
        for (let j = 0; j <= divisions; j++) {
            const x = -halfSize + (i / divisions) * size;
            const z = -halfSize + (j / divisions) * size;
            group.add(createLine({ start: new THREE.Vector3(x, -halfSize, z), end: new THREE.Vector3(x, halfSize, z), color }));
        }
    }
    return group;
}

/** 6: A hoop (cylinder of lines parallel to axis) */
export function createHoop({ radius = 1, height = 2, lineCount = 24, color = 0x000000 }) {
    const group = new THREE.Group();
    const halfHeight = height / 2;
    for (let i = 0; i < lineCount; i++) {
        const angle = (i / lineCount) * Math.PI * 2;
        const x = radius * Math.cos(angle);
        const z = radius * Math.sin(angle);
        const start = new THREE.Vector3(x, -halfHeight, z);
        const end = new THREE.Vector3(x, halfHeight, z);
        group.add(createLine({ start, end, color }));
    }
    return group;
}

/** 7: A sphere (star of lines from a center point) */
export function createSphere({ radius = 1, lineCount = 100, color = 0x000000 }) {
    const group = new THREE.Group();
    const center = new THREE.Vector3(0, 0, 0);
    // Use Fibonacci sphere for evenly distributed points
    const phi = Math.PI * (3. - Math.sqrt(5.)); // Golden angle in radians
    for (let i = 0; i < lineCount; i++) {
        const y = 1 - (i / (lineCount - 1)) * 2; // y goes from 1 to -1
        const radiusAtY = Math.sqrt(1 - y * y); // radius at y
        const theta = phi * i; // Golden angle increment
        const x = Math.cos(theta) * radiusAtY;
        const z = Math.sin(theta) * radiusAtY;
        const point = new THREE.Vector3(x, y, z).multiplyScalar(radius);
        group.add(createLine({ start: center, end: point, color }));
    }
    return group;
}

/** 8: A cylindroid (ruled surface) */
export function createCylindroid({ width = 2, height = 1, lineCount = 24, color = 0x000000 }) {
    const group = new THREE.Group();
    // The ruling lines of a cylindroid pass through the z-axis.
    // The height on the z-axis is determined by the angle.
    for (let i = 0; i < lineCount; i++) {
        const angle = (i / lineCount) * Math.PI * 2;
        const z = (height / 2) * Math.sin(2 * angle);
        const start = new THREE.Vector3(0, 0, z); // Point on the z-axis
        const end = new THREE.Vector3(width * Math.cos(angle), width * Math.sin(angle), z);
        group.add(createLine({ start, end, color }));
    }
    return group;
}

/** 9 & 10: A hyperbolic paraboloid (orthogonal and non-orthogonal) */
export function createHyperbolicParaboloid({ size = 2, divisions = 10, isOrthogonal = true, color = 0x000000 }) {
    const group = new THREE.Group();
    const halfSize = size / 2;
    // This surface is "doubly ruled", meaning two sets of straight lines create it.
    const shearMatrix = new THREE.Matrix4().makeShear(0.5, 0, 0, 0, 0, 0); // For non-orthogonal version

    for (let i = 0; i <= divisions; i++) {
        const u = -halfSize + (i / divisions) * size;
        // First set of ruling lines
        const start1 = new THREE.Vector3(u, -halfSize, u * -halfSize * 0.5);
        const end1 = new THREE.Vector3(u, halfSize, u * halfSize * 0.5);
        
        // Second set of ruling lines
        const v = -halfSize + (i / divisions) * size;
        const start2 = new THREE.Vector3(-halfSize, v, -halfSize * v * 0.5);
        const end2 = new THREE.Vector3(halfSize, v, halfSize * v * 0.5);

        if (!isOrthogonal) {
            start1.applyMatrix4(shearMatrix);
            end1.applyMatrix4(shearMatrix);
            start2.applyMatrix4(shearMatrix);
            end2.applyMatrix4(shearMatrix);
        }

        group.add(createLine({ start: start1, end: end1, color }));
        group.add(createLine({ start: start2, end: end2, color }));
    }
    return group;
}

/** 11 & 12: A hyperboloid (circular and elliptical) */
export function createHyperboloid({ radiusX = 1, radiusZ = 1, height = 2, lineCount = 24, twistAngle = Math.PI / 4, color = 0x000000 }) {
    const group = new THREE.Group();
    const halfHeight = height / 2;
    // A hyperboloid is also doubly ruled. We can generate it by connecting
    // two circles/ellipses with a twist.
    for (let i = 0; i < lineCount; i++) {
        const angle1 = (i / lineCount) * Math.PI * 2;
        const angle2 = angle1 + twistAngle;

        // Top ellipse
        const start = new THREE.Vector3(
            radiusX * Math.cos(angle1), 
            halfHeight, 
            radiusZ * Math.sin(angle1)
        );
        // Bottom ellipse
        const end = new THREE.Vector3(
            radiusX * Math.cos(angle2), 
            -halfHeight, 
            radiusZ * Math.sin(angle2)
        );
        group.add(createLine({ start, end, color }));
    }
    return group;
}