function TGAParser(gl, file) {
  this.texture;

  const data = new Uint8Array(loadFileAJAX(file));

  const width = data[12] + (data[13] << 8);
  const height = data[14] + (data[15] << 8);
  const pixelDepth = data[16];
  const channelNum = pixelDepth / 8;

  for (let i = 0; i < width * height * channelNum; i += channelNum) {
    data[i] = data[i + 18 + 2];
    data[i + 1] = data[i + 18 + 1];
    data[i + 2] = data[i + 18];
  }

  this.texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, this.texture);

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
}
