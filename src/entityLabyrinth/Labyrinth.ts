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
        const flagSAB = new SharedArrayBuffer(4);
        const flag = new Int32Array(flagSAB);

        const W = 2048, H = 1024;
        const VERT_COUNT = W * H;
        const BYTES_PER_TEXEL = 4 * 4;

        ///////////////////////
        const sabVertex = new SharedArrayBuffer(W * H * BYTES_PER_TEXEL);
        const posData = new Float32Array(sabVertex);
        // @ts-ignore
        const posTex = new THREE.DataTexture(posData, W, H, THREE.RGBAFormat, THREE.FloatType);
        posTex.needsUpdate = true;
        posTex.magFilter = THREE.NearestFilter;
        posTex.minFilter = THREE.NearestFilter;
        posTex.generateMipmaps = false;
        posTex.wrapS = posTex.wrapT = THREE.ClampToEdgeWrapping;
        posTex.flipY = false;

        /////////////////////
        const sabColor = new SharedArrayBuffer(W * H * BYTES_PER_TEXEL)
        const colorData = new Float32Array(sabColor)
        // @ts-ignore
        const colorTex = new THREE.DataTexture(colorData, W, H, THREE.RGBAFormat, THREE.FloatType)
        colorTex.needsUpdate = true
        colorTex.magFilter = THREE.NearestFilter
        colorTex.minFilter = THREE.NearestFilter
        colorTex.generateMipmaps = false
        colorTex.wrapS = colorTex.wrapT = THREE.ClampToEdgeWrapping
        colorTex.flipY = false

        /////////////////////
        const sabUv = new SharedArrayBuffer(W * H * BYTES_PER_TEXEL)
        const uvData = new Float32Array(sabUv)
        // @ts-ignore
        const uvTex = new THREE.DataTexture(uvData, W, H, THREE.RGBAFormat, THREE.FloatType)
        uvTex.needsUpdate = true
        uvTex.magFilter = THREE.NearestFilter
        uvTex.minFilter = THREE.NearestFilter
        uvTex.generateMipmaps = false
        uvTex.wrapS = uvTex.wrapT = THREE.ClampToEdgeWrapping
        uvTex.flipY = false

        const geom = new THREE.BufferGeometry()
        geom.setAttribute('position', new THREE.Float32BufferAttribute(VERT_COUNT * 3, 3))
        geom.setDrawRange(0, VERT_COUNT);

        const uniforms = {
            posTexSize: { value: new THREE.Vector2(W, H) },
            posTex: { value: posTex },
            colorTex: { value: colorTex },
            uvTex: { value: uvTex },
            map: { value: this._root.loader.assets.roadImg },
        };

        const vertexShader = /* glsl */ `//#version 300 es
        precision highp float;
        precision highp int;

        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;

        uniform ivec2 posTexSize;
        uniform sampler2D posTex;
        uniform sampler2D colorTex;
        uniform sampler2D uvTex;

        out vec2 vUv;
        out vec3 vColor;

        ivec2 indexToCoord(int index, ivec2 size){
            int x = index % size.x;
            int y = index / size.x;
            return ivec2(x, y);
        }

        void main() {
            int vid = gl_VertexID;
            ivec2 coord = indexToCoord(vid, posTexSize);

            vec3 p = texelFetch(posTex, coord, 0).xyz;

            vUv = texelFetch(uvTex, coord, 0).xy;

            vColor = texelFetch(colorTex, coord, 0).xyz;

            gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
            gl_PointSize = 2.0;
        }
        `;

        const fragmentShader = /* glsl */ `
        precision highp float;
        precision highp int;

        uniform sampler2D colorTex;
        uniform sampler2D map;

        in vec2 vUv;
        in vec3 vColor;
        out vec4 outColor;

        void main(){
            vec3 cTex = texture(map, vUv).rgb;  // теперь цвет меняется по полигону
            outColor = vec4(cTex * vColor, 1.0);
        }
        `;

        const material = new THREE.RawShaderMaterial({
            glslVersion: THREE.GLSL3,
            uniforms,
            vertexShader,
            fragmentShader,
            //transparent: true,
            //depthTest: true,
            //depthWrite: false,
            side: THREE.DoubleSide
        });

        const m = new THREE.Mesh(geom, material);
        m.frustumCulled = false;
        this._root.studio.add(m);

        // Воркер
        let date = Date.now()
        console.log('[MESSAGE:] START CREATE WORKER')
        const worker = new Worker(new URL('./worker.ts', import.meta.url));
        worker.postMessage({ 
            keyMessage: 'init', 
            sabVertex, sabColor, sabUv, flagSAB, 
            w: W, h: H 
        });

        const tick = () => {
            if (Atomics.load(flag, 0) === 1) {
                Atomics.store(flag, 0, 0)
                
                posTex.needsUpdate = true
                colorTex.needsUpdate = true
                uvTex.needsUpdate = true
                
                console.log('[TIME:] UPDATE LABYRINTH', ((Date.now() - date) / 1000).toFixed(2))
                date = Date.now()

                setTimeout(() => {
                    worker.postMessage({ keyMessage: 'update' });
                }, 1)
            }
            requestAnimationFrame(tick)
        }
        tick()
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

