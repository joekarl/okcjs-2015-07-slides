const canvas = document.getElementById("webglCanvas"),
          gl = canvas.getContext("webgl");

// shaders
const vertexShader = compileShader(gl, gl.VERTEX_SHADER,
`
  attribute vec2 aVertexCoordinate;
  attribute vec4 aVertexColor;
  uniform mat4 uModelMatrix;
  varying mediump vec4 vColor;

  void main() {
    gl_Position = uModelMatrix * vec4(aVertexCoordinate, 0.0, 1.0);
    vColor = aVertexColor;
  }
`);
const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER,
`
  varying mediump vec4 vColor;

  void main() {
    gl_FragColor = vColor;
  }
`);

// Setup program information
const program = makeProgram(gl, vertexShader, fragmentShader);
const vertexCoordinateAttribute = gl.getAttribLocation(program, "aVertexCoordinate");
gl.enableVertexAttribArray(vertexCoordinateAttribute);
const vertexColorAttribute = gl.getAttribLocation(program, "aVertexColor");
gl.enableVertexAttribArray(vertexColorAttribute);
const modelMatrixUniform = gl.getUniformLocation(program, "uModelMatrix");

// Init gl information
gl.useProgram(program);
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
gl.enable(gl.BLEND);

// Setup buffer
const vertices = [
  -0.5, -0.5,
     0,  0.5,
   0.5, -0.5
];
const verticesBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

const colors = [
  1, 0, 0, 1,
  0, 1, 0, 1,
  0, 0, 1, 1
];
const colorsBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

var angle = 0;
var identityMatrix = mat4.create();
var rotateZMatrix = mat4.create();
var rotateYMatrix = mat4.create();
var rotateXMatrix = mat4.create();
var modelMatrix = mat4.create();

function renderLoop() {
  angle += 1;
  angle %= 360;

  mat4.identity(identityMatrix);
  mat4.identity(rotateZMatrix);
  mat4.identity(rotateYMatrix);
  mat4.identity(rotateXMatrix);
  mat4.identity(modelMatrix);

  mat4.rotateZ(rotateZMatrix, identityMatrix, angle * Math.PI / 180.0);
  mat4.rotateY(rotateYMatrix, rotateZMatrix, angle * Math.PI / 180.0);
  mat4.rotateX(rotateXMatrix, rotateYMatrix, angle * Math.PI / 180.0);
  mat4.copy(modelMatrix, rotateXMatrix);

  gl.clear(gl.COLOR_BUFFER_BIT);

  // bind array to shader input
  gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
  gl.vertexAttribPointer(vertexCoordinateAttribute, 2, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);
  gl.vertexAttribPointer(vertexColorAttribute, 4, gl.FLOAT, false, 0, 0);
  gl.uniformMatrix4fv(modelMatrixUniform, false, modelMatrix);

  // draw the array
  gl.drawArrays(gl.TRIANGLES, 0, 3);

  requestAnimationFrame(renderLoop);
}

renderLoop();
