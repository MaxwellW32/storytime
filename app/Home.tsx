"use client"
import { useEffect, useMemo, useState } from "react"
import { v4 as uuidv4 } from "uuid";
import styles from "./style.module.css"
import MakeStory from './components/maker/MakeStory';
import ViewStory from './components/viewer/ViewStory';
import { StoryData, StoryDataSend, gameObjType, updateGameModesParams } from "./page";
import { allServerFunctionsAtom, globalTheme, search } from "./utility/globalState";
import { useAtom } from "jotai";
import { retreiveFromLocalStorage } from "./utility/savestorage";



export default function Home({ allstories, getStories, newAllStory, updateStory, newStory, deleteStory, updateGameModes, updatePassword }: { allstories: StoryData[],getStories(): Promise<StoryData[] | undefined>, updateStory: (option: "story" | "likes" | "rating", seeBoard: StoryData) => Promise<{message: string}>, newStory: (newStory: StoryDataSend) => Promise<void>, deleteStory(seenId: string, sentPAss: string): Promise<{message: string}>, newAllStory: (newStoriesArr: StoryData[]) => Promise<void>, updateGameModes:updateGameModesParams, updatePassword: (option: "story" | "gamemode", sentStoryId: string, oldPass: string, newPass: string, sentGameModeObjId?: string) => Promise<{message: string}>}) {

    const [, allServerFunctionsSet] = useAtom(allServerFunctionsAtom)
    
    const [theme,] = useAtom(globalTheme)
    
    const [seenSearch,] = useAtom(search)
    
    const [makingStory, makingStorySet] = useState(false)
    //use this instead of drilling props
    useEffect(()=>{
        allServerFunctionsSet({
            "getStories":getStories,
            "deleteStory":deleteStory,
            "newStory":newStory,
            "updateStory":updateStory,
            "newAllStory":newAllStory,
            "updateGameModes":updateGameModes,
            "updatePassword": updatePassword
                })
    },[])
 
    const [storiesSeenAlready, storiesSeenAlreadySet] = useState<StoryData[]>([])

    const stories = useMemo(()=>{
        const seenStoryIds: string[] = retreiveFromLocalStorage("recentlySeenStories") ?? []

        const localSeenAlready:StoryData[] = []

        const normalStories = allstories.filter((eachStory)=>{
            if (!seenStoryIds.includes(eachStory.storyid)){
                return eachStory
            }else{
                localSeenAlready.push(eachStory)
            }
        })

        storiesSeenAlreadySet(localSeenAlready)
        
        return normalStories
    },[allstories])
  
    const [showAllRecentStories, showAllRecentStoriesSet] = useState(false)
    
    const searchFilteredStories = useMemo(()=>{

        if (seenSearch === "") return []
        
        seenSearch.toLowerCase()

        const storiesMatchingSearch:StoryData[] = []

        allstories.forEach(eachStory => {

            let seen = false

            if (eachStory.title.toLowerCase().includes(seenSearch)){
                seen = true
            }

            if (eachStory.shortdescription && eachStory.shortdescription.toLowerCase().includes(seenSearch)){
                seen = true
            }

            if (seen){
                storiesMatchingSearch.push(eachStory)
            }
        })
        
        return storiesMatchingSearch
    },[seenSearch])

    return (
        <main className={styles.homeDiv}>
            {makingStory ? 
                <MakeStory makingStorySet={makingStorySet} /> : 
                <button style={{ margin: ".5rem 0 0 .5rem" }} onClick={() => { makingStorySet(true) }}>Add A Story</button>
            }

            {searchFilteredStories.length > 0 && searchFilteredStories.map((eachStory: StoryData) => (
                <ViewStory key={eachStory.storyid} fullData={eachStory}/>
            ))}

            {storiesSeenAlready.length > 0 && (
                <div style={{padding: "1rem", display: "grid", gap: "1rem", backgroundColor: theme ?  "rgba(0,0,0,0.2)" :  "rgba(255,255,255,0.2)", borderRadius: "1rem", }}>
                    <div style={{display: "flex", alignItems: "center", gap: "1rem", cursor: "pointer"}} onClick={()=>{showAllRecentStoriesSet(p => !p)}}>
                        <h3 style={{color: theme ? "var(--textColorAnti)" : "var(--secondaryColor)"}}>Recently Seen Stories</h3>

                        <svg style={{fill: theme ? "var(--textColorAnti)" : "var(--secondaryColor)", rotate: showAllRecentStories ? "180deg" : "0deg", transition: 'rotate 600ms'}}  xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"/></svg>
                    </div>

                    {(!showAllRecentStories ? storiesSeenAlready.slice(0,1) : [...storiesSeenAlready]).map((eachStory: StoryData) => (
                        <ViewStory key={eachStory.storyid} fullData={eachStory}/>
                    ))}
                </div>
            )}

            {stories?.map((eachStory: StoryData) => (
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
