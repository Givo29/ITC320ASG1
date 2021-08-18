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

  const house = new objectParser("Assets/meshes/H1.obj");

  const houseTexture = await parseTGA(gl, "Assets/textures/H1.tga");

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  let program = initShaders(gl, vShader, fShader);
  gl.useProgram(program);

  gl.uniform1i(gl.getUniformLocation(program, "myTexture"), 0);
  gl.activeTexture(gl.TEXTURE0);

  // Position buffer
  const posBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(house.pPoints), gl.STATIC_DRAW);

  const vPos = gl.getAttribLocation(program, "aPosition");
  gl.vertexAttribPointer(vPos, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPos);

  // Colour buffer
  const colBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(house.tPoints), gl.STATIC_DRAW);

  const vCol = gl.getAttribLocation(program, "aTextureCoordinate");
  gl.vertexAttribPointer(vCol, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vCol);

  const worldMatrixLocation = gl.getUniformLocation(program, "umWorldMatrix");
  gl.enable(gl.DEPTH_TEST);

  setInterval(render, 16, house, houseTexture, worldMatrixLocation);
};

function render(house, houseTexture, worldMatrixLocation) {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  if (houseTexture === null) return;
  gl.bindTexture(gl.TEXTURE_2D, houseTexture);

  let projectionMatrix = perspective(45, 640.0 / 640.0, 2.1, 10000.0);
  let viewMatrix = lookAt([0, 0, -20], [0, 0, 10], [0, 1, 0]);
  let projViewMatrix = mult(projectionMatrix, viewMatrix);
  let initMatrix = mult(
    scalem(1.0 / house.radius, 1.0 / house.radius, 1.0 / house.radius),
    translate(-house.center[0], -house.center[1], -house.center[2])
  );

  initMatrix = scalem(
    2.0 / house.radius,
    2.0 / house.radius,
    2.0 / house.radius
  );

  const worldMatrix = mult(
    projViewMatrix,
    mult(rotate(45, [0, 1, 0]), initMatrix)
  );
  gl.uniformMatrix4fv(worldMatrixLocation, gl.FALSE, flatten(worldMatrix));
  gl.drawArrays(gl.TRIANGLES, 0, house.pPoints.length);
}
