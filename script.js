// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111122);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 10, 20);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 20, 10);
directionalLight.castShadow = true;
scene.add(directionalLight);

// Grid parameters
const gridSize = 100;
const gridDivisions = 100;
const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0x888888, 0x444444);
gridHelper.position.y = 0;
scene.add(gridHelper);

// Create coordinate labels
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
document.body.appendChild(labelRenderer.domElement);

const labels = [];
const labelDistance = gridSize / gridDivisions;

for (let i = -gridDivisions/2; i <= gridDivisions/2; i++) {
    for (let j = -gridDivisions/2; j <= gridDivisions/2; j++) {
        if (i % 5 === 0 && j % 5 === 0) { // Only label every 5th intersection
            const label = createLabel(`${i},${j}`, i * labelDistance, 0.1, j * labelDistance);
            labels.push(label);
            scene.add(label);
        }
    }
}

function createLabel(text, x, y, z) {
    const labelDiv = document.createElement('div');
    labelDiv.className = 'label';
    labelDiv.textContent = text;
    labelDiv.style.color = 'white';
    labelDiv.style.fontSize = '10px';
    labelDiv.style.pointerEvents = 'none';
    
    const label = new CSS2DObject(labelDiv);
    label.position.set(x, y, z);
    return label;
}

// Movement controls
const moveSpeed = 0.2;
const keys = {
    w: false,
    a: false,
    s: false,
    d: false,
    shift: false,
    ctrl: false
};

document.addEventListener('keydown', (event) => {
    if (keys.hasOwnProperty(event.key.toLowerCase())) {
        keys[event.key.toLowerCase()] = true;
    }
});

document.addEventListener('keyup', (event) => {
    if (keys.hasOwnProperty(event.key.toLowerCase())) {
        keys[event.key.toLowerCase()] = false;
    }
});

// Position display
const positionElement = document.getElementById('position');

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Handle movement
    const direction = new THREE.Vector3();
    const frontVector = new THREE.Vector3(
        Math.sin(camera.rotation.y),
        0,
        Math.cos(camera.rotation.y)
    );
    const sideVector = new THREE.Vector3().crossVectors(frontVector, camera.up);
    
    if (keys.w) direction.add(frontVector);
    if (keys.s) direction.sub(frontVector);
    if (keys.a) direction.sub(sideVector);
    if (keys.d) direction.add(sideVector);
    if (keys.shift) direction.y += 1;
    if (keys.ctrl) direction.y -= 1;
    
    if (direction.length() > 0) {
        direction.normalize();
        camera.position.addScaledVector(direction, moveSpeed);
        controls.target.addScaledVector(direction, moveSpeed);
    }
    
    controls.update();
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
    
    // Update position display
    positionElement.textContent = 
        `${Math.round(camera.position.x * 10) / 10}, ` +
        `${Math.round(camera.position.y * 10) / 10}, ` +
        `${Math.round(camera.position.z * 10) / 10}`;
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
