import * as THREE from 'three';
import * as Shapes from './elemental-shapes.js';

/**
 * Renders a 3D thumbnail of a FACT chart entry into a container element.
 * @param {HTMLElement} container - The div element to render the canvas into.
 * @param {object} spaceData - The freedomSpace or constraintSpace object from the JSON.
 */
export function renderThumbnail(container, spaceData) {
    // --- Basic Scene Setup ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); // alpha:true for transparent background
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // --- Create the Shape ---
    // This group will hold all the elemental shapes for this entry
    const masterGroup = new THREE.Group();

    // Loop through the elements defined in the JSON (even if there's only one)
    spaceData.elements.forEach(element => {
        const shapeType = element.type;
        const shapeOptions = element.options;

        // Check if the shape function exists in our library
        if (Shapes[shapeType]) {
            const shape = Shapes[shapeType](shapeOptions);
            masterGroup.add(shape);
        } else {
            console.warn(`Shape type "${shapeType}" not found in elemental-shapes.js`);
        }
    });

    scene.add(masterGroup);

    // --- Frame the Shape in the Camera ---
    // This is a crucial step to make sure the object is visible and centered.
    const box = new THREE.Box3().setFromObject(masterGroup);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    masterGroup.position.x += masterGroup.position.x - center.x;
    masterGroup.position.y += masterGroup.position.y - center.y;
    masterGroup.position.z += masterGroup.position.z - center.z;

    const maxSize = Math.max(size.x, size.y, size.z);
    const fitHeightDistance = maxSize / (2 * Math.atan(Math.PI * camera.aspect / 360));
    const fitWidthDistance = fitHeightDistance / camera.aspect;
    const distance = 1.5 * Math.max(fitHeightDistance, fitWidthDistance); // 1.5 is a padding factor

    camera.position.z = distance;

    // --- Static Render ---
    // We don't need a continuous animation loop for a static thumbnail.
    // We just render it once. This is much better for performance.
    renderer.render(scene, camera);
}