/////////////////////////////////////////////////////////////////
//    Sýnidæmi í Tölvugrafík
//     Búum til bókstafinn H úr þremur teningum
//
//    Hjálmtýr Hafsteinsson, september 2023
//
//    Sýnidæmi breytt til þess að sýna stól
//
//    Ívar Sigurðsson, september 2023
/////////////////////////////////////////////////////////////////
var canvas;
var gl;
var program;

var numVertices  = 36;
/*
var points = [];
var colors = [];
*/
var movement = false;     // Do we rotate?
var spinX = 0;
var spinY = 0;
var origX;
var origY;

var fovy = 50.0;
var near = 0.2;
var far = 100.0;

var va = vec4(0.0, 0.0, -1.0,1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333,1);
    
var lightPosition = vec4(1.0, 1.0, 1.0, 0.0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialShininess = 150.0;


var points = [];
var normals = [];
var normalMatrix, normalMatrixLoc;
var modelViewMatrixLoc;
var matrixLoc;


window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //colorCube();
    [points,normals] = normalCube(0.5);

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW );

    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    projectionMatrix = perspective( fovy, 1.0, near, far );
    gl.uniformMatrix4fv( gl.getUniformLocation(program, "projectionMatrix"), false, flatten(projectionMatrix));

    normalMatrixLoc = gl.getUniformLocation(program,"normalMatrix");
    modelViewMatrixLoc = gl.getUniformLocation(program,"modelViewMatrix");
    //event listeners for mouse
    canvas.addEventListener("mousedown", function(e){
        movement = true;
        origX = e.offsetX;
        origY = e.offsetY;
        e.preventDefault();         // Disable drag and drop
    } );

    canvas.addEventListener("mouseup", function(e){
        movement = false;
    } );

    canvas.addEventListener("mousemove", function(e){
        if(movement) {
    	    spinY = ( spinY + (origX - e.offsetX) ) % 360;
            spinX = ( spinX + (origY - e.offsetY) ) % 360;
            origX = e.offsetX;
            origY = e.offsetY;
        }
    } );
    numVertices = points.length;
    makeLight();
    render();
}
function makeLight(){
    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);

    gl.uniform4fv( gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct) );	
    gl.uniform4fv( gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(program, "shininess"), materialShininess );
}
function normalCube(r = 0.5){
    let npoints = [];
    let nnormals = [];
  
    const indices = [
      [1, 0, 3, 2],
      [2, 3, 7, 6],
      [3, 0, 4, 7],
      [6, 5, 1, 2],
      [4, 5, 6, 7],
      [5, 4, 0, 1],
    ];
    for(var i =0; i< indices.length; ++i) {
        [a,b,c,d] = indices[i];
        const [tp,tn] = normQuad(r,a,b,c,d,i);
        npoints.push(tp);
        nnormals.push(tn);

    };
  
    return [npoints, nnormals];
  };
  function normQuad(
    r,
    a,
    b,
    c,
    d,
    n,
  ){
    const vertices = [
      vec4(-r, -r, r, 1.0),
      vec4(-r, r, r, 1.0),
      vec4(r, r, r, 1.0),
      vec4(r, -r, r, 1.0),
      vec4(-r, -r, -r, 1.0),
      vec4(-r, r, -r, 1.0),
      vec4(r, r, -r, 1.0),
      vec4(r, -r, -r, 1.0),
    ];
  
    const faceNormals = [
      vec4(0.0, 0.0, 1.0, 0.0), // front
      vec4(1.0, 0.0, 0.0, 0.0), // right
      vec4(0.0, -1.0, 0.0, 0.0), // down
      vec4(0.0, 1.0, 0.0, 0.0), // up
      vec4(0.0, 0.0, -1.0, 0.0), // back
      vec4(-1.0, 0.0, 0.0, 0.0), // left
    ];
  
    let indices = [a, b, c, a, c, d];
  
    let qpoints = [];
    let qnormals = [];
    for (var i = 0; i < indices.length; ++i) {
      qpoints.push(vertices[indices[i]]);
      qnormals.push(faceNormals[n]);
    }
  
    return [qpoints, qnormals];
  };
  

const legWidth = 0.1;
const legHeight = 0.5;
const legDepth = 0.1;
const legPosX = 0.25;
const legPosY = -0.1225;
const legPosZ = 0.2;
function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    var mv = mat4();
    mv = mult( mv, rotateX(spinX) );
    mv = mult( mv, rotateY(spinY) ) ;

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(mv));
    normalMatrix = [
        vec3(mv[0][0], mv[0][1], mv[0][2]),
        vec3(mv[1][0], mv[1][1], mv[1][2]),
        vec3(mv[2][0], mv[2][1], mv[2][2]),
      ];
  
    gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix));

    // First the right leg front leg
    mv1 = mult( mv, translate( legPosX, legPosY,legPosZ ) );
    mv1 = mult( mv1, scalem( legWidth, legHeight, legDepth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(mv1));
    gl.drawArrays( gl.TRIANGLES, 0, numVertices );

    // First the right leg back leg
    mv1 = mult( mv, translate( legPosX, legPosY,-legPosZ ) );
    mv1 = mult( mv1, scalem( legWidth, legHeight, legDepth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(mv1));
    gl.drawArrays( gl.TRIANGLES, 0, numVertices );

    // Then the left leg front leg
    mv1 = mult( mv, translate( -legPosX, legPosY,legPosZ ) );
    mv1 = mult( mv1, scalem( legWidth, legHeight, legDepth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(mv1));
    gl.drawArrays( gl.TRIANGLES, 0, numVertices );

    // Then the left leg front leg
    mv1 = mult( mv, translate( -legPosX, legPosY,-legPosZ ) );
    mv1 = mult( mv1, scalem( legWidth, legHeight, legDepth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(mv1));
    gl.drawArrays( gl.TRIANGLES, 0, numVertices );

    // Finally the seat
    mv1 = mult (mv, translate(0,0.19,0))
    mv1 = mult( mv1, scalem( (legPosX*2)+(legWidth), legHeight/4,(legPosZ*2)+(legDepth) ) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(mv1));
    gl.drawArrays( gl.TRIANGLES, 0, numVertices );

    requestAnimFrame( render );
}

