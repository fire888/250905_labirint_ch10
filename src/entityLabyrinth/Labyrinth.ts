import { Root } from "../index"
import { _M, A3 } from "../geometry/_m"
import * as THREE from "three"
import { IArrayForBuffers, SegmentType, IArea, ILevelConf, TSchemeElem, TLabData } from "types/GeomTypes";

export class Labyrinth {
    _root: Root
    _houses: THREE.Mesh[] = []
    _roads: THREE.Mesh[] = []
    _stricts: THREE.Group[] = []
    _collisionsNames: string[] = []
    _labSheme: TLabData = { areasData: [], positionsEnergy: [], positionsAntigravs: [] }

    constructor() {}
    async init (root: Root) {
        this._root = root        
    }

    async build (conf: ILevelConf) {
        const width = 512
        const height = 512

        const size = width * height
        const data: number[] = []

        const sizePolygon = 3

        for ( let i = 0; i < size; i += 3) {
            const center = [Math.random() * 100, Math.random() * 100, Math.random() * 100]

            const p1 = [
                center[0] + Math.random() * sizePolygon, 
                center[1] + Math.random() * sizePolygon, 
                center[2] + Math.random() * sizePolygon,
                1,
            ]
            const p2 = [
                center[0] + Math.random() * sizePolygon, 
                center[1] + Math.random() * sizePolygon, 
                center[2] + Math.random() * sizePolygon,
                1,
            ]
            const p3 = [
                center[0] + Math.random() * sizePolygon, 
                center[1] + Math.random() * sizePolygon, 
                center[2] + Math.random() * sizePolygon,
                1,             
            ]
            data.push( ...p1, ...p2, ...p3)
        }

        // used the buffer to create a DataTexture

        const tArr = new Float32Array(data)
        const texture = new THREE.DataTexture(tArr, width, height, THREE.RGBAFormat, THREE.FloatType )
        texture.needsUpdate = true
        console.log('texture', texture)

        const mat = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide })
        const geo = new THREE.PlaneGeometry(50, 50, 1, 1)
        const mesh = new THREE.Mesh(geo, mat)
        mesh.position.y = 25
        this._root.studio.add(mesh)


        const verts = []
        for (let i = 0; i < size * 3; ++i) {
            verts.push(0, 0, 0)
        }
        const geomMMM = _M.createBufferGeometry({ v: verts })
        // const matGGG = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
        // matGGG.onBeforeCompile = (shader: any) => {
        //     shader.uniforms.positionTexture = { value: texture };
        //     shader.vertexShader = `
        //         uniform sampler2D positionTexture;
        //         ${shader.vertexShader}
        //     `.replace(
        //         `#include <begin_vertex>`,
        //         `#include <begin_vertex>
                
        //         int vertID = gl_VertexID;
        //         // ivec2 uv = ivec2(col, vertID);
                
        //         vec4 posData = texelFetch(positionTexture, uv, 0);
                
        //         transformed = posData.rgb;
        //         `
        //     );
        // const meshMMM = new THREE.Mesh(geomMMM, matGGG)
        // this._root.studio.add(meshMMM)

        // под WebGL2: чтобы были доступны gl_VertexID / texelFetch / textureSize
        const matM = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        //matM.glslVersion = THREE.GLSL3;

        matM.onBeforeCompile = (shader:any) => {
        shader.uniforms.positionTexture = { value: texture };
        // опционально: если знаете ширину, можно передать её uniform'ом.
        // shader.uniforms.texSize = { value: new THREE.Vector2(texture.image.width, texture.image.height) };

        shader.vertexShader = `
            uniform highp sampler2D positionTexture;
            ${shader.vertexShader}
        `.replace(
            '#include <begin_vertex>',
            `#include <begin_vertex>
            // вычисляем integer-координаты пикселя по индексу вершины
            ivec2 size = textureSize(positionTexture, 0);   // (width, height)
            int idx = gl_VertexID;
            int x = idx % size.x;
            int y = idx / size.x;
            ivec2 texel = ivec2(x, y);

            vec3 pos = texelFetch(positionTexture, texel, 0).xyz * vec3(.1);
            transformed = pos; // three.js ожидает писать в transformed
            `
        );
        };

        const meshMMM = new THREE.Mesh(geomMMM, matM)
        this._root.studio.add(meshMMM)






        // matG.onBeforeCompile = (shader: any) => {
        // shader.uniforms.positionTexture = { value: texture };
        // shader.vertexShader = `
        //     uniform sampler2D positionTexture;
        //     ${shader.vertexShader}
        // `.replace(
        //     `#include <begin_vertex>`,
        //     `#include <begin_vertex>
            
            
        //     //ivec2 uv = ivec2(col, vertID);
            
        //     vec4 posData = texelFetch(positionTexture, uv, 0);
            
        //     transformed = posData.rgb;
            
        //     `
        // );
        
        // console.log(shader.vertexShader);
        // }

        // материал

        // const meshG = new THREE.Mesh(g, matG);
        // this._root.studio.add(meshG);







        // test MESH 
        // const v: number[] = []
        // for (let i = 0; i < data.length; i += 4) {
        //     v.push(data[i], data[i + 1], data[i + 2])
        // }
        // const g = _M.createBufferGeometry({ v })
        // const matPlane = new THREE.MeshLambertMaterial({flatShading: true, wireframe: !true})
        // const meshPlane = new THREE.Mesh(g, matPlane)
        // this._root.studio.add(meshPlane)

    }

    async clear () {
    }

    get positionsEnergy () {
        return this._labSheme.positionsEnergy
    }

    get positionsAntigravs () {
        return this._labSheme.positionsAntigravs
    }

}

