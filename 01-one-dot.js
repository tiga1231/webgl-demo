// EXPLAIN set up a canvas
const canvas = document.getElementById("glcanvas");
// [optional] handle high-density display via devicePixelRatio
// const dpr = window.devicePixelRatio || 1;
// console.log(`Canvas w and h: ${canvas.clientWidth} x ${canvas.clientHeight}`);
// canvas.style.height = `${canvas.clientHeight}px`;
// canvas.style.width = `${canvas.clientWidth}px`;
// canvas.width = Math.floor(canvas.clientWidth * dpr);
// canvas.height = Math.floor(canvas.clientHeight * dpr);

// EXPLAIN get gl context
const gl = canvas.getContext("webgl");
if (!gl) {
  console.error("WebGL not supported");
}

// EXPLAIN Shaders
const vsSource = `
    attribute vec2 a_position; // DEMO4
    void main() {
        gl_Position = vec4(0.0, 0.0, 0.0, 1.0); // DEMO2
        gl_PointSize = 10.0; // DEMO3
        // gl_Position = vec4(a_position, 0.0, 1.0); // DEMO4
    }
`;

const fsSource = `
    precision mediump float;
    void main() {
        // float x = gl_PointCoord.x;
        // float y = gl_PointCoord.y;
        // if (x + y < 0.5){ // draw on board
        // if (x*x + y*y < 0.25){ // draw on board
        // if ((x-0.5)*(x-0.5) + (y-0.5)*(y-0.5) < 0.25){ // draw on board
            gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
        // } else {
            // discard;
        // }

    }
`;

// EXPLAIN  Shader utility functions
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

// EXPLAIN program == vert_shader + frag_shader
const program = createProgram(vsSource, fsSource);
gl.useProgram(program);

const aPosLoc = gl.getAttribLocation(program, "a_position");

function render(t) {
  // Setting drawing area or 'viewport'
  gl.viewport(0, 0, canvas.width, canvas.height);
  // gl.viewport(0, 0, canvas.width / 2, canvas.height); //DEMO0

  //clear the canvas
  gl.clearColor(0.0, 0.0, 0.0, 1.0); // Black DEMO1
  gl.clear(gl.COLOR_BUFFER_BIT);

  // draw a single point
  gl.vertexAttrib2f(aPosLoc, 0.0, 0.0);
  // DEMO4
  // gl.vertexAttrib2f(aPosLoc, Math.sin(t / 500), 0.0);
  // gl.vertexAttrib2f(aPosLoc, 0.9 * Math.sin(t / 1000), 0.3 * Math.cos(t / 400));
  gl.drawArrays(gl.POINTS, 0, 1);
  // DEMO5
  // for (let i = 0; i < 100; i++) {
  //   gl.vertexAttrib2f(
  //     aPosLoc,
  //     Math.sin(i / 100 + t / 300),
  //     Math.cos(i / 200 + t / 300),
  //   );
  //   gl.drawArrays(gl.POINTS, 0, 1);
  // }
  // DEMO animation
  // window.requestAnimationFrame(render);
}

// EXPLAIN where all the drawing happens
render(0);
