import * as THREE from "three";
/*import {move_player,keyup,keydown, newPlayer, newBullet, setLimits} from "./playerdata";
*/


const keystate = {ArrowUp:false, ArrowDown:false,ArrowLeft:false,ArrowRight:false};
var limits = [0,0,0,0];


export function newPlayer(size){
    const mesh = new THREE.Mesh(
        new THREE.ConeGeometry(0.4,2,6),
        new THREE.MeshBasicMaterial({color:0xff0000})
    );
    mesh.position.set((Math.floor(size[0]/2)),-size[1]-2,0)
    return mesh;
}

export function newBullet(){
    return  new THREE.Mesh(
        new THREE.ConeGeometry(0.1,0.8,6),
        new THREE.MeshBasicMaterial({color: 0xff0000})
    );
};

export function setLimits(x1,x2,y1,y2){
    limits = [x1,x2,y1,y2];
}

export function keydown(event){
    keystate[event.code] = true;
};
export function keyup(event){
    keystate[event.code] = false;
}

export function move_player(player, speed){
    var x_move = 0;
    var y_move = 0;

    if(keystate["ArrowUp"]){
        y_move = (y_move + speed);
    }
    if(keystate["ArrowDown"]){
        y_move = (y_move - speed);
    }
    if(keystate["ArrowLeft"]){
        x_move = (x_move - speed);
    }
    if(keystate["ArrowRight"]){
        x_move = (x_move + speed);
    }
    player.position.x += x_move;
    if(player.position.x < limits[0]) player.position.x = limits[0];
    if(player.position.x > limits[1]) player.position.x = limits[1];
    player.position.y += y_move;
    if(player.position.y < limits[2]) player.position.y = limits[2];
    if(player.position.y > limits[3]) player.position.y = limits[3];
    return player.position;
}




var score = 0;
var size = [16,17];
var player_pos = new THREE.Vector3(0,0,0);
var over_the_shoulder = false;
var centi_move = Date.now();
var centi_wait = 200;
var shot = Date.now();
const bullet_speed = 0.2;
const reload_time = 200;
var active_bullets = [];
const speed = 0.2;
const scene = new THREE.Scene();
var camera= new THREE.PerspectiveCamera(75,1,0.1,1000);
//const otscamera;
const renderer= new THREE.WebGLRenderer({canvas: document.getElementById('mycanvas')});
var player;
var centipedes = [];
var game_map;
var mushrooms;

function init(){
    setView();
    renderer.setClearColor(0x00ff00);
    renderer.setSize(500,500);
    player = newPlayer(size);
    var newCent = {
        head: new THREE.Vector3(0,0,0),
        length: 10,
        direction: 1,
        tail: null,
        up: false,
        next_up:false
    }
    centipedes = [centipede(newCent)];
    for(var i = 0; i<centipedes[0].meshes.length; i++){
        scene.add(centipedes[0].meshes[i]);
    }
    setLimits(0,size[0],-(size[1]+2),-(size[1]-1))
    make_light("ambient");
    
    scene.add(player);
}

function setView(){
    if(!over_the_shoulder){
        camera.rotation.x = 0;
        camera.position.set(7.5,-10,15);
    }else{
        camera.rotation.x = Math.PI / 2;
        camera.position.set(player_pos.x,player_pos.y-1.9,1);
    }
    
}
function centipede(centipede){
    if(centipede.tail==null){
        centipede.tail = new Array(centipede.length-1).fill(new THREE.Vector3(0,0,0));
    }
    const meshes = new Array(centipede.length).fill(0).map(()=>{
        return new THREE.Mesh(new THREE.SphereGeometry(0.5,16,16),new THREE.MeshBasicMaterial({color: 0xFF0000}));
    });
    if(meshes.length > 0 && centipede.head != null){
        meshes[0].position.set(...centipede.head);
        for(var i = 1; i< centipede.length-1; i++)
        meshes[i].position.set(...centipede.tail[i]);
    }
    centipede.meshes = meshes;
    return centipede;
}
const gameboard = (mapw, maph, mmpl) =>{
    var gameboard = new Array(maph+4).fill(null).map(()=>{
        return new Array(mapw).fill(0);
    });
    for(var i = 1; i<gameboard.length-4;++i){
        let mush = Math.floor(Math.random()*mmpl);
        for(var j = 0; j<mush; j++){
            let mushspot = Math.floor(Math.random()*mapw)
            while(gameboard[i][mushspot]>0){
                mushspot = Math.floor(Math.random()*mapw)
            }
            gameboard[i][mushspot] = 4;
        }
    }
    
    let mushrooms = new Array(maph).fill(null).map(()=>{
        return new Array(mapw).fill(null);
    });
    for (var i = 0; i< gameboard.length; i++){
        for(var j = 0; j<gameboard[i].length; j++){
            let poss = gameboard[i][j];
            if(poss>0){
                const geometry = new THREE.SphereGeometry(0.15*poss, 16, 16);
                const material = new THREE.MeshBasicMaterial({
                    color: 0xFFA733 + (0x001100*poss)
                })
                const mushroom = new THREE.Mesh(geometry,material);
                mushroom.position.set(j,-i,0);
                mushrooms[i][j] = mushroom;
            }
        }
    }
    return [gameboard,mushrooms];
}

function shoot(){
    console.log("bang");
    if(Date.now()-shot < 200) return;
    shot = Date.now();
    var bullet = newBullet();
    bullet.position.set(player_pos.x,player_pos.y,player_pos.z);
    scene.add(bullet);
    active_bullets.push(bullet);
}
function killBullet(i){
    scene.remove(active_bullets[i]);
    active_bullets.splice(i,1);
}

function track_shot(){
    active_bullets.forEach((bullet,i)=>{
        if(bullet.parent !== scene) scene.add(bullet);
        bullet.position.y += bullet_speed;
        if(bullet.position.y > 0){
            killBullet(i);
        }else{
            const [rx, ry] = [Math.round(bullet.position.x),Math.round(bullet.position.y)];
            const ry_abs = Math.abs(ry);
            if(game_map[ry_abs][rx]>0){
                killBullet(i);
                game_map[ry_abs][rx] -= 1;
                const scale = (mushrooms[ry_abs][rx].scale.x -0.2);

                mushrooms[ry_abs][rx].scale.set(scale,scale,scale);
                if(game_map[ry_abs][rx]===0){
                    scene.remove(mushrooms[ry_abs][rx]);
                    score_increase(1);
                }

            }else{
                centipedes.forEach((centipart,j) => {
                    if(
                        centipart.meshes.some(
                            (mesh) =>
                            mesh.position.x === rx && mesh.position.y ===ry
                        )
                    ){
                        killBullet(i);
                        let marker = 0;
                        centipart.meshes.forEach((mesh,k)=>{
                            if(mesh.position.x === rx && mesh.position.y === ry){
                                marker = k;
                            }
                        });
                        shootCentipede(centipart,j,marker);
                    }
                })
            }
        }   
    })
}
function shootCentipede(centi, index, marker){
    if(marker==0){
        score_increase(100);
    }else{
        score_increase(10);
    }
    var mushx,mushy;
    var tail = [];
    var meshes = [];
    if(centi.tail != null){
        tail = centi.tail;
    }
    if(centi.meshes != null){
        meshes = centi.meshes;
    }
    if(marker === 0 || marker === centi.length -1){
        if(tail && tail.length > 0) {
            scene.remove(centi.meshes?.pop());
            if(marker == 0) {
                mushx = centi.head.x;
                mushy = centi.head.y;
                centi.head = tail[0];
                
            }else{
                mushx = tail[marker-1].x;
                mushy = tail[marker-1].y;
            }
            centi.tail?.pop();
            centi.length -= 1;
        }else{
            mushx = tail[marker-1].x;
            mushy = tail[marker-1].y;
            scene.remove(centi.meshes[i]);
            centipedes.splice(index,1);
        }
    }else{
        mushx = tail[marker-1].x;
        mushy = tail[marker-1].y;

        var new_centi = splitCentipede(centi,marker);
        new_centi.meshes.forEach((mesh)=> scene.add(mesh));
        centipedes.push(new_centi);
        

    }    
    const geometry = new THREE.SphereGeometry(0.15*4, 16, 16);
    const material = new THREE.MeshBasicMaterial({
        color: 0xFFA733 + (0x001100*4)
        })
    const mushroom = new THREE.Mesh(geometry,material);
    console.log(mushx);
    console.log(mushy);
    mushroom.position.x = mushx;
    mushroom.position.y = mushy;
    mushrooms[Math.abs(mushy)][mushx] = mushroom;
    game_map[Math.abs(mushy)][mushx] = 4;
    scene.add(mushrooms[Math.abs(mushy)][mushx]);
}
function splitCentipede(centi,index){
    var new_tail = [];
    if(centi.tail){
        new_tail = [...centi.tail.slice(index)];
    }
    const new_head = new_tail.pop();
    const new_direction = Math.abs(new_head.y - centi.head.y) % 2 === 0? -centi.direction : centi.direction;
    var new_centi = {
        direction: new_direction,
        length: new_tail.length +1,
        head: new_head,
        tail: new_tail.length? new_tail : [],
        up: false,
        next_up: false
    };
    for(var i = index; i<centi.length; ++i){
        scene.remove(centi.meshes?.[i]);
    }
    centi.tail = centi?.tail?.slice(0,index);
    centi.meshes = centi.meshes?.slice(0, index);
    centi.length = index;
    const meshes = new Array(new_centi.length).fill(0).map(()=>{
        return new THREE.Mesh(new THREE.SphereGeometry(0.5,16,16),new THREE.MeshBasicMaterial({color: 0xFF0000}));
    });
    if(meshes.length > 0 && new_centi.head != null){
        meshes[0].position.set(...new_centi.head);
        for(var i = 1; i< new_centi.length-1; i++)
        meshes[i].position.set(...new_centi.tail[i]);
    }
    new_centi.meshes = meshes;
    return new_centi;


    
}
function move_centis(){
    if(Date.now() - centi_move > centi_wait){
        centipedes.forEach((centi) =>{
            if(!centi.tail) return;
            var old_head = new THREE.Vector3(...centi.head);
            var old = [old_head, ...centi.tail.slice(0, centi.tail.length-1)];
            if(centi.up){
                centi.head.y +=1;
                centi.up = centi.head.y !== 0;
            }else if( centi.head.y <= -(size[1]-1) && centi.next_up){
                centi.next_up = false;
                centi.up = true;
            }else if (outsideBounds(centi.head.x, centi.direction) 
                    || blocked(Math.abs(centi.head.y),centi.head.x,centi.direction)){
                if(centi.head.y === -(size[1]-1)) centi.next_up = true;
                else centi.head.y -=1;
                centi.direction = -(centi.direction);
            }else{
                centi.head.x += centi.direction;
            }

            for (var i = 0; i< old.length; ++i){
                centi.tail[i] = old[i];
            }

            if(!centi.meshes) return;
            centi.meshes.forEach((mesh,i)=>{
                var pos;
                if(i=== 0) pos = centi.head;
                else pos = old?.[i-1] ?? new THREE.Vector3(0,0,0);
                mesh.position.x = pos.x;
                mesh.position.y = pos.y;

            }) 
        })
        centi_move = Date.now();
    }
}

function make_light(type){
    switch(type){
        case "ambient":
            const light = new THREE.AmbientLight(0x404040);
            scene.add(light);
    }
    
}
function switchView(){
    over_the_shoulder = !over_the_shoulder;
}
function outsideBounds(pos,dir){
    if(dir > 0) return pos >= size[0] -1;
    else return pos <= 0;

}
function blocked(y,x,dir){
    return game_map[y][x+dir] >1;
}
function score_increase(value){
    score += value;
    document.getElementById("scorecontainer").innerHTML = score.toString();
}

function make(){
    console.log("wow");
    init();
    
    document.addEventListener('keydown', (event) => {
        var code = event.code;
        if(code=="Space"){
            shoot();
        }else if(code=="KeyV"){
            switchView();
        }else{
            keydown(event);
        }
    });
    document.addEventListener('keyup', (event) =>{
        keyup(event);
    } );
    
    [game_map,mushrooms] = gameboard(size[0],size[1],4);
    for(var i = 0; i<mushrooms.length;i++){
        for(var j = 0; j<mushrooms[i].length;j++){
            if(mushrooms[i][j]!=null){
                scene.add(mushrooms[i][j]);
            }
        }
        
    }

    
    
    animate();
}
function animate(){
    player_pos = move_player(
        player,speed
    );
    setView();
    track_shot();
    move_centis();
    renderer.render( scene, camera );
    requestAnimationFrame( animate );
}
function domReady(cb) {
    if (document.readyState === "complete" || document.readyState === "interactive") {
      cb();
    } else {
      document.addEventListener("DOMContentLoaded", cb);
    }
  }
  

domReady(() => {
    make();
});

