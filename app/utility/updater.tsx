// import { StoryData, gameObjType } from "../page"

// export function updateStoryWithGameDataGlobal(stories: StoryData[], storyId: string, boardObjId: string, newGameObj: gameObjType) {
//     //for updates to gameFinished

//     const updatedStories = stories.map(eachStory => {
//         if (eachStory.storyId === storyId) {
//             return {
//                 ...eachStory, storyBoard: eachStory.storyBoard!.map(eachBoard => {
//                     if (eachBoard.boardObjId === boardObjId) {
//                         return { ...newGameObj }
//                     } else {
//                         return eachBoard
//                     }
//                 })
//             }
//         } else {
//             return eachStory
//         }
//     })

//     return updatedStories
// }