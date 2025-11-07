// set up canvas
const canvas = document.getElementById("glcanvas");

// get gl context
const gl = canvas.getContext("webgl");
if (!gl) {
  console.error("WebGL not supported");
}

// --- Shaders ---
const vsSource = `
    attribute vec2 a_position; 
    attribute vec3 a_color; 
    varying vec3 v_color; 
    uniform mat2 u_rotate; 
    void main() {
        gl_Position = vec4(u_rotate * a_position, 0.0, 1.0);
        gl_PointSize = 12.0; 
        v_color = a_color;
    }
`;

const fsSource = `
    precision mediump float;
    uniform vec3 u_color; 
    varying vec3 v_color; 
    void main() {
        // gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0); // hard-coded color
        // gl_FragColor = u_color; // uniform color
        gl_FragColor = vec4(v_color, 1.0); // varying color
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
// data -- a flat float32 arrays representing
// xy coordinates of three dots
const vertices = new Float32Array([0.0, 0.0, 0.5, 0.0, 0.0, 0.3]);
// rgb colors of three dots
const colors = new Float32Array([1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0]);

// create a buffer object in GPU and upload vertices data into the buffer
const posBuffer = gl.createBuffer(); // create buffer
gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer); // bind buffer to "ARRAY_BUFFER"
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW); // upload data to the buffer in ARRAY_BUFFER

// link vertices data to the the position attribute "a_position" in shader
const aPosLoc = gl.getAttribLocation(program, "a_position");
gl.enableVertexAttribArray(aPosLoc);
gl.vertexAttribPointer(aPosLoc, 2, gl.FLOAT, false, 0, 0);

// [option 1] set up global, uniform "u_color"
const uColor = gl.getUniformLocation(program, "u_color");
// // [option 2] set up per-vertex attribute "a_color"
const colBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colBuffer);
gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
const aColLoc = gl.getAttribLocation(program, "a_color");
gl.enableVertexAttribArray(aColLoc);
gl.vertexAttribPointer(aColLoc, 3, gl.FLOAT, false, 0, 0);

// get the reference to u_rotate
const uRotate = gl.getUniformLocation(program, "u_rotate");

// --- Render ---
function render(t) {
  console.log(`render(t=${t})`);

  // Setting drawing area or 'viewport'
  gl.viewport(0, 0, canvas.width, canvas.height);

  //clear the canvas
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  // gl.clearColor(0.0, 0.0, Math.sin(t / 300), 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // set the color uniform (RGBA)
  // gl.uniform4f(uColor, 0.0, 0.0, 1.0, 1.0);

  //set rotation matrix u_rotate
  let [c, s] = [Math.cos(t / 500), Math.sin(t / 500)];
  gl.uniformMatrix2fv(uRotate, false, new Float32Array([c, s, -s, c]));

  // gl.drawArrays(mode, first, count)
  gl.drawArrays(gl.TRIANGLES, 0, 3); // draw triangle
  gl.drawArrays(gl.POINTS, 0, 3); // draw three dots

  // now comment out prev two lines, then try:
  // gl.drawArrays(gl.POINTS, 0, 2);
  // gl.drawArrays(gl.POINTS, 1, 2);
  // gl.drawArrays(gl.POINTS, 2, 1);
  // gl.drawArrays(gl.POINTS, 1, 3); // NOTE ERROR: going out-of-bound, see warning in brower debug console

  // animation
  window.requestAnimationFrame(render);
}

render(0);
