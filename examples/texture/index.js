const canvas = document.getElementById("webglCanvas"),
          gl = canvas.getContext("webgl");

// shaders
const vertexShader = compileShader(gl, gl.VERTEX_SHADER,
`
  attribute vec2 aVertexCoordinate;
  attribute vec2 aTextureCoordinate;
  varying mediump vec2 vTextureCoordinate;

  void main() {
    gl_Position = vec4(aVertexCoordinate, 0.0, 1.0);
    vTextureCoordinate = aTextureCoordinate;
  }
`);
const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER,
`
  uniform sampler2D uTexture;
  varying mediump vec2 vTextureCoordinate;

  void main() {
    gl_FragColor = texture2D(uTexture, vTextureCoordinate);
  }
`);

// Setup program information
const program = makeProgram(gl, vertexShader, fragmentShader);
const vertexCoordinateAttribute = gl.getAttribLocation(program, "aVertexCoordinate");
gl.enableVertexAttribArray(vertexCoordinateAttribute);
const textureCoordinateAttribute = gl.getAttribLocation(program, "aTextureCoordinate");
gl.enableVertexAttribArray(textureCoordinateAttribute);
const textureUniform = gl.getUniformLocation(program, "uTexture");

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

// Setup texture coordinates
const textureCoordinates = [
    0, 0,
  0.5, 1,
    1, 0
];
const textureCoordinatesBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordinatesBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);

// Setup texture
const texture = gl.createTexture();
const textureImage = new Image();
textureImage.loaded = false;
textureImage.onload = function() {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureImage);
  // texture isn't power of 2 so have to do texture linear filtering
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  textureImage.loaded = true;
};
textureImage.src = '../common/blue-bottom.jpg';

function renderLoop() {
  gl.clear(gl.COLOR_BUFFER_BIT);

  // bind array to shader input
  gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
  gl.vertexAttribPointer(vertexCoordinateAttribute, 2, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordinatesBuffer);
  gl.vertexAttribPointer(textureCoordinateAttribute, 2, gl.FLOAT, false, 0, 0);

  if (textureImage.loaded) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(textureUniform, texture);
  }

  // draw the array
  gl.drawArrays(gl.TRIANGLES, 0, 3);

  requestAnimationFrame(renderLoop);
}

renderLoop();
