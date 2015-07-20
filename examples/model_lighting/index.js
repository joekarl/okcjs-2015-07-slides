const canvas = document.getElementById("webglCanvas"),
          gl = canvas.getContext("webgl");

// shaders
const vertexShader = compileShader(gl, gl.VERTEX_SHADER,
`
  attribute vec3 aVertexCoordinate;
  attribute vec2 aTextureCoordinate;
  attribute vec3 aVertexNormal;
  varying mediump vec2 vTextureCoordinate;
  varying mediump float diffuse;
  uniform mat4 uModelMatrix;
  uniform mat3 uNormalMatrix;
  uniform vec3 uLightPosition;

  void main() {

    gl_Position = uModelMatrix * vec4(aVertexCoordinate, 1.0);

    vec3 lightDirection = normalize(uLightPosition - gl_Position.xyz);
    vec3 normalPositionVec = uNormalMatrix * aVertexNormal;
    diffuse = max(dot(normalPositionVec, lightDirection), 0.0);

    vTextureCoordinate = aTextureCoordinate;
  }
`);
const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER,
`
  uniform sampler2D uTexture;
  varying mediump vec2 vTextureCoordinate;
  varying mediump float diffuse;

  void main() {
    mediump vec4 texColor = texture2D(uTexture, vTextureCoordinate);
    mediump vec4 ambient = vec4(0.8, 0.8, 0.8, 1.0) * texColor;
    mediump vec3 lightColor = vec3(1.0, 1.0, 0.0);
    gl_FragColor = vec4(texColor.rbg * diffuse * lightColor + ambient.rgb, texColor.a);
  }
`);

// Setup program information
const program = makeProgram(gl, vertexShader, fragmentShader);
const vertexCoordinateAttribute = gl.getAttribLocation(program, "aVertexCoordinate");
gl.enableVertexAttribArray(vertexCoordinateAttribute);
const textureCoordinateAttribute = gl.getAttribLocation(program, "aTextureCoordinate");
gl.enableVertexAttribArray(textureCoordinateAttribute);
const vertexNormalAttribute = gl.getAttribLocation(program, "aVertexNormal");
gl.enableVertexAttribArray(vertexNormalAttribute);
const textureUniform = gl.getUniformLocation(program, "uTexture");
const modelMatrixUniform = gl.getUniformLocation(program, "uModelMatrix");
const normalMatrixUniform = gl.getUniformLocation(program, "uNormalMatrix");
const lightPositionUniform = gl.getUniformLocation(program, "uLightPosition");

// Init gl information
gl.useProgram(program);
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
gl.enable(gl.BLEND);
gl.enable(gl.CULL_FACE);
gl.enable(gl.DEPTH_TEST);

var treeModel;
var forestModel;

ObjLoader.load(gl, 'tree_model/arvore.obj', 'tree_model/arvore.mtl', function(err, models) {
    if (err) {
      return console.error(err);
    }
    treeModel = new ModelGroup(models);
    mat4.translate(treeModel.modelMatrix, mat4.clone(treeModel.modelMatrix), vec3.fromValues(-0.5, 0, 0));
    mat4.scale(treeModel.modelMatrix, mat4.clone(treeModel.modelMatrix), vec3.fromValues(0.2, 0.2, 0.2));

    ObjLoader.load(gl, 'forest-scene/ForestSceneClean.obj', 'forest-scene/ForestSceneClean.mtl', function(err, models) {
      if (err) {
          return console.error(err);
      }
      forestModel = new ModelGroup(models);
      mat4.translate(forestModel.modelMatrix, mat4.clone(forestModel.modelMatrix), vec3.fromValues(0.5, 0, 0));
      mat4.scale(forestModel.modelMatrix, mat4.clone(forestModel.modelMatrix), vec3.fromValues(0.001, 0.001, 0.001));
      requestAnimationFrame(renderLoop);
    });
});

var cameraMatrix = mat4.create();
var viewMatrix = mat4.create();
var lightPosition = vec3.fromValues(0, 0, 0);

var cameraRotationY = 0;

function renderLoop() {

    cameraRotationY += 0.5 * Math.PI / 180;

    mat4.identity(cameraMatrix);
    mat4.translate(cameraMatrix, mat4.clone(cameraMatrix), vec3.fromValues(0, 0.5, 0));
    mat4.rotateY(cameraMatrix, mat4.clone(cameraMatrix), cameraRotationY);
    mat4.rotateX(cameraMatrix, mat4.clone(cameraMatrix), 10 * Math.PI / 180);
    mat4.invert(viewMatrix, cameraMatrix);

    vec3.transformMat4(lightPosition, vec3.fromValues(0, 0, 0), cameraMatrix);

    gl.clear(gl.COLOR_BUFFER_BIT);

    treeModel.draw(gl, vertexCoordinateAttribute, textureCoordinateAttribute,
       vertexNormalAttribute, textureUniform, modelMatrixUniform,
       normalMatrixUniform, lightPositionUniform, viewMatrix, lightPosition);
    forestModel.draw(gl, vertexCoordinateAttribute, textureCoordinateAttribute,
         vertexNormalAttribute, textureUniform, modelMatrixUniform,
         normalMatrixUniform, lightPositionUniform, viewMatrix, lightPosition);

    requestAnimationFrame(renderLoop);
}
