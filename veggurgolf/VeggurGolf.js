/////////////////////////////////////////////////////////////////
//    Sýnidæmi í Tölvugrafík
//     Forrit með tveimur mynstrum.  Sýnir vegg með
//     múrsteinsmynstri og gólf með viðarmynstri.  Það er hægt
//     að ganga um líkanið, en það er engin árekstarvörn.
//
//    Hjálmtýr Hafsteinsson, mars 2022
/////////////////////////////////////////////////////////////////
var canvas;
var gl;

var numVertices  = 6;

var program;

var pointsArray = [];
var colorsArray = [];
var texCoordsArray = [];

var texture;
var texVegg;
var texGolf;
var texThak;

// Breytur fyrir hreyfingu áhorfanda
var userXPos = 0.0;
var userZPos = 2.0;
var userIncr = 0.1;                // Size of forward/backward step
var userAngle = 270.0;             // Direction of the user in degrees
var userXDir = 0.0;                // X-coordinate of heading
var userZDir = -1.0;               // Z-coordinate of heading


var movement = false;
var spinX = 0;
var spinY = 0;
var origX;
var origY;

var zDist = -5.0;

var proLoc;
var mvLoc;
var numWalls = 5;
// Hnútar veggsins
var vertices = [
    //hnútar vegg 1
    vec4( -5.0,  0.0, 0.0, 1.0 ),
    vec4(  5.0,  0.0, 0.0, 1.0 ),
    vec4(  5.0,  1.0, 0.0, 1.0 ),
    vec4(  5.0,  1.0, 0.0, 1.0 ),
    vec4( -5.0,  1.0, 0.0, 1.0 ),
    vec4( -5.0,  0.0, 0.0, 1.0 ),
    //hnútar vegg 2
    vec4(  5.0,  0.0, 5.0, 1.0 ),
    vec4(  5.0,  0.0, 0.0, 1.0 ),
    vec4(  5.0,  1.0, 0.0, 1.0 ),
    vec4(  5.0,  1.0, 0.0, 1.0 ),
    vec4(  5.0,  1.0, 5.0, 1.0 ),
    vec4(  5.0,  0.0, 5.0, 1.0 ),
    //hnútar vegg 3
    vec4(  -5.0,  0.0, 5.0, 1.0 ),
    vec4(  -5.0,  0.0, 0.0, 1.0 ),
    vec4(  -5.0,  1.0, 0.0, 1.0 ),
    vec4(  -5.0,  1.0, 0.0, 1.0 ),
    vec4(  -5.0,  1.0, 5.0, 1.0 ),
    vec4(  -5.0,  0.0, 5.0, 1.0 ),
    //hnútar vegg 4
    vec4( -5.0,  0.0, 5.0, 1.0 ),
    vec4( -0.5,  0.0, 5.0, 1.0 ),
    vec4( -0.5,  1.0, 5.0, 1.0 ),
    vec4( -0.5,  1.0, 5.0, 1.0 ),
    vec4( -5.0,  1.0, 5.0, 1.0 ),
    vec4( -5.0,  0.0, 5.0, 1.0 ),
    //hnútar vegg 5
    vec4(  0.5,  0.0, 5.0, 1.0 ),
    vec4(  5.0,  0.0, 5.0, 1.0 ),
    vec4(  5.0,  1.0, 5.0, 1.0 ),
    vec4(  5.0,  1.0, 5.0, 1.0 ),
    vec4(  0.5,  1.0, 5.0, 1.0 ),
    vec4(  0.5,  0.0, 5.0, 1.0 ),

// Hnútar gólfsins (strax á eftir)
    vec4( -5.0,  0.0, 10.0, 1.0 ),
    vec4(  5.0,  0.0, 10.0, 1.0 ),
    vec4(  5.0,  0.0,  0.0, 1.0 ),
    vec4(  5.0,  0.0,  0.0, 1.0 ),
    vec4( -5.0,  0.0,  0.0, 1.0 ),
    vec4( -5.0,  0.0, 10.0, 1.0 ),
// Hnútar Þaks
    vec4( -5.0,  1.0, 5.0, 1.0 ),
    vec4(  5.0,  1.0, 5.0, 1.0 ),
    vec4(  5.0,  1.0,  0.0, 1.0 ),
    vec4(  5.0,  1.0,  0.0, 1.0 ),
    vec4( -5.0,  1.0,  0.0, 1.0 ),
    vec4( -5.0,  1.0, 5.0, 1.0 )
];

// Mynsturhnit fyrir vegg
var texCoords = [
    vec2(  0.0, 0.0 ),
    vec2( 10.0, 0.0 ),
    vec2( 10.0, 1.0 ),
    vec2( 10.0, 1.0 ),
    vec2(  0.0, 1.0 ),
    vec2(  0.0, 0.0 ),
    //veggur 2
    vec2(  0.0, 0.0 ),
    vec2( 10.0, 0.0 ),
    vec2( 10.0, 1.0 ),
    vec2( 10.0, 1.0 ),
    vec2(  0.0, 1.0 ),
    vec2(  0.0, 0.0 ),
    //veggur 3
    vec2(  0.0, 0.0 ),
    vec2( 10.0, 0.0 ),
    vec2( 10.0, 1.0 ),
    vec2( 10.0, 1.0 ),
    vec2(  0.0, 1.0 ),
    vec2(  0.0, 0.0 ),
    //veggur 4
    vec2(  0.0, 0.0 ),
    vec2( 10.0, 0.0 ),
    vec2( 10.0, 1.0 ),
    vec2( 10.0, 1.0 ),
    vec2(  0.0, 1.0 ),
    vec2(  0.0, 0.0 ),
    //veggur 5
    vec2(  0.0, 0.0 ),
    vec2( 10.0, 0.0 ),
    vec2( 10.0, 1.0 ),
    vec2( 10.0, 1.0 ),
    vec2(  0.0, 1.0 ),
    vec2(  0.0, 0.0 ),
// Mynsturhnit fyrir gólf
    vec2(  0.0,  0.0 ),
    vec2( 10.0,  0.0 ),
    vec2( 10.0, 10.0 ),
    vec2( 10.0, 10.0 ),
    vec2(  0.0, 10.0 ),
    vec2(  0.0,  0.0 ),
// Mynsturhnit fyrir þak
    vec2(  0.0,  0.0 ),
    vec2( 10.0,  0.0 ),
    vec2( 10.0, 10.0 ),
    vec2( 10.0, 10.0 ),
    vec2(  0.0, 10.0 ),
    vec2(  0.0,  0.0 ),

];


window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.9, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    
    var tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoords), gl.STATIC_DRAW );
    
    var vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
    gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vTexCoord );

    // Lesa inn og skilgreina mynstur fyrir vegg
    var veggImage = document.getElementById("VeggImage");
    texVegg = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texVegg );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, veggImage );
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
    
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);

    // Lesa inn og skilgreina mynstur fyrir gólf
    var golfImage = document.getElementById("GolfImage");
    texGolf = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texGolf );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, golfImage );
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );

    var thakImage = document.getElementById("ThakImage");
    texThak = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texThak );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, thakImage );
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );

    
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);


    proLoc = gl.getUniformLocation( program, "projection" );
    mvLoc = gl.getUniformLocation( program, "modelview" );

    var proj = perspective( 50.0, 1.0, 0.2, 100.0 );
    gl.uniformMatrix4fv(proLoc, false, flatten(proj));
    

    //event listeners for mouse
    canvas.addEventListener("mousedown", function(e){
        movement = true;
        origX = e.clientX;
    } );

    canvas.addEventListener("mouseup", function(e){
        movement = false;
    } );

    canvas.addEventListener("mousemove", function(e){
        if(movement) {
            userAngle += 0.4*(origX - e.clientX);
            userAngle %= 360.0;
            userXDir = Math.cos( radians(userAngle) );
            userZDir = Math.sin( radians(userAngle) );
            origX = e.clientX;
        }
    } );
    
    // Event listener for keyboard
     window.addEventListener("keydown", function(e){
        var newXPos = userXPos;
        var newZPos = userZPos;
         switch( e.keyCode ) {
            case 87:	// w
                newXPos += userIncr * userXDir;
                newZPos += userIncr * userZDir;;
                break;
            case 83:	// s
                newXPos -= userIncr * userXDir;
                newZPos -= userIncr * userZDir;;
                break;
            case 65:	// a
                newXPos += userIncr * userZDir;
                newZPos -= userIncr * userXDir;;
                break;
            case 68:	// d
                newXPos -= userIncr * userZDir;
                newZPos += userIncr * userXDir;;
                break;
         }
         if(!collision(newXPos,newZPos)){
            userXPos = newXPos;
            userZPos = newZPos;
         }
     }  );  

    // Event listener for mousewheel
     window.addEventListener("wheel", function(e){
         if( e.deltaY > 0.0 ) {
             zDist += 0.2;
         } else {
             zDist -= 0.2;
         }
     }  );  


    render();
 
}
function collision(XPos, ZPos){
    if(ZPos > 5.2){
        return false;
    }
    if(ZPos > 4.8){
        if(XPos > -0.4){
            if(XPos > 5.2){
                return false;
            }
            if(XPos > 0.4){
                return true;
            }
            return false;
        }
        if(XPos < -5.2){
            return false;
        }
        return true;
    }
    if(ZPos >0.2){
        if(XPos < 4.8){
            if(XPos > -4.8 || XPos < -5.2){
                return false;
            }return true;
        }if(XPos > 5.2){
            return false;
        }
        return true;
    }
    return true;
}

var render = function(){
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // staðsetja áhorfanda og meðhöndla músarhreyfingu
    var mv = lookAt( vec3(userXPos, 0.5, userZPos), vec3(userXPos+userXDir, 0.5, userZPos+userZDir), vec3(0.0, 1.0, 0.0 ) );
    
    gl.uniformMatrix4fv(mvLoc, false, flatten(mv));

    // Teikna vegg með mynstri
    for(var i = 0; i< numWalls; i++){
        gl.bindTexture( gl.TEXTURE_2D, texVegg );
        gl.drawArrays( gl.TRIANGLES, i*numVertices, numVertices );
    }
    // Teikna gólf með mynstri
    gl.bindTexture( gl.TEXTURE_2D, texGolf );
    gl.drawArrays( gl.TRIANGLES, numVertices*numWalls, numVertices );

    gl.bindTexture(gl.TEXTURE_2D,texThak);
    gl.drawArrays(gl.TRIANGLES, numVertices*(numWalls+1),numVertices)

    requestAnimFrame(render);
}
