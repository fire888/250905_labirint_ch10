import { Root } from "../index"
import { _M, A3 } from "../geometry/_m"
import * as THREE from "three"
import { IArrayForBuffers, SegmentType, IArea, ILevelConf, TSchemeElem, TLabData } from "types/GeomTypes";


// const createTexture = (width: number, height: number, w: number = 100) => {
//     const size = width * height    
    
//     const data: number[] = []

//     const sizePolygon = 3

//     for (let i = 0; i < size; i += 3) {
//         const center = [Math.random() * w, Math.random() * w, Math.random() * w]

//         const p1 = [
//             center[0] + Math.random() * sizePolygon, 
//             center[1] + Math.random() * sizePolygon, 
//             center[2] + Math.random() * sizePolygon,
//             1,
//         ]
//         const p2 = [
//             center[0] + Math.random() * sizePolygon, 
//             center[1] + Math.random() * sizePolygon, 
//             center[2] + Math.random() * sizePolygon,
//             1,
//         ]
//         const p3 = [
//             center[0] + Math.random() * sizePolygon, 
//             center[1] + Math.random() * sizePolygon, 
//             center[2] + Math.random() * sizePolygon,
//             1,             
//         ]
//         data.push( ...p1, ...p2, ...p3)
//     }

//     // used the buffer to create a DataTexture

//     const tArr = new Float32Array(data)
//     const texture = new THREE.DataTexture(tArr, width, height, THREE.RGBAFormat, THREE.FloatType )
//     texture.needsUpdate = true
//     console.log('texture', texture)
//     return texture
// }





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
        // const textures: any[] = []

        // const width = 512
        // const height = 512
        // const size = width * height

        // for (let i = 0; i < 10; ++i) {
        //     textures.push(createTexture(width, height, Math.random() * 300))
        // } 




        // // const mat = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide })
        // // const geo = new THREE.PlaneGeometry(50, 50, 1, 1)
        // // const mesh = new THREE.Mesh(geo, mat)
        // // mesh.position.y = 25
        // // this._root.studio.add(mesh)


        // const verts = []
        // for (let i = 0; i < size * 3; ++i) {
        //     verts.push(0, 0, 0)
        // }
        // const geomMMM = _M.createBufferGeometry({ v: verts })

        // const matM = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        // matM.onBeforeCompile = (shader:any) => {
        //     shader.uniforms.positionTexture = { value: textures[0] };

        //     shader.vertexShader = `
        //         uniform highp sampler2D positionTexture;
        //         ${shader.vertexShader}
        //     `.replace(
        //         '#include <begin_vertex>',
        //         `#include <begin_vertex>
        //         // вычисляем integer-координаты пикселя по индексу вершины
        //         ivec2 size = textureSize(positionTexture, 0);   // (width, height)
        //         int idx = gl_VertexID;
        //         int x = idx % size.x;
        //         int y = idx / size.x;
        //         ivec2 texel = ivec2(x, y);

        //         vec3 pos = texelFetch(positionTexture, texel, 0).xyz;
        //         transformed = pos; // three.js ожидает писать в transformed
        //         `
        //     );
        //     matM.userData.uniforms = shader.uniforms
        // };

        // const meshMMM = new THREE.Mesh(geomMMM, matM)
        // this._root.studio.add(meshMMM)

        // const update = (n: number) => {
        //     if (!textures[n]) {
        //         n = 0
        //     }
        //     if (matM.userData.uniforms) {
        //         matM.userData.uniforms.positionTexture.value = textures[n]
        //         matM.needsUpdate = true
        //     }

        //     n++
        //     setTimeout(() => {
        //         update(n)
        //     }, 0)
        // }
        // update(0)






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




        // === параметры текстуры-позиций ===
        const W = 256, H = 256; // 65_536 вершин
        const VERT_COUNT = W * H;

        // SharedArrayBuffer под RGBA32F
        const BYTES_PER_TEXEL = 4 * 4;
        const sab = new SharedArrayBuffer(W * H * BYTES_PER_TEXEL);
        const posData = new Float32Array(sab);

        // Флаг "кадр готов"
        const flagSAB = new SharedArrayBuffer(4);
        const flag = new Int32Array(flagSAB);

        // Создаём единожды текстуру поверх posData
        // @ts-ignore
        const posTex = new THREE.DataTexture(posData, W, H, THREE.RGBAFormat, THREE.FloatType);
        posTex.needsUpdate = true;
        posTex.magFilter = THREE.NearestFilter;
        posTex.minFilter = THREE.NearestFilter;
        posTex.generateMipmaps = false;
        posTex.wrapS = posTex.wrapT = THREE.ClampToEdgeWrapping;
        posTex.flipY = false;

        // Буферная геометрия-заглушка на нужное число вершин
        const geom = new THREE.BufferGeometry();
        geom.setAttribute('position', new THREE.Float32BufferAttribute(VERT_COUNT * 3, 3)); // не используется, но задаёт поток
        geom.setDrawRange(0, VERT_COUNT);

        // Юниформы и материал (RawShaderMaterial + GLSL3)
        const uniforms = {
            posTex:  { value: posTex },
            texSize: { value: new THREE.Vector2(W, H) },
            tint:    { value: new THREE.Color(0x77ccff) },
            time:    { value: 0 }
        };

        const vertexShader = /* glsl */ `//#version 300 es
        precision highp float;
        precision highp int;

        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;

        uniform sampler2D posTex;
        uniform ivec2 texSize;

        out vec3 vNormalLike;
        out float vZ;

        ivec2 indexToCoord(int index, ivec2 size){
            int x = index % size.x;
            int y = index / size.x;
            return ivec2(x, y);
        }

        void main() {
            int vid = gl_VertexID;
            ivec2 coord = indexToCoord(vid, texSize);
            vec3 p = texelFetch(posTex, coord, 0).xyz;

            // Псевдо-нормаль: производная по экрану на фрагменте, но тут можно прикинуть в вертексе:
            vNormalLike = normalize(vec3(0.0, 0.0, 1.0));
            vZ = p.z;

            gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
            gl_PointSize = 2.0;
        }
        `;

        const fragmentShader = /* glsl */ `//#version 300 es
        precision highp float;
        out vec4 outColor;

        in vec3 vNormalLike;
        in float vZ;
        uniform vec3 tint;

        void main(){
            // Для точек — мягкая альфа
            #ifdef GL_ES
            #endif
            // Сделаем точки круглыми:
            vec2 uv = gl_PointCoord * 2.0 - 1.0;
            float m = 1.0 - smoothstep(0.9, 1.0, length(uv));
            vec3 base = mix(vec3(0.15,0.2,0.25), tint, 0.7 + 0.3 * vZ * 2.0);
            outColor = vec4(base, m);
        }
        `;

        const material = new THREE.RawShaderMaterial({
            glslVersion: THREE.GLSL3,
            uniforms,
            vertexShader,
            fragmentShader,
            transparent: true,
            depthTest: true,
            depthWrite: false
        });

        // Рисуем точками. Если хотите Mesh — нужна топология/индексы.
        const points = new THREE.Points(geom, material);
        points.frustumCulled = false;
        this._root.studio.add(points);

        // Воркер
        //const worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });
        const worker = new Worker(new URL('./worker.js', import.meta.url));
        worker.postMessage({ sab, flagSAB, w: W, h: H });


        let t = 0;
        function tick() {
            requestAnimationFrame(tick);

            // кадр готов из воркера? — подгружаем без аллокаций
            if (Atomics.load(flag, 0) === 1) {
                Atomics.store(flag, 0, 0);
                posTex.needsUpdate = true; // внутри будет texSubImage2D на тот же объект
            }

            t += 0.01;
            uniforms.time.value = t;
        }
        tick();

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

