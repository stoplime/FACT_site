import * as THREE from 'three';

// Helper for materials
const lineMaterial = (color) => new THREE.LineBasicMaterial({ color: color });

// --- NEW: ADVANCED HELPER FUNCTIONS ---

/** Creates a dashed line. Note: The parent object must have .computeLineDistances() called. */
function createDashedLine({ start, end, color = 0x000000, dashSize = 0.1, gapSize = 0.1 }) {
    const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
    const material = new THREE.LineDashedMaterial({ color, dashSize, gapSize, scale: 1 });
    const line = new THREE.Line(geometry, material);
    line.computeLineDistances(); // Crucial for dashed lines to render
    return line;
}

/** Creates an arrowhead (cone) for translation vectors. */
function createArrowhead({ color = 0x000000, length = 0.2, radius = 0.08 }) {
    const geometry = new THREE.ConeGeometry(radius, length, 16);
    const material = new THREE.MeshBasicMaterial({ color });
    return new THREE.Mesh(geometry, material);
}

/** Creates a torque/moment arrow symbol. */
function createTorqueArrow({ color = 0x000000, radius = 0.15, tube = 0.02 }) {
    const group = new THREE.Group();
    const material = new THREE.MeshBasicMaterial({ color });

    // 1. Create the C-shaped curve (same as before).
    const curveGeometry = new THREE.TorusGeometry(radius, tube, 16, 48, Math.PI * 1.5);
    const curve = new THREE.Mesh(curveGeometry, material);
    group.add(curve);
    
    // 2. Create the FIRST arrowhead (for the END of the arc).
    const arrowheadEnd = createArrowhead({ color, length: 0.08, radius: 0.04 });
    // Position it at the end of the 270-degree arc.
    arrowheadEnd.position.set(0, -radius, 0);
    // Rotate it to point along the tangent.
    arrowheadEnd.rotation.z = -Math.PI / 2;
    group.add(arrowheadEnd);
    
    // --- NEW ---
    // 3. Create the SECOND arrowhead (for the START of the arc).
    const arrowheadStart = createArrowhead({ color, length: 0.08, radius: 0.04 });
    // Position it at the start of the arc (angle 0).
    arrowheadStart.position.set(radius, 0, 0);
    arrowheadStart.rotation.z = -Math.PI;
    // The cone's default orientation (+Y) already matches the tangent here, so no rotation is needed.
    group.add(arrowheadStart);
    // --- END NEW ---
    
    // The entire symbol is now correctly constructed in the XY plane.
    return group;
}

/** Creates a "bold" line using a thin cylinder, more reliable than linewidth. */
function createBoldLine({ start, end, color = 0x000000, radius = 0.02 }) {
    const direction = new THREE.Vector3().subVectors(end, start);
    const length = direction.length();
    const geometry = new THREE.CylinderGeometry(radius, radius, length, 16);
    const material = new THREE.MeshBasicMaterial({ color });
    const cylinder = new THREE.Mesh(geometry, material);

    cylinder.position.copy(start).add(direction.multiplyScalar(0.5));
    cylinder.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
    
    return cylinder;
}


// --- Elemental Shapes ---

/** 1: A simple line */
export function createLine({ start, end, color = 0x000000 }) {
    const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
    const material = new THREE.LineBasicMaterial({ color: color });
    return new THREE.Line(geometry, material);
}

/** 2: A disk (radial lines) with outline and translucency */
export function createDisk({ radius = 1, lineCount = 12, color = 0x000000 }) {
    const group = new THREE.Group();
    // Translucent filled plane
    const planeGeom = new THREE.CircleGeometry(radius, 32);
    const planeMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.2, side: THREE.DoubleSide });
    group.add(new THREE.Mesh(planeGeom, planeMat));

    // Black outline
    const outlineGeom = new THREE.RingGeometry(radius, radius, 64);
    const outlineMat = new THREE.LineBasicMaterial({ color: 0x000000 });
    const outline = new THREE.Line(outlineGeom, outlineMat);
    group.add(outline);
    
    // Radial lines
    const center = new THREE.Vector3(0, 0, 0);
    for (let i = 0; i < lineCount; i++) {
        const angle = (i / lineCount) * Math.PI * 2;
        const edge = new THREE.Vector3(radius * Math.cos(angle), radius * Math.sin(angle), 0);
        group.add(createLine({ start: center, end: edge, color }));
    }
    return group;
}

/** 3: A plane (single translucent surface with colored border) */
export function createPlane({ size = 2, color = 0x000000 }) {
    const group = new THREE.Group();
    const halfSize = size / 2;
    // Translucent surface
    const planeGeom = new THREE.PlaneGeometry(size, size);
    const planeMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.2, side: THREE.DoubleSide });
    group.add(new THREE.Mesh(planeGeom, planeMat));

    // Colored Edges
    const edgesGeom = new THREE.EdgesGeometry(planeGeom);
    const edgesMat = new THREE.LineBasicMaterial({ color });
    group.add(new THREE.LineSegments(edgesGeom, edgesMat));
    
    return group;
}

/** 4: A plane of parallel lines with outline and translucency */
export function createPlaneOfParallelLines({ size = 2, divisions = 10, color = 0x000000 }) {
    const group = new THREE.Group();
    const halfSize = size / 2;
    // Translucent background plane
    const planeGeom = new THREE.PlaneGeometry(size, size);
    const planeMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.1, side: THREE.DoubleSide });
    group.add(new THREE.Mesh(planeGeom, planeMat));
    
    // Black outline
    const outline = new THREE.LineSegments(
        new THREE.EdgesGeometry(planeGeom), 
        new THREE.LineBasicMaterial({ color: 0x000000 })
    );
    group.add(outline);

    // Parallel lines
    for (let i = 0; i <= divisions; i++) {
        const pos = -halfSize + (i / divisions) * size;
        group.add(createLine({ start: new THREE.Vector3(pos, -halfSize, 0), end: new THREE.Vector3(pos, halfSize, 0), color }));
    }
    return group;
}


/** 5: A box of parallel lines with black wireframe outline */
export function createBoxOfParallelLines({ size = 2, divisions = 4, color = 0x000000 }) {
    const group = new THREE.Group();
    const halfSize = size / 2;

    // 1. Create the black wireframe (this is correct).
    const boxGeometry = new THREE.BoxGeometry(size, size, size);
    const edgesGeometry = new THREE.EdgesGeometry(boxGeometry);
    const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
    const wireframe = new THREE.LineSegments(edgesGeometry, edgeMaterial);
    group.add(wireframe);

    // 2. Loop through all possible line positions, including the faces.
    for (let i = 0; i <= divisions; i++) {
        for (let j = 0; j <= divisions; j++) {
            
            // --- KEY CHANGE: The condition to skip the corners ---
            // A corner is where BOTH i and j are at the boundaries (0 or divisions).
            const isCorner = (i === 0 || i === divisions) && (j === 0 || j === divisions);

            // Only draw the line if it is NOT one of the four corners.
            if (!isCorner) {
                const x = -halfSize + (i / divisions) * size;
                const z = -halfSize + (j / divisions) * size;
                
                const start = new THREE.Vector3(x, -halfSize, z);
                const end = new THREE.Vector3(x, halfSize, z);
                group.add(createLine({ start, end, color }));
            }
        }
    }
    
    return group;
}

/** 6A: NEW - A translation vector (bold black line with arrows) */
export function createTranslation({ start, end }) {
    const group = new THREE.Group();
    const color = 0x000000; // Translations are always black
    group.add(createBoldLine({ start, end, color }));

    const dir = new THREE.Vector3().subVectors(end, start).normalize();
    const arrowhead1 = createArrowhead({ color });
    arrowhead1.position.copy(end);
    arrowhead1.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    group.add(arrowhead1);

    const arrowhead2 = createArrowhead({ color });
    arrowhead2.position.copy(start);
    arrowhead2.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.negate());
    group.add(arrowhead2);

    return group;
}

/** 6B: NEW - A moment/torque vector (bold black line with torque arrows) */
export function createMoment({ start, end }) {
    const group = new THREE.Group();
    const color = 0x000000;
    group.add(createBoldLine({ start, end, color }));

    // --- The crucial orientation logic ---
    const torqueArrow1 = createTorqueArrow({ color });
    const torqueArrow2 = createTorqueArrow({ color });

    // Calculate the direction of the line
    const direction = new THREE.Vector3().subVectors(end, start).normalize();
    // Define the default orientation of our symbol (it "points" along the Z axis)
    const defaultUp = new THREE.Vector3(0, 0, 1);
    
    // Create a quaternion that represents the rotation from the default direction to the line's direction
    const orientation = new THREE.Quaternion().setFromUnitVectors(defaultUp, direction);

    // Apply the orientation and position to both symbols
    torqueArrow1.quaternion.copy(orientation);
    torqueArrow1.position.copy(end);

    torqueArrow2.quaternion.copy(orientation);
    torqueArrow2.position.copy(start);

    group.add(torqueArrow1);
    group.add(torqueArrow2);
    
    return group;
}

/** 7: A sphere with black wireframe and equatorial ring */
export function createSphere({ radius = 1, lineCount = 20, color = 0x000000 }) {
    const group = new THREE.Group();
    const ringMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });

    // 1. Equatorial Ring (horizontal, in the XZ plane)
    const equatorialGeom = new THREE.RingGeometry(radius, radius, 64);
    const equatorialRing = new THREE.Line(equatorialGeom, ringMaterial);
    equatorialRing.rotation.x = Math.PI / 2; // Rotate to be flat
    group.add(equatorialRing);

    // 2. Sagittal Ring (vertical, in the YZ plane)
    const sagittalGeom = new THREE.RingGeometry(radius, radius, 64);
    const sagittalRing = new THREE.Line(sagittalGeom, ringMaterial);
    // No rotation needed, it's already vertical facing the camera
    group.add(sagittalRing);

    // 3. Coronal Ring (vertical, in the XY plane)
    const coronalGeom = new THREE.RingGeometry(radius, radius, 64);
    const coronalRing = new THREE.Line(coronalGeom, ringMaterial);
    coronalRing.rotation.y = Math.PI / 2; // Rotate to be side-on
    group.add(coronalRing);
    
    // Radiating lines
    const center = new THREE.Vector3(0, 0, 0);
    const phi = Math.PI * (3. - Math.sqrt(5.));
    for (let i = 0; i < lineCount; i++) {
        const y = 1 - (i / (lineCount - 1)) * 2;
        const radiusAtY = Math.sqrt(1 - y * y);
        const theta = phi * i;
        const point = new THREE.Vector3(Math.cos(theta) * radiusAtY, y, Math.sin(theta) * radiusAtY).multiplyScalar(radius);
        group.add(createLine({ start: center, end: point, color }));
        const theta2 = theta + Math.PI; // Opposite side
        const point2 = new THREE.Vector3(Math.cos(theta2) * radiusAtY, y, Math.sin(theta2) * radiusAtY).multiplyScalar(radius);
        group.add(createLine({ start: center, end: point2, color }));
    }
    return group;
}

/** 8: A cylindroid with dashed centerline and dotted boundary */
export function createCylindroid({ width = 2, height = 1, lineCount = 24, color = "#00ff00" }) {
    const group = new THREE.Group();
    const halfHeight = height / 2;

    // Black dashed centerline
    const centerStart = new THREE.Vector3(0, 0, -halfHeight * 1.2);
    const centerEnd = new THREE.Vector3(0, 0, halfHeight * 1.2);
    group.add(createDashedLine({ start: centerStart, end: centerEnd, color: 0x000000 }));

    // Dotted boundary curves
    const points1 = [], points2 = [];
    for (let i = 0; i <= lineCount; i++) {
        const angle = (i / lineCount) * Math.PI * 2;
        const z = halfHeight * Math.sin(2 * angle);
        points1.push(new THREE.Vector3(width * Math.cos(angle), width * Math.sin(angle), z));
        points2.push(new THREE.Vector3(-width * Math.cos(angle), -width * Math.sin(angle), z));
    }
    const boundary1 = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points1), new THREE.LineDashedMaterial({ color: 0x000000, dashSize: 0.02, gapSize: 0.02 }));
    boundary1.computeLineDistances();
    group.add(boundary1);
    
    // Ruling lines with color gradient
    const startColor = new THREE.Color(color); // e.g., green
    const endColor = new THREE.Color(color).offsetHSL(0, 0, -0.4); // Darker green
    for (let i = 0; i < lineCount; i++) {
        const angle = (i / lineCount) * Math.PI * 2;
        const z = halfHeight * Math.sin(2 * angle);
        
        const start = new THREE.Vector3(0, 0, z);
        const end = new THREE.Vector3(width * Math.cos(angle), width * Math.sin(angle), z);
        
        const interpColor = new THREE.Color().lerpColors(startColor, endColor, i / lineCount);
        group.add(createLine({ start, end, color: interpColor }));
    }
    return group;
}

/** 9 & 10: A hyperbolic paraboloid (single ruling) with translucency and annotations */
export function createHyperbolicParaboloid({ size = 2, divisions = 10, color = 0xff0000 }) {
    const group = new THREE.Group();
    const halfSize = size / 2;
    
    // Create the translucent surface geometry
    const surfaceGeom = new THREE.BufferGeometry();
    const vertices = [];
    for (let i = 0; i <= divisions; i++) {
        const u = -halfSize + (i / divisions) * size;
        const start = new THREE.Vector3(u, -halfSize, u * -halfSize * 0.5);
        const end = new THREE.Vector3(u, halfSize, u * halfSize * 0.5);
        vertices.push(start.x, start.y, start.z);
        vertices.push(end.x, end.y, end.z);
    }
    surfaceGeom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const surface = new THREE.Mesh(surfaceGeom, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.2, side: THREE.DoubleSide }));
    // Note: this surface is visually incorrect but gives the translucent effect. A proper ParametricGeometry is more complex.
    // group.add(surface); // Optional: add translucent surface

    // Dashed centerlines
    group.add(createDashedLine({start: new THREE.Vector3(0, -halfSize, 0), end: new THREE.Vector3(0, halfSize, 0)}));
    
    // Ruling lines
    const endPoints = [];
    for (let i = 0; i <= divisions; i++) {
        const u = -halfSize + (i / divisions) * size;
        const start = new THREE.Vector3(u, -halfSize, u * -halfSize * 0.5);
        const end = new THREE.Vector3(u, halfSize, u * halfSize * 0.5);
        group.add(createLine({ start, end, color }));
        if(i === 0 || i === divisions) endPoints.push(start, end);
    }

    // Dotted connecting lines
    const connector1 = createDashedLine({start: endPoints[0], end: endPoints[2], dashSize: 0.02, gapSize: 0.02});
    const connector2 = createDashedLine({start: endPoints[1], end: endPoints[3], dashSize: 0.02, gapSize: 0.02});
    group.add(connector1, connector2);

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