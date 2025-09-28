import { glCanvas, overlay } from './config.js';
import * as shaders from './shaders.js';
import { state, obstacleCorners } from './simulation.js';
import { toClip } from './utils.js';

// --- CONTEXT CREATION ---
// Create contexts once and export them to be used by other modules.
export const ctx = overlay.getContext('2d');
export const gl = glCanvas.getContext('webgl', { antialias: true });

let triProgram, pointProgram;
let buffers = {};

function createShader(type, source) {
    if (!gl) return null;
    const s = gl.createShader(type);
    gl.shaderSource(s, source);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(s));
    return s;
}

function createProgram(vs, fs) {
    if (!gl) return null;
    const p = gl.createProgram();
    gl.attachShader(p, createShader(gl.VERTEX_SHADER, vs));
    gl.attachShader(p, createShader(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) console.error(gl.getProgramInfoLog(p));
    return p;
}

export function initRenderer() {
    // **FIX:** Hide the WebGL canvas. It's causing a layout issue where it appears
    // as a blank space at the top of the page. The 2D overlay canvas is now
    // responsible for rendering the entire scene, so the WebGL canvas can be hidden.
    glCanvas.style.display = 'none';

    if (!gl) {
        console.warn('WebGL not available — overlay will still show visualization');
        return;
    }
    triProgram = createProgram(shaders.triVS, shaders.triFS);
    pointProgram = createProgram(shaders.pointVS, shaders.pointFS);
}

function drawOverlay(uiState) {
    const { showPoints, draggingPerson, selectedPersonIndex } = uiState;
    const DPR = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, overlay.width, overlay.height);

    ctx.save();
    ctx.scale(DPR, DPR);

    draw2DTriangles();

    const occ = obstacleCorners(state.obstacle);
    ctx.beginPath();
    occ.forEach((p, i) => {
        const x = p.x * window.innerWidth;
        const y = p.y * window.innerHeight;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = 'rgba(100, 100, 100, 0.95)'; // Dark grey
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    state.people.forEach((p, i) => {
        const px = p.x * window.innerWidth;
        const py = p.y * window.innerHeight;
        ctx.beginPath();
        const isSelected = (i === selectedPersonIndex) && draggingPerson;
        if (isSelected) {
            ctx.arc(px, py, 7, 0, Math.PI * 2);
            ctx.fillStyle = '#000';
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'white';
            ctx.stroke();
        } else {
            ctx.arc(px, py, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#000';
            ctx.fill();
        }
    });

    if (showPoints) {
        state.points.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x * window.innerWidth, p.y * window.innerHeight, 2, 0, Math.PI * 2);
            ctx.fillStyle = '#444';
            ctx.fill();
        });
    }

    ctx.restore();
}

function draw2DTriangles() {
    for (const t of state.triangles) {
        if (!t.valid) continue;
        const [i0, i1, i2] = t.indices;
        const a = state.points[i0], b = state.points[i1], c = state.points[i2];
        ctx.beginPath();
        ctx.moveTo(a.x * window.innerWidth, a.y * window.innerHeight);
        ctx.lineTo(b.x * window.innerWidth, b.y * window.innerHeight);
        ctx.lineTo(c.x * window.innerWidth, c.y * window.innerHeight);
        ctx.closePath();
        const col = t.color;
        ctx.fillStyle = `rgba(${Math.floor(col[0] * 255)},${Math.floor(col[1] * 255)},${Math.floor(col[2] * 255)},0.7)`;
        ctx.fill();
        ctx.strokeStyle = '#111';
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }
}

export function drawAll(uiState) {
    drawOverlay(uiState);
}