//ivs10
var gl;
var colorLoc;
var offsetLoc;
var rotationLoc;
var trinum = 100;
var frogDir = false;
var points = 0;
const lanes = 9;
const streetcol = vec4(0,0,0,1);
const sidewalkcol = vec4(0.5,0.5,0.5,1);
const frogcol = vec4(0.5,0.6,0.2,1);
var carCol = [];
var carX = [];
var carspeed = [];
const laneWidth = 2/lanes;
const carWidth = laneWidth*2;
const frograd = (laneWidth/2)*0.7;
var frogX =  4;
var frogY = lanes;
var frogPos = vec4(xToCanvasX(lanes,frogX),yToCanvasY(lanes,frogY),0,0);
var gameOver = false;
var win = false;

document.addEventListener('keydown', (event) => {
    var code = event.code;
    if(!gameOver){
    switch(code){
        case'ArrowUp':
            movefrog('upp');
            break;
        case 'ArrowDown':
            movefrog('down');
            break;
        case 'ArrowLeft':
            movefrog('left');
            break;
        case 'ArrowRight':
            movefrog('right');
            break;
    }
    render();
}
})

window.onload = function init()
{   var canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    const lane = square([-1,laneWidth],[1,0]);
    const froggy = [frograd,frograd*2,0,0,frograd*2,0];
    const reverseFroggy = [frograd,0,0,frograd*2,frograd*2,frograd*2];
    const car = square([0,laneWidth*0.8],[carWidth,laneWidth*0.2]);
    const scoreMark = square([0.02,0.05],[-0.02,-0.05]);
    var vertices = [];
    vertices.push(lane);
    vertices.push(froggy);
    vertices.push(reverseFroggy);
    vertices.push(car);
    vertices.push(scoreMark);
    for(var i = 0; i<lanes-2;i++){
        carX.push((lanes-0.5) - Math.random()*(lanes));
        carspeed.push(0.1 + Math.random()*0.4);
        carCol.push(vec4(Math.random(),Math.random(),Math.random(),1));
    }
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
    display();

}

function display(){
    setInterval(moveCars,100);
    setInterval(render,100);
    /*setTimeout(function (){
        render();
    },100)*/ 
}
function movefrog(direction){
    switch(direction){
        case 'left':
            if(!(frogX<=0)){
                --frogX;
                frogPos[0] = xToCanvasX(lanes,frogX);
            }
            break;
        case 'right':
            if(!(frogX>=lanes-1)){
                ++frogX;
                frogPos[0] = xToCanvasX(lanes,frogX);
            }
            break;
        case 'upp':
            if(!(frogY<=1)){
                --frogY;
                frogPos[1] = yToCanvasY(lanes,frogY);
                if(frogY == 1){
                    if(!frogDir){
                        winPoints();
                        frogDir = true;
                        console.log(points);
                    }
                }
            }
            break;
        case 'down':
            if(!(frogY>=lanes)){
                ++frogY;
                frogPos[1] = yToCanvasY(lanes,frogY);
                if(frogY == lanes){
                    if(frogDir){
                        winPoints();
                        frogDir = false;
                    }
                }
            }
            break;
    }
}
function winPoints(){
    points++;
    if(points>9){
        win = true;
        gameOver = true;
    }
}
function moveCars(){
    if(!gameOver){
    for(var i = 0; i<lanes-2; i++){
        carX[i] += carspeed[i];
        if(carX[i]> lanes){
            carX[i] = -2;
            carspeed[i] = 0.1+ Math.random()*0.3;
            carCol[i] = vec4(Math.random(),Math.random(),Math.random(),1);
        }
    }
    collision();
}
}

function square(a,d){
    return [a[0],a[1],d[0],a[1],a[0],d[1],d[0],d[1]];
}
function collision(){
    if(!(frogY<1||frogY>lanes-1||gameOver)){
    const left  = carX[frogY-2]<=frogX+0.8;
    const right = carX[frogY-2]>frogX-1.4;
    gameOver = left && right;
    }
}
function xToCanvasX(size,xpos){
    const ret = ((2 * xpos)/size)-1;
    return ret;
}
function yToCanvasY(size,ypos){
    const ret = ((2*(size-ypos))/size)-1;
    return ret;
}
function render(){
    gl.clear(gl.COLOR_BUFFER_BIT);
    if(!gameOver){
        gl.uniform4fv(colorLoc,streetcol);
        gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
    
        for(var i = 2;i<lanes;i++ ){
            gl.uniform4fv(offsetLoc,vec4(0,yToCanvasY(lanes,i),1,0));
            gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
        }
        gl.uniform4fv(colorLoc,sidewalkcol);
        gl.uniform4fv(offsetLoc,vec4(0,yToCanvasY(lanes,1),1,0));
        gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
        gl.uniform4fv(offsetLoc,vec4(0,yToCanvasY(lanes,lanes),1,0));
        gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
        gl.uniform4fv(colorLoc,frogcol);
        gl.uniform4fv(offsetLoc,frogPos);
        if(frogDir){
            gl.drawArrays(gl.TRIANGLES,7,3);
        }else{
            gl.drawArrays(gl.TRIANGLES,4,3);
        }
    
        for(var i = 2;i<lanes;i++){
            gl.uniform4fv(colorLoc,carCol[i-2]);
            gl.uniform4fv(offsetLoc,vec4(xToCanvasX(lanes,carX[i-2]),yToCanvasY(lanes,i),1,0));
            gl.drawArrays(gl.TRIANGLE_STRIP,10,4);
        }
        gl.uniform4fv(colorLoc,vec4(1,0,0,1));
        for(var i = 0; i<points;i++){
            if(i<5){
                gl.uniform4fv(offsetLoc,vec4((-0.98+(i*0.06)),0.96,1,0));
            }else{
                gl.uniform4fv(offsetLoc,vec4((-0.98+((i-5)*0.06)),0.83,1,0))
            }
            gl.drawArrays(gl.TRIANGLE_STRIP,14,4);
        }
    }else{
        gl.uniform4fv(colorLoc,vec4(1,0,0,1));
        for(var i = 1; i<=lanes;i++){
            gl.uniform4fv(offsetLoc,vec4(0,yToCanvasY(lanes,i),1,0));
            gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
        }
        if(win){
            gl.uniform4fv(colorLoc,vec4(1,1,0,1));
            gl.uniform4fv(offsetLoc,vec4(-frograd,-frograd,1,0));
            gl.drawArrays(gl.TRIANGLES,7,3);
            gl.uniform4fv(offsetLoc,vec4(-frograd,-frograd*1.8,1,0));
            gl.drawArrays(gl.TRIANGLES,4,3);
        };
    }

}