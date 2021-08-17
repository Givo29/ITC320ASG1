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

  const car = new objectParser("Assets/meshes/H3.obj");

  const points = car.vertexPositions;
  const span = car.span;
  const offset = car.offset;

  let colours = [];

  for (let i = 0; i < points.length / 3; i++) {
    colours.push(vec3(1, 0, 0));
    colours.push(vec3(0, 1, 0));
    colours.push(vec3(0, 0, 1));
  }

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  let program = initShaders(gl, vShader, fShader);
  gl.useProgram(program);

  // Position buffer
  const posBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

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

  const worldMatrixLocation = gl.getUniformLocation(program, "umWorldMatrix");
  gl.enable(gl.DEPTH_TEST);

  setInterval(render, 16, span, offset, worldMatrixLocation, points);
};

function render(span, offset, worldMatrixLocation, points) {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  let projectionMatrix = perspective(45, 640.0 / 640.0, 2.1, 10000.0);
  let viewMatrix = lookAt([0, 0, -20], [0, 0, 10], [0, 1, 0]);
  rotation += 0.5;
  const worldMatrix = mult(
    projectionMatrix,
    mult(
      viewMatrix,
      mult(
        rotate(rotation, [0, 1, 0]),
        mult(
          scalem(3.0 / span[0], 3.0 / span[1], 3.0 / span[2]),
          translate(-offset[0], -offset[1], -offset[2])
        )
      )
    )
  );
  gl.uniformMatrix4fv(worldMatrixLocation, gl.FALSE, flatten(worldMatrix));
  gl.drawArrays(gl.TRIANGLES, 0, points.length);
}
