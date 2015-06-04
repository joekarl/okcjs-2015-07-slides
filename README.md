#WebGl the hard way

Will cover:

* What WebGl is
  * Wrapper around OpenGles 2
  * Canvas context "webgl"
  * OpenGl vs OpenGles
* How GPU works
  * Slow
  * Bad at branching
  * Lots of processing cores
* What you can do in WebGl
  * Points
  * Lines
  * Triangles
  * Hardware optimized
* Pieces for using WebGl
  * Vertex/Fragment Shaders
  * Uniforms/Attributes
  * Buffers
* Simple example (single triangle)
  * Hook up shader, etc
  * Simple shader
  * Coordinate system
* Multiple tris
  * Draw quad
* Color the tris
  * GlBlend
  * gl_fragmentColor
* Texture the tris
  * Texture + texture coords
* WebCam as texture
  * Other things you can use as a texture
  * Webcam
  * Video
  * Example using webcam as texture for quad
* 3D (cube)
  * Basic 3D
  * Camera
  * Transformation matrix
* 3D (object)
  * Load 3D object
  * Keyboard rotation
* When to use WebGl vs Canvas
  * Canvas for 2D
  * WebGl for 2D when per pixel effects needed
  * WebGl for 3D
* Resources
  * https://developer.mozilla.org/en-US/docs/Web/WebGL
  * http://webglfundamentals.org/
  * http://www.opengl-tutorial.org/
  * https://www.shadertoy.com/
  * Look for things OpenGles 2+ or OpenGl 3+

## Serve slides and examples
`python -m SimpleHTTPServer 8000`
