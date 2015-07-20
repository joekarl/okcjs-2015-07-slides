ObjLoader = (function() {

    function ajax(url, cb) {
      microAjax(url, cb.bind(null, null));
    }

    function load(gl, objUrl, mtlUrl, cb) {
      // sigh micro ajax is a terrible library that fails when multiple load calls are invoked
      // so do loads in series so not to upset the apple cart :/
      // TODO(karl): replace micro ajax with something not terrible
      fastsync.series([
          loadObjs.bind(null, objUrl),
          loadMtls.bind(null, mtlUrl)
      ], function(err, res) {
          if (err) return cb(err);
          initGl(gl, res[0], res[1], cb);
      });
    }

    function initGl(gl, objects, materials, cb) {
      materials.forEach(function(material) {
          const imageUrlParts = material.image.src.split('\.');
          const imageType = imageUrlParts[imageUrlParts.length - 1];
          var textureType = gl.RGBA;
          if (imageType == "jpg" ||
              imageType == "jpeg" ||
              imageType == "bmp") {
              textureType = gl.RGB;
          }

          const textureId = gl.createTexture();
          gl.bindTexture(gl.TEXTURE_2D, textureId);
          gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
          gl.texImage2D(gl.TEXTURE_2D, 0, textureType, textureType, gl.UNSIGNED_BYTE, material.image);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          material.textureId = textureId;
      });

      const models = objects.map(function(obj) {
          return objToModel(obj, materials, gl);
      });
      cb(null, models);
    }

    function loadObjs(objUrl, cb) {
      fastsync.waterfall([
          ajax.bind(null, objUrl),
          parseObjs
      ], cb);
    }

    function parseObjs(objFileText, cb) {
      var i = 0, j = 0;
      var line, vertex, texCoord, vNormal, face, faceParts, combinedFaceParts, tempVec;
      const lines = stringToLines(objFileText);
      var objs = [];
      var currentObj;
      var vCoords;
      var tCoords;
      var vCoordStore = [];
      var tCoordStore = [];
      var vNormalStore = [];

      for (i = 0; i < lines.length; ++i) {
          line = lines[i].trim();
          if (line.match(/^#.*\r?$/)) {
            // comment noop
          } else if (line.match(/^[og].*\r?$/)) {
            currentObj = {
                name: line.split(/\s+/)[1],
                vertexCoordinates: [],
                texCoordinates: []
            };
            objs.push(currentObj);
          } else if (line.match(/^v\s+.*\r?$/)) {
            vertex = line.split(/\s+/);
            vCoordStore.push([vertex[1], vertex[2], vertex[3]]);
          } else if (line.match(/^vt.*\r?$/)) {
            texCoord = line.split(/\s+/);
            tCoordStore.push([texCoord[1], texCoord[2]]);
          } else if (line.match(/^vn.*\r?$/)) {
            vNormal = line.split(/\s+/);
            vNormalStore.push([vNormal[1], vNormal[2], vNormal[3]]);
          } else if (line.match(/^usemtl.*\r?$/)) {
            currentObj.materialName = line.split(/\s+/)[1];
          } else if (line.match(/^s.*\r?$/)) {
            // smoothing noop
          } else if (line.match(/^f.*\r?$/)) {
            face = line.split(/\s+/);
            faceParts = [];

            for (j = 2; j >= 0; --j) {
                combinedFaceParts = face[j + 1].split('/');
                faceParts.push(combinedFaceParts[0]);
                faceParts.push(combinedFaceParts[1]);
                faceParts.push(combinedFaceParts[2]);
            }

            vCoords = currentObj.vertexCoordinates;
            tCoords = currentObj.texCoordinates;

            // push vertex coordinates
            for (j = 0; j < 3; ++j) {
                tempVec = vCoordStore[parseInt(faceParts[j * 3]) - 1];
                vCoords.push(parseFloat(tempVec[0]));
                vCoords.push(parseFloat(tempVec[1]));
                vCoords.push(parseFloat(tempVec[2]));
            }

            // push tex coordinates
            for (j = 0; j < 3; ++j) {
                tempVec = tCoordStore[parseInt(faceParts[j * 3 + 1]) - 1];
                tCoords.push(parseFloat(tempVec[0]));
                tCoords.push(parseFloat(tempVec[1]));
            }
          }
      }

      cb(null, objs);
    }

    function loadMtls(mtlUrl, cb) {
      fastsync.waterfall([
          ajax.bind(null, mtlUrl),
          parseMtls,
          loadImagesForMaterials
      ], cb);
    }

    function parseMtls(mtlFileText, cb) {
      var i = 0;
      var line;
      const lines = stringToLines(mtlFileText);
      var mtls = [];
      var currentMtl;
      for (i = 0; i < lines.length; ++i) {
          line = lines[i].trim();
          if (line.match(/^\s*#.*\r?$/)) {
              // comment noop
          } else if (line.match(/^\s*map_Kd.*\r?$/)) {
              currentMtl.url = 'resources/' + line.split(/\s+/)[1];
          } else if (line.match(/^\s*newmtl.*\r?$/)) {
            currentMtl = {
                name: line.split(/\s+/)[1]
            };
            mtls.push(currentMtl);
          }
      }
      cb(null, mtls);
    }

    function loadImagesForMaterials(materials, cb) {
      var pipeline = materials.map(function(material) {
          return loadImageForMaterial.bind(null, material);
      });

      // fastsync doesn't deal with empty pipelines well...
      if (pipeline.length > 0) {
          fastsync.parallel(pipeline, cb);
      } else {
          cb(null, []);
      }
    }

    function loadImageForMaterial(material, cb) {
      if (!material.url) {
          return cb(null, material);
      }
      var image = new Image();
      material.image = image;
      image.onload = cb.bind(null, null, material);
      image.src = material.url;
    }

    function objToModel(obj, materials, gl) {

      const vertexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(obj.vertexCoordinates), gl.STATIC_DRAW);

      const texCoordBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(obj.texCoordinates), gl.STATIC_DRAW);

      const objMaterial = materials.find(function(material) {
          return material.name == obj.materialName;
      });

      return new Model(vertexBuffer, texCoordBuffer, objMaterial.textureId, obj.vertexCoordinates.length / 3);
    }

    function stringToLines(str) {
      return str.split('\n');
    }

    if (!Array.prototype.find) {
      Array.prototype.find = function(predicate) {
          if (this == null) {
            throw new TypeError('Array.prototype.find called on null or undefined');
          }
          if (typeof predicate !== 'function') {
            throw new TypeError('predicate must be a function');
          }
          var list = Object(this);
          var length = list.length >>> 0;
          var thisArg = arguments[1];
          var value;

          for (var i = 0; i < length; i++) {
            value = list[i];
            if (predicate.call(thisArg, value, i, list)) {
                return value;
            }
          }
          return undefined;
      };
    }

    return {
      load: load
    };
})();
