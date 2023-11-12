import { Mesh, MeshBasicMaterial, SphereGeometry } from "three";

export const gameboard = (mapw, maph, mmpl) =>{
    var gameboard = new Array(maph).fill(null).map(()=>{
        return new Array(mapw).fill(0);
    });
    for(var i = 1; i<gameboard.length-1;++i){
        let mush = Math.floor(Math.random()*mmpl);
        for(var j = 0; j<mush; j++){
            let mushspot = Math.floor(Math.random()*mapw)
            while(gameboard[i][mushspot]>0){
                mushspot = Math.floor(Math.random()*mapw)
            }
            gameboard[i][mushspot] = 4;
        }
    }
    
    let mushrooms = [];
    for (var i = 0; i< gameboard.length; i++){
        for(var j = 0; j<gameboard[i].length; j++){
            let poss = gameboard[i][j];
            if(poss>0){
                const geometry = new SphereGeometry(0.15*poss, 16, 16);
                const material = new MeshBasicMaterial({
                    color: 0xFFA733 + (0x001100*poss)
                })
                const mushroom = new Mesh(geometry,material);
                mushroom.position.set(j,-i,0);
                mushrooms.push(mushroom);
            }
        }
    }
    return [gameboard,mushrooms];
}