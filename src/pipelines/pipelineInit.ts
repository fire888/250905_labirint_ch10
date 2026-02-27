import { pause } from 'helpers/htmlHelpers'
import { Root } from '../index'
import { update } from '@tweenjs/tween.js'
import { IS_DEV_START_ORBIT } from '../constants/CONSTANTS'
import * as THREE from 'three'
import { createChangerGameTheme } from 'helpers/changerGameTheme'

export const pipelineInit = async (root: Root) => {
    const {
        studio,
        controls,
        ui,
        ticker,
        loader,
        texturesCanvas,
        phisics,
        lab,
        backTower,
        audio,
        materials,
    } = root

    loader.init()
    await loader.loadAssets()

    await texturesCanvas.init()

    ticker.start()

    ticker.on((t: number) => {
        update()
    })

    materials.init(root)

    studio.init(root)
    ticker.on(studio.render.bind(studio))

    phisics.init(root)
    phisics.createPlayerPhisicsBody([3, 2, 0])
    
    await lab.init(root)
    await lab.buildNext()

    await backTower.init(root)
    const TOWER_OFFSET = 900
    root.backTower.setPositionX(phisics.playerBody.position.x + TOWER_OFFSET)
    let n = 100
    ticker.on(() => {
        --n
        if (n < 0) {
            n = 100
            root.backTower.setPositionX(phisics.playerBody.position.x + TOWER_OFFSET)
        }

    })

    ui.init(root)
    ui.setTransparentBackground()

    if (IS_DEV_START_ORBIT) {
        await ui.hideStartScreenForce()
    } else {
        root.studio.addFog()
        await ui.hideStartScreen().then()
    }

    ticker.on(phisics.update.bind(phisics))

    audio.init(root)
    ticker.on(audio.update.bind(audio))
    audio.playAmbient()
    
    controls.init(root, IS_DEV_START_ORBIT)
    ticker.on(controls.update.bind(controls))

    //await pause(100)
    
    // if (!IS_DEV_START_ORBIT) {
    //     controls.disconnect()
    //     // const startPos 
    //     // const startPos = [LEVELS[0].playerStartPosition[0], .7, LEVELS[0].playerStartPosition[1]]
    //     await studio.cameraFlyToLevel(startPos)
    //     phisics.setPlayerPosition(...startPos)
    //     studio.animateFogTo(LEVELS[0].fogFar, LEVELS[0].theme.fogColor, 4000)
    //     studio.animateBackgroundTo(LEVELS[0].theme.sceneBackground, 3000)
    //     studio.animateLightTo(LEVELS[0].theme.dirLightColor, LEVELS[0].theme.ambientLightColor, 3000)
    //     controls.connect()
    // }

    //createChangerGameTheme(root)
}
