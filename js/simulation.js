import * as config from './config.js';
import { rand, pointInPolygon, pointInTriangle, dist2 } from './utils.js';

// Re-export state for easier access from other modules if needed
export let state = {
    points: config.points,
    triangles: config.triangles,
    people: config.people,
    obstacle: config.obstacle,
};

export function obstacleCorners(obj) {
    const { cx, cy, w, h, angle } = obj;
    const hw = w / 2, hh = h / 2;
    const ca = Math.cos(angle), sa = Math.sin(angle);
    const corners = [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]];
    return corners.map(([dx, dy]) => ({ x: cx + dx * ca - dy * sa, y: cy + dx * sa + dy * ca }));
}

function updateDiagnostics() {
    if (config.diag) {
        const validTriangles = state.triangles.filter(t => t.valid).length;
        config.diag.innerText = `tri: ${state.triangles.length} (valid ${validTriangles}) pts: ${state.points.length} ppl: ${state.people.length}`;
    }
}

export function generatePoints(nInterior = config.NUM_INTERIOR_POINTS) {
    state.points.length = 0;
    const bb = [{ x: 0.03, y: 0.03 }, { x: 0.97, y: 0.03 }, { x: 0.97, y: 0.97 }, { x: 0.03, y: 0.97 }];
    state.points.push(...bb);
    for (let i = 0; i < nInterior; i++) {
        state.points.push({ x: rand(0.05, 0.95), y: rand(0.05, 0.95) });
    }
    const occ = obstacleCorners(state.obstacle);
    state.points.push(...occ);
    updateDiagnostics();
}

function removeTrianglesInsideObstacle() {
    const poly = obstacleCorners(state.obstacle);
    for (const t of state.triangles) {
        t.valid = !pointInPolygon(t.centroid, poly);
    }
}

export function updateTriangleColors() {
    for (const t of state.triangles) {
        if (!t.valid) {
            t.color = [0.95, 0.95, 0.95]; // Keep invalid triangles a light grey
            continue;
        }
        const d = t.peopleCount;
        // **IMPROVEMENT:** Using brighter, more distinct colors.
        if (d === config.PEOPLE_PER_TRI) {
            t.color = [0.1, 1.0, 0.1]; // Bright Green
        } else if (d > config.PEOPLE_PER_TRI) {
            const factor = Math.min(1, (d - config.PEOPLE_PER_TRI) / Math.max(1, config.PEOPLE_PER_TRI));
            // Fades from light red to bright red
            t.color = [1.0, 0.6 - factor * 0.5, 0.6 - factor * 0.5];
        } else {
            const factor = Math.min(1, (config.PEOPLE_PER_TRI - d) / Math.max(1, config.PEOPLE_PER_TRI));
            // Fades from light blue to bright blue
            t.color = [0.6 - factor * 0.5, 0.6 - factor * 0.5, 1.0];
        }
    }
}

export function assignPeopleToTriangles() {
    for (const t of state.triangles) t.peopleCount = 0;

    for (const p of state.people) {
        let assigned = false;
        for (let i = 0; i < state.triangles.length; i++) {
            const t = state.triangles[i];
            if (!t.valid) continue;
            const [i0, i1, i2] = t.indices;
            const a = state.points[i0], b = state.points[i1], c = state.points[i2];
            if (pointInTriangle(p, a, b, c)) {
                t.peopleCount++;
                p.triIndex = i;
                assigned = true;
                break;
            }
        }
        if (!assigned) {
            const valids = state.triangles.filter(t => t.valid);
            if (valids.length > 0) {
                let best = 0, bd = Infinity;
                for (let i = 0; i < valids.length; i++) {
                    const d2 = dist2(p, valids[i].centroid);
                    if (d2 < bd) { bd = d2; best = i; }
                }
                const tri = valids[best];
                p.x = tri.centroid.x + (Math.random() - 0.5) * 0.008;
                p.y = tri.centroid.y + (Math.random() - 0.5) * 0.008;
                tri.peopleCount++;
                p.triIndex = state.triangles.indexOf(tri);
            }
        }
    }
}

export function generatePeople(num = config.NUM_PEOPLE_TO_GENERATE) {
    state.people.length = 0;
    const valid = state.triangles.filter(t => t.valid);
    if (valid.length === 0) return;
    for (let i = 0; i < num; i++) {
        const t = valid[Math.floor(Math.random() * valid.length)];
        const [i0, i1, i2] = t.indices;
        const p0 = state.points[i0], p1 = state.points[i1], p2 = state.points[i2];
        let r1 = Math.random(), r2 = Math.random();
        if (r1 + r2 >= 1) { r1 = 1 - r1; r2 = 1 - r2; }
        const x = p0.x + r1 * (p1.x - p0.x) + r2 * (p2.x - p0.x);
        const y = p0.y + r1 * (p1.y - p0.y) + r2 * (p2.y - p0.y);
        state.people.push({ x, y, triIndex: -1 });
    }
    assignPeopleToTriangles();
    updateTriangleColors();
}

export function buildTriangulation() {
    // Ensure obstacle corners are the last 4 points
    const base = state.points.slice(0, Math.max(0, state.points.length - 4));
    const oc = obstacleCorners(state.obstacle);
    base.push(...oc);
    state.points = base; // Replace the global points array

    const ptsArray = state.points.map(p => [p.x, p.y]);
    let d = null;
    try {
        d = Delaunator.from(ptsArray);
    } catch (err) {
        console.error('Delaunator failed', err);
    }

    state.triangles.length = 0;
    if (d) {
        for (let t = 0; t < d.triangles.length; t += 3) {
            const i0 = d.triangles[t], i1 = d.triangles[t + 1], i2 = d.triangles[t + 2];
            const a = state.points[i0], b = state.points[i1], c = state.points[i2];
            const cx = (a.x + b.x + c.x) / 3, cy = (a.y + b.y + c.y) / 3;
            state.triangles.push({ indices: [i0, i1, i2], centroid: { x: cx, y: cy }, peopleCount: 0, valid: true });
        }
    }

    removeTrianglesInsideObstacle();
    assignPeopleToTriangles();
    updateTriangleColors();
    updateDiagnostics();
}