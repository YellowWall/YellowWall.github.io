var gl;
var points;

var color = vec4( 1.0, 0.0, 0.0, 1.0 );
var locColor;
var locTime;
var iniTime;
var lastChange;

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    var vertices = new Float32Array([-1, -1, 0, 1, 1, -1]);

    //  Configure WebGL

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.95, 1.0, 1.0, 1.0 );
    
    //  Load shaders and initialize attribute buffers
    
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // Load the data into the GPU
    
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW );

    // Associate shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    locColor = gl.getUniformLocation( program, "rcolor" );
    gl.uniform4fv( locColor, flatten(color) );

    locTime = gl.getUniformLocation( program, "time" );
    gl.uniform4fv(locColor,vec4(1,0,0,1));

    iniTime = Date.now();
    lastChange = 0;

    render();
};
function colChange(){
    var col = vec4( Math.random(), Math.random(), Math.random(), 1.0 );
    gl.uniform4fv( locColor , flatten(col) );
}


function render() {
    var msek = Date.now() - iniTime;
    gl.uniform1f(locTime,msek);/*
    if((msek-1000)  > lastChange){
        lastChange = msek;
        colChange();
    }*/
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, 3 );

    window.requestAnimationFrame(render);
}
