const vShader = `
attribute vec3 aPosition; 
attribute vec3 aColour;
varying vec3 vColour;
uniform mat4 umWorldMatrix;

void main() {
	vColour=aColour;
	vec4 transformedPos = umWorldMatrix * vec4(aPosition,1.0);
    gl_Position = transformedPos; 
}
`;

const fShader = `
precision mediump float; 
varying vec3 vColour;

void main() { 
  gl_FragColor = vec4( vColour, 1.0 ); 
}
`;

let gl;
let rotation = 0;

window.onload = (_) => {
  const canvas = document.getElementById("glCanvas");
  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) alert("WebGL isn't available");

  const houses = [
    new objectParser("Assets/meshes/H1.obj"),
    new objectParser("Assets/meshes/H1.obj", 10, 100, 0, 10),
    new objectParser("Assets/meshes/H1.obj", 270, 50, 0, 10),
    new objectParser("Assets/meshes/H1.obj", 90, -50, 0, 90),
  ];
  const houseTexture = new TGAParser(gl, "Assets/textures/H1.tga");

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  const program = initShaders(gl, vShader, fShader);
  gl.useProgram(program);

  const worldMatrixLocation = gl.getUniformLocation(program, "umWorldMatrix");
  gl.enable(gl.DEPTH_TEST);

  // setInterval(render, 16, car.span, car.offset, worldMatrixLocation, car.points);
  setInterval(renderShapes, 16, houses, worldMatrixLocation, program);
};


function renderShapes(houses, worldMatrixLocation, program) {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  let projectionMatrix = perspective(45, 640.0 / 640.0, 2.1, 10000.0);
  let viewMatrix = lookAt([0, 0, -20], [0, 10, 10], [0, 10, 0]);
  let projViewMatrix = mult(projectionMatrix, viewMatrix);

  houses.forEach((house) => {
    let colours = [];
    for (let i = 0; i < house.vertexPositions.length / 3; i++) {
      colours.push(vec3(1, 0, 0));
      colours.push(vec3(0, 1, 0));
      colours.push(vec3(0, 0, 1));
    }

    let initMatrix = mult(
      scalem(1.0 / house.span[0], 1.0 / house.span[1], 1.0 / house.span[2]),
      translate(-house.offset[0], -house.offset[1], -house.offset[2])
    );

    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      flatten(house.vertexPositions),
      gl.STATIC_DRAW
    );

    const vPos = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(vPos, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPos);

    // Colour buffer
    const colBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colours), gl.STATIC_DRAW);

    const vCol = gl.getAttribLocation(program, "aColour");
    gl.vertexAttribPointer(vCol, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vCol);

    const worldMatrix = mult(
      projViewMatrix,
      mult(initMatrix, rotate(house.rotation, [0, 1, 0]))
    );
    gl.uniformMatrix4fv(worldMatrixLocation, gl.FALSE, flatten(worldMatrix));
    gl.drawArrays(gl.TRIANGLES, 0, house.vertexPositions.length);
  });
}
