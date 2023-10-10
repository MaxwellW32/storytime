"use client"
import { useState, useEffect } from "react"
import { v4 as uuidv4 } from "uuid";
import styles from "./style.module.css"
import { useAtom } from 'jotai'
import { saveToLocalStorage, retreiveFromLocalStorage } from './utility/savestorage';
import { globalStorieArray } from '@/app/utility/globalState'


import MakeStory from './components/maker/MakeStory';
import ViewStory from './components/viewer/ViewStory';


//this is the layout for the objects of each of my games that holds everything
export interface textType { //default add
  boardObjId: string,
  storedText: string | undefined,
  boardType: "text",
}

export interface imageType {
  boardObjId: string,
  imageUrl: string | undefined,
  boardType: "image",
}

export interface videoType {
  boardObjId: string,
  videoUrl: string | undefined,
  boardType: "video",
}

export type gameDataType = matchupType | pronounceType | wordsToMeaningType | crosswordType
export type gameSelectionTypes = "matchup" | "crossword" | "pronounce" | "wordmeaning"

export interface gameObjType {
  boardObjId: string,
  gameSelection: gameSelectionTypes, //tell different types of gamemodes
  gameFinished: boolean,
  boardType: "gamemode",
  shouldStartOnNewPage: boolean | undefined,
  gameData: gameDataType | undefined,
}


export type storyBoardType = gameObjType | videoType | imageType | textType
export interface StoryData {
  title: string,
  storyId: string,
  rating: number | undefined,
  storyBoard: storyBoardType[] | undefined,
  backgroundAudio: string | undefined,
  shortDescription: string | undefined
}


export interface matchupType {
  gameDataFor: "matchup",
  questionsArr: string[] | undefined,
  choicesArr: string[][] | undefined,
}

export interface pronounceType {
  gameDataFor: "pronounce",

}

export interface wordsToMeaningType {
  gameDataFor: "wordmeaning",

}

export interface crosswordType {
  gameDataFor: "crossword",
  wordArray: string[] | undefined
}




export default function Home() {
  const [storiesGlobal, storiesGlobalSet] = useAtom(globalStorieArray)

  const [makingStory, makingStorySet] = useState(false)

  //save stories
  useEffect(() => {
    if (storiesGlobal) {
      saveToLocalStorage("storiesArr", storiesGlobal)
    }
  }, [storiesGlobal])

  //load
  useEffect(() => {
    const seenStories = retreiveFromLocalStorage("storiesArr") as StoryData[]
    if (seenStories) {
      storiesGlobalSet(seenStories)
      //   const seenStoriesClear = seenStories.filter(eachSeenStory => {

      //     let foundInArr = false
      //     tempbddata.forEach(eachTempStory => {
      //       if (eachTempStory.storyId === eachSeenStory.storyId) {
      //         foundInArr = true
      //       }
      //     })

      //     if (!foundInArr) {
      //       return eachSeenStory
      //     }
      //   })

      //   storiesSet([...tempbddata as StoryData[], ...seenStoriesClear])
      // }
      // else {
      //   storiesSet(tempbddata as StoryData[])
    }
  }, [])

  return (
    <main className={styles.homeDiv}>

      {makingStory
        ? <MakeStory makingStorySet={makingStorySet} />
        : (<button style={{ margin: ".5rem 0 0 .5rem" }} onClick={() => { makingStorySet(true) }}>Add a Story</button>)
      }

      {storiesGlobal?.map((eachStory: StoryData) => (
        <ViewStory key={uuidv4()} fullData={eachStory} />
      ))}
    </main>
  )
}










