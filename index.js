const canvas = document.getElementById("glCanvas");
const gl = canvas.getContext("webgl");

if (!gl) {
  throw new Error("WebGL not supported!");
}

const vertexData = new Float32Array([0, 1, 0, -1, -1, 0, 1, -1, 0]);
const colourData = new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);

const colourBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colourBuffer);
gl.bufferData(gl.ARRAY_BUFFER, colourData, gl.STATIC_DRAW);

const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(
  vertexShader,
  `
  precision mediump float;

  attribute vec3 position;
  attribute vec3 colour;
  varying vec3 vColour;

  uniform mat4 matrix;

  void main() {
    vColour = colour;
    gl_Position = matrix * vec4(position, 1.0);
  }
`
);
gl.compileShader(vertexShader);

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(
  fragmentShader,
  `
  precision mediump float;

  varying vec3 vColour;

  void main() {
    gl_FragColor = vec4(vColour, 1.0);
  }
`
);
gl.compileShader(fragmentShader);

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

const positionLocation = gl.getAttribLocation(program, "position");
gl.enableVertexAttribArray(positionLocation);
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.vertexAttribPointer(
  positionLocation,
  vertexData.length / 3,
  gl.FLOAT,
  false,
  0,
  0
);

const colourLocation = gl.getAttribLocation(program, "colour");
gl.enableVertexAttribArray(colourLocation);
gl.bindBuffer(gl.ARRAY_BUFFER, colourBuffer);
gl.vertexAttribPointer(
  colourLocation,
  colourData.length / 3,
  gl.FLOAT,
  false,
  0,
  0
);

gl.useProgram(program);

const uniformLocations = {
  matrix: gl.getUniformLocation(program, "matrix"),
};

let matrix = mat4();
matrix = mult(matrix, translate(0.2, 0.5, 1));
matrix = mult(matrix, scalem(0.25, 0.25, 0.25));

function animate() {
  requestAnimationFrame(animate);
  gl.uniformMatrix4fv(uniformLocations.matrix, false, flatten(mult(matrix, rotate(90, [0, 0, 1]))));
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

requestAnimationFrame(animate);
