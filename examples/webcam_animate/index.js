const canvas = document.getElementById("webglCanvas"),
     videoEl = document.getElementById("webglVideoInput"),
          gl = canvas.getContext("webgl");

// shaders
const vertexShader = compileShader(gl, gl.VERTEX_SHADER, `
  attribute vec2 aVertexCoordinate;
  attribute vec2 aTextureCoordinate;
  uniform mat4 uModelMatrix;
  varying mediump vec2 vTextureCoordinate;

  void main() {
    gl_Position = uModelMatrix * vec4(aVertexCoordinate, 0.0, 1.0);
    vTextureCoordinate = aTextureCoordinate;
  }
`);
const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, `
  varying mediump vec2 vTextureCoordinate;
  uniform sampler2D uTexture;

  void main() {
    gl_FragColor = texture2D(uTexture, vTextureCoordinate);
  }
`);

// Setup progam information
const program = makeProgram(gl, vertexShader, fragmentShader);
const vertexCoordinateAttribute = gl.getAttribLocation(program, "aVertexCoordinate");
gl.enableVertexAttribArray(vertexCoordinateAttribute);
const textureCoordinateAttribute = gl.getAttribLocation(program, "aTextureCoordinate");
gl.enableVertexAttribArray(textureCoordinateAttribute);
const textureUniform = gl.getUniformLocation(program, "uTexture");
const modelMatrixUniform = gl.getUniformLocation(program, "uModelMatrix");

// Init gl information
gl.useProgram(program);
gl.clearColor(0.0, 0.0, 0.0, 1.0);
const vertices = [
  -0.5, -0.5, 0.0, 0.0, // vertice (x, y) texCoord (s, t)
   0.0,  0.5, 0.5, 1.0,
   0.5, -0.5, 1.0, 0.0,
];
const verticesBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
const videoTexture = new VideoTexture(gl, videoEl);

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

  // update video texture
  videoTexture.update(gl);

  gl.vertexAttribPointer(vertexCoordinateAttribute, 2, gl.FLOAT, false, 16, 0);
  gl.vertexAttribPointer(textureCoordinateAttribute, 2, gl.FLOAT, false, 16, 8);
  gl.uniform1i(textureUniform, 0);

  gl.uniformMatrix4fv(modelMatrixUniform, false, modelMatrix);

  // draw the arrays
  gl.drawArrays(gl.TRIANGLES, 0, 3);

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

renderLoop()
