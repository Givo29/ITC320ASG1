// Get a file as a string using  AJAX
function loadBinaryFileAJAX(name, callbackfunction) {
  var xhr = new XMLHttpRequest(),
    okStatus = document.location.protocol === "file:" ? 0 : 200;
  xhr.responseType = "arraybuffer";
  xhr.open("GET", name, true);

  xhr.onload = function (oEvent) {
    //callbackfunction(xhr.response);
  };
  xhr.send(null);
  return xhr.status == okStatus ? xhr.response : null;
}

// Get a file as a string using  AJAX
function loadFileAJAX(name) {
  var xhr = new XMLHttpRequest(),
    okStatus = document.location.protocol === "file:" ? 0 : 200;
  xhr.open("GET", name, false);
  xhr.send(null);
  return xhr.status == okStatus ? xhr.responseText : null;
}

function getFile(name) {
  let txt = '';
  let xhr = new XMLHttpRequest();
  xhr.onreadystatechange = _ => {
    if (xhr.status === 200 && xhr.readyState === 4) {
      txt = xhr.responseText;
    }
  };
  xhr.open('GET', name, true);
  xhr.send();
  return xhr.status === 200 ? xhr.responseText : null;
}

function initShaders(gl, vShaderName, fShaderName) {
  function getShader(gl, shaderName, type) {
    var shader = gl.createShader(type),
      shaderScript = loadFileAJAX(shaderName);
    if (!shaderScript) {
      alert("Could not find shader source: " + shaderName);
    }
    gl.shaderSource(shader, shaderScript);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert(gl.getShaderInfoLog(shader));
      return null;
    }
    return shader;
  }
  var vertexShader = getShader(gl, vShaderName, gl.VERTEX_SHADER),
    fragmentShader = getShader(gl, fShaderName, gl.FRAGMENT_SHADER),
    program = gl.createProgram();
    return program

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    alert("Could not initialise shaders");
    return null;
  }

  return program;
}
