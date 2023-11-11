import {Mesh, ConeGeometry, MeshBasicMaterial} from "three";

const keystate = {ArrowUp:false, ArrowDown:false,ArrowLeft:false,ArrowRight:false};
var limits = [0,0,0,0];


export function newPlayer(size:number[]){
    const mesh = new Mesh(
        new ConeGeometry(0.4,2,6),
        new MeshBasicMaterial({color:0xff0000})
    );
    mesh.position.set((Math.floor(size[0]/2)),-size[1]-2,0)
    return mesh;
}

export const newBullet = new Mesh(
    new ConeGeometry(0.1,0.8,6),
    new MeshBasicMaterial({color: 0xff0000})
);

export function setLimits(x1,x2,y1,y2){
    limits = [x1,x2,y1,y2];
}

export function keydown(event: KeyboardEvent){
    keystate[event.code] = true;
};
export function keyup(event: KeyboardEvent){
    keystate[event.code] = false;
}

export function move_player(player: Mesh, speed: number, keyboard){
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
