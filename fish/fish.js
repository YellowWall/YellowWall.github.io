
var canvas;
var gl;

const NumVertices  = 9;
const NumBody = 6;
const NumTail = 3;
const NumFins = 3;

//settings
var size = 1.0;
var NumFish = 10;
var wall = 10 - size * 0.3;
var nearGroupRad = 20.0;
var separation = 4.0;
var alignment = 3.0;
var cohesion = 2.0;
var wireframe = false;
var zView = 25.0;
var globalSpeed = 1;
//data input

const sizeInput = document.querySelector("#fishSize");
const radInput = document.querySelector("#radius");
const speedInput = document.querySelector("#fishSpeed");
const wireInput = document.querySelector("#wireframe");
const sepInput = document.querySelector("#separation");
const alignInput = document.querySelector("#alignment");
const cohesionInput = document.querySelector("#cohesion");
const numInput = document.querySelector("#NumFish");

sizeInput.addEventListener("input", updateValue);
radInput.addEventListener("input", updateValue);
speedInput.addEventListener("input", updateValue);
wireInput.addEventListener("input", updateValue);
sepInput.addEventListener("input", updateValue);
alignInput.addEventListener("input", updateValue);
cohesionInput.addEventListener("input", updateValue);
numInput.addEventListener("input", updateValue);


function updateValue(e){
    switch(e.target.id){
        case "fishSize":
            console.log(e.target.value);
            size = e.target.value;
            break;
        case "radius":
            nearGroupRad = e.target.value;
            break;
        case "fishSpeed":
            globalSpeed = e.target.value;
            break;
        case "wireframe":
            wireframe = !wireframe;
            break;
        case "separation":
            separation = e.target.value;
            break;
        case "alignment":
            alignment = e.target.value;
            break;
        case "cohesion":
            cohesion = e.target.value;
            break;
        case "NumFish":
            NumFish = e.target.value;
            break;

    }
    
}

//fish data
var fishLocation = new Array(300).fill(null).map(() =>{
    return vec3(
        Math.random() * 18 - 9,
        Math.random() * 18 - 9,
        Math.random() * 18 - 9
    )
});
var fishDirection = new Array(300).fill(null).map(() =>{
    return vec3(
        Math.random() * 0.1 - 0.05,
        Math.random() * 0.1 - 0.05,
        Math.random() * 0.1 - 0.05
    )
});
var fishSpeed = new Array(300).fill(null).map(() =>{
    return Math.random() * 0.1 + 0.05;
    
});
var fishTail = new Array(300).fill(null).map(() =>{
    return 0
});
var tailOffset = new Array(300).fill(null).map(() =>{
    return 10 * Math.random() - 5;
});
var xSpin = new Array(300).fill(null).map(() =>{
    return 0;
});
var ySpin = new Array(300).fill(null).map(() =>{
    return 0;
});
var fishColor = new Array(300).fill(null).map(() =>{
    return vec3(Math.random(), Math.random(),Math.random());
})




// Hn�tar fisks � xy-planinu
const vertices = [
    // l�kami (spjald)
    vec4( -0.5,  0.0, 0.0, 1.0 ),
	vec4(  0.2,  0.2, 0.0, 1.0 ),
	vec4(  0.5,  0.0, 0.0, 1.0 ),
	vec4(  0.5,  0.0, 0.0, 1.0 ),
	vec4(  0.2, -0.15, 0.0, 1.0 ),
	vec4( -0.5,  0.0, 0.0, 1.0 ),
	// spor�ur (�r�hyrningur)
    vec4( -0.5,  0.0, 0.0, 1.0 ),
    vec4( -0.65,  0.15, 0.0, 1.0 ),
    vec4( -0.65, -0.15, 0.0, 1.0 ),
    // uggi
    vec4(0.0,0.0,0.0,1.0),
    vec4(0.1,0.15,0.0,1.0),
    vec4(-0.1,0.15,0.0,1.0)
];
const box =[
    vec4(-10, 10, -10, 1.0),
    vec4(-10, -10, -10, 1.0),
    vec4(10, -10, -10, 1.0),
    vec4(10, 10, -10, 1.0),
    vec4(-10, 10, -10, 1.0),
    vec4(-10, 10, 10, 1.0),
    vec4(-10, -10, 10, 1.0),
    vec4(10, -10, 10, 1.0),
    vec4(10, 10, 10, 1.0),
    vec4(-10, 10, 10, 1.0),
    vec4(-10, -10, 10, 1.0),
    vec4(-10, -10, -10, 1.0),
    vec4(10, -10, -10, 1.0),
    vec4(10, -10, 10, 1.0),
    vec4(10, 10, 10, 1.0),
    vec4(10, 10, -10, 1.0)
];


var movement = false;     // Er m�sarhnappur ni�ri?
var spinX = 0;
var spinY = 0;
var origX;
var origY;

var incTail = 2.0;        // Breyting � sn�ningshorni

var proLoc;
var mvLoc;
var colorLoc;

var bBuffer;
var vBuffer;
var vPosition;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 1.0, 1.0 );
 
    gl.enable(gl.DEPTH_TEST);
 
    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    bBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,bBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,flatten(box),gl.STATIC_DRAW);

    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    colorLoc = gl.getUniformLocation( program, "fColor" );
    proLoc = gl.getUniformLocation( program, "projection" );
    mvLoc = gl.getUniformLocation( program, "modelview" );

    // Setjum ofanvarpsfylki h�r � upphafi
    var proj = perspective( 90.0, 1.0, 0.1, 100.0 );
    gl.uniformMatrix4fv(proLoc, false, flatten(proj));
    

    // Atbur�af�ll fyrir m�s
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
    	    spinY += (e.offsetX - origX) % 360;
            spinX += (e.offsetY - origY) % 360;
            origX = e.offsetX;
            origY = e.offsetY;
        }
    } );
    
    // Atbur�afall fyrir lyklabor�
     window.addEventListener("keydown", function(e){
         switch( e.keyCode ) {
            case 38:	// upp �r
                zView += 0.2;
                break;
            case 40:	// ni�ur �r
                zView -= 0.2;
                break;
         }
     }  );  

    // Atbur�afall fyri m�sarhj�l
     window.addEventListener("mousewheel", function(e){
         zview += e.deltaY * 0.1;
     }  );  

    render();
}

function flocking(id){
    const location = fishLocation[id];
    var revAvg = vec3(0,0,0);
    var directionAverage = vec3(0,0,0);
    var positionAverage = vec3(0,0,0);
    var neighbors = 0;
    for(var i = 0;i< NumFish;i++){
        if(i===id){
            continue;
        }
        var dist = distance(location,fishLocation[i])

        if(dist <= nearGroupRad){
            neighbors++;
            revAvg = add(revAvg,scale(dist,add(fishLocation[i],negate(location))));
            directionAverage = add(directionAverage,fishDirection[i]);
            positionAverage = add(positionAverage,fishLocation[i]);
        }
    }
    if(neighbors === 0) return;
    
    //aðskilnaður
    revAvg = revAvg.map((v) => v/neighbors);
    revAvg = negate(revAvg);

    //beining
    directionAverage = directionAverage.map((v) => v/neighbors);

    //samheldni
    positionAverage = positionAverage.map((v)=> v/neighbors);
    positionAverage = add (positionAverage,negate(location));
    var [x,y,z] = positionAverage;
    var posMag = Math.sqrt(x*x+y*y+z*z);
    if(posMag > 0){
        positionAverage = positionAverage.map((v)=> v/posMag);
    }
    const flockVector = vec3(
        (separation * revAvg[0]) + (alignment*directionAverage[0])+(cohesion*positionAverage[0]),
        (separation * revAvg[1]) + (alignment*directionAverage[1])+(cohesion*positionAverage[1]),
        (separation * revAvg[2]) + (alignment*directionAverage[2])+(cohesion*positionAverage[2])

    );
    
    fishDirection[i] = normalize(
        add(flockVector, fishDirection[i])
        );
    return true;
}

function moveFish(i){
    if(i<0||i>=NumFish){
        return;
    }
    for(var k = 0; k<3;k++){
        if(fishLocation[i][k]>=wall||fishLocation[i][k]<= -wall){
            fishLocation[i] = vec3(-fishLocation[i][0],-fishLocation[i][1],-fishLocation[i][2]);
            break;
        }
    }

    fishLocation[i] = add(
        fishLocation[i],
        scale((globalSpeed *fishSpeed[i]),
            fishDirection[i]) 
            );
    const [xd, yd, zd]  =normalize(fishDirection[i]);
    const zxAngle = degrees(Math.atan2(zd,xd));
    var mv = mat4();
    mv = mult(mv,translate(fishLocation[i]));
    mv = mult(mv, rotateY(-zxAngle));
    mv = mult(mv, scalem(vec3(size,size,size)))
    return mv;
};
function drawFish(i,mv, gl){
    flocking(i);
    mv = mult(mv,moveFish(i));

    //snúum hala
    fishTail[i] += tailOffset[i];
    if(fishTail[i]>35.0|| fishTail[i]<-35.0){
        tailOffset[i] *= -1;
    }
    // Teikna l�kama fisks (�n sn�nings)
    gl.uniform4fv( colorLoc, vec4(fishColor[i][0],fishColor[i][1],fishColor[i][2],1.0));
    gl.uniformMatrix4fv(mvLoc, false, flatten(mv));
    if(wireframe){
        gl.drawArrays(gl.LINE_LOOP, 0, NumBody)
    }else{
        gl.drawArrays( gl.TRIANGLES, 0, NumBody ); 
    }
    
    // Teikna spor� og sn�a honum
    var tailMv = mult(mv, translate(vec3(-0.5,0.0,0.0)));
	tailMv = mult(tailMv, rotateY(fishTail[i]));
    tailMv = mult(tailMv, translate(vec3(0.5,0.0,0.0)));

    gl.uniformMatrix4fv(mvLoc, false, flatten(tailMv));
    gl.drawArrays( gl.TRIANGLES, NumBody, NumTail );
    
    // Teiknum ugga
    var uggaMv = mult(mv,translate(vec3(0.15,0,0.15)));
    uggaMv = mult(uggaMv,rotateZ(90));
    uggaMv = mult(uggaMv, rotateX(45 + 0.5 * fishTail[i]));

    gl.uniformMatrix4fv(mvLoc, false, flatten(uggaMv));
    gl.drawArrays(gl.TRIANGLES, NumBody+NumTail,NumFins);

    var hinnUgginn = mult(mv,translate(vec3(0.15,0,-0.15)));
    hinnUgginn = mult(hinnUgginn,rotateZ(90));
    hinnUgginn = mult(hinnUgginn, rotateX(-45 - 0.5 * fishTail[i]));
    
    gl.uniformMatrix4fv(mvLoc,false,flatten(hinnUgginn));
    gl.drawArrays(gl.TRIANGLES, NumBody+NumTail,NumFins);
    
}

function render()
{
    if(!vPosition && vPosition !== 0){
        console.error("No vertex pos");
        return;
    }
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.bindBuffer(gl.ARRAY_BUFFER,vBuffer);
    gl.vertexAttribPointer(vPosition,4,gl.FLOAT,false,0,0);

    var mv = lookAt( 
        vec3(0.0, 0.0, zView), 
        vec3(0.0, 0.0, 0.0), 
        vec3(0.0, 1.0, 0.0) 
        );
    mv = mult( mv, rotateX(spinX) );
    mv = mult( mv, rotateY(spinY) );
    
    for(var i = 0; i<NumFish;i++){
        drawFish(i,mv,gl)
    }
    gl.uniform4fv(colorLoc, vec4(1.0,1.0,1.0,1.0));
    gl.bindBuffer(gl.ARRAY_BUFFER,bBuffer);
    gl.vertexAttribPointer(vPosition,4, gl.FLOAT, false, 0,0);
    gl.uniformMatrix4fv(mvLoc,false,flatten(mv));
    gl.drawArrays(gl.LINE_STRIP,0,16);
    

    requestAnimFrame( render );
}