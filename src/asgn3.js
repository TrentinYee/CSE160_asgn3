// HelloPoint1.js (c) 2012 matsuda

// Vertex shader program
var VSHADER_SOURCE = 
  'attribute vec4 a_Position;\n' + // attribute variable
  'attribute vec2 a_UV;\n' +
  'varying vec2 v_UV;\n' +
  'uniform mat4 u_ModelMatrix;\n' +
  'uniform mat4 u_GlobalRotateMatrix;\n' +
  'void main() {\n' +
  '  gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;\n' +
  '  v_UV = a_UV;\n' +
  '}\n'; 

// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'varying vec2 v_UV;\n' +
  'uniform vec4 u_FragColor;\n' +
  'void main() {\n' +
  '  gl_FragColor = u_FragColor;\n' + // Set the point color
  '  gl_FragColor = vec4(v_UV, 1.0, 1.0);\n' +
  '}\n';

// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

//Global Variables
let canvas;
let gl;
let a_Position;
let u_PointSize;
let u_FragColor;
let a_UV;

// Global UI element related variables
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedType=POINT;
let g_globalAngle = [0, 0, 0];
let g_larmAngle = [[0,0,0],[0,0,0],[60, 0, 0]]; // every matrix is a dimension XYZ and the elements in the matrix are for each individual shape
let g_rarmAngle = [[0,0,0],[0,0,0],[60, 0, 0]];
let g_tailAngle = [[25,25,25],[0,0,0],[0, 0, 0]];
let g_llegAngle = [[0,0,0],[0,0,0],[0, 0, 0]];
let g_rlegAngle = [[0,0,0],[0,0,0],[0, 0, 0]];
let g_idle = 0;
let g_jutsu = 0;
let g_globalScale = 1;
let g_shrine;

// all the UI interaction
function addActionsForHtmlUI() {
   // Camera Sliders
  document.getElementById('YangleSlide').addEventListener('mousemove', function() { g_globalAngle[1] = this.value; renderAllShapes(); });
  document.getElementById('XangleSlide').addEventListener('mousemove', function() { g_globalAngle[0] = this.value; renderAllShapes(); });
  document.getElementById('ZangleSlide').addEventListener('mousemove', function() { g_globalAngle[2] = this.value; renderAllShapes(); });
  document.getElementById('ZoomSlide').addEventListener('mousemove', function() { g_globalScale = this.value/10; renderAllShapes(); });
}

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  //gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Get the storage location of uniform variables
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (u_FragColor < 0) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of attribute variables
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // get the storage location of a_UV
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }

  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  // Set initial value for this matrix to identity
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

}

// THE MAIN FUNCTION
function main() {

  // sets up canvas and gl
  setupWebGL();

  // set up shader programs and glsl variables
  connectVariablesToGLSL();
  
  // set up the actions for all the HTML UI elements
  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = function(ev) {
    if(ev.shiftKey) { 
      resetmodel();
      g_shrine.play();
      g_jutsu = 1;
    } else {
      click(ev) 
    } 
  };
  canvas.onmousemove = function(ev) {if(ev.buttons == 1) { drag(ev) } };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.15, 0.14, 0.32, 1.0);

  renderAllShapes();
  requestAnimationFrame(tick);
}

var g_startTime=performance.now()/1000.0;
var g_seconds=performance.now()/1000.0-g_startTime;

function tick() {
  // save current time
  g_seconds=performance.now()/1000.0-g_startTime;
  //console.log(g_seconds);

  updateAnimationAngles();

  // Draw everything
  renderAllShapes();

  // Tell the browser to update again when it has time
  requestAnimationFrame(tick);
}

function clearCanvas() {
  g_shapesList[g_selectedLayer] = [];
  renderAllShapes();
}

var g_lastclick = [0, 0];

function click(ev) {
  let [x, y] = convertCoordinatesEventToGL(ev);

  //console.log(g_lastclick);

  //g_globalAngle[0] += (y - g_lastclick[0]) * 90;
  //g_globalAngle[1] += (x - g_lastclick[1]) * 90;

  g_lastclick[0] = y;
  g_lastclick[1] = x;
  renderAllShapes();
}

function drag(ev) {
  let [x, y] = convertCoordinatesEventToGL(ev);

  //console.log(g_lastclick);
  //console.log(x);
  //console.log(y);
  g_globalAngle[0] -= (y - g_lastclick[0]) * 2;
  g_globalAngle[1] -= (x - g_lastclick[1]) * 2;
  
  renderAllShapes();
}

// converts the coordiantes of the event to the coordinates needed
function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return([x, y]);
}

var g_bottomy = -1.5;
var g_topy = 1.5;
var g_bottomog = -5.0;
var g_topog = 5.0;
var g_flash = 8.0;
var g_flashstart = 0; //used as a tick timer
var g_soundstart = 0;
var g_ending = 0;
var g_slash = -8.0;

// Update the angles of everything if currently animated
function updateAnimationAngles() {
  //console.log(g_idle);
  if (g_idle) {
    // Tail --------------
    g_tailAngle[2][0] = 45*Math.sin(2*g_seconds);
    g_tailAngle[2][1] = 25*Math.sin(2*g_seconds);
    g_tailAngle[2][2] = 60*Math.sin(2*g_seconds);

    // Left arm ------------
    g_larmAngle[1][0] = 15*Math.sin(5*g_seconds);

    // Right arm --------------
    g_rarmAngle[1][0] = 15*Math.sin(5*g_seconds);
    
  } else if(g_jutsu) { // Poke animation ---------------------------
    gl.clearColor(0.5, 0.0, 0.0, 1.0);
    g_bottomog = 0;
    g_topog = 0;

    // timer for this animation specifically -----------------
    g_flashstart += 0.01;

    // Black bars -------------------

    if (g_bottomy <= -0.3) {
      g_bottomy += 0.025;
      //console.log(g_bottomy);
    }
    
    if (g_topy >= 0.3) {
      g_topy -= 0.025;
      //console.log(g_topy);
    }

    // Zoom ------------------------

    if (g_globalScale < 1.65) {
      g_globalScale += 0.025;
    } else if (g_globalScale > 1.75) {
      g_globalScale -= 0.05;
    }

    // Left arm ------------
    if (g_larmAngle[0][0] > -20) {
      g_larmAngle[0][0] = -30*Math.abs(Math.sin(g_flashstart));
    }

    if (g_larmAngle[1][0] > -30) {
      g_larmAngle[1][0] = -40*Math.abs(Math.sin(g_flashstart));
    }

    if (g_larmAngle[0][1] > -110) {
      g_larmAngle[0][1] = -115*Math.abs(Math.sin(g_flashstart));
    }
    

    // Right arm --------------
    if (g_rarmAngle[0][0] > -20) {
      g_rarmAngle[0][0] = -30*Math.abs(Math.sin(g_flashstart));
    }

    if (g_rarmAngle[1][0] > -30) {
      g_rarmAngle[1][0] = -40*Math.abs(Math.sin(g_flashstart));
    }

    if (g_rarmAngle[0][1] > -110) {
      g_rarmAngle[0][1] = -125*Math.abs(Math.sin(g_flashstart));
    }

    if (g_flashstart > 7.75) {
      g_slash = 0.0;
    }

    if (g_flashstart > 8) {
      g_flash = -1.0;
    }

    if (g_flashstart > 11) {
      g_ending = 1;
    }

    // return to normal --------------------
    if (g_ending) {
      resetmodel();
    }

  }
}

function resetmodel() {
  g_bottomog = -3.0;
  g_topog = 3.0;
  g_idle = 0;
  g_flash = 8.0;
  g_soundstart = 0;
  g_jutsu = 0;
  gl.clearColor(0.15, 0.14, 0.32, 1.0);
  g_larmAngle = [[0,0,0],[0,0,0],[60, 0, 0]];
  g_rarmAngle = [[0,0,0],[0,0,0],[60, 0, 0]];
  g_tailAngle = [[25,25,25],[0,0,0],[0, 0, 0]];
  g_llegAngle = [[0,0,0],[0,0,0],[0, 0, 0]];
  g_rlegAngle = [[0,0,0],[0,0,0],[0, 0, 0]];
  g_globalAngle = [0, 0, 0];
  g_globalScale = 1.0;
  g_flashstart = 0;
  g_ending = 0;
  g_slash = -8;
}


// renders all stored shapes
function renderAllShapes() {
  
  // Checking the time at the start of the draw
  var startTime = performance.now();

  // Pass the matrix to the u_ModelMatrix attribute
  var globalRotMat = new Matrix4();
  globalRotMat.rotate(g_globalAngle[0],1,0,0);
  globalRotMat.rotate(g_globalAngle[1],0,1,0);
  globalRotMat.rotate(g_globalAngle[2],0,0,1);
  globalRotMat.scale(g_globalScale, g_globalScale, g_globalScale);
  
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  // pos, scale, irot, rot, color is the order

  // black bars ----------------------------------------------

  var bottombar = new Cube();
  bottombar.color = [0.0,0.0,0.0,1.0];
  //bottombar.matrix.translate(-1.0, -2.0, 1.0);
  bottombar.matrix.translate(-1.0, g_bottomy + g_bottomog, 0.5);
  bottombar.matrix.scale(2.0,-0.75,-0.1);
  bottombar.render();

  var topbar = new Cube();
  topbar.color = [0.0,0.0,0.0,1.0];
  topbar.matrix.translate(-1.0, g_topy + g_topog, 0.5);
  topbar.matrix.scale(2.0, 0.75,-0.1);
  topbar.render();

  var flashbang = new Cube();
  flashbang.color = [0.0,0.0,0.0,1.0];
  flashbang.matrix.translate(-1.0, g_flash, -0.5);
  flashbang.matrix.scale(2.0, 2.0,-0.1);
  flashbang.render();
  
  // head cube -----------------------------------------
  var head = new Cube();
  head.color = [0.9,0.9,0.9,1.0];
  head.matrix.translate(-0.125,0.25,-0.0625);
  head.matrix.scale(0.25,0.25,0.25);
  head.renderfast();

  // performance stuff
  var duration = performance.now() - startTime;
  //console.log(duration);
  sendTextToHTML("ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numdot");
}

//Set the text of an HTML element
function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}
