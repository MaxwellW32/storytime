"use client"
import { useEffect, useState } from "react"
import { v4 as uuidv4 } from "uuid";
import styles from "./style.module.css"
import MakeStory from './components/maker/MakeStory';
import ViewStory from './components/viewer/ViewStory';
import { StoryData, StoryDataSend, gameObjType, updateGameModesParams } from "./page";
import { allServerFunctionsAtom } from "./utility/globalState";
import { useAtom } from "jotai";



export default function Home({ allstories, getStories, newAllStory, updateStory, newStory, deleteStory, updateGameModes }: { allstories: StoryData[],getStories(): Promise<StoryData[] | undefined>, updateStory: (option: "story" | "likes", seeBoard: StoryData) => Promise<void>, newStory: (newStory: StoryDataSend) => Promise<void>, deleteStory: (seenId: string) => Promise<void>, newAllStory: (newStoriesArr: StoryData[]) => Promise<void>, updateGameModes:updateGameModesParams}) {

    const [, allServerFunctionsSet] = useAtom(allServerFunctionsAtom)

    const [makingStory, makingStorySet] = useState(false)

    //use this instead of drilling props
    useEffect(()=>{
        allServerFunctionsSet({
            "getStories":getStories,
            "deleteStory":deleteStory,
            "newStory":newStory,
            "updateStory":updateStory,
            "newAllStory":newAllStory,
            "updateGameModes":updateGameModes
                })
    },[])

    return (
        <main className={styles.homeDiv}>

            {makingStory ? <MakeStory makingStorySet={makingStorySet} />
                : (<button style={{ margin: ".5rem 0 0 .5rem" }} onClick={() => { makingStorySet(true) }}>Add a Story</button>)
            }

            {allstories?.map((eachStory: StoryData) => (
                <ViewStory key={eachStory.storyid} fullData={eachStory}/>
            ))}
        </main>
    )
}
























//whenever changing old data layout
  // function convertToNewLayout(seenStories: oldStoryData[]) {
    //     if (!ranOnce) {




    //         console.clear()
    //         console.log("oldstories", seenStories)

    //         //need to extract gamemodes array from old data 
    //         //need a clear list of storyboardobjs without gamemode

    //         const newStoryBoard = []
    //         const newGameModesArr = []

    //         const updatedStories: StoryData[] = seenStories.map(eachOldStory => {
    //             if (eachOldStory.storyid === storyIdToIgnore) {
    //                 return eachOldStory as StoryData
    //             } else {

    //                 seenStories.forEach(eachStory => {
    //                     if (eachStory.storyid === eachOldStory.storyid) {

    //                         if (eachStory.storyboard !== null) {
    //                             eachStory.storyboard.forEach(eachBoard => {
    //                                 if (eachBoard.boardType !== "gamemode") {
    //                                     newStoryBoard.push(eachBoard)
    //                                 } else {
    //                                     delete eachBoard.boardType
    //                                     if (eachBoard.gameSelection === "crossword") {
    //                                         eachBoard.gameData.hintObj = null
    //                                     }
    //                                     newGameModesArr.push(eachBoard)
    //                                 }

    //                             })
    //                         }
    //                     }
    //                 })

    //                 console.log(`$eachNewStoryBoard`, [...newStoryBoard]);
    //                 console.log(`$eachnewGameModesArr`, [...newGameModesArr]);

    //                 if (newStoryBoard.length > 0) eachOldStory.storyboard = [...newStoryBoard]
    //                 if (newGameModesArr.length > 0) eachOldStory.gamemodes = [...newGameModesArr]

    //                 newStoryBoard.length = 0
    //                 newGameModesArr.length = 0

    //                 return eachOldStory as StoryData
    //             }
    //         })

    //         newAllStory(updatedStories)
    //         console.log(`$corrected stories`, updatedStories);

    //     }
    //     ranOnce = true
    // }
    // convertToNewLayout(allstories)
