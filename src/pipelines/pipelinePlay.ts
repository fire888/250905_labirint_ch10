import { Root } from '../index'
import * as THREE from 'three'
import { LEVELS, COLOR_FOG_PLAY } from '../constants/CONSTANTS'
import { pause } from 'helpers/htmlHelpers'

export const pipelinePlay = async (root: Root, currentIndexLevel = 0) => {
    console.log('[MESSAGE:] START PLAY LEVEL: ', currentIndexLevel)

    // root.phisics.onCollision('collisionNextBuild', async () => { 
    //     await root.lab.buildNext(LEVELS[currentIndexLevel])
    //     ++currentIndexLevel
    // })

    
    //await pause(3000)

    //const { lab } = root

    // const iterate = () => {
    //     ++currentIndexLevel

    //     lab.buildNext(LEVELS[currentIndexLevel])

    //     setTimeout(iterate, 15000)
    // }

    // setTimeout(iterate, 5000)
    
    // await pipelinePlay(root, currentIndexLevelNext)
}
