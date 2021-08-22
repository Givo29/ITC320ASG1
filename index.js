// Set shader strings
const vShader = `
attribute vec3 aPosition; 
attribute vec2 aTextureCoordinate;
varying vec2 varyTextureCoordinate;
uniform mat4 umWorldMatrix;

void main() {
	varyTextureCoordinate = aTextureCoordinate;
	vec4 transformedPos = umWorldMatrix*vec4(aPosition,1.0);
    gl_Position = transformedPos; 
}
`;

const fShader = `
precision mediump float; 
varying vec2 varyTextureCoordinate;
uniform sampler2D myTexture;

void main()  { 
	gl_FragColor = texture2D(myTexture, varyTextureCoordinate);
}
`;

let gl;

/** This function is an async function that will run
 * as soon as the html window is ready.
 * It has to be an async function due to the use of the
 * fetch api to load the texture and obj files.
 **/
window.onload = async (_) => {
  // Initialise canvas and webgl using provided helper functions
  const canvas = document.getElementById("glCanvas");
  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) alert("WebGL isn't available");

  // Setup shapes using my objectParser
  const shapes = [
    // Floor
    await parseObject(
      gl,
      "floor",
      "Assets/meshes/floor.obj",
      "Assets/textures/floor.tga",
      [50, 50, 50]
    ),
    // Houses
    await parseObject(
      gl,
      "h1",
      "Assets/meshes/H1.obj",
      "Assets/textures/H1.tga",
      [1, 1, 1],
      [1, 2, 0],
      90
    ),
    await parseObject(
      gl,
      "h1",
      "Assets/meshes/H1.obj",
      "Assets/textures/H1.tga",
      [1.25, 3, 1.25],
      [3, 2, 5],
    ),
    await parseObject(
      gl,
      "h1",
      "Assets/meshes/H1.obj",
      "Assets/textures/H1.tga",
      [2, 2, 2],
      [-5, 2, 2]
    ),
    await parseObject(
      gl,
      "h1",
      "Assets/meshes/H1.obj",
      "Assets/textures/H1.tga",
      [1.2, 1.2, 1.2],
      [-2, 2, -0.5],
      -45
    ),
    await parseObject(
      gl,
      "h2",
      "Assets/meshes/H2.obj",
      "Assets/textures/H2.tga",
      [2, 2, 2],
      [0.5, 2, 1],
      -25
    ),
    await parseObject(
      gl,
      "h2",
      "Assets/meshes/H2.obj",
      "Assets/textures/H2.tga",
      [1.5, 1.5, 1.5],
      [-2, 2, -5],
      45
    ),
    await parseObject(
      gl,
      "h2",
      "Assets/meshes/H2.obj",
      "Assets/textures/H2.tga",
      [1, 4, 1],
      [5, 2, 5],
      10
    ),
    await parseObject(
      gl,
      "h2",
      "Assets/meshes/H2.obj",
      "Assets/textures/H2.tga",
      [2, 5, 2],
      [9, 2, 8],
      36
    ),
    await parseObject(
      gl,
      "h3",
      "Assets/meshes/H3.obj",
      "Assets/textures/H3_1.tga",
      [3, 3, 3],
      [5.5, 0, 2.5]
    ),
    await parseObject(
      gl,
      "h3",
      "Assets/meshes/H3.obj",
      "Assets/textures/H3_3.tga",
      [5, 5, 5],
      [-3, 0, 22],
      45
    ),
    await parseObject(
      gl,
      "h3",
      "Assets/meshes/H3.obj",
      "Assets/textures/H3_2.tga",
      [2, 2, 2],
      [-5, 0, 4],
      15
    ),
    await parseObject(
      gl,
      "h3",
      "Assets/meshes/H3.obj",
      "Assets/textures/H3_2.tga",
      [3, 1, 3],
      [8, 0, 15],
      25
    ),
    // Car
    await parseObject(
      gl,
      "car",
      "Assets/meshes/car.obj",
      "Assets/textures/car_1.tga",
      [1, 1, 1],
      [-3, 0, -5.5]
    ),
  ];

  // Setup camera
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Setup program and shaders
  let program = initShaders(gl, vShader, fShader);
  gl.useProgram(program);

  gl.uniform1i(gl.getUniformLocation(program, "myTexture"), 0);
  gl.activeTexture(gl.TEXTURE0);

  const worldMatrixLocation = gl.getUniformLocation(program, "umWorldMatrix");
  gl.enable(gl.DEPTH_TEST);

  setInterval(render, 16, shapes, worldMatrixLocation, program);
};

/**
 * Main render function that loops through shapes
 * and renders them
 * @param {Array} shapes - Array of shapes to render
 * @param {WebGLUniformLocation} worldMatrixLocation - Location of the world matrix
 * @param {WebGLProgram} program - WebGL program to use
 * @returns {void}
 **/
function render(shapes, worldMatrixLocation, program) {
  // Clear the canvas and setup viewport
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  let projectionMatrix = perspective(45, 640.0 / 640.0, 2.1, 10000.0);
  let viewMatrix = lookAt([1, 4, -15], [0, 0, 10], [0, 1, 0]);
  let projViewMatrix = mult(projectionMatrix, viewMatrix);

  // Loop through shapes and render them
  shapes.forEach((shape) => {
    // If the shape is the car, change the rotation
    // each iteration
    if (shape.type === "car") shape.rotation--;

    // Setup world matrix
    let initMatrix = mult(
      scalem(1.0 / shape.radius, 1.0 / shape.radius, 1.0 / shape.radius),
      translate(-shape.center[0] + 10, -shape.center[1] + 100, -shape.center[2])
    );

    // Position buffer
    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(shape.pPoints), gl.STATIC_DRAW);

    const vPos = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(vPos, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPos);

    // Colour buffer
    const colBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(shape.tPoints), gl.STATIC_DRAW);

    const vCol = gl.getAttribLocation(program, "aTextureCoordinate");
    gl.vertexAttribPointer(vCol, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vCol);

    // Return null if the shape has no texture
    if (shape.texture === null) return;
    // Else, bind the texture
    gl.bindTexture(gl.TEXTURE_2D, shape.texture);

    // Set the world matrix
    initMatrix = scalem(
      shape.scale[0] / shape.radius,
      shape.scale[0] / shape.radius,
      shape.scale[0] / shape.radius
    );
    let worldMatrix;
    
    // If the shape is not the car,
    // render the shape normally
    if (shape.type !== "car") {
      worldMatrix = mult(
        projViewMatrix,
        mult(
          translate(shape.pos[0], shape.pos[1], shape.pos[2]),
          mult(rotate(shape.rotation, [0, 1, 0]), initMatrix)
        )
      );
    // If the shape is the car,
    // change it's position each iteration
    // to drive around the building
    } else {
      worldMatrix = mult(
        projViewMatrix,
        mult(
          rotate(shape.rotation, [0, 1, 0]),
          mult(
            translate(shape.pos[0] + 2.5, shape.pos[1], shape.pos[2] + 2.5),
            initMatrix
          )
        )
      );
    }

    // Draw shapes
    gl.uniformMatrix4fv(worldMatrixLocation, gl.FALSE, flatten(worldMatrix));
    gl.drawArrays(gl.TRIANGLES, 0, shape.pPoints.length);
  });
}
