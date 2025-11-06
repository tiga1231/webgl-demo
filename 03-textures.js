// set up canvas
const canvas = document.getElementById("glcanvas");

// get gl context
const gl = canvas.getContext("webgl");
if (!gl) {
  console.error("WebGL not supported");
}

// --- Shaders ---
const vsSource = `
    attribute vec4 a_position;
    attribute vec2 a_texcoord; // MARK
    varying vec2 v_texcoord;

    void main() {
        gl_Position =  a_position;
        // Pass the texcoord to the fragment shader.
        v_texcoord = a_texcoord;
    }
`;

const fsSource = `
    precision mediump float;
    
    varying vec2 v_texcoord;
    uniform sampler2D u_texture;

    void main() {
        gl_FragColor = texture2D(u_texture, v_texcoord);
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

// uniforms
// const uColor = gl.getUniformLocation(program, "u_color");
const uTextureLoc = gl.getUniformLocation(program, "u_texture");
console.log("uTextureLoc", uTextureLoc);

// --- Geometry: vertex positions ---
// WebGL uses clip space coordinates from -1 to 1, where [0,0] is the center.
//
// per vertex data
// verts -- a flat float32 array representing xy coordinates of three dots
const verts = new Float32Array([0.0, 0.0, 0.5, 0.0, 0.5, 0.3, 0.0, 0.3]);
const texCoords = new Float32Array([0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0]);

//put data in buffers
const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
const aPosLoc = gl.getAttribLocation(program, "a_position");
gl.enableVertexAttribArray(aPosLoc);
gl.vertexAttribPointer(aPosLoc, 2, gl.FLOAT, false, 0, 0);

const texCoordBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);
const texCoordLoc = gl.getAttribLocation(program, "a_texcoord");
gl.enableVertexAttribArray(texCoordLoc);
gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);

// Create a texture.
var texture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, texture);
// pre-Fill the texture with a 1x1 blue pixel.
gl.texImage2D(
  gl.TEXTURE_2D,
  0,
  gl.RGBA,
  1,
  1,
  0,
  gl.RGBA,
  gl.UNSIGNED_BYTE,
  new Uint8Array([0, 255, 0, 255]),
);

// Asynchronously load an image
var image = new Image();
image.src = "f.png";
image.addEventListener("load", function () {
  console.log("image loaded");
  // Now that the image has loaded make copy it to the texture.
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); //FLIP image's y axis
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  gl.uniform1i(uTextureLoc, 0);
  // gl.generateMipmap(gl.TEXTURE_2D);
  render();
});

// --- Render ---
function render() {
  gl.viewport(0, 0, canvas.width, canvas.height);

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}

render();
