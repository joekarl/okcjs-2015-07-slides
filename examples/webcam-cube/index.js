const canvas = document.getElementById("webglCanvas"),
     videoEl = document.getElementById("webglVideoInput"),
          gl = canvas.getContext("webgl");

// shaders
const vertexShader = compileShader(gl, gl.VERTEX_SHADER,
`
  attribute vec3 aVertexCoordinate;
  attribute vec2 aTextureCoordinate;
  attribute vec3 aColorCoordinate;
  varying mediump vec2 vTextureCoordinate;
  varying mediump vec3 vColorCoordinate;
  uniform mat4 uModelMatrix;

  void main() {
    gl_Position = uModelMatrix * vec4(aVertexCoordinate, 1.0);
    vTextureCoordinate = aTextureCoordinate;
    vColorCoordinate = aColorCoordinate;
  }
`);
const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER,
`
  uniform sampler2D uTexture;
  varying mediump vec2 vTextureCoordinate;
  varying mediump vec3 vColorCoordinate;

  void main() {
    gl_FragColor = texture2D(uTexture, vTextureCoordinate);
    //gl_FragColor = vec4(vColorCoordinate, 1);
  }
`);

// Setup program information
const program = makeProgram(gl, vertexShader, fragmentShader);
const vertexCoordinateAttribute = gl.getAttribLocation(program, "aVertexCoordinate");
gl.enableVertexAttribArray(vertexCoordinateAttribute);
const textureCoordinateAttribute = gl.getAttribLocation(program, "aTextureCoordinate");
gl.enableVertexAttribArray(textureCoordinateAttribute);
const colorCoordinateAttribute = gl.getAttribLocation(program, "aColorCoordinate");
gl.enableVertexAttribArray(colorCoordinateAttribute);
const textureUniform = gl.getUniformLocation(program, "uTexture");
const modelMatrixUniform = gl.getUniformLocation(program, "uModelMatrix");

// Init gl information
gl.useProgram(program);
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
gl.enable(gl.BLEND);
gl.enable(gl.CULL_FACE);
gl.enable(gl.DEPTH_TEST);

// Setup buffer
const vertices = [
  // front face
  -0.2, -0.2, 0.2,
   0.2, -0.2, 0.2,
  -0.2,  0.2, 0.2,
  -0.2,  0.2, 0.2,
   0.2, -0.2, 0.2,
   0.2,  0.2, 0.2,

  // back face
   0.2, -0.2, -0.2,
  -0.2, -0.2, -0.2,
   0.2,  0.2, -0.2,
   0.2,  0.2, -0.2,
  -0.2, -0.2, -0.2,
  -0.2,  0.2, -0.2,

  // top face
   0.2, 0.2, -0.2,
  -0.2, 0.2, -0.2,
   0.2, 0.2,  0.2,
   0.2, 0.2,  0.2,
  -0.2, 0.2, -0.2,
  -0.2, 0.2,  0.2,

  // bottom face
  -0.2, -0.2, -0.2,
   0.2, -0.2, -0.2,
  -0.2, -0.2,  0.2,
  -0.2, -0.2,  0.2,
   0.2, -0.2, -0.2,
   0.2, -0.2,  0.2,

  // left side face
  -0.2, -0.2, -0.2,
  -0.2, -0.2,  0.2,
  -0.2,  0.2, -0.2,
  -0.2,  0.2, -0.2,
  -0.2, -0.2,  0.2,
  -0.2,  0.2,  0.2,

  // right side face
  0.2, -0.2,  0.2,
  0.2, -0.2, -0.2,
  0.2,  0.2,  0.2,
  0.2,  0.2,  0.2,
  0.2, -0.2, -0.2,
  0.2,  0.2, -0.2,
];
const verticesBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

// Setup texture coordinates
const colorCoordinates = [
  // front face
  1, 0, 0,
  1, 0, 0,
  1, 0, 0,
  1, 0, 0,
  1, 0, 0,
  1, 0, 0,

  // back face
  0, 1, 0,
  0, 1, 0,
  0, 1, 0,
  0, 1, 0,
  0, 1, 0,
  0, 1, 0,

  // top face
  0, 0, 1,
  0, 0, 1,
  0, 0, 1,
  0, 0, 1,
  0, 0, 1,
  0, 0, 1,

  // bottom face
  1, 1, 0,
  1, 1, 0,
  1, 1, 0,
  1, 1, 0,
  1, 1, 0,
  1, 1, 0,

  // left side face
  0, 1, 1,
  0, 1, 1,
  0, 1, 1,
  0, 1, 1,
  0, 1, 1,
  0, 1, 1,

  // right side face
  1, 0, 1,
  1, 0, 1,
  1, 0, 1,
  1, 0, 1,
  1, 0, 1,
  1, 0, 1
];
const colorCoordinatesBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorCoordinatesBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorCoordinates), gl.STATIC_DRAW);

// Setup texture coordinates
const textureCoordinates = [
  // front face
  0, 0,
  1, 0,
  0, 1,
  0, 1,
  1, 0,
  1, 1,

  // back face
  0, 0,
  1, 0,
  0, 1,
  0, 1,
  1, 0,
  1, 1,

  // top face
  0, 0,
  1, 0,
  0, 1,
  0, 1,
  1, 0,
  1, 1,

  // bottom face
  0, 0,
  1, 0,
  0, 1,
  0, 1,
  1, 0,
  1, 1,

  // left side face
  0, 0,
  1, 0,
  0, 1,
  0, 1,
  1, 0,
  1, 1,

  // right side face
  0, 0,
  1, 0,
  0, 1,
  0, 1,
  1, 0,
  1, 1
];
const textureCoordinatesBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordinatesBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);

// Setup texture
const videoTexture = new VideoTexture(gl, videoEl);

var xAngle = 0;
var yAngle = 0;
var zAngle = 0;
var identityMatrix = mat4.create();
var rotateZMatrix = mat4.create();
var rotateYMatrix = mat4.create();
var rotateXMatrix = mat4.create();
var modelMatrix = mat4.create();

function renderLoop() {
  xAngle += 1;
  xAngle %= 360;
  yAngle += 0.5;
  yAngle %= 360;
  zAngle += 0.3;
  zAngle %= 360;

  mat4.identity(identityMatrix);
  mat4.identity(rotateZMatrix);
  mat4.identity(rotateYMatrix);
  mat4.identity(rotateXMatrix);
  mat4.identity(modelMatrix);

  mat4.rotateZ(rotateZMatrix, identityMatrix, zAngle * Math.PI / 180.0);
  mat4.rotateY(rotateYMatrix, rotateZMatrix, yAngle * Math.PI / 180.0);
  mat4.rotateX(rotateXMatrix, rotateYMatrix, xAngle * Math.PI / 180.0);
  mat4.copy(modelMatrix, rotateXMatrix);

  gl.clear(gl.COLOR_BUFFER_BIT);

  // bind array to shader input
  gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
  gl.vertexAttribPointer(vertexCoordinateAttribute, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordinatesBuffer);
  gl.vertexAttribPointer(textureCoordinateAttribute, 2, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, colorCoordinatesBuffer);
  gl.vertexAttribPointer(colorCoordinateAttribute, 3, gl.FLOAT, false, 0, 0);

  // update video texture
  videoTexture.update(gl);

  gl.uniformMatrix4fv(modelMatrixUniform, false, modelMatrix);

  // draw the items
  // 6 items per face, 6 faces, 36 items
  gl.drawArrays(gl.TRIANGLES, 0, 6 * 6);

  requestAnimationFrame(renderLoop);
}

// Wrapper around texture + webcam video
function VideoTexture(gl, videoEl) {
  this.videoEl = videoEl;
  this.isReady = false;
  this.glTexture = gl.createTexture();

  // Init video (note this doesn't work from local file, must be served from webserver)
  navigator.getUserMedia({video: true}, function (stream) {
    this.videoEl.src = (window.URL && window.URL.createObjectURL(stream)) || stream;
    this.videoEl.width = 1024;
    this.videoEl.height = 1024;
    this.videoEl.play();
    this.videoEl.addEventListener("canplay", function(){
      gl.bindTexture(gl.TEXTURE_2D, this.glTexture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.videoEl);
      // video texture isn't power of 2 so have to do texture linear filtering
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      this.isReady = true;
    }.bind(this));
  }.bind(this), console.error);
}

// Update the texture if video is ready
VideoTexture.prototype.update = function() {
  if (this.isReady) {
    gl.bindTexture(gl.TEXTURE_2D, this.glTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.videoEl);
  }
};

renderLoop();
