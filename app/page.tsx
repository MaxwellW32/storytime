"use client"
import Image from 'next/image'
import { useMemo, useState, useRef, useEffect } from "react"
import { v4 as uuidv4 } from "uuid";
import styles from "./style.module.css"


interface gamemodeInfo {
  typeOfGameMode: string,
  gameModeComponent: JSX.Element,
  gameModeId: string,
  gameData?: matchupGameData | pronounciationGameData | wordsToMEaningGameData | crosswordGameData,
  shouldStartOnNewPage?: boolean,
}



interface StoryData {
  title: string,
  storyId: string,
  rating?: number,
  storyTextBoard?: (gamemodeInfo | string)[],
  backgroundAudio?: string,
  shortDescription?: string
}

// only view story
function Story({ title, rating, storyTextBoard, shortDescription, backgroundAudio }: StoryData) {

  const [reading, readingSet] = useState(false)

  return (
    <div style={{ border: "1px solid red", display: "flex", gap: "1rem" }}>
      <h3>{title}</h3>
      {rating && <p>{rating}/5</p>}
      {shortDescription && <p>{shortDescription}</p>}
      <button style={{ backgroundColor: "yellow" }} onClick={() => { readingSet(true) }}>Let's Read</button>

      {/* storyboard container */}
      {reading && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", backgroundColor: "yellow", position: "fixed", top: 0, left: 0, height: "100dvh", width: "100%" }}>
          {/* {storyTextBoard} */}
        </div>
      )}
    </div>
  )
}

function MakeStory() {
  const [storyData, storyDataSet] = useState<StoryData>()

  const [storyTitle, storyTitleSet] = useState("")
  const storyId = useRef(() => uuidv4())

  const [storyRating, storyRatingSet] = useState<undefined | number>()
  const [storyBgAudio, storyBgAudioSet] = useState<undefined | string>()
  const [storyShrtDescription, storyShrtDescriptionSet] = useState<undefined | string>()

  const [ogStoryText, ogStoryTextSet] = useState(
    `1 paragraph
    2 paragraph

    3 paragraph

    4 paragraph
    5 paragraph`
  )

  //game modes and story text
  const [storyTextBoard, storyTextBoardSet] = useState<(gamemodeInfo | string)[] | undefined>()

  function loadUpStoryTextBoardFresh() {
    //sets up my original array from text only blank
    storyTextBoardSet(() => {
      const paragraphs = ogStoryText.split('\n\n');
      const storyBoardArr = paragraphs
      return storyBoardArr
    })
  }

  function addToStoryTextBoard(index: number, option = "newString") {

    if (option === "newString") {
      storyTextBoardSet((prevStoryBoard) => {
        const newBoard = [...prevStoryBoard!]
        newBoard.splice(index + 1, 0, "")
        return newBoard
      })
    } else {
      storyTextBoardSet((prevStoryBoard) => {
        const newBoard = [...prevStoryBoard!]

        let typeOfGameModeSet = ""
        let gameModeIdSet: string = uuidv4()
        let shouldStartOnNewPageset = false
        let gameModeComponentSet: JSX.Element | undefined

        if (option === "matchup") {
          typeOfGameModeSet = "MatchUp"
          gameModeComponentSet = <MatchUp />
        }
        if (option === "crossword") {
          typeOfGameModeSet = "CrossWord"
          gameModeComponentSet = <Crossword />
        }
        if (option === "wordstomeaning") {
          typeOfGameModeSet = "WordsToMeaning"
          gameModeComponentSet = <WordsToMeaning />
        }
        if (option === "pronounciation") {
          typeOfGameModeSet = "Pronounciation"
          gameModeComponentSet = <Pronounciation />
        }


        const gameModeObj: gamemodeInfo = {
          typeOfGameMode: typeOfGameModeSet,
          gameModeComponent: gameModeComponentSet!,
          gameModeId: gameModeIdSet,
          shouldStartOnNewPage: shouldStartOnNewPageset,
        }

        newBoard.splice(index + 1, 0, gameModeObj)
        return newBoard
      })
    }

  }

  return (
    <div style={{ overflowY: "auto", position: "fixed", top: 0, left: 0, zIndex: 1, height: "100dvh", width: "100%", backgroundColor: "blue", display: "flex", flexDirection: "column", gap: "2rem" }}>
      <p>Lets make a story</p>

      <div>
        <label htmlFor='msTitle'>Title</label>
        <input id='msTitle' type='text' placeholder='Enter a title: ' value={storyTitle} onChange={(e) => {
          storyTitleSet(e.target.value)
        }} />

      </div>

      {storyTextBoard === undefined ? (

        <>
          <textarea style={{ backgroundColor: "wheat", resize: "vertical", minHeight: "100px", width: "100%", }} placeholder='Enter your story' value={ogStoryText} onChange={(e) => { ogStoryTextSet(e.target.value) }} />
          <button onClick={loadUpStoryTextBoardFresh}>Process</button>
        </>
      ) : (

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {storyTextBoard.map((eachElemnt, index) => {
            let newElement
            if (typeof eachElemnt === "string") {
              newElement = <textarea style={{ backgroundColor: "wheat" }} defaultValue={eachElemnt} onBlur={(e) => {
                storyTextBoardSet(prevStoryBoard => {
                  const newArr = [...prevStoryBoard!]
                  const paragraphsArrSeen = e.target.value.split('\n\n');

                  if (paragraphsArrSeen.length <= 1) {
                    newArr[index] = e.target.value
                  } else {
                    newArr.splice(index, 1);
                    paragraphsArrSeen.forEach((paragraph, pIndex) => {
                      const indexToAdd = pIndex + index;
                      newArr.splice(indexToAdd, 0, paragraph);
                    })
                  }

                  return newArr
                })
              }} />
            } else {
              newElement = eachElemnt.gameModeComponent
            }

            return (
              <div className={styles.storyTextboardHolder} style={{ display: "flex", flexDirection: "column", border: "3px solid red" }} key={uuidv4()}>
                {newElement}
                <div className={styles.bttnHolder} style={{ display: "flex", gap: "1rem" }}>
                  <button style={{ marginRight: "1rem" }} onClick={() => {
                    // updater buttn
                    addToStoryTextBoard(index)
                  }}>Add Below</button>

                  <button onClick={() => { addToStoryTextBoard(index, "matchup") }}>Matchup</button>
                  <button onClick={() => { addToStoryTextBoard(index, "crossword") }}>Crossword</button>
                  <button onClick={() => { addToStoryTextBoard(index, "wordstomeaning") }}>WordsToMeaning</button>
                  <button onClick={() => { addToStoryTextBoard(index, "pronounciation") }}>Pronounciation</button>
                </div>
              </div>
            )
          })}
        </div>
      )}


    </div>
  )
}

export default function Home() {

  const firstStoryData: StoryData = {
    title: 'First Story',
    storyId: "5b8a8eb0-74f8-41dc-b616-952196eb3b3f",
    rating: 5,
  }

  const [makingStory, makingStorySet] = useState(false)

  return (
    <main>
      <p>Home Page</p>
      {!makingStory && <button onClick={() => {
        makingStorySet(true)
      }}>Add a Story</button>}
      {makingStory && <MakeStory />}
      <Story {...firstStoryData} />
    </main>
  )
}

interface matchupGameData {
  questionsArr?: string[],
  choisesArr?: string[],
  answersArr?: string[]
}
interface pronounciationGameData { }
interface wordsToMEaningGameData { }
interface crosswordGameData { }
// games

function MatchUp({ gameId, updater, questionsArr, choisesArr, answersArr }: matchupGameData & { gameId: string, updater: (id: string) => void }) {

  const [questions, questionsSet] = useState<string[] | undefined>(questionsArr)
  const [choices, choicesSet] = useState<string[] | undefined>(choisesArr)
  const [answers, answersSet] = useState<string[] | undefined>(answersArr)

  const [dataSeen, dataSeenSet] = useState(false)

  useEffect(() => {
    if (questions) {
      dataSeenSet(true)
    }
  }, [])
  //match 4
  //4 answer
  //4 questions

  //what is up - the sky
  //what is down - the land
  //what is blue - the water
  //what is red - the sun
  //move things in right place

  //either see data
  //or will ask you to make data - then pass that data up - update with id

  const showQuestions = useMemo(() => {
    const newArr = [1, 2, 3, 4]

    return newArr.map((item, index) => (
      <div key={index}>
        <input type='text' placeholder={`Question ${index + 1}`} value={questions![index]} onChange={(e) => {
          questionsSet((prevQuestions) => {
            const newQuestionsArr = prevQuestions ?? []
            newQuestionsArr[index] = e.target.value
            return newQuestionsArr
          })
        }} />
        <input type='text' placeholder={`Matching Choice ${index + 1}`} value={choices![index]} onChange={(e) => {
          choicesSet((prevChoices) => {
            const newChoicesArr = prevChoices ?? []
            newChoicesArr[index] = e.target.value
            return newChoicesArr
          })
        }} />
      </div>
    ))
  }, [])

  return (
    <div>
      {dataSeen ? (
        <>
          seeing data - quiz time
        </>
      ) : (
        <>
          <p>setup data</p>

        </>
      )}
    </div>
  )
}

function Crossword() {
  return (
    <div>
      crossword
    </div>
  )
}

function WordsToMeaning() {
  return (
    <div>
      WordsToMeaning
    </div>
  )
}

function Pronounciation() {
  return (
    <div>
      Pronounciation
    </div>
  )
}