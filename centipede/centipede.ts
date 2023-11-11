import * as THREE from "three";
import {move_player,keyup,keydown, newPlayer, newBullet} from "./playerdata";
import { gameboard } from "./gameboard";
import { centipede, centipart } from "./centidata";
/**
 * leikjasvæði er 16x15
 * táknað af 16x15 x og y hnitum sem eru túlkuð sem heiltölur, min 0, max y = 16, max x = 15
 * centipede hlutur er táknaður sem linked listi, þarf sem að hver centipede hlutur hefur vísun bæði
 * í höfuð sitt og hala
 */
/**
 * direction, niður 0, hægri 1, vinstri 2, upp 3 
 */


var score = 0;
var size = [16,17];
var player_pos = new THREE.Vector3(0,0,0);
var over_the_shoulder = false;
var centi_move = Date.now();
var centi_wait = 200;
var shot = Date.now();
const bullet_speed = 0.2;
const reload_time = 200;
var active_bullets: THREE.Mesh[] = [];
var perspective;
var scene;
var renderer;
var player;
var centipedes;

function init(container){
    scene = new THREE.scene();
    perspective = new THREE.perspectiveCamera(75,1,0.1,1000);
    setView();
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(400,400);
    container.appendChild(renderer.domElement);
    player = newPlayer(size);
    /**export interface centipart {
    head: Vector3 | null;
    tail: Vector3[] | null;
    direction: number;
    length: number;
    meshes: Mesh[];
} */
    var newCent = {
        head: new THREE.Vector3(0,0,0),
        length: 7,
        direction: 1,
        tail: null,
    }
    centipedes = centipede(newCent);
    scene.add(player);
}

function setView(){
    if(!over_the_shoulder){
        perspective.position.set(7.5,-10,15);
    }
    
}
function shoot(){
    if(Date.now()-shot < 200) return;
    shot = Date.now();
    const bullet = newBullet;
    bullet.position.set(player_pos.x,player_pos.y,player_pos.z);
    bullet.rotation.z = Math.PI / 2;
    active_bullets.push(bullet);
}
function track_shot(){
    active_bullets.forEach((bullet,i)=>{
        if(bullet.parent !== scene) scene.add(bullet);
        bullet.position.y += bullet_speed;
        if(bullet.position.y > 0){
            scene.remove(bullet);
            active_bullets.splice(i,1);
        }else{
            
        }
    })
}
window.onload = function make(){
    init(document.body);
    
    
    document.addEventListener('keydown', (event) => {
        var code = event.code;
        if(code==" "){
            shoot();
        }
        else{
            keydown(event);
        }
    });
    document.addEventListener('keyup', (event) =>{
        keyup(event);
    } )
    
    
}



