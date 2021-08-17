function objectParser(file) {
  this.pPoints = [];
  this.tPoints = [];
  this.radius = [];
  this.offset = [];

  const lines = loadFileAJAX(file).split("\n");
  if (!lines) alert(`Could not get data from ${file}`);

  let minX, maxX, minY, maxY, minZ, maxZ;
  let vertices = [];

  lines.forEach((line) => {
    if (line[0] === "v" && line[1] === " ") {
      const vertex = line.split(" ");
      const newPosition = [
        parseFloat(vertex[1]),
        parseFloat(vertex[2]),
        parseFloat(vertex[3]),
      ];

      vertices.push(newPosition);

      if (vertices.length === 1) {
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

    if (line[0] === "f" && line[1] === " ") {
      const face = line.split(" ");

      face.slice(1).forEach((element) => {
        let vertex = element.split("/");
        this.pPoints.push(vertices[vertex[0] - 1]);
        this.tPoints.push(vertices[vertex[1] - 1]);
      });
    }
  });

  this.span = [maxX - minX, maxY - minY, maxZ - minZ];
  this.offset = [(maxX + minX) / 2.0, (maxY + minY) / 2.0, (maxZ + minZ) / 2.0];
}
