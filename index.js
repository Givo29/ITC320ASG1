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

window.onload = async (_) => {
  const canvas = document.getElementById("glCanvas");
  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) alert("WebGL isn't available");

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
      [2, 2, 2],
      [-5, 2, 2]
    ),
    await parseObject(
      gl,
      "h1",
      "Assets/meshes/H1.obj",
      "Assets/textures/H1.tga",
      [1.2, 1.2, 1.2],
      [-2, 2, -.5], //! change 20 to 2
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
      "Assets/textures/H3_1.tga",
      [5, 5, 5],
      [-3, 0, 22],
      45
    ),
    await parseObject(
      gl,
      "h3",
      "Assets/meshes/H3.obj",
      "Assets/textures/H3_1.tga",
      [1.5, 1.5, 1.5],
      [-5, 0, 4],
      15
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

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  let program = initShaders(gl, vShader, fShader);
  gl.useProgram(program);

  gl.uniform1i(gl.getUniformLocation(program, "myTexture"), 0);
  gl.activeTexture(gl.TEXTURE0);

  const worldMatrixLocation = gl.getUniformLocation(program, "umWorldMatrix");
  gl.enable(gl.DEPTH_TEST);

  // setInterval(render, 16, house, houseTexture, worldMatrixLocation);
  setInterval(render, 16, shapes, worldMatrixLocation, program);
};

function render(shapes, worldMatrixLocation, program) {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  let projectionMatrix = perspective(45, 640.0 / 640.0, 2.1, 10000.0);
  let viewMatrix = lookAt([1, 4, -15], [0, 0, 10], [0, 1, 0]);
  let projViewMatrix = mult(projectionMatrix, viewMatrix);

  shapes.forEach((shape) => {
    if (shape.type === "car") {
      shape.rotation--;
      shape.pos = [shape.pos[0], shape.pos[1], shape.pos[2]];
    }

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

    if (shape.texture === null) return;
    gl.bindTexture(gl.TEXTURE_2D, shape.texture);

    initMatrix = scalem(
      shape.scale[0] / shape.radius,
      shape.scale[0] / shape.radius,
      shape.scale[0] / shape.radius
    );
    let worldMatrix;
    if (shape.type !== "car") {
      worldMatrix = mult(
        projViewMatrix,
        mult(
          translate(shape.pos[0], shape.pos[1], shape.pos[2]),
          mult(rotate(shape.rotation, [0, 1, 0]), initMatrix)
        )
      );
    } else {
      worldMatrix = mult(
        projViewMatrix,
        mult(
          rotate(shape.rotation, [0, 1, 0]),
          mult(translate(shape.pos[0] + 2.5, shape.pos[1], shape.pos[2] + 2.5), initMatrix)
        )
      );
    }
    gl.uniformMatrix4fv(worldMatrixLocation, gl.FALSE, flatten(worldMatrix));
    gl.drawArrays(gl.TRIANGLES, 0, shape.pPoints.length);
  });
}
