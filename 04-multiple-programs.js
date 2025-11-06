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
    void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        gl_PointSize = 12.0; 
        v_color = a_color;
    }
`;

const fsSource = `
    precision mediump float;
    varying vec3 v_color; 
    void main() {
        gl_FragColor = vec4(v_color, 1.0);
    }
`;

const vsSource2 = `
    attribute vec2 a_position; 
    attribute vec3 a_color; 
    varying vec3 v_color; 
    void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_color = a_color;
    }
`;

const fsSource2 = `
    precision mediump float;
    varying vec3 v_color; 
    void main() {
        gl_FragColor = vec4(v_color+0.3, 1.0);
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

// program 1
const program = createProgram(vsSource, fsSource); //color triangle
const program2 = createProgram(vsSource2, fsSource2); //texture

// uniform

// --- vertex data ---
const vertices = new Float32Array([-0.1, 0.0, -0.4, 0.5, -0.7, 0.0]);
const vertices2 = new Float32Array([0.0, 0.0, 0.5, 0.0, 0.5, 0.5, 0.0, 0.5]);
const colors = new Float32Array([
  1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0,
]);

// create buffers and upload data
// buffer for vertices
const verticesBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
// buffer for colors
const colorsBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);
gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
// buffer for vertices2
const vertices2Buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertices2Buffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices2, gl.STATIC_DRAW);

//render start
gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

// program 1
gl.useProgram(program);

const aPosLoc = gl.getAttribLocation(program, "a_position");
const aColLoc = gl.getAttribLocation(program, "a_color");

//use verticesBuffer for a_position at aPosLoc
gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
gl.enableVertexAttribArray(aPosLoc);
gl.vertexAttribPointer(aPosLoc, 2, gl.FLOAT, false, 0, 0);

//use colorsBuffer for a_color at aColLoc
gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);
gl.enableVertexAttribArray(aColLoc);
gl.vertexAttribPointer(aColLoc, 3, gl.FLOAT, false, 0, 0);

//draw triangle
gl.drawArrays(gl.TRIANGLES, 0, 3);

// program 2
gl.useProgram(program2);
const aPosLoc2 = gl.getAttribLocation(program2, "a_position");
const aColLoc2 = gl.getAttribLocation(program2, "a_color");

// attribute "a_position"
gl.bindBuffer(gl.ARRAY_BUFFER, vertices2Buffer);
gl.enableVertexAttribArray(aPosLoc2);
gl.vertexAttribPointer(aPosLoc2, 2, gl.FLOAT, false, 0, 0);
// attribute "a_color"
gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);
gl.enableVertexAttribArray(aColLoc2);
gl.vertexAttribPointer(aColLoc2, 3, gl.FLOAT, false, 0, 0);

// draw square
gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
