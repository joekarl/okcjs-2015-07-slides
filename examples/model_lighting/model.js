/**
 * Simple model abstraction
 */
function Model(vertexBuffer, texCoordsBuffer, vNormalBuffer, textureId, vertexNum) {
    this.vertexBuffer = vertexBuffer;
    this.texCoordsBuffer = texCoordsBuffer;
    this.vNormalBuffer = vNormalBuffer;
    this.textureId = textureId;
    this.vertexNum = vertexNum;
    this.modelMatrix = mat4.create();
}

/**
 * Bind buffers and texture for drawing
 */
Model.prototype.draw = function(gl, vertexAttr, texCoordsAttr, vNormalAttr,
                                textureUnif, modelMatrixUnif, normalMatrixUnif,
                                lightPositionUniform, transformMatrix, cameraMatrix,
                                lightPosition) {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(vertexAttr, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordsBuffer);
    gl.vertexAttribPointer(texCoordsAttr, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vNormalBuffer);
    gl.vertexAttribPointer(vNormalAttr, 3, gl.FLOAT, false, 0, 0);

    gl.bindTexture(gl.TEXTURE_2D, this.textureId);
    gl.uniform1i(textureUnif, this.textureId);

    var combinedMatrix = mat4.create();
    mat4.multiply(combinedMatrix, this.modelMatrix, transformMatrix);
    mat4.multiply(combinedMatrix, mat4.clone(combinedMatrix), cameraMatrix);

    // Need to transform the normal positions because they're relative to 0, 0, 0
    // and need to be relative to the final position of the model
    var invertedPosition = mat4.create();
    var normalMatrix4 = mat4.create();
    var normalMatrix3 = mat3.create();
    mat4.invert(invertedPosition, combinedMatrix);
    mat4.transpose(normalMatrix4, invertedPosition);
    mat3.fromMat4(normalMatrix4, normalMatrix3);

    // Need to transform the light position relative to the object position
    // to do this we invert the model position and transform
    var transformedLightPosition = vec3.create();
    vec3.transformMat4(transformedLightPosition, lightPosition, invertedPosition);

    gl.uniformMatrix4fv(modelMatrixUnif, false, combinedMatrix);
    gl.uniformMatrix3fv(normalMatrixUniform, false, normalMatrix3);
    gl.uniform3fv(lightPositionUniform, transformedLightPosition);

    gl.drawArrays(gl.TRIANGLES, 0, this.vertexNum);
};

function ModelGroup(models) {
    this.models = models;
    this.modelMatrix = mat4.create();
}

ModelGroup.prototype.draw = function(gl, vertexAttr, texCoordsAttr, vNormalAttr,
                                     textureUnif, modelMatrixUnif, normalMatrixUnif,
                                     lightPositionUniform, cameraMatrix, lightPosition) {
    this.models.forEach(function(model) {
      model.draw(gl, vertexAttr, texCoordsAttr, vNormalAttr,
                 textureUnif, modelMatrixUnif, normalMatrixUnif,
                 lightPositionUniform, cameraMatrix, this.modelMatrix,
                 lightPosition);
    }.bind(this));
};
