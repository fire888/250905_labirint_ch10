import { 
    Texture, 
    TextureLoader, 
    AudioLoader, 
    CubeTextureLoader, 
    CubeTexture 
} from 'three'

import audioAmbient from '../assets/ambient.mp3'
import steps from '../assets/steps_metal.mp3'
import audioBzink from '../assets/bzink.mp3'
import audioDoor from '../assets/door.mp3'
import audioFly from '../assets/fly.mp3'

import roadImg from '../assets/road_stone.webp'
import wallTile from '../assets/tiles_wall.webp'
import noise00 from '../assets/noise00.webp'
import sprite from '../assets/sprite.webp'

import el_0 from '../assets/el_0.jpg'
import el_0_norm from '../assets/el_0_norm.png'
import el_0_ao from '../assets/el_0_ao.png'
import el_0_spec from '../assets/el_0_spec.png'

type Assets = {
    sprite: Texture,
    soundAmbient: any,
    soundStepsMetal: any,
    soundBzink: any, 
    soundDoor: any,
    soundFly: any,
    roadImg: Texture,
    lightMap: Texture,
    mapWall_01: Texture,
    noise00: Texture,

    el_0: Texture,
    el_0_norm: Texture,
    el_0_ao: Texture,
    el_0_spec: Texture
}
type ResultLoad = {
    key: keyof Assets,
    texture: Texture | any,
}

export class LoaderAssets {
    _textureLoader: TextureLoader = new TextureLoader()
    _cubeTextureLoader: CubeTextureLoader = new CubeTextureLoader()
    assets: Assets = {
        sprite: null,
        soundAmbient: null,
        soundStepsMetal: null,
        soundBzink: null,
        soundDoor: null,
        soundFly: null,
        roadImg: null,
        lightMap: null,
        mapWall_01: null,
        noise00: null,

        el_0: null,
        el_0_norm: null,
        el_0_ao: null,
        el_0_spec: null
    }

    init () {}

    loadAssets (): Promise<void> {
        return new Promise(res => {

            const loadTexture = (key: keyof Assets, src: string) => {
                return new Promise<ResultLoad>(res => {
                    this._textureLoader.load(src, texture => {
                        res({ key, texture })
                    })
                })
            }

            const loadAudio = ( key: keyof Assets, src: string) => {
                return new Promise<ResultLoad>(res => {
                    const loader = new AudioLoader()
                    loader.load(src, buffer => {
                        res({ key, texture: buffer })
                    })
                })
            }

            const loadCubeTexture = (key: keyof Assets, src: string[]) => {
                return new Promise<ResultLoad>(res => {
                    this._cubeTextureLoader.load(src, cubeTexture => {
                        res({ key, texture: cubeTexture })
                    })
                })
            }

            const promises = [
                loadAudio('soundAmbient', audioAmbient),
                loadAudio('soundStepsMetal', steps),
                loadAudio('soundBzink', audioBzink),
                loadAudio('soundDoor', audioDoor),
                loadAudio('soundFly', audioFly),
                
                loadTexture('sprite', sprite),
                loadTexture('roadImg', roadImg),
                loadTexture('mapWall_01', wallTile),
                loadTexture('noise00', noise00),
                
                loadTexture('el_0', el_0),
                loadTexture('el_0_norm', el_0_norm),
                loadTexture('el_0_ao', el_0_ao),
                loadTexture('el_0_spec', el_0_spec),
            ]

            Promise.all(promises).then(result => {
                for (let i = 0; i < result.length; ++i) {
                     this.assets[result[i].key as keyof Assets] = result[i].texture
                }
                res()
            })
        })
    }
}
