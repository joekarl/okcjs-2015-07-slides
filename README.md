#WebGl the hard way

### Outline

* WebGl overview (WebGl logo)
  * WebGL - 3D for the web
  * WebGl is the future of high end graphics for the web
  * WebGl is the ~~future~~ present of high end graphics for the web
  * Story - Why I started learning WebGl
    - Games, games, more games
  * WebGl is complicated
    - stateful API
    - "C" like API (ie not object oriented)
    - deals directly with memory
    - large API
  * Why you should learn WebGl
    * 3D (image of 3D scene)
      - Games
      - Data viz
      - Physical model viz
      - Simulations
    * Not just for 3D (Mapbox logo)
      - Mapping (Mapbox and Google)
      - Complex interactions
      - Per pixel 2D effects
    * Good way to learn OpenGl (OpenGl logo)
      - Mobile/Desktop graphics
  * Three.js and other libraries (three.js and babylon.js logo)
    - Good for doing 3D
    - Not so good for 2D (the ones that are are game engines)
    - You learn the library not a standard o_0 (ie not transferrable to other platforms)
    - Need to know WebGl to extend libraries
  * Performance
    * Javascript != 'fast'
      - Limited control over memory
      - Slow math
      - Basically WebGl == don't do graphics with Javascript
    * Canvas, SVG, DOM == 'slow'
      - Same reasons
      - Reliant on server side rendering for complex graphics
      - Are good until they aren't
  * Overview - 3D, Fast 2D, Good way to learn OpenGl
* How does it work? (image of points -> tri -> raster -> color)
  * Triangles, Lines, Points
    - Only focus on triangles as lines and points are limited
    - Yes you can only those, no text, no circles, no rectangles
  * A graphics pipeline
  * (pipline image)
    - Parallelism in hardware
    - All current graphics cards work this way
    - Future is ray tracing but no standard for this yet
  * Vertex/Fragment Shaders
    * Programs that run per vertex or fragment
      - GLSL
      - "C" like
      - Lots of built in math functions like vector and matrix math
    * Example vertex shader
    * Example fragment shader
      - Shadertoy
  * Buffers - ie get things to the graphics card
    - Stored in GPU memory
    - Typed arrays to represent data in JS
    - Interleaved buffers
    - Minimize traffic to the bus
  * Textures
    - images
    - lighting maps
    - shadow maps
    - from canvas, video, image, typed array
  * Overview - shaders, buffers, textures
* Let's do something
  * Single triangle demo
  * Color triangle
  * Quad
  * Textured quad
  * 3D (linear algebra)
  * Cube
  * Model
  * Overview - everything is triangles, shaders are simple, yay linear algebra
* Overview
  - WebGl isn't something to be afraid of
  - Good way to build cross platform graphics skills
  - Good skill to have for future jobs
  - Spend an hour playing with this stuff, it's lots of fun and you'll learn a lot
* Resources
  * https://developer.mozilla.org/en-US/docs/Web/WebGL
  * http://webglfundamentals.org/
  * http://www.opengl-tutorial.org/
  * https://www.shadertoy.com/
  * WebGL Programming Guide: Interactive 3D Graphics Programming with WebGL
  * Professional WebGL Programming: Developing 3D Graphics for the Web
  * Look for things OpenGles 2+ or OpenGl 3+

Testing something 

## Serve slides and examples
`python -m SimpleHTTPServer 8000`
