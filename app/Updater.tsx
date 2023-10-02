import { StoryData, gamemodeInfo } from "./page"
import { atom, useAtom } from 'jotai'

export default function gameObjLocalUpdater(storyBoardObj: (gamemodeInfo | string)[] | undefined, id: string, data: gamemodeInfo) {

    if (!storyBoardObj) return

    const newStoryBoardObj = [...storyBoardObj]

    //data can be all gamemodeobj data
    return newStoryBoardObj.map(storyTextBoards => {
        if (typeof storyTextBoards === "string") {
            return storyTextBoards
        } else {
            if (id === storyTextBoards.gameModeId) {
                return { ...data }
            } else {
                return storyTextBoards
            }
        }
    })
}



export function gameObjGlobalUpdater(globalStories: StoryData[] | undefined, storyId: string, objId: string, data: gamemodeInfo) {


    if (!globalStories) return



    const newObj = globalStories.map(eachStory => {
        if (eachStory.storyId === storyId) {
            return {
                ...eachStory, storyTextBoard: eachStory.storyTextBoard?.map(eachTextBoard => {
                    if (typeof eachTextBoard === "string") {
                        return eachTextBoard
                    } else {
                        if (eachTextBoard.gameModeId === objId) {
                            return { ...eachTextBoard, ...data }
                        } else {
                            return eachTextBoard
                        }

                    }
                })
            }

        } else {
            return eachStory
        }
    })

    console.log("new obj")
    console.log(newObj)
    return newObj
}