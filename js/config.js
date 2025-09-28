// --- STATE ---
// These variables are mutated by the simulation and renderer files.
export let points = [];
export let triangles = [];
export let people = [];
export let obstacle = { cx: 0.5, cy: 0.5, w: 0.28, h: 0.18, angle: -25 * Math.PI / 180 };

// --- CONFIG ---
export const PEOPLE_PER_TRI = 4;
export const NUM_PEOPLE_TO_GENERATE = 50;
export const NUM_INTERIOR_POINTS = 5;

// --- DOM ELEMENTS ---
export const glCanvas = document.getElementById('glcanvas');
export const overlay = document.getElementById('overlay');
export const diag = document.getElementById('diag');