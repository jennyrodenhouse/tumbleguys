// Game State
const gameState = {
    isPlaying: false,
    startTime: 0,
    checkpointsPassed: 0,
    totalCheckpoints: 3,
    pointerLocked: false,
    currentRound: 1,
    totalRounds: 3,
    playerPosition: 1,
    totalPlayers: 6
};

// Three.js variables
let scene, camera, renderer;
let player, playerBody;
let cpuPlayers = [];
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

// Constants (EASIER SETTINGS)
const PLAYER_SIZE = 0.6;
const PLAYER_HEIGHT = 2;
const PLAYER_SPEED = 6; // Reduced from 8
const JUMP_FORCE = 10; // Reduced from 12
const RESPAWN_POSITION = new THREE.Vector3(0, 3, 0);
const CPU_COUNT = 5;

// CPU player colors
const CPU_COLORS = [
    0x4d96ff, // Blue
    0x6bcf7f, // Green
    0xff8e53, // Orange
    0x764ba2, // Purple
    0xffd93d  // Yellow
];

// Initialize the game
function init() {
    setupThreeJS();
    setupPhysics();
    createWorld();
    createPlayer();
    createCPUPlayers();
    setupControls();
    setupEventListeners();
    animate();

    // Auto-start the game immediately - no start button needed!
    setTimeout(() => {
        console.log('Auto-starting game...');
        gameState.isPlaying = true;
        gameState.startTime = Date.now();
        gameState.checkpointsPassed = 0;
        gameState.currentRound = 1;
        updateCheckpointDisplay();
        updateRoundDisplay();
        console.log('Game started automatically!');
    }, 100);
}

// Setup Three.js
function setupThreeJS() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    scene.fog = new THREE.Fog(0x87CEEB, 50, 250);

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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 50, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.left = -80;
    directionalLight.shadow.camera.right = 80;
    directionalLight.shadow.camera.top = 80;
    directionalLight.shadow.camera.bottom = -80;
    scene.add(directionalLight);
}

// Setup Cannon.js physics
function setupPhysics() {
    world = new CANNON.World();
    world.gravity.set(0, -25, 0); // Reduced from -30 for easier gameplay
    world.broadphase = new CANNON.NaiveBroadphase();
    world.solver.iterations = 10;
}

// Create the obstacle course (EASIER VERSION)
function createWorld() {
    clearWorld();

    if (gameState.currentRound === 1) {
        createRound1();
    } else if (gameState.currentRound === 2) {
        createRound2();
    } else if (gameState.currentRound === 3) {
        createRound3();
    }

    // Walls to prevent falling off
    createWall(-30, 10, -150, 1, 20, 300, 0x888888);
    createWall(46, 10, -150, 1, 20, 300, 0x888888);
}

// Round 1 - Easy Course
function createRound1() {
    // Starting platform (BIGGER)
    createPlatform(0, 0, 0, 25, 1, 25, 0x6bcf7f);

    // Wide bridge
    createPlatform(0, 0, -30, 12, 1, 20, 0xffd93d);

    // Slow rotating platform
    createRotatingPlatform(0, 0, -55, 15, 1, 15, 0xff6b6b, 0.003); // Much slower

    // Easy jump section (BIGGER PLATFORMS, CLOSER)
    createPlatform(-6, 0, -75, 10, 1, 10, 0x4d96ff);
    createPlatform(2, 1, -88, 10, 1, 10, 0x4d96ff);
    createPlatform(10, 0, -100, 10, 1, 10, 0x4d96ff);

    // Checkpoint 1
    createCheckpoint(10, 3, -100, 1);

    // Wide platform with slow moving obstacles
    createPlatform(10, 0, -125, 20, 1, 30, 0x6bcf7f);
    createMovingObstacle(10, 3, -120, 2, 3, 1, 0xff6b6b, 6, 0); // Smaller range

    // Checkpoint 2
    createCheckpoint(10, 3, -140, 2);

    // Final straight path
    createPlatform(10, 0, -165, 20, 1, 25, 0xffd93d);

    // Checkpoint 3
    createCheckpoint(10, 3, -175, 3);

    // Finish platform (BIGGER)
    createPlatform(10, 0, -195, 25, 1, 25, 0x6bcf7f);
    createFinishLine(10, 3, -195);
}

// Round 2 - Medium Course
function createRound2() {
    // Starting platform
    createPlatform(0, 0, 0, 20, 1, 20, 0x6bcf7f);

    // Zigzag platforms
    createPlatform(0, 0, -25, 10, 1, 15, 0xffd93d);
    createPlatform(8, 0, -45, 10, 1, 15, 0x4d96ff);
    createPlatform(0, 0, -65, 10, 1, 15, 0xffd93d);

    // Checkpoint 1
    createCheckpoint(0, 3, -65, 1);

    // Rotating platform section
    createRotatingPlatform(0, 0, -85, 14, 1, 14, 0xff6b6b, 0.005);

    // Moving platforms
    createPlatform(-8, 0, -105, 8, 1, 8, 0x6bcf7f);
    createPlatform(8, 0, -105, 8, 1, 8, 0x6bcf7f);
    createMovingObstacle(0, 3, -105, 3, 3, 1, 0xff6b6b, 8, 0);

    // Checkpoint 2
    createCheckpoint(8, 3, -105, 2);

    // Falling platforms (LONGER DELAY)
    createFallingPlatform(8, 0, -125, 8, 1, 8, 0xff8e53);
    createFallingPlatform(8, 0, -137, 8, 1, 8, 0xff8e53);

    // Final section
    createPlatform(8, 0, -160, 18, 1, 25, 0x6bcf7f);

    // Checkpoint 3
    createCheckpoint(8, 3, -170, 3);

    // Finish
    createPlatform(8, 0, -190, 20, 1, 20, 0x6bcf7f);
    createFinishLine(8, 3, -190);
}

// Round 3 - Challenge Course
function createRound3() {
    // Starting platform
    createPlatform(0, 0, 0, 18, 1, 18, 0x6bcf7f);

    // Mixed obstacles section
    createPlatform(0, 0, -25, 14, 1, 15, 0xffd93d);
    createRotatingPlatform(0, 0, -50, 12, 1, 12, 0xff6b6b, 0.008);

    // Jump challenge
    createPlatform(-8, 0, -70, 8, 1, 8, 0x4d96ff);
    createPlatform(0, 2, -82, 8, 1, 8, 0x4d96ff);
    createPlatform(8, 0, -94, 8, 1, 8, 0x4d96ff);

    // Checkpoint 1
    createCheckpoint(8, 3, -94, 1);

    // Spinning windmill (SLOWER)
    createPlatform(8, 0, -115, 14, 1, 14, 0xffd93d);
    createSpinningObstacle(8, 4, -115, 10, 1, 2, 0xff6b6b, 0.012); // Slower

    // Checkpoint 2
    createCheckpoint(8, 3, -115, 2);

    // Slalom with moving obstacles
    createPlatform(8, 0, -145, 18, 1, 25, 0x6bcf7f);
    createMovingObstacle(6, 3, -140, 2, 3, 1, 0xff6b6b, 5, 0);
    createMovingObstacle(10, 3, -150, 2, 3, 1, 0xff6b6b, 5, Math.PI);

    // Checkpoint 3
    createCheckpoint(8, 3, -160, 3);

    // Final challenge
    createRotatingPlatform(8, 0, -180, 12, 1, 12, 0xff6b6b, 0.007);

    // Finish
    createPlatform(8, 0, -200, 20, 1, 20, 0x6bcf7f);
    createFinishLine(8, 3, -200);
}

// Clear world for new round
function clearWorld() {
    // Remove old obstacles and checkpoints from scene
    obstacles.forEach(obs => {
        scene.remove(obs.mesh);
        world.removeBody(obs.body);
    });

    ground.forEach(g => {
        scene.remove(g.mesh);
        world.removeBody(g.body);
    });

    checkpoints.forEach(cp => {
        scene.remove(cp.mesh);
    });

    if (finishLine) {
        scene.remove(finishLine.mesh);
    }

    obstacles = [];
    ground = [];
    checkpoints = [];
    finishLine = null;
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
function createRotatingPlatform(x, y, z, width, height, depth, color, speed = 0.005) {
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
        speed: 0.015, // Slower
        offset: offset
    });
}

// Create a spinning obstacle (like a windmill arm)
function createSpinningObstacle(x, y, z, width, height, depth, color, speed = 0.015) {
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
        speed: speed,
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
        opacity: 0.2
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
    const geometry = new THREE.RingGeometry(2.5, 3.5, 32);
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
    const geometry = new THREE.CylinderGeometry(5, 5, 0.5, 32);
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

// Create banana-shaped player (humanoid)
function createPlayer() {
    // Create a group for the banana character
    const bananaGroup = new THREE.Group();

    // Body (main banana shape - cylinder with rounded top/bottom using spheres)
    const bodyGeometry = new THREE.CylinderGeometry(PLAYER_SIZE * 0.8, PLAYER_SIZE * 0.9, PLAYER_HEIGHT - 0.5, 16);
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0xFFE135, // Bright banana yellow
        metalness: 0.2,
        roughness: 0.8
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    body.receiveShadow = true;
    bananaGroup.add(body);

    // Head (rounded top)
    const headGeometry = new THREE.SphereGeometry(PLAYER_SIZE * 0.7, 16, 16);
    const head = new THREE.Mesh(headGeometry, bodyMaterial);
    head.position.y = PLAYER_HEIGHT / 2 - 0.2;
    head.castShadow = true;
    head.receiveShadow = true;
    bananaGroup.add(head);

    // Eyes (sunglasses effect)
    const eyeGeometry = new THREE.SphereGeometry(0.15, 16, 16);
    const eyeMaterial = new THREE.MeshStandardMaterial({
        color: 0x000000,
        metalness: 0.8,
        roughness: 0.2
    });

    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.25, PLAYER_HEIGHT / 2 - 0.1, 0.5);
    bananaGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.25, PLAYER_HEIGHT / 2 - 0.1, 0.5);
    bananaGroup.add(rightEye);

    // Arms (cylinders)
    const armGeometry = new THREE.CylinderGeometry(0.12, 0.12, 0.7, 8);
    const armMaterial = new THREE.MeshStandardMaterial({
        color: 0xFFE135,
        metalness: 0.2,
        roughness: 0.8
    });

    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-0.7, 0.2, 0);
    leftArm.rotation.z = Math.PI / 6;
    leftArm.castShadow = true;
    bananaGroup.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(0.7, 0.2, 0);
    rightArm.rotation.z = -Math.PI / 6;
    rightArm.castShadow = true;
    bananaGroup.add(rightArm);

    // Hands (small spheres)
    const handGeometry = new THREE.SphereGeometry(0.15, 8, 8);
    const handMaterial = new THREE.MeshStandardMaterial({
        color: 0xFFFFFF, // White gloves
        metalness: 0.1,
        roughness: 0.9
    });

    const leftHand = new THREE.Mesh(handGeometry, handMaterial);
    leftHand.position.set(-0.85, -0.15, 0);
    leftHand.castShadow = true;
    bananaGroup.add(leftHand);

    const rightHand = new THREE.Mesh(handGeometry, handMaterial);
    rightHand.position.set(0.85, -0.15, 0);
    rightHand.castShadow = true;
    bananaGroup.add(rightHand);

    // Legs (cylinders)
    const legGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.5, 8);
    const legMaterial = new THREE.MeshStandardMaterial({
        color: 0xFFE135,
        metalness: 0.2,
        roughness: 0.8
    });

    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.25, -PLAYER_HEIGHT/2 - 0.2, 0);
    leftLeg.castShadow = true;
    bananaGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.25, -PLAYER_HEIGHT/2 - 0.2, 0);
    rightLeg.castShadow = true;
    bananaGroup.add(rightLeg);

    // Feet (red shoes)
    const footGeometry = new THREE.BoxGeometry(0.2, 0.15, 0.35);
    const footMaterial = new THREE.MeshStandardMaterial({
        color: 0xFF3030, // Red shoes
        metalness: 0.3,
        roughness: 0.7
    });

    const leftFoot = new THREE.Mesh(footGeometry, footMaterial);
    leftFoot.position.set(-0.25, -PLAYER_HEIGHT/2 - 0.45, 0.05);
    leftFoot.castShadow = true;
    bananaGroup.add(leftFoot);

    const rightFoot = new THREE.Mesh(footGeometry, footMaterial);
    rightFoot.position.set(0.25, -PLAYER_HEIGHT/2 - 0.45, 0.05);
    rightFoot.castShadow = true;
    bananaGroup.add(rightFoot);

    player = bananaGroup;
    scene.add(player);

    // Physics body (capsule shape for better movement)
    const shape = new CANNON.Sphere(PLAYER_SIZE);
    playerBody = new CANNON.Body({
        mass: 5,
        linearDamping: 0.9,
        angularDamping: 0.99,
        fixedRotation: true // Prevent the player from tipping over
    });
    playerBody.addShape(shape);
    playerBody.position.copy(RESPAWN_POSITION);
    world.addBody(playerBody);

    // Material for better physics interaction
    const playerMaterial = new CANNON.Material();
    const groundMaterial = new CANNON.Material();
    const playerGroundContact = new CANNON.ContactMaterial(
        playerMaterial,
        groundMaterial,
        { friction: 0.4, restitution: 0.1 }
    );
    world.addContactMaterial(playerGroundContact);
}

// Create CPU players
function createCPUPlayers() {
    for (let i = 0; i < CPU_COUNT; i++) {
        const cpuGroup = new THREE.Group();

        // Body (cylinder)
        const bodyGeometry = new THREE.CylinderGeometry(PLAYER_SIZE * 0.7, PLAYER_SIZE * 0.8, PLAYER_HEIGHT - 0.5, 16);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: CPU_COLORS[i],
            metalness: 0.2,
            roughness: 0.8
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.castShadow = true;
        body.receiveShadow = true;
        cpuGroup.add(body);

        // Head (sphere)
        const headGeometry = new THREE.SphereGeometry(PLAYER_SIZE * 0.6, 16, 16);
        const head = new THREE.Mesh(headGeometry, bodyMaterial);
        head.position.y = PLAYER_HEIGHT / 2 - 0.2;
        head.castShadow = true;
        head.receiveShadow = true;
        cpuGroup.add(head);

        // Simple face
        const eyeGeometry = new THREE.SphereGeometry(0.12, 16, 16);
        const eyeMaterial = new THREE.MeshStandardMaterial({
            color: 0x000000,
            metalness: 0.6,
            roughness: 0.3
        });

        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.2, PLAYER_HEIGHT / 2 - 0.1, 0.45);
        cpuGroup.add(leftEye);

        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.2, PLAYER_HEIGHT / 2 - 0.1, 0.45);
        cpuGroup.add(rightEye);

        // Arms
        const armGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.6, 8);
        const armMaterial = new THREE.MeshStandardMaterial({
            color: CPU_COLORS[i],
            metalness: 0.2,
            roughness: 0.8
        });

        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-0.6, 0.2, 0);
        leftArm.rotation.z = Math.PI / 6;
        leftArm.castShadow = true;
        cpuGroup.add(leftArm);

        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(0.6, 0.2, 0);
        rightArm.rotation.z = -Math.PI / 6;
        rightArm.castShadow = true;
        cpuGroup.add(rightArm);

        scene.add(cpuGroup);

        // Physics
        const cpuShape = new CANNON.Sphere(PLAYER_SIZE * 0.9);
        const cpuBody = new CANNON.Body({
            mass: 5,
            linearDamping: 0.9,
            angularDamping: 0.99,
            fixedRotation: true
        });
        cpuBody.addShape(cpuShape);

        // Spread CPU players at start
        const spreadX = (i - 2) * 3;
        const spreadZ = (i % 2) * 3;
        cpuBody.position.set(spreadX, 3, spreadZ);
        world.addBody(cpuBody);

        cpuPlayers.push({
            mesh: cpuGroup,
            body: cpuBody,
            color: CPU_COLORS[i],
            targetZ: -200, // Move towards finish
            speed: 3 + Math.random() * 2, // Random speed
            jumpTimer: Math.random() * 3,
            finished: false
        });
    }
}

// Update CPU AI
function updateCPUPlayers() {
    cpuPlayers.forEach((cpu, index) => {
        if (cpu.finished) return;

        // Simple AI: move forward with some variation
        const moveSpeed = cpu.speed;

        // Move towards finish line
        if (cpu.body.position.z > cpu.targetZ) {
            cpu.body.velocity.z = -moveSpeed;
        }

        // Random sideways movement to avoid obstacles
        const sideMove = Math.sin(Date.now() * 0.001 + index) * 0.5;
        cpu.body.velocity.x = sideMove;

        // Random jumping
        cpu.jumpTimer -= timeStep;
        if (cpu.jumpTimer <= 0) {
            if (Math.abs(cpu.body.velocity.y) < 0.5) {
                cpu.body.velocity.y = 8;
            }
            cpu.jumpTimer = 2 + Math.random() * 3;
        }

        // Respawn if fallen
        if (cpu.body.position.y < -20) {
            cpu.body.position.set((index - 2) * 3, 3, 0);
            cpu.body.velocity.set(0, 0, 0);
        }

        // Check if finished
        if (finishLine && cpu.body.position.distanceTo(finishLine.position) < 6) {
            cpu.finished = true;
        }

        // Sync mesh with physics
        cpu.mesh.position.copy(cpu.body.position);
        cpu.mesh.quaternion.copy(cpu.body.quaternion);
    });
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
    const startBtn = document.getElementById('start-btn');
    const restartBtn = document.getElementById('restart-btn');

    if (startBtn) {
        startBtn.addEventListener('click', startGame);
        console.log('Start button listener attached');
    } else {
        console.error('Start button not found!');
    }

    if (restartBtn) {
        restartBtn.addEventListener('click', restartGame);
    }

    window.addEventListener('resize', onWindowResize);
}

// Start game
function startGame() {
    console.log('startGame called');

    const startScreen = document.getElementById('start-screen');
    const gameHud = document.getElementById('game-hud');

    if (startScreen) {
        startScreen.classList.add('hidden');
        console.log('Start screen hidden');
    }
    if (gameHud) {
        gameHud.classList.remove('hidden');
        console.log('Game HUD shown');
    }

    gameState.isPlaying = true;
    gameState.startTime = Date.now();
    gameState.checkpointsPassed = 0;
    gameState.currentRound = 1;

    // Reset checkpoints
    checkpoints.forEach(cp => cp.passed = false);

    // Reset CPU players
    cpuPlayers.forEach((cpu, index) => {
        const spreadX = (index - 2) * 3;
        const spreadZ = (index % 2) * 3;
        cpu.body.position.set(spreadX, 3, spreadZ);
        cpu.body.velocity.set(0, 0, 0);
        cpu.finished = false;
    });

    updateCheckpointDisplay();
    updateRoundDisplay();

    console.log('Game started, round', gameState.currentRound);
}

// Restart game
function restartGame() {
    document.getElementById('win-screen').classList.add('hidden');
    respawnPlayer();
    createWorld(); // Recreate current round
    startGame();
}

// Next round
function nextRound() {
    gameState.currentRound++;
    if (gameState.currentRound > gameState.totalRounds) {
        winGame();
        return;
    }

    gameState.checkpointsPassed = 0;
    respawnPlayer();
    createWorld();

    // Reset CPU players
    cpuPlayers.forEach((cpu, index) => {
        const spreadX = (index - 2) * 3;
        const spreadZ = (index % 2) * 3;
        cpu.body.position.set(spreadX, 3, spreadZ);
        cpu.body.velocity.set(0, 0, 0);
        cpu.finished = false;
    });

    // Reset checkpoints
    checkpoints.forEach(cp => cp.passed = false);

    updateCheckpointDisplay();
    updateRoundDisplay();
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

// Update round display
function updateRoundDisplay() {
    document.getElementById('objective').textContent =
        `Round ${gameState.currentRound}/${gameState.totalRounds} - Reach the finish!`;
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

            if (distance < 4) {
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

    if (distance < 6) {
        if (gameState.currentRound < gameState.totalRounds) {
            // Go to next round
            setTimeout(() => {
                nextRound();
            }, 1000);
        } else {
            // Win the game
            winGame();
        }
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
        `Time: ${minutes}:${seconds.toString().padStart(2, '0')} - All ${gameState.totalRounds} Rounds Complete!`;

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
            // Check if player or CPU is on this platform
            const platformPos = obstacle.body.position;
            let someonOnPlatform = false;

            // Check player
            const playerPos = playerBody.position;
            let distance = Math.sqrt(
                Math.pow(playerPos.x - platformPos.x, 2) +
                Math.pow(playerPos.z - platformPos.z, 2)
            );
            if (distance < 5 && Math.abs(playerPos.y - platformPos.y) < 2) {
                someonOnPlatform = true;
            }

            // Check CPUs
            cpuPlayers.forEach(cpu => {
                const cpuPos = cpu.body.position;
                distance = Math.sqrt(
                    Math.pow(cpuPos.x - platformPos.x, 2) +
                    Math.pow(cpuPos.z - platformPos.z, 2)
                );
                if (distance < 5 && Math.abs(cpuPos.y - platformPos.y) < 2) {
                    someonOnPlatform = true;
                }
            });

            if (someonOnPlatform && !obstacle.falling) {
                obstacle.falling = true;
                obstacle.fallTimer = Date.now();
            }

            if (obstacle.falling) {
                const elapsed = Date.now() - obstacle.fallTimer;
                if (elapsed > 1200) { // LONGER DELAY - fall after 1.2 seconds
                    obstacle.body.position.y -= 0.08; // Slower fall
                    obstacle.mesh.position.copy(obstacle.body.position);

                    // Reset after falling far enough
                    if (obstacle.body.position.y < -50) {
                        obstacle.body.position.y = obstacle.originalY;
                        obstacle.mesh.position.copy(obstacle.body.position);
                        obstacle.falling = false;
                    }
                } else {
                    // Shake effect before falling
                    obstacle.mesh.position.y = obstacle.originalY + Math.sin(elapsed * 0.03) * 0.15;
                }
            }
        }
    });
}

// Update camera
function updateCamera() {
    const playerPos = playerBody.position;

    // Third-person camera
    const cameraDistance = 15;
    const cameraHeight = 6;

    const targetX = playerPos.x + Math.sin(cameraRotation.x) * cameraDistance;
    const targetY = playerPos.y + cameraHeight + Math.sin(cameraRotation.y) * cameraDistance;
    const targetZ = playerPos.z + Math.cos(cameraRotation.x) * cameraDistance;

    camera.position.x = targetX;
    camera.position.y = targetY;
    camera.position.z = targetZ;

    camera.lookAt(playerPos.x, playerPos.y + 1, playerPos.z);
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

    // Update CPU players
    updateCPUPlayers();

    // Update obstacles
    updateObstacles();

    // Sync player mesh with physics body
    player.position.copy(playerBody.position);

    // Keep banana upright
    player.rotation.y = -cameraRotation.x;
    player.rotation.x = 0;
    player.rotation.z = 0;

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
