//ivs10
var gl;
var colorLoc;
var offsetLoc;
var trinum = 100;

window.onload = function init()
{
    var canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    var vertices = [-0.07,-0.07,
        0.07,-0.07,
        0.0,0.07];
    //notum Math.random * 2 til að fá tölu til að draga frá 1 sem gefur okkur tölu á bilinu -1 til 1
    //þetta verða hliðrunartölurnar okkar fyrir x og y hnit punktana okkar

    gl.viewport(0,0,canvas.width,canvas.height);
    gl.clearColor(1.0,1.0,1.0,1.0);
    var program = initShaders(gl,"vertex-shader","fragment-shader");
    gl.useProgram(program);

    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,bufferId);
    gl.bufferData(gl.ARRAY_BUFFER,flatten(vertices),gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition,2,gl.FLOAT,false,0,0);
    gl.enableVertexAttribArray(vPosition);
    colorLoc = gl.getUniformLocation( program, "fColor" );
    offsetLoc = gl.getUniformLocation(program,"u_offset");
    render();

}
function render(){
    gl.clear(gl.COLOR_BUFFER_BIT);
	// Setjum litinn sem bláann og teiknum helming punktanna
    for(var i = 0;i<trinum;i++){
        var coladj = vec4(Math.random(),Math.random(),Math.random(),0.5+Math.random()*0.5);
        var locadj = vec4(1-(Math.random()*2),1-(Math.random()*2),Math.random(),0);
        gl.uniform4fv( colorLoc, coladj );
        gl.uniform4fv( offsetLoc , locadj)
        gl.drawArrays( gl.TRIANGLES,0,3);
    }
}