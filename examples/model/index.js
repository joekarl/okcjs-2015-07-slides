const canvas = document.getElementById("webglCanvas"),
          gl = canvas.getContext("webgl");

// shaders
const vertexShader = compileShader(gl, gl.VERTEX_SHADER,
`
  attribute vec3 aVertexCoordinate;
  attribute vec2 aTextureCoordinate;
  varying mediump vec2 vTextureCoordinate;
  uniform mat4 uModelMatrix;
  uniform mat4 uCameraMatrix;
				   
  void main() {
    gl_Position = uModelMatrix * uCameraMatrix * vec4(aVertexCoordinate, 1.0);
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
const modelMatrixUniform = gl.getUniformLocation(program, "uModelMatrix");
const cameraMatrixUniform = gl.getUniformLocation(program, "uCameraMatrix");

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
    
    ObjLoader.load(gl, 'forest-scene/ForestSceneClean.obj', 'forest-scene/ForestScene.mtl', function(err, models) {
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
mat4.translate(cameraMatrix, mat4.clone(cameraMatrix), vec3.fromValues(0, 0.2, 0));
mat4.rotateX(cameraMatrix, mat4.clone(cameraMatrix), 10 * Math.PI / 180);

// invert the matrix so it will move the world relative to the camera
var viewMatrix = mat4.create();
mat4.invert(viewMatrix, cameraMatrix);

function renderLoop() {

    mat4.rotateY(treeModel.modelMatrix, mat4.clone(treeModel.modelMatrix), 0.3 * Math.PI / 180);
    mat4.rotateY(forestModel.modelMatrix, mat4.clone(forestModel.modelMatrix), -0.3 * Math.PI / 180);
    
    gl.clear(gl.COLOR_BUFFER_BIT);

    treeModel.draw(gl, vertexCoordinateAttribute, textureCoordinateAttribute, textureUniform, modelMatrixUniform, cameraMatrixUniform, viewMatrix);
    forestModel.draw(gl, vertexCoordinateAttribute, textureCoordinateAttribute, textureUniform, modelMatrixUniform, cameraMatrixUniform, viewMatrix);
 
    requestAnimationFrame(renderLoop);
}


