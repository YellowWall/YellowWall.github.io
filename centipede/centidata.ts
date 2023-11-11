import { Mesh, MeshBasicMaterial, SphereGeometry, Vector3 } from "three";

export interface centipart {
    head: Vector3 | null;
    tail: Vector3[] | null;
    direction: number;
    length: number;
    meshes: Mesh[];
}
export function centipede(centipede){
    if(centipede.tail==null){
        centipede.tail = new Array(centipede.length-1).fill(new Vector3(0,0,0));
    }
    const meshes = new Array(centipede.length).fill(0).map(()=>{
        return new Mesh(new SphereGeometry(0.5,16,16),new MeshBasicMaterial({color: 0xFFEB33}));
    });
    if(meshes.length > 0 && centipede.head != null){
        meshes[0].position.set(...centipede.head);
        for(var i = 1; i< centipede.length-1; i++)
        meshes[i].position.set(...centipede.tail[i]);
    }
    centipede.meshes = meshes;
    return centipede;
}