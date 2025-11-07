// Set up canvas
const canvas = document.getElementById("glcanvas");

// [optional] handle high-density display via devicePixelRatio
// const dpr = window.devicePixelRatio || 1;
// console.log(`Canvas w and h: ${canvas.clientWidth} x ${canvas.clientHeight}`);
// canvas.style.height = `${canvas.clientHeight}px`;
// canvas.style.width = `${canvas.clientWidth}px`;
// canvas.width = Math.floor(canvas.clientWidth * dpr);
// canvas.height = Math.floor(canvas.clientHeight * dpr);

// Get gl context
const gl = canvas.getContext("webgl");
if (!gl) {
  console.error("WebGL not supported");
}

// Shaders
const vsSource = `
    attribute vec2 a_position; 
    void main() {
        // gl_Position = vec4(0.0, 0.0, 0.0, 1.0); // hard-coded position
        gl_Position = vec4(a_position, 0.0, 1.0); 
        gl_PointSize = 20.0; 
    }
`;

const fsSource = `
    precision mediump float;
    void main() {
        gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);
        // // custom point shape and color
        // float x = gl_PointCoord.x;
        // float y = gl_PointCoord.y;
        // float d = distance(vec2(x,y), vec2(0.5,0.5));
        // if (d < 0.5){ 
        //     gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);
        //     // try this:
        //     // float d2 = distance(vec2(x,y), vec2(0.7,0.3));
        //     // float c = pow(1.0-d2, 2.0);
        //     // gl_FragColor = vec4(c, c, 0.0, 1.0);
        // } else {
        //     discard;
        // }
    }
`;

//Shader and gl program utility functions
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

// program == vert_shader + frag_shader
const program = createProgram(vsSource, fsSource);
gl.useProgram(program);

// static variables for rendering
const aPosLoc = gl.getAttribLocation(program, "a_position");

function render(t) {
  console.log(`render(t=${t})`);
  // Setting drawing area or 'viewport'
  gl.viewport(0, 0, canvas.width, canvas.height);

  //clear the canvas
  gl.clearColor(0.1, 0.1, 0.1, 1.0); // background color
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.vertexAttrib2f(aPosLoc, 0.0, 0.0);
  // now you try: set a_position to (0.5, 0.0)
  // gl.vertexAttrib2f(aPosLoc, 0.5, 0.0);

  // draw a single point
  gl.drawArrays(gl.POINTS, 0, 1);

  // DEMO4:
  // gl.vertexAttrib2f(aPosLoc, Math.sin(t / 500), 0.0);
  // gl.vertexAttrib2f(aPosLoc, 0.9 * Math.sin(t / 1000), 0.3 * Math.cos(t / 400));
  //
  // DEMO5: multiple points via a for loop
  // for (let i = 0; i < 100; i++) {
  //   gl.vertexAttrib2f(
  //     aPosLoc,
  //     0.9 * Math.cos(i / 80 + t / 500),
  //     0.9 * Math.sin(i / 80 + t / 400),
  //   );
  //   gl.drawArrays(gl.POINTS, 0, 1);
  // }
  // animation
  window.requestAnimationFrame(render);
}

render(0); // where the drawing happens
