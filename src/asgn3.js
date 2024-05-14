// HelloPoint1.js (c) 2012 matsuda

// Vertex shader program
var VSHADER_SOURCE = 
  'attribute vec4 a_Position;\n' + // attribute variable
  'attribute vec2 a_UV;\n' +
  'varying vec2 v_UV;\n' +
  'uniform mat4 u_ModelMatrix;\n' +
  'uniform mat4 u_ViewMatrix;\n' +
  'uniform mat4 u_ProjectionMatrix;\n' +
  'void main() {\n' +
  '  gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;\n' +
  '  v_UV = a_UV;\n' +
  '}\n'; 

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform int u_whichTexture;
  void main() {

    if (u_whichTexture == -2) {

        gl_FragColor = u_FragColor; // Use Color

    } else if (u_whichTexture == -1) {

        gl_FragColor = vec4(v_UV, 1.0, 1.0); // Use UV debug color

    } else if (u_whichTexture == 0) {

        gl_FragColor = texture2D(u_Sampler0, v_UV);

    } else if (u_whichTexture == 1) {

        gl_FragColor = texture2D(u_Sampler1, v_UV);

    } else {
        gl_FragColor = vec4(1,0.2,0.2,1); // Otherwise just use some reddish color
    }
    
  }`;

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
let u_whichTexture;
let u_Sampler0;
let u_Sampler1;

// Global UI element related variables
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedType=POINT;
let g_globalAngle = [0, 0, 0];
let g_globalScale = 1;

// all the UI interaction
function addActionsForHtmlUI() {
   //all gone
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

  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }

  // Get the storage location of u_Sampler
  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler0');
    return false;
  }

  // Get the storage location of u_Sampler
  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler1) {
    console.log('Failed to get the storage location of u_Sampler1');
    return false;
  }

  // Get the storage location of u_whichTexture
  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
    console.log('Failed to get the storage location of u_whichTexture');
    return false;
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

  g_cam = new Camera();

    canvas.addEventListener("click", async () => {
      if (!(document.pointerLockElement === canvas)) {
        await canvas.requestPointerLock({
          unadjustedMovement: true,
        });
      }
    });
  

  //Register function (event handler) to be called on a mouse press
  canvas.onmousedown = function(ev) {
    click(ev) 
  };

  document.addEventListener("mousemove", mouseMovement);

  //document.onkeydown = keydown;
  document.addEventListener("keydown", keydown, false);
  document.addEventListener("keyup", keyup, false);

  initTextures();

  // Specify the color for clearing <canvas>
  gl.clearColor(0.15, 0.14, 0.32, 1.0);

  renderAllShapes();
  requestAnimationFrame(tick);
}

function mouseMovement(event) {
  if (document.pointerLockElement === canvas) {
    g_cam.panLeft(event.movementX/-10);
    g_cam.panUp(event.movementY/-10);
  } else {
    return;
  }
}

var g_startTime=performance.now()/1000.0;
var g_seconds=performance.now()/1000.0-g_startTime;

function tick() {
  // save current time
  g_seconds=performance.now()/1000.0-g_startTime;
  //console.log(g_seconds);

  //updateAnimationAngles();

  // Draw everything
  renderAllShapes();

  // Tell the browser to update again when it has time
  requestAnimationFrame(tick);
}

function initTextures() {
  var image1 = new Image();  // Create the image object
  if (!image1) {
    console.log('Failed to create the image object');
    return false;
  }
  var image2 = new Image();  // Create the image object
  if (!image2) {
    console.log('Failed to create the image object');
    return false;
  }

  // Register the event handler to be called on loading an image
  image1.onload = function(){ sendTextureToGLSL(0, image1); };
  image2.onload = function(){ sendTextureToGLSL(1, image2); };

  // Tell the browser to load an image
  image1.src = '../offcentertile.jpg';
  image2.src = '../maurice.jpg';

  return true;
}

function sendTextureToGLSL(n, image) {
  var texture = gl.createTexture();   // Create a texture object
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis

  if (n == 0) {
  
    // Enable texture unit0
    gl.activeTexture(gl.TEXTURE0);
    // Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    
    // Set the texture unit 0 to the sampler
    gl.uniform1i(u_Sampler0, 0);

  } else {
    // texture 1 ---------------------------

    // Enable texture unit1
    gl.activeTexture(gl.TEXTURE1);
    // Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    
    // Set the texture unit 1 to the sampler
    gl.uniform1i(u_Sampler1, 1);
  }
  
}

function clearCanvas() {
  g_shapesList[g_selectedLayer] = [];
  renderAllShapes();
}

function click(ev) {
  switch (ev.button) { // this one is from chatGPT
    case 0: //Left Click
      createBlock();
      break;
    case 2: //Right
      deleteBlock();
      break;
  }
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

var g_keyspressed = [false, false, false, false, false, false];

// enacts camera movement
function keydown(ev) {

  if (ev.keyCode == 87) { // w key, forward

    g_keyspressed[0] = true;

  } else if (ev.keyCode == 83) { //s key, backward
    
    g_keyspressed[1] = true;

  }
  
  if (ev.keyCode == 65) { //a key, move left
    
    g_keyspressed[2] = true;

  } else if (ev.keyCode == 68)  { //d key, move right

    g_keyspressed[3] = true;
    
  } else if (ev.keyCode == 81) { // q key, pan left

    g_keyspressed[4] = true;

  } else if (ev.keyCode == 69) { // e key, pan right

    g_keyspressed[5] = true;
 
  } else { return; }
}

// signals when keys are not pressed
function keyup(ev) {

  if (ev.keyCode == 87) { // w key, forward

    g_keyspressed[0] = false;
    

  } else if (ev.keyCode == 83) { //s key, backward
    
    g_keyspressed[1] = false;

  }
  
  if (ev.keyCode == 65) { //a key, move left
    
    g_keyspressed[2] = false;

  } else if (ev.keyCode == 68)  { //d key, move right

    g_keyspressed[3] = false;
    
  } else if (ev.keyCode == 81) { // q key, pan left

    g_keyspressed[4] = false;

  } else if (ev.keyCode == 69) { // e key, pan right

    g_keyspressed[5] = false;
 
  } else { return; }
}

function handlemovement() {
  var moveSpeed = 0.5;
  var panSpeed = 10;

  if (g_keyspressed[0] == true) { // w key, forward

    g_cam.moveForward(moveSpeed);

  } else if (g_keyspressed[1] == true) { //s key, backward
    
    g_cam.moveForward(-moveSpeed);

  }
  
  if (g_keyspressed[2] == true) { //a key, move left
    
    g_cam.moveLeft(moveSpeed);

  } else if (g_keyspressed[3] == true)  { //d key, move right

    g_cam.moveLeft(-moveSpeed);
    
  } else if (g_keyspressed[4] == true) { // q key, pan left

    g_cam.panLeft(panSpeed);

  } else if (g_keyspressed[5] == true) { // e key, pan right

    g_cam.panLeft(-panSpeed);
 
  } else { return; }
}

// could probably be pretty easily turned into a local variable in main and passed in, allowing different map loads
var g_map=[
  [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
  [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
  [3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 3],
  [3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 3],
  [3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 3],
  [3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 3],
  [3, 3, 1, 1, 1, 1, 5, 5, 5, 5, 5, 5, 3, 3, 9, 9, 9, 9, 3, 3, 5, 5, 5, 5, 5, 5, 1, 1, 1, 1, 3, 3],
  [3, 3, 1, 1, 1, 1, 5, 5, 5, 5, 5, 5, 3, 3, 9, 9, 9, 9, 3, 3, 5, 5, 5, 5, 5, 5, 1, 1, 1, 1, 3, 3],
  [3, 3, 1, 1, 1, 1, 5, 5, 5, 5, 5, 5, 3, 3, 9, 9, 9, 9, 3, 3, 5, 5, 5, 5, 5, 5, 1, 1, 1, 1, 3, 3],
  [3, 3, 1, 1, 1, 1, 5, 5, 5, 5, 5, 5, 3, 3, 9, 9, 9, 9, 3, 3, 5, 5, 5, 5, 5, 5, 1, 1, 1, 1, 3, 3],
  [3, 3, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 3, 3],
  [3, 3, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 3, 3],
  [3, 3, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 3, 3],
  [3, 3, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 3, 3],
  [3, 3, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 3, 3],
  [3, 3, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 3, 3],
  [3, 3, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 3, 3],
  [3, 3, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 3, 3],
  [3, 3, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 3, 3],
  [3, 3, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 3, 3],
  [3, 3, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 3, 3],
  [3, 3, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 3, 3],
  [3, 3, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 3, 3],
  [3, 3, 1, 1, 1, 1, 5, 5, 5, 5, 5, 5, 3, 3, 9, 9, 9, 9, 3, 3, 5, 5, 5, 5, 5, 5, 1, 1, 1, 1, 3, 3],
  [3, 3, 1, 1, 1, 1, 5, 5, 5, 5, 5, 5, 3, 3, 9, 9, 9, 9, 3, 3, 5, 5, 5, 5, 5, 5, 1, 1, 1, 1, 3, 3],
  [3, 3, 1, 1, 1, 1, 5, 5, 5, 5, 5, 5, 3, 3, 9, 9, 9, 9, 3, 3, 5, 5, 5, 5, 5, 5, 1, 1, 1, 1, 3, 3],
  [3, 3, 1, 1, 1, 1, 5, 5, 5, 5, 5, 5, 3, 3, 9, 9, 9, 9, 3, 3, 5, 5, 5, 5, 5, 5, 1, 1, 1, 1, 3, 3],
  [3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 3],
  [3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 3],
  [3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 3],
  [3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 3],
  [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
  [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
];

// draws map using that massive g_map array up there, number equates to height
function drawMap(mapsize) {
  for (x=0;x<mapsize;x++) {
    for (y=0;y<mapsize;y++){
        for (z=0;z<g_map[x][y];z++) { // generate one cube per height
          drawCube([x-mapsize/2, -1.75+z, y-mapsize/2], [1, 1, 1], [0, 1, 0, 0], [1,1,1], 0);
        }
    }
  }
}

// rounds camera coordinate to where it is on the map
function getBlockCoordinates() {
  var cameraCoords = g_cam.eye.elements.slice();
  //console.log(cameraCoords);
  for (let weh = 0; weh < 3; weh++) {
    cameraCoords[weh] = Math.ceil(cameraCoords[weh]) + 15;
  }

  return cameraCoords;
}

// Creates block at given coordinate
function createBlock() {

  cameraCoords = getBlockCoordinates();

  //console.log(cameraCoords);
  //console.log(g_map[cameraCoords[0]][cameraCoords[2]]);
  if (cameraCoords[0] < 33 && cameraCoords[0] > 0 && cameraCoords[2] < 33 && cameraCoords[2] > 0) {
    g_map[cameraCoords[0]][cameraCoords[2]] = g_map[cameraCoords[0]][cameraCoords[2]] + 1;
  }

}

// Deletes block at given coordinate
function deleteBlock() {
  cameraCoords = getBlockCoordinates();

  if (cameraCoords[0] < 33 && cameraCoords[0] > 0 && cameraCoords[2] < 33 && cameraCoords[2] > 0) {
    g_map[cameraCoords[0]][cameraCoords[2]] = g_map[cameraCoords[0]][cameraCoords[2]] - 1;
  }
} 

// renders all stored shapes
function renderAllShapes() {
  
  // Checking the time at the start of the draw
  var startTime = performance.now();

  // Does camera stuff
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, g_cam.projMat.elements);
  gl.uniformMatrix4fv(u_ViewMatrix, false, g_cam.viewMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Handles movement based on user input
  handlemovement();

  // head cube -----------------------------------------
  var head = new Cube();
  head.color = [1.0,0.1,0.1,1.0];
  head.textureNum = 1;
  head.matrix.translate(-0.125,4.25,-0.0625);
  head.matrix.scale(2,2,2);
  head.renderfast();

  // floor cube -----------------------------------------
  var floor = new Cube();
  floor.color = [0.7,0,0,1.0];
  floor.textureNum = -2;
  floor.matrix.translate(0,-1.76,0);
  floor.matrix.scale(38,0,38);
  floor.matrix.translate(-0.5,0,-0.5);
  floor.renderfast();

  // sky cube ------------------------------------------
  var sky = new Cube();
  sky.color = [0.2,0.2,0.2,1.0];
  sky.textureNum = -2;
  sky.matrix.scale(1000,1000,1000);
  sky.matrix.translate(-0.5,-0.5,-0.5);
  sky.renderfast();

  // draw map
  drawMap(32);

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
