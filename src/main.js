import * as THREE from 'three';
// Import OrbitControls
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// Import all our shape creation functions
import * as Shapes from './elemental-shapes.js';

// --- SCENE SETUP ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222233); // Dark blue background

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 4, 12);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- CONTROLS ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Makes the rotation feel smoother

// --- LIGHTS ---
// Add a simple light so materials are visible if we use non-basic ones later
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const pointLight = new THREE.PointLight(0xffffff, 0.5);
pointLight.position.set(2, 5, 5);
scene.add(pointLight);


// --- CREATE AND ARRANGE ALL SHAPES IN A GRID ---

const grid = { cols: 4, rows: 3, spacing: 4 };
const shapes = []; // To store shapes for animation

// Row 1
shapes.push(Shapes.createLine({ start: new THREE.Vector3(-1, 0, 0), end: new THREE.Vector3(1, 0, 0), color: 0xffffff }));
shapes.push(Shapes.createDisk({ color: 0xffaaaa }));
shapes.push(Shapes.createPlane({ color: 0xaaffaa }));
shapes.push(Shapes.createPlaneOfParallelLines({ color: 0xaaaaff }));

// Row 2
shapes.push(Shapes.createBoxOfParallelLines({ size: 1.5, divisions: 6, color: 0xffffaa }));
shapes.push(Shapes.createHoop({ color: 0xaaffff }));
shapes.push(Shapes.createSphere({ lineCount: 60, color: 0xffaaff }));
shapes.push(Shapes.createCylindroid({ color: 0xff5555 }));

// Row 3
shapes.push(Shapes.createHyperbolicParaboloid({ isOrthogonal: true, color: 0x55ff55 }));
shapes.push(Shapes.createHyperbolicParaboloid({ isOrthogonal: false, color: 0x55ffff }));
shapes.push(Shapes.createHyperboloid({ color: 0x5555ff })); // Circular
shapes.push(Shapes.createHyperboloid({ radiusX: 1.5, radiusZ: 0.7, color: 0xffaaff })); // Elliptical

// Position the shapes in the grid
shapes.forEach((shape, i) => {
    const col = i % grid.cols;
    const row = Math.floor(i / grid.cols);
    const x = (col - (grid.cols - 1) / 2) * grid.spacing;
    const y = (row - (grid.rows - 1) / 2) * -grid.spacing; // Negative to go top-to-bottom
    shape.position.set(x, y, 0);
    scene.add(shape);
});


// --- ANIMATION LOOP ---
function animate() {
    requestAnimationFrame(animate);

    // Required if enableDamping is true
    controls.update();
    
    // Animate all shapes for fun
    shapes.forEach(shape => {
        shape.rotation.y += 0.005;
    });

    renderer.render(scene, camera);
}
animate();


// --- RESIZE HANDLER ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});