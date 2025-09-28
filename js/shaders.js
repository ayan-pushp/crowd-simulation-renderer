// js/shaders.js

export const triVS = `
  attribute vec2 a_pos;
  attribute vec3 a_color;
  varying vec3 v_color;
  void main() {
    gl_Position = vec4(a_pos, 0.0, 1.0);
    v_color = a_color;
  }
`;

export const triFS = `
  precision mediump float;
  varying vec3 v_color;
  void main() {
    gl_FragColor = vec4(v_color, 1.0);
  }
`;

export const pointVS = `
  attribute vec2 a_pos;
  uniform float u_pointSize;
  void main() {
    gl_Position = vec4(a_pos, 0.0, 1.0);
    gl_PointSize = u_pointSize;
  }
`;

export const pointFS = `
  precision mediump float;
  void main() {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
  }
`;