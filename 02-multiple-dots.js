// set up canvas
const canvas = document.getElementById("glcanvas");

// get gl context
const gl = canvas.getContext("webgl");
if (!gl) {
  console.error("WebGL not supported");
}

// --- Shaders ---
const vsSource = `
    attribute vec2 a_position; // EXPLAIN
    attribute vec3 a_color; 
    varying vec3 v_color; 
    void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        gl_PointSize = 12.0; 
        v_color = a_color;
    }
`;

const fsSource = `
    precision mediump float;
    uniform vec4 u_color; // EXPLAIN
    varying vec3 v_color; 
    void main() {
        // gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
        // gl_FragColor = u_color;
        gl_FragColor = vec4(v_color, 1.0);
    }
`;

function compileShader(src, type) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(s);
    gl.deleteShader(s);
    throw new Error("Shader compile failed: " + info);
  }
  return s;
}

function createProgram(vsSrc, fsSrc) {
  const v = compileShader(vsSrc, gl.VERTEX_SHADER);
  const f = compileShader(fsSrc, gl.FRAGMENT_SHADER);
  const p = gl.createProgram();
  gl.attachShader(p, v);
  gl.attachShader(p, f);
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(p);
    gl.deleteProgram(p);
    throw new Error("Program link failed: " + info);
  }
  return p;
}

const program = createProgram(vsSource, fsSource);
gl.useProgram(program);

// --- Geometry: vertex positions ---
// WebGL uses clip space coordinates from -1 to 1, where [0,0] is the center.
//
//put data in buffer
// vertices -- a flat float32 array representing xy coordinates of three dots
// EXPLAIN
const vertices = new Float32Array([0.0, 0.0, 0.5, 0.0, 0.0, 0.3]);
// const sqrt3 = Math.sqrt(3);
// const r = 0.5; // radius of an equilateral triangle
// const vertices = new Float32Array([0, 0, 0.5, 0, 0, 0.3]);
// const vertices = new Float32Array([ r * sqrt3, -r / 2, 0, r, -r * sqrt3, -r / 2, ]);
// const vertices = new Float32Array( Array(240) .fill(0.0) .map((d, i) => [Math.cos(i / 40), Math.sin(i / 40)]) .flat());
const colors = new Float32Array([1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0]);

// EXPLAIN - create buffer object in GPU and upload vertices data into the buffer
const posBuffer = gl.createBuffer(); //figures
gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
// link vertices data to the the position attribute, "a_position", in shader
const aPosLoc = gl.getAttribLocation(program, "a_position");
gl.enableVertexAttribArray(aPosLoc);
gl.vertexAttribPointer(aPosLoc, 2, gl.FLOAT, false, 0, 0);
//EXPLAIN - Question: how does gl associate a_position with the uploaded vertices data in the buffer? (figure)

// [option 1] set up global, uniform "u_color"
// const uColor = gl.getUniformLocation(program, "u_color");
// // [option 2] set up individual, attribute "a_color"
const colBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colBuffer);
gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
const aColLoc = gl.getAttribLocation(program, "a_color");
gl.enableVertexAttribArray(aColLoc);
gl.vertexAttribPointer(aColLoc, 3, gl.FLOAT, false, 0, 0);

// --- Render ---
function render(t) {
  console.log("rendering at time", t);
  // Setting drawing area or 'viewport'
  gl.viewport(0, 0, canvas.width, canvas.height);

  //clear the canvas
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  // gl.clearColor(0.0, 0.0, Math.sin(t / 200), 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // set the dot color uniform (RGBA). e.g., Red
  // gl.uniform4f(uColor, 0.0, 0.0, 1.0, 1.0); // DEMO1 try #0055ff

  // gl.drawArrays(mode, first, count)
  // gl.drawArrays(gl.POINTS, 0, 3); // draw three dots
  // gl.drawArrays(gl.POINTS, 0, Math.floor(vertices.length / 2));

  gl.drawArrays(gl.TRIANGLES, 0, 3); // DEMO
  // gl.drawArrays(gl.POINTS, 0, 2);
  // gl.drawArrays(gl.POINTS, 1, 2);
  // gl.drawArrays(gl.POINTS, 2, 1);
  // gl.drawArrays(gl.POINTS, 1, 3); // DEMO NOTE ERROR going out-of-bound, see warning in brower debug console

  // DEMO animation
  // window.requestAnimationFrame(render);
}

render(0);
