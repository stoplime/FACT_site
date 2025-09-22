import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as Shapes from './elemental-shapes.js';

// Module state
let controls;
let freedomScene, constraintScene;
let freedomRenderer, constraintRenderer;
let camera;
let animationFrameId = null;

const modalOverlay = document.getElementById('modal-overlay');
const freedomCanvas = document.getElementById('freedom-canvas');
const constraintCanvas = document.getElementById('constraint-canvas');

// Utility function to create a scene and renderer
function createScene(canvas) {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xddeeff);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const light = new THREE.DirectionalLight(0xffffff, 0.3);
    light.position.set(2, 5, 5);
    scene.add(light);
    return { scene, renderer };
}

// Main animation loop for the modal
function animate() {
    animationFrameId = requestAnimationFrame(animate);
    controls.update();

    // The core of the synchronization: the shared camera is updated by controls
    // and both renderers use its state to render their respective scenes.
    freedomRenderer.render(freedomScene, camera);
    constraintRenderer.render(constraintScene, camera);
}

// Initialize the modal and its events
export function init() {
    const { scene: fs, renderer: fr } = createScene(freedomCanvas);
    freedomScene = fs;
    freedomRenderer = fr;

    const { scene: cs, renderer: cr } = createScene(constraintCanvas);
    constraintScene = cs;
    constraintRenderer = cr;

    camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.set(0, 1.5, 5);
    
    // CRUCIAL: One set of controls for the shared camera, attached to one canvas
    controls = new OrbitControls(camera, freedomRenderer.domElement);
    controls.enableDamping = true;

    // Event listeners for closing the modal
    document.getElementById('modal-close-btn').addEventListener('click', hide);
    modalOverlay.addEventListener('click', (event) => {
        if (event.target === modalOverlay) {
            hide();
        }
    });
}

// Show the modal and populate it with 3D models
export function show(entryData) {
    // Clean up previous models
    freedomScene.clear();
    constraintScene.clear();
    // Re-add lights
    initLights(freedomScene);
    initLights(constraintScene);

    // Create and add freedom space model
    const freedomElement = entryData.freedomSpace.elements[0];
    const freedomShape = Shapes[freedomElement.type](freedomElement.options);
    freedomScene.add(freedomShape);

    // Create and add constraint space model
    const constraintElement = entryData.constraintSpace.elements[0];
    const constraintShape = Shapes[constraintElement.type](constraintElement.options);
    constraintScene.add(constraintShape);
    
    modalOverlay.classList.remove('hidden');
    
    // Start the rendering loop
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    animate();
}

// Hide the modal and stop the rendering loop to save resources
function hide() {
    modalOverlay.classList.add('hidden');
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
}

function initLights(scene) {
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const light = new THREE.DirectionalLight(0xffffff, 0.3);
    light.position.set(2, 5, 5);
    scene.add(light);
}