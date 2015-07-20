/**
 * Simple model abstraction
 */
function Model(vertexBuffer, texCoordsBuffer, textureId, vertexNum) {
    this.vertexBuffer = vertexBuffer;
    this.texCoordsBuffer = texCoordsBuffer;
    this.textureId = textureId;
    this.vertexNum = vertexNum;
    this.modelMatrix = mat4.create();
}

/**
 * Bind buffers and texture for drawing
 */
Model.prototype.draw = function(gl, vertexAttr, texCoordsAttr,
                                textureUnif, modelMatrixUnif,
                                transformMatrix, cameraMatrix) {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(vertexAttr, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordsBuffer);
    gl.vertexAttribPointer(texCoordsAttr, 2, gl.FLOAT, false, 0, 0);

    gl.bindTexture(gl.TEXTURE_2D, this.textureId);
    gl.uniform1i(textureUnif, this.textureId);

    var combinedMatrix = mat4.create();
    mat4.multiply(combinedMatrix, this.modelMatrix, transformMatrix);
    mat4.multiply(combinedMatrix, mat4.clone(combinedMatrix), cameraMatrix);

    gl.uniformMatrix4fv(modelMatrixUnif, false, combinedMatrix);

    gl.drawArrays(gl.TRIANGLES, 0, this.vertexNum);
};

function ModelGroup(models) {
    this.models = models;
    this.modelMatrix = mat4.create();
}

ModelGroup.prototype.draw = function(gl, vertexAttr, texCoordsAttr,
                                     textureUnif, modelMatrixUnif,
                                     cameraMatrix) {
    this.models.forEach(function(model) {
      model.draw(gl, vertexAttr, texCoordsAttr,
                 textureUnif, modelMatrixUnif,
                 cameraMatrix, this.modelMatrix);
    }.bind(this));
};
