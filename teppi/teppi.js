"use strict";
//ivs10
var canvas;
var gl;
let third = 1/3;
var points = [];

var NumTimesToSubdivide = 3;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    // First, initialize the corners of our carpet

    var vertices = [
        vec2( -1, 1 ),
        vec2(  1, 1 ),
        vec2(-1,-1),
        vec2(1,-1)
    ];

    divideSquare(vertices[0],vertices[1],vertices[2],vertices[3],NumTimesToSubdivide)

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    console.log(flatten(points));
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    render();
};
function squareExtrapolator(a,d,count){
    var b = vec2(d[0],a[1]);
    var c = vec2(a[0],d[1]);
    divideSquare(a,b,c,d,count)
}

//a=-1,1;b=1,1;c=-1,-1;d=1,-1;
function divideSquare(a,b,c,d,count){
    if( count === 0){
        square(a,b,c,d);
    }
    else{
        //skiptum hliðum kassans
        var a1 = mix(a,d,third);
        var d1 = mix(a1,d,0.5);
        var array = [a,a1,d1,d];
        --count;
        for(var i = 0; i<3;i++){
            for(var j = 0; j<3;j++){
                if(i!==1 || j!==1)
                squareExtrapolator(vec2(array[i][0],array[j][1]),vec2(array[i+1][0],array[j+1][1]),count);
            }
        }
    }
}
function square(a,b,c,d){
    points.push(a,b,c,b,c,d);
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );

    gl.drawArrays( gl.TRIANGLES, 0  , points.length );
}
