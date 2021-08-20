async function parseObject(
  gl,
  objFile,
  textureFile,
  scale = [1, 1, 1],
  pos = [0, 0, 0],
  rot = 45
) {
  /* Setting up Object vertices */
  const obj = await fetch(objFile).then((response) =>
    response.status === 200 ? response.text() : null
  );

  // Making sure the object is loaded
  if (obj === null) {
    alert(`Error loading object file ${objFile}`);
    return;
  }
  // Formatting data correctly
  const objLines = obj.split("\n");
  const object = setupObject(objLines);

  /* Setting up Texture */
  const encodedTexture = await fetch(textureFile).then((response) =>
    response.status === 200 ? response.arrayBuffer() : null
  );

  // Making sure the texture is loaded
  if (encodedTexture === null) {
    alert(`Error loading texture file ${textureFile}`);
    return;
  }
  // Formatting data correctly
  const textureData = new Uint8Array(encodedTexture);
  const texture = setupTexture(gl, textureData);

  object.scale = scale;
  object.pos = pos;
  object.rotation = rot;
  object.texture = texture

  return object;
}

function setupObject(data) {
  let pPoints = [];
  let tPoints = [];

  let minX, maxX, minY, maxY, minZ, maxZ;
  let pVertices = [];
  let tVertices = [];

  data.forEach((line) => {
    // Object Coordinates
    if (line[0] === "v" && line[1] === " ") {
      const vertex = line.split(" ");
      const newPosition = [
        parseFloat(vertex[1]),
        parseFloat(vertex[2]),
        parseFloat(vertex[3]),
      ];

      pVertices.push(newPosition);

      if (pVertices.length === 1) {
        minX = maxX = newPosition[0];
        minY = maxY = newPosition[1];
        minZ = maxZ = newPosition[2];
      } else {
        if (minX > newPosition[0]) minX = newPosition[0];
        if (maxX < newPosition[0]) maxX = newPosition[0];
        if (minY > newPosition[1]) minY = newPosition[1];
        if (maxY < newPosition[1]) maxY = newPosition[1];
        if (minZ > newPosition[2]) minZ = newPosition[2];
        if (maxZ < newPosition[2]) maxZ = newPosition[2];
      }
    }

    // Texture Coordinates
    if (line[0] === "v" && line[1] === "t") {
      const vertex = line.split(" ");
      const newPosition = [parseFloat(vertex[1]), parseFloat(vertex[2])];
      tVertices.push(newPosition);
    }

    if (line[0] === "f" && line[1] === " ") {
      const face = line.split(" ");

      face.slice(1).forEach((element) => {
        let vertex = element.split("/");
        pPoints.push(pVertices[vertex[0] - 1]);
        tPoints.push(tVertices[vertex[1] - 1]);
      });
    }
  });

  const  center = [(maxX + minX) / 2, (maxY + minY) / 2, (maxZ + minZ) / 2];
  return {
    pPoints: pPoints,
    tPoints: tPoints,
    span: [maxX - minX, maxY - minY, maxZ - minZ],
    center: center,
    radius: Math.sqrt(
      (center[0] - minX) * (center[0] - minX) +
      (center[1] - minY) * (center[1] - minY) +
      (center[2] - minZ) * (center[2] - minZ)
  )
  }
}

function setupTexture(gl, data) {
  let texture;

  const width = data[12] + (data[13] << 8);
  const height = data[14] + (data[15] << 8);
  const pixelDepth = data[16];
  const channelNum = pixelDepth / 8;

  for (let i = 0; i < width * height * channelNum; i += channelNum) {
    data[i] = data[i + 18 + 2];
    data[i + 1] = data[i + 18 + 1];
    data[i + 2] = data[i + 18];
  }

  texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGB,
    width,
    height,
    0,
    gl.RGB,
    gl.UNSIGNED_BYTE,
    data
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(
    gl.TEXTURE_2D,
    gl.TEXTURE_MIN_FILTER,
    gl.LINEAR_MIPMAP_NEAREST
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

  gl.generateMipmap(gl.TEXTURE_2D);

  return texture;
}
