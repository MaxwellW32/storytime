"use client"
import { useEffect, useMemo, useState } from "react"
import styles from "./style.module.css"
import MakeStory from './components/maker/MakeStory';
import ViewStory from './components/viewer/ViewStory';
import type { StoryData } from "./page";
import { globalTheme, search } from "./utility/globalState";
import { useAtom } from "jotai";
import { retreiveFromLocalStorage } from "./utility/savestorage";



export default function Home({ seenError, allstories}: { seenError: undefined | string, allstories: StoryData[]}){
   
    //refresh on error
    useEffect(()=>{
        if (seenError){
            setTimeout(()=>{
                location.reload();
            },5000)
        }
    },[])

    const [theme,] = useAtom(globalTheme)
    
    const [seenSearch,] = useAtom(search)
    
    const [makingStory, makingStorySet] = useState(false)
 
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
        
        const storiesMatchingSearch:StoryData[] = []

        allstories.forEach(eachStory => {

            let seen = false

            if (eachStory.title.toLowerCase().includes(seenSearch.toLowerCase())){
                seen = true
            }

            if (eachStory.shortdescription && eachStory.shortdescription.toLowerCase().includes(seenSearch.toLowerCase())){
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
            {makingStory ? <MakeStory makingStorySet={makingStorySet} /> : <button style={{ margin: ".5rem 0 0 .5rem" }} onClick={() => { makingStorySet(true) }}>Add A Story</button>}

            {seenError && <p>Error Loading Stories, refreshing...</p>}
            
            {seenSearch ? (
                <>
                 {searchFilteredStories.length > 0 ? (
                    <>
                        <p>Stories matching {seenSearch}:</p>
                    
                        {searchFilteredStories.map((eachStory: StoryData) => (
                            <ViewStory key={eachStory.storyid} fullData={eachStory}/>
                        ))}
                    </>
                ) : (
                    <>
                        <p>Story Not Found</p>
                    </>
                )}

                    <div style={{height: '.2rem', backgroundColor: "var(--textColor)"}}></div>
                </>
            ) : null}

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
