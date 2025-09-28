// js/main.js
import { glCanvas, overlay, obstacle } from './config.js';
import * as sim from './simulation.js';
import { initRenderer, drawAll } from './renderer.js';
import { screenToNorm, pointInPolygon } from './utils.js';

// --- UI & Interaction State ---
let uiState = {
    showEdges: true,
    showPoints: false,
    draggingPerson: false,
    selectedPersonIndex: -1,
};
let dragObstacle = {
    dragging: false,
    selected: false,
    mode: 'move',
    lastMouse: null,
};
let personMouseOffset = { x: 0, y: 0 };

// --- Event Handlers ---
function handleResize() {
    const DPR = window.devicePixelRatio || 1;
    glCanvas.width = Math.floor(window.innerWidth * DPR);
    glCanvas.height = Math.floor(window.innerHeight * DPR);
    overlay.width = glCanvas.width;
    overlay.height = glCanvas.height;
    
    glCanvas.style.width = `${window.innerWidth}px`;
    glCanvas.style.height = `${window.innerHeight}px`;
    overlay.style.width = glCanvas.style.width;
    overlay.style.height = glCanvas.style.height;

    const gl = glCanvas.getContext('webgl');
    if (gl) gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    drawAll(uiState);
}

function handleMouseDown(e) {
    const rect = overlay.getBoundingClientRect();
    const sx = e.clientX, sy = e.clientY;

    let hitPerson = -1, hitDist = Infinity;
    sim.state.people.forEach((p, i) => {
        const px = rect.left + p.x * rect.width;
        const py = rect.top + p.y * rect.height;
        const dx = sx - px, dy = sy - py;
        const d2 = dx * dx + dy * dy;
        if (d2 < (12 * (window.devicePixelRatio || 1)) ** 2 && d2 < hitDist) {
            hitPerson = i;
            hitDist = d2;
        }
    });

    if (hitPerson >= 0) {
        uiState.draggingPerson = true;
        uiState.selectedPersonIndex = hitPerson;
        dragObstacle.dragging = false;
        dragObstacle.selected = false;
        const pos = screenToNorm(sx, sy, overlay);
        personMouseOffset.x = pos.x - sim.state.people[hitPerson].x;
        personMouseOffset.y = pos.y - sim.state.people[hitPerson].y;
        return;
    }

    const pos = screenToNorm(e.clientX, e.clientY, overlay);
    if (pointInPolygon(pos, sim.obstacleCorners(obstacle))) {
        dragObstacle.selected = true;
        dragObstacle.dragging = true;
        dragObstacle.lastMouse = { x: e.clientX, y: e.clientY };
        dragObstacle.mode = e.shiftKey ? 'rotate' : 'move';
    } else {
        dragObstacle.selected = false;
    }
}

function handleMouseMove(e) {
    if (uiState.draggingPerson && uiState.selectedPersonIndex >= 0) {
        const pos = screenToNorm(e.clientX, e.clientY, overlay);
        const person = sim.state.people[uiState.selectedPersonIndex];
        person.x = Math.min(0.99, Math.max(0.01, pos.x - personMouseOffset.x));
        person.y = Math.min(0.99, Math.max(0.01, pos.y - personMouseOffset.y));
        drawAll(uiState);
        return;
    }

    if (!dragObstacle.dragging || !dragObstacle.selected) return;
    const pos = screenToNorm(e.clientX, e.clientY, overlay);

    if (e.shiftKey || dragObstacle.mode === 'rotate') {
        const prev = screenToNorm(dragObstacle.lastMouse.x, dragObstacle.lastMouse.y, overlay);
        const a1 = Math.atan2(prev.y - obstacle.cy, prev.x - obstacle.cx);
        const a2 = Math.atan2(pos.y - obstacle.cy, pos.x - obstacle.cx);
        let delta = a2 - a1;
        if (delta > Math.PI) delta -= 2 * Math.PI;
        if (delta < -Math.PI) delta += 2 * Math.PI;
        obstacle.angle += delta;
        dragObstacle.lastMouse = { x: e.clientX, y: e.clientY };
    } else {
        const halfW = obstacle.w / 2;
        const halfH = obstacle.h / 2;
        obstacle.cx = Math.max(halfW, Math.min(1 - halfW, pos.x));
        obstacle.cy = Math.max(halfH, Math.min(1 - halfH, pos.y));
    }
    sim.buildTriangulation();
    drawAll(uiState);
}

function handleMouseUp() {
    if (uiState.draggingPerson) {
        uiState.draggingPerson = false;
        sim.assignPeopleToTriangles();
        sim.updateTriangleColors();
        drawAll(uiState);
        uiState.selectedPersonIndex = -1;
    }
    dragObstacle.dragging = false;
    dragObstacle.lastMouse = null;
}

function handleWheel(e) {
    e.preventDefault();
    const s = e.deltaY > 0 ? 0.95 : 1.05;
    obstacle.w *= s;
    obstacle.h *= s;
    sim.buildTriangulation();
    drawAll(uiState);
}

function handleKeyDown(e) {
    let needsUpdate = true;
    switch (e.key.toLowerCase()) {
        case 'r': obstacle.angle += 15 * Math.PI / 180; break;
        case '+': case '=': obstacle.w *= 1.05; obstacle.h *= 1.05; break;
        case '-': obstacle.w *= 0.95; obstacle.h *= 0.95; break;
        case 'c': uiState.showEdges = !uiState.showEdges; needsUpdate = false; break;
        default: needsUpdate = false;
    }
    if (needsUpdate) sim.buildTriangulation();
    drawAll(uiState);
}

// --- Initial Setup ---
function initialize() {
    // Attach event listeners
    window.addEventListener('resize', handleResize);
    overlay.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    overlay.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);

    document.getElementById('regen').addEventListener('click', () => {
        sim.generatePoints();
        sim.buildTriangulation();
        sim.generatePeople();
        drawAll(uiState);
    });
    // document.getElementById('retri').addEventListener('click', () => {
    //     sim.buildTriangulation();
    //     drawAll(uiState);
    // });
    document.getElementById('centerObs').addEventListener('click', () => {
        obstacle.cx = 0.5; obstacle.cy = 0.5;
        sim.buildTriangulation();
        drawAll(uiState);
    });
    document.getElementById('togglePts').addEventListener('change', (e) => {
        uiState.showPoints = e.target.checked;
        drawAll(uiState);
    });

    // Initial simulation setup
    initRenderer();
    handleResize(); // Set initial size
    sim.generatePoints();
    sim.buildTriangulation();
    sim.generatePeople();
    drawAll(uiState);
}

initialize();