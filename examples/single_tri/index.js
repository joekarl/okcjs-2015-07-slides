const canvas = document.getElementById("webglCanvas"),
          gl = canvas.getContext("webgl");

// shaders
const vertexShader = compileShader(gl, gl.VERTEX_SHADER,
`
  attribute vec2 aVertexCoordinate;

  void main() {
    gl_Position = vec4(aVertexCoordinate, 0.0, 1.0);
  }
`);
const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER,
`
  void main() {
    gl_FragColor = vec4(1.0, 0, 0, 1.0);
  }
`);

// Setup program information
const program = makeProgram(gl, vertexShader, fragmentShader);
const vertexCoordinateAttribute = gl.getAttribLocation(program, "aVertexCoordinate");
gl.enableVertexAttribArray(vertexCoordinateAttribute);

// Init gl information
gl.useProgram(program);
gl.clearColor(0.0, 0.0, 0.0, 1.0);

// Setup buffer
const vertices = [
  -0.5, -0.5,
     0,  0.5,
   0.5, -0.5
];
const verticesBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

function renderLoop() {
  gl.clear(gl.COLOR_BUFFER_BIT);

  // bind array to shader input
  gl.vertexAttribPointer(vertexCoordinateAttribute, 2, gl.FLOAT, false, 0, 0);

  // draw the array
  gl.drawArrays(gl.TRIANGLES, 0, 3);

  requestAnimationFrame(renderLoop);
}

renderLoop();
