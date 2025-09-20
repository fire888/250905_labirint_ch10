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

        const W = 2048, H = 2048;
        const VERT_COUNT = W * H;

        const BYTES_PER_TEXEL = 4 * 4;
        const sab = new SharedArrayBuffer(W * H * BYTES_PER_TEXEL);
        const posData = new Float32Array(sab);

        const flagSAB = new SharedArrayBuffer(4);
        const flag = new Int32Array(flagSAB);

        // @ts-ignore
        const posTex = new THREE.DataTexture(posData, W, H, THREE.RGBAFormat, THREE.FloatType);
        posTex.needsUpdate = true;
        posTex.magFilter = THREE.NearestFilter;
        posTex.minFilter = THREE.NearestFilter;
        posTex.generateMipmaps = false;
        posTex.wrapS = posTex.wrapT = THREE.ClampToEdgeWrapping;
        posTex.flipY = false;

        const geom = new THREE.BufferGeometry()
        geom.setAttribute('position', new THREE.Float32BufferAttribute(VERT_COUNT * 3, 3))
        geom.setDrawRange(0, VERT_COUNT);

        const uniforms = {
            posTex:  { value: posTex },
            texSize: { value: new THREE.Vector2(W, H) },
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

        const fragmentShader = /* glsl */ `
        precision highp float;
        out vec4 outColor;

        void main(){
            outColor = vec4(1., 0., 0., 1.);
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
        const worker = new Worker(new URL('./worker.ts', import.meta.url));
        worker.postMessage({ keyMessage: 'init', sab, flagSAB, w: W, h: H });

        function tick() {
            if (Atomics.load(flag, 0) === 1) {
                Atomics.store(flag, 0, 0);
                posTex.needsUpdate = true; // внутри будет texSubImage2D на тот же объект
                console.log('complete');

                setTimeout(() => {
                    worker.postMessage({ keyMessage: 'update' });
                }, 0)
            }
            requestAnimationFrame(tick)
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

