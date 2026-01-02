// Game State
const gameState = {
    isPlaying: false,
    startTime: 0,
    checkpointsPassed: 0,
    totalCheckpoints: 3,
    pointerLocked: false
};

// Three.js variables
let scene, camera, renderer;
let player, playerBody;
let ground = [];
let obstacles = [];
let checkpoints = [];
let finishLine;

// Cannon.js physics
let world;
let timeStep = 1/60;

// Controls
let keys = {};
let mouseMovement = { x: 0, y: 0 };
let cameraRotation = { x: 0, y: 0 };

// Constants
const PLAYER_SIZE = 1;
const PLAYER_SPEED = 8;
const JUMP_FORCE = 12;
const RESPAWN_POSITION = new THREE.Vector3(0, 2, 0);

// Initialize the game
function init() {
    setupThreeJS();
    setupPhysics();
    createWorld();
    createPlayer();
    setupControls();
    setupEventListeners();
    animate();
}

// Setup Three.js
function setupThreeJS() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    scene.fog = new THREE.Fog(0x87CEEB, 50, 200);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 10);

    renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('game-canvas'),
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 50, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    scene.add(directionalLight);
}

// Setup Cannon.js physics
function setupPhysics() {
    world = new CANNON.World();
    world.gravity.set(0, -30, 0);
    world.broadphase = new CANNON.NaiveBroadphase();
    world.solver.iterations = 10;
}

// Create the obstacle course
function createWorld() {
    // Starting platform
    createPlatform(0, 0, 0, 15, 1, 15, 0x6bcf7f);

    // Path segment 1 - Narrow bridge
    createPlatform(0, 0, -20, 5, 1, 10, 0xffd93d);

    // Rotating platform 1
    createRotatingPlatform(0, 0, -35, 10, 1, 10, 0xff6b6b);

    // Jump section
    createPlatform(-8, 0, -50, 6, 1, 6, 0x4d96ff);
    createPlatform(0, 2, -58, 6, 1, 6, 0x4d96ff);
    createPlatform(8, 0, -66, 6, 1, 6, 0x4d96ff);

    // Checkpoint 1
    createCheckpoint(8, 2, -66, 1);

    // Moving obstacles section
    createPlatform(8, 0, -80, 15, 1, 20, 0x6bcf7f);
    createMovingObstacle(8, 3, -80, 3, 3, 1, 0xff6b6b, 10);
    createMovingObstacle(8, 3, -75, 3, 3, 1, 0xff6b6b, 10, Math.PI);

    // Rotating windmill section
    createPlatform(8, 0, -105, 12, 1, 12, 0xffd93d);
    createSpinningObstacle(8, 4, -105, 12, 1, 2, 0xff6b6b);

    // Checkpoint 2
    createCheckpoint(8, 2, -105, 2);

    // Falling platforms section
    createFallingPlatform(8, 0, -120, 5, 1, 5, 0xff8e53);
    createFallingPlatform(8, 0, -128, 5, 1, 5, 0xff8e53);
    createFallingPlatform(8, 0, -136, 5, 1, 5, 0xff8e53);

    // Slalom section
    createPlatform(8, 0, -150, 20, 1, 20, 0x6bcf7f);
    createObstacle(5, 2, -145, 2, 4, 2, 0x764ba2);
    createObstacle(11, 2, -150, 2, 4, 2, 0x764ba2);
    createObstacle(5, 2, -155, 2, 4, 2, 0x764ba2);

    // Checkpoint 3
    createCheckpoint(8, 2, -160, 3);

    // Final rotating platform challenge
    createRotatingPlatform(8, 0, -175, 12, 1, 12, 0xff6b6b, 0.5);

    // Finish platform
    createPlatform(8, 0, -190, 15, 1, 15, 0x6bcf7f);
    createFinishLine(8, 2, -190);

    // Walls to prevent falling off the world
    createWall(-20, 5, -100, 1, 10, 200, 0x888888);
    createWall(36, 5, -100, 1, 10, 200, 0x888888);
}

// Create a static platform
function createPlatform(x, y, z, width, height, depth, color) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshStandardMaterial({ color: color });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);

    const shape = new CANNON.Box(new CANNON.Vec3(width/2, height/2, depth/2));
    const body = new CANNON.Body({ mass: 0 });
    body.addShape(shape);
    body.position.set(x, y, z);
    world.addBody(body);

    ground.push({ mesh, body });
}

// Create a rotating platform
function createRotatingPlatform(x, y, z, width, height, depth, color, speed = 0.01) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshStandardMaterial({ color: color });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);

    const shape = new CANNON.Box(new CANNON.Vec3(width/2, height/2, depth/2));
    const body = new CANNON.Body({ mass: 0 });
    body.addShape(shape);
    body.position.set(x, y, z);
    world.addBody(body);

    obstacles.push({
        mesh,
        body,
        type: 'rotating',
        speed: speed,
        axis: 'y'
    });
}

// Create a moving obstacle
function createMovingObstacle(x, y, z, width, height, depth, color, range, offset = 0) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshStandardMaterial({ color: color });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);

    const shape = new CANNON.Box(new CANNON.Vec3(width/2, height/2, depth/2));
    const body = new CANNON.Body({
        mass: 0,
        type: CANNON.Body.KINEMATIC
    });
    body.addShape(shape);
    body.position.set(x, y, z);
    world.addBody(body);

    obstacles.push({
        mesh,
        body,
        type: 'moving',
        startX: x,
        range: range,
        speed: 0.02,
        offset: offset
    });
}

// Create a spinning obstacle (like a windmill arm)
function createSpinningObstacle(x, y, z, width, height, depth, color) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshStandardMaterial({ color: color });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);

    const shape = new CANNON.Box(new CANNON.Vec3(width/2, height/2, depth/2));
    const body = new CANNON.Body({
        mass: 0,
        type: CANNON.Body.KINEMATIC
    });
    body.addShape(shape);
    body.position.set(x, y, z);
    world.addBody(body);

    obstacles.push({
        mesh,
        body,
        type: 'spinning',
        speed: 0.02,
        centerX: x,
        centerZ: z,
        radius: width / 2
    });
}

// Create a falling platform
function createFallingPlatform(x, y, z, width, height, depth, color) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshStandardMaterial({ color: color });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);

    const shape = new CANNON.Box(new CANNON.Vec3(width/2, height/2, depth/2));
    const body = new CANNON.Body({ mass: 0 });
    body.addShape(shape);
    body.position.set(x, y, z);
    world.addBody(body);

    obstacles.push({
        mesh,
        body,
        type: 'falling',
        originalY: y,
        falling: false,
        fallTimer: 0
    });
}

// Create a static obstacle
function createObstacle(x, y, z, width, height, depth, color) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshStandardMaterial({ color: color });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);

    const shape = new CANNON.Box(new CANNON.Vec3(width/2, height/2, depth/2));
    const body = new CANNON.Body({ mass: 0 });
    body.addShape(shape);
    body.position.set(x, y, z);
    world.addBody(body);

    obstacles.push({ mesh, body, type: 'static' });
}

// Create a wall
function createWall(x, y, z, width, height, depth, color) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshStandardMaterial({
        color: color,
        transparent: true,
        opacity: 0.3
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    scene.add(mesh);

    const shape = new CANNON.Box(new CANNON.Vec3(width/2, height/2, depth/2));
    const body = new CANNON.Body({ mass: 0 });
    body.addShape(shape);
    body.position.set(x, y, z);
    world.addBody(body);
}

// Create checkpoint
function createCheckpoint(x, y, z, number) {
    const geometry = new THREE.RingGeometry(2, 3, 32);
    const material = new THREE.MeshStandardMaterial({
        color: 0xffd93d,
        side: THREE.DoubleSide,
        emissive: 0xffd93d,
        emissiveIntensity: 0.5
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.rotation.x = Math.PI / 2;
    scene.add(mesh);

    checkpoints.push({
        mesh,
        position: new THREE.Vector3(x, y, z),
        number: number,
        passed: false
    });
}

// Create finish line
function createFinishLine(x, y, z) {
    const geometry = new THREE.CylinderGeometry(4, 4, 0.5, 32);
    const material = new THREE.MeshStandardMaterial({
        color: 0x6bcf7f,
        emissive: 0x6bcf7f,
        emissiveIntensity: 0.8
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);

    finishLine = {
        mesh,
        position: new THREE.Vector3(x, y, z)
    };
}

// Create player
function createPlayer() {
    const geometry = new THREE.SphereGeometry(PLAYER_SIZE, 32, 32);
    const material = new THREE.MeshStandardMaterial({
        color: 0xff6b6b,
        metalness: 0.3,
        roughness: 0.7
    });
    player = new THREE.Mesh(geometry, material);
    player.castShadow = true;
    player.receiveShadow = true;
    scene.add(player);

    const shape = new CANNON.Sphere(PLAYER_SIZE);
    playerBody = new CANNON.Body({
        mass: 5,
        linearDamping: 0.9,
        angularDamping: 0.9
    });
    playerBody.addShape(shape);
    playerBody.position.copy(RESPAWN_POSITION);
    world.addBody(playerBody);

    // Material for player-ground interaction
    const playerMaterial = new CANNON.Material();
    const groundMaterial = new CANNON.Material();
    const playerGroundContact = new CANNON.ContactMaterial(
        playerMaterial,
        groundMaterial,
        { friction: 0.3, restitution: 0.3 }
    );
    world.addContactMaterial(playerGroundContact);
}

// Setup controls
function setupControls() {
    document.addEventListener('keydown', (e) => {
        keys[e.code] = true;

        if (e.code === 'KeyR' && gameState.isPlaying) {
            respawnPlayer();
        }
    });

    document.addEventListener('keyup', (e) => {
        keys[e.code] = false;
    });

    // Pointer lock for mouse look
    document.addEventListener('click', () => {
        if (gameState.isPlaying && !gameState.pointerLocked) {
            document.body.requestPointerLock();
        }
    });

    document.addEventListener('pointerlockchange', () => {
        gameState.pointerLocked = document.pointerLockElement === document.body;
        const instructions = document.getElementById('instructions');
        if (gameState.isPlaying && !gameState.pointerLocked) {
            instructions.classList.remove('hidden');
        } else {
            instructions.classList.add('hidden');
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (gameState.pointerLocked) {
            mouseMovement.x = e.movementX || 0;
            mouseMovement.y = e.movementY || 0;
        }
    });
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('start-btn').addEventListener('click', startGame);
    document.getElementById('restart-btn').addEventListener('click', restartGame);
    window.addEventListener('resize', onWindowResize);
}

// Start game
function startGame() {
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-hud').classList.remove('hidden');
    gameState.isPlaying = true;
    gameState.startTime = Date.now();
    gameState.checkpointsPassed = 0;

    // Reset checkpoints
    checkpoints.forEach(cp => cp.passed = false);

    updateCheckpointDisplay();
}

// Restart game
function restartGame() {
    document.getElementById('win-screen').classList.add('hidden');
    respawnPlayer();
    startGame();
}

// Respawn player
function respawnPlayer() {
    playerBody.position.copy(RESPAWN_POSITION);
    playerBody.velocity.set(0, 0, 0);
    playerBody.angularVelocity.set(0, 0, 0);
    cameraRotation.x = 0;
    cameraRotation.y = 0;
}

// Update timer
function updateTimer() {
    if (!gameState.isPlaying) return;

    const elapsed = Date.now() - gameState.startTime;
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    document.getElementById('timer').textContent =
        `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Update checkpoint display
function updateCheckpointDisplay() {
    document.getElementById('checkpoints').textContent =
        `${gameState.checkpointsPassed}/${gameState.totalCheckpoints}`;
}

// Check checkpoints
function checkCheckpoints() {
    const playerPos = playerBody.position;

    checkpoints.forEach(checkpoint => {
        if (!checkpoint.passed) {
            const distance = Math.sqrt(
                Math.pow(playerPos.x - checkpoint.position.x, 2) +
                Math.pow(playerPos.y - checkpoint.position.y, 2) +
                Math.pow(playerPos.z - checkpoint.position.z, 2)
            );

            if (distance < 3) {
                checkpoint.passed = true;
                gameState.checkpointsPassed++;
                updateCheckpointDisplay();

                // Visual feedback
                checkpoint.mesh.material.color.setHex(0x6bcf7f);
                checkpoint.mesh.material.emissive.setHex(0x6bcf7f);
            }
        }
    });
}

// Check win condition
function checkWinCondition() {
    const playerPos = playerBody.position;
    const finishPos = finishLine.position;

    const distance = Math.sqrt(
        Math.pow(playerPos.x - finishPos.x, 2) +
        Math.pow(playerPos.y - finishPos.y, 2) +
        Math.pow(playerPos.z - finishPos.z, 2)
    );

    if (distance < 4) {
        winGame();
    }
}

// Win game
function winGame() {
    gameState.isPlaying = false;
    document.getElementById('game-hud').classList.add('hidden');
    document.getElementById('win-screen').classList.remove('hidden');

    const elapsed = Date.now() - gameState.startTime;
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    document.getElementById('final-time').textContent =
        `Time: ${minutes}:${seconds.toString().padStart(2, '0')}`;

    if (document.pointerLockElement) {
        document.exitPointerLock();
    }
}

// Update player movement
function updatePlayer() {
    if (!gameState.isPlaying) return;

    const forward = new CANNON.Vec3();
    const right = new CANNON.Vec3();

    // Calculate forward and right vectors based on camera rotation
    forward.set(
        Math.sin(cameraRotation.x),
        0,
        Math.cos(cameraRotation.x)
    );

    right.set(
        Math.sin(cameraRotation.x + Math.PI / 2),
        0,
        Math.cos(cameraRotation.x + Math.PI / 2)
    );

    const moveForce = new CANNON.Vec3();

    // WASD or Arrow keys
    if (keys['KeyW'] || keys['ArrowUp']) {
        moveForce.vadd(forward.scale(-PLAYER_SPEED), moveForce);
    }
    if (keys['KeyS'] || keys['ArrowDown']) {
        moveForce.vadd(forward.scale(PLAYER_SPEED), moveForce);
    }
    if (keys['KeyA'] || keys['ArrowLeft']) {
        moveForce.vadd(right.scale(-PLAYER_SPEED), moveForce);
    }
    if (keys['KeyD'] || keys['ArrowRight']) {
        moveForce.vadd(right.scale(PLAYER_SPEED), moveForce);
    }

    playerBody.velocity.x = moveForce.x;
    playerBody.velocity.z = moveForce.z;

    // Jump
    if (keys['Space']) {
        // Simple ground check
        if (Math.abs(playerBody.velocity.y) < 0.5) {
            playerBody.velocity.y = JUMP_FORCE;
        }
    }

    // Update camera rotation based on mouse movement
    if (gameState.pointerLocked) {
        cameraRotation.x -= mouseMovement.x * 0.002;
        cameraRotation.y -= mouseMovement.y * 0.002;
        cameraRotation.y = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, cameraRotation.y));
        mouseMovement.x = 0;
        mouseMovement.y = 0;
    }

    // Check for falling off the world
    if (playerBody.position.y < -20) {
        respawnPlayer();
    }
}

// Update obstacles
function updateObstacles() {
    obstacles.forEach((obstacle, index) => {
        if (obstacle.type === 'rotating') {
            const angle = Date.now() * obstacle.speed;
            obstacle.body.quaternion.setFromEuler(0, angle, 0);
            obstacle.mesh.quaternion.copy(obstacle.body.quaternion);
        }
        else if (obstacle.type === 'moving') {
            const time = Date.now() * obstacle.speed + obstacle.offset;
            const newX = obstacle.startX + Math.sin(time) * obstacle.range;
            obstacle.body.position.x = newX;
            obstacle.mesh.position.copy(obstacle.body.position);
        }
        else if (obstacle.type === 'spinning') {
            const angle = Date.now() * obstacle.speed;
            const newX = obstacle.centerX + Math.cos(angle) * obstacle.radius;
            const newZ = obstacle.centerZ + Math.sin(angle) * obstacle.radius;
            obstacle.body.position.set(newX, obstacle.body.position.y, newZ);
            obstacle.body.quaternion.setFromEuler(0, angle, 0);
            obstacle.mesh.position.copy(obstacle.body.position);
            obstacle.mesh.quaternion.copy(obstacle.body.quaternion);
        }
        else if (obstacle.type === 'falling') {
            // Check if player is on this platform
            const playerPos = playerBody.position;
            const platformPos = obstacle.body.position;
            const distance = Math.sqrt(
                Math.pow(playerPos.x - platformPos.x, 2) +
                Math.pow(playerPos.z - platformPos.z, 2)
            );

            if (distance < 3 && Math.abs(playerPos.y - platformPos.y) < 2 && !obstacle.falling) {
                obstacle.falling = true;
                obstacle.fallTimer = Date.now();
            }

            if (obstacle.falling) {
                const elapsed = Date.now() - obstacle.fallTimer;
                if (elapsed > 500) { // Fall after 0.5 seconds
                    obstacle.body.position.y -= 0.1;
                    obstacle.mesh.position.copy(obstacle.body.position);

                    // Reset after falling far enough
                    if (obstacle.body.position.y < -50) {
                        obstacle.body.position.y = obstacle.originalY;
                        obstacle.mesh.position.copy(obstacle.body.position);
                        obstacle.falling = false;
                    }
                } else {
                    // Shake effect before falling
                    obstacle.mesh.position.y = obstacle.originalY + Math.sin(elapsed * 0.05) * 0.1;
                }
            }
        }
    });
}

// Update camera
function updateCamera() {
    const playerPos = playerBody.position;

    // Third-person camera
    const cameraDistance = 12;
    const cameraHeight = 5;

    const targetX = playerPos.x + Math.sin(cameraRotation.x) * cameraDistance;
    const targetY = playerPos.y + cameraHeight + Math.sin(cameraRotation.y) * cameraDistance;
    const targetZ = playerPos.z + Math.cos(cameraRotation.x) * cameraDistance;

    camera.position.x = targetX;
    camera.position.y = targetY;
    camera.position.z = targetZ;

    camera.lookAt(playerPos.x, playerPos.y + 2, playerPos.z);
}

// Window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Update physics
    world.step(timeStep);

    // Update player
    updatePlayer();

    // Update obstacles
    updateObstacles();

    // Sync player mesh with physics body
    player.position.copy(playerBody.position);
    player.quaternion.copy(playerBody.quaternion);

    // Update camera
    updateCamera();

    // Check game conditions
    if (gameState.isPlaying) {
        checkCheckpoints();
        checkWinCondition();
        updateTimer();
    }

    // Animate checkpoint rings
    checkpoints.forEach(checkpoint => {
        checkpoint.mesh.rotation.z += 0.01;
    });

    // Animate finish line
    if (finishLine) {
        finishLine.mesh.rotation.y += 0.02;
    }

    renderer.render(scene, camera);
}

// Start the game when page loads
window.addEventListener('load', init);
