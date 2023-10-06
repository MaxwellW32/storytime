import { StoryData, storyBoardType } from "./page"


export default function updateBoardObjWithBoardDataGlobal(globalStories: StoryData[], storyId: string, seenBoardId: string, seenBoardObjData: storyBoardType) {

    const newGlobalStoried = globalStories.map(eachStory => {
        if (eachStory.storyId === storyId) {
            return {
                ...eachStory, storyBoard: eachStory.storyBoard!.map(eachStoryBoard => {
                    if (eachStoryBoard.boardObjId === seenBoardId) {
                        return { ...seenBoardObjData }
                    } else {
                        return eachStoryBoard
                    }
                })
            }

        } else {
            return eachStory
        }
    })

    return newGlobalStoried
}