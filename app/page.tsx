"use client"
import Image from 'next/image'
import { useMemo, useState, useRef, useEffect } from "react"
import { v4 as uuidv4 } from "uuid";
import styles from "./style.module.css"
import { atom, useAtom } from 'jotai'

export const globalStorieArray = atom<StoryData[] | undefined>(undefined)

interface gamemodeInfo {
  typeOfGameMode: string,
  gameModeComponent: JSX.Element,
  gameModeId: string,
  updateGameModeObj: (id: string, data: matchupGameData | pronounciationGameData | wordsToMEaningGameData | crosswordGameData) => void,
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
  const [, storiesSet] = useAtom(globalStorieArray)

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
        newBoard.splice(index + 1, 0, { ...makeNewGameModeObj(option) })
        return newBoard
      })
    }

  }

  function makeNewGameModeObj(option: string) {
    let typeOfGameModeSet = ""
    let gameModeIdSet: string = uuidv4()
    let shouldStartOnNewPageset = false
    let gameModeComponentSet: JSX.Element | undefined
    let gameData: matchupGameData | pronounciationGameData | wordsToMEaningGameData | crosswordGameData = {}

    if (option === "matchup") {
      typeOfGameModeSet = "MatchUp"
      gameModeComponentSet = <MatchUp {...gameData} gameId={gameModeIdSet} updateGameModeObj={updateGameModeObj} />

    } else if (option === "crossword") {
      typeOfGameModeSet = "CrossWord"
      gameModeComponentSet = <Crossword />

    } else if (option === "wordstomeaning") {
      typeOfGameModeSet = "WordsToMeaning"
      gameModeComponentSet = <WordsToMeaning />

    } else if (option === "pronounciation") {
      typeOfGameModeSet = "Pronounciation"
      gameModeComponentSet = <Pronounciation />
    }


    const gameModeObj: gamemodeInfo = {
      typeOfGameMode: typeOfGameModeSet,
      gameModeComponent: gameModeComponentSet!,
      gameModeId: gameModeIdSet,
      shouldStartOnNewPage: shouldStartOnNewPageset,
      updateGameModeObj: updateGameModeObj,
    }

    return gameModeObj

  }

  function updateGameModeObj(id: string, data: matchupGameData | pronounciationGameData | wordsToMEaningGameData | crosswordGameData) {

    storyTextBoardSet(prevStoryTextBoard => {
      const newBoard = prevStoryTextBoard!.map(storyTextBoards => {
        if (typeof storyTextBoards === "string") {
          return storyTextBoards
        } else {
          if (id === storyTextBoards.gameModeId) {
            return { ...storyTextBoards, gameData: data, gameModeComponent: <MatchUp gameId={storyTextBoards.gameModeId} updateGameModeObj={updateGameModeObj} {...data} /> }
          } else {
            return storyTextBoards
          }
        }
      })

      return newBoard
    })

  }

  function handleSubmit() {
    const newStoryObj: StoryData = {
      storyId: storyId.current(),
      title: storyTitle,
      backgroundAudio: storyBgAudio,
      rating: storyRating,
      shortDescription: storyShrtDescription,
      storyTextBoard: storyTextBoard
    }

    storiesSet(prevStoriesArr => {
      if (prevStoriesArr) {
        return [...prevStoriesArr, newStoryObj]
      } else {
        return [newStoryObj]
      }
    })
  }

  return (
    <div style={{ overflowY: "auto", position: "fixed", top: 0, left: 0, zIndex: 1, height: "100dvh", width: "100%", backgroundColor: "blue", display: "flex", flexDirection: "column", gap: "2rem" }}>
      <p>Lets make a story</p>

      <div className={styles.makeStoryLabelInputCont}>
        <label htmlFor='msTitle'>Title</label>
        <input id='msTitle' type='text' placeholder='Enter a title: ' value={storyTitle} onChange={(e) => {
          storyTitleSet(e.target.value)
        }} />
      </div>

      <div className={styles.makeStoryLabelInputCont}>
        <label htmlFor='msShDescription'>Short Description</label>
        <input id='msShDescription' type='text' placeholder='Enter a Description: ' value={storyShrtDescription} onChange={(e) => {
          storyShrtDescriptionSet(e.target.value)
        }} />
      </div>

      <div className={styles.makeStoryLabelInputCont}>
        <label htmlFor='msRating'>Rating</label>
        <input id='msRating' type='number' placeholder='Enter a Rating /5: ' value={storyRating} onChange={(e) => {
          storyRatingSet(parseInt(e.target.value))
        }} />
      </div>

      <div className={styles.makeStoryLabelInputCont}>
        <label htmlFor='msAudio'>Audio</label>
        <input id='msAudio' type='text' placeholder='Background Music?: ' value={storyBgAudio} onChange={(e) => {
          storyBgAudioSet(e.target.value)
        }} />
      </div>

      {storyTextBoard === undefined ? (

        <>
          <textarea style={{ backgroundColor: "wheat", resize: "vertical", minHeight: "100px", width: "100%", }} placeholder='Enter your story' value={ogStoryText} onChange={(e) => { ogStoryTextSet(e.target.value) }} />
          <button onClick={loadUpStoryTextBoardFresh}>Process</button>
        </>
      ) : (

        <>
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

        </>
      )}

      <button onClick={handleSubmit}>Submit</button>

    </div>
  )
}

function saveToLocalStorage(keyName: string, item: any) {
  // localStorage.removeItem(keyName);
  localStorage.setItem(keyName, JSON.stringify(item));
}

function retreiveFromLocalStorage(keyName: string) {
  const todos = localStorage.getItem(keyName);
  if (todos) {
    const todosArray = JSON.parse(todos);
    return todosArray
  } else {
    return null
  }
}

export default function Home() {
  const [stories, storiesSet] = useAtom(globalStorieArray)
  const [makingStory, makingStorySet] = useState(false)

  useEffect(() => {
    //save
    if (stories) {
      saveToLocalStorage("storiesArr", stories)
      makingStorySet(false)
      console.log('seeing here')
    }
  }, [stories])


  useEffect(() => {
    const seenStories = retreiveFromLocalStorage("storiesArr")
    //save
    if (seenStories) {
      console.log("seeing some stories from storage")
      storiesSet(seenStories)
    }
  }, [])

  return (
    <main>
      <p>Home Page</p>

      {makingStory ? <MakeStory /> : (
        <button onClick={() => {
          makingStorySet(true)
        }}>Add a Story</button>
      )}

      {stories?.map(eachStory => (
        <Story key={eachStory.storyId} {...eachStory} />
      ))}
    </main>
  )
}

interface matchupGameData {
  questionsArr?: string[],
  choicesArr?: string[],
  answersArr?: string[],
  gameComplete?: boolean
}

// games
//match 4
function MatchUp({ gameId, updateGameModeObj, questionsArr, choicesArr, answersArr, gameComplete }: matchupGameData & {
  gameId: string,
  updateGameModeObj: (id: string, data: matchupGameData | pronounciationGameData | wordsToMEaningGameData | crosswordGameData) => void,
}) {

  const [questions, questionsSet] = useState<string[] | undefined>(questionsArr)
  const [choices, choicesSet] = useState<string[] | undefined>(choicesArr)
  const [answers, answersSet] = useState<string[] | undefined>(answersArr)
  const [userAnswers, userAnswersSet] = useState<string[]>([])
  const [gameWon, gameWonSet] = useState(gameComplete)

  const [dataSeen, dataSeenSet] = useState(false)
  const choiceRefs = useRef<HTMLDivElement[]>([])
  const questionRefs = useRef<HTMLDivElement[]>([])

  useEffect(() => {
    if (questionsArr) {
      dataSeenSet(true)
    }
  }, [])

  const amtQuestionsArr = useRef(() => {
    const amount = 4
    const newArr = []
    for (let index = 0; index < amount; index++) {
      newArr.push(index)
    }

    return newArr
  })

  useEffect(() => {
    if (questions && choices) {
      answersSet(() => {
        const newArr = amtQuestionsArr.current().map((temp, index) => {
          return `${questions[index] ?? ''}${choices[index] ?? ''}`;

        })
        return newArr
      })
    }

  }, [questions, choices])

  function submit() {
    const newGameData: matchupGameData = {
      choicesArr: choices,
      answersArr: answers,
      questionsArr: questions,
      gameComplete: gameWon
    }

    console.log(newGameData.gameComplete)
    updateGameModeObj(gameId, newGameData)
  }

  const addChoiceRef = (el: HTMLDivElement) => {
    if (el && !choiceRefs.current.includes(el)) {
      choiceRefs.current.push(el)
    }
  }

  const addQuestionRefs = (el: HTMLDivElement) => {
    if (el && !questionRefs.current.includes(el)) {
      questionRefs.current.push(el)
    }
  }

  const [mouseIsDown, mouseIsDownSet] = useState(false)

  function checkAnswers() {

    let amtCorrect = 0
    userAnswers.forEach(userAns => {
      answers!.forEach(answer => {
        if (userAns === answer) {
          amtCorrect++
        }
      })
    })

    if (amtCorrect === amtQuestionsArr.current().length) {
      gameWonSet(true)
      submit()
      console.log(amtCorrect)
    }
  }

  return (
    <div>
      {dataSeen ? (
        <>
          <p>seeing data - quiz time</p>
          questions
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridAutoRows: "100px", gap: ".3rem" }}>

            {questions!.map((question, index) => (
              <div style={{ backgroundColor: "white" }} ref={addQuestionRefs}>
                {question}
              </div>
            ))}
          </div>
          choices
          <div style={{ display: "flex", gap: "1rem" }}>
            {choices!.map((choice, choiceMapIndex) => (
              <div className={styles.choices} style={{ backgroundColor: "yellow" }} ref={addChoiceRef} onMouseDown={(e) => { mouseIsDownSet(true) }}
                onMouseMove={(e) => {
                  if (mouseIsDown) {
                    const { width, height, top, left } = choiceRefs.current[choiceMapIndex].getBoundingClientRect();

                    choiceRefs.current[choiceMapIndex].style.position = "absolute"
                    choiceRefs.current[choiceMapIndex].style.left = `${e.pageX - width / 2}px`
                    choiceRefs.current[choiceMapIndex].style.top = `${e.pageY - height / 2}px`

                    // console.log(e.pageX, e.pageY)
                  }
                }}

                onMouseUp={(e) => {
                  mouseIsDownSet(false)
                  //current choice selected
                  const { width: choiceWidth, height: choiceHeight } = choiceRefs.current[choiceMapIndex].getBoundingClientRect();
                  const currentChoiceLocationX = e.clientX - choiceWidth / 2
                  const currentChoiceLocationY = e.clientY - choiceHeight / 2

                  //compare to refs of questions
                  //if midpoint is over 
                  //set over a question to true
                  // overAQuestionSet(true)

                  //if over topleft corner
                  //if over topright corner
                  //if over bottomleft corner
                  //if over bottomright corner
                  let overAQuestionLocal = false
                  let overQuestionIndex = 0
                  let questionBound = {
                    height: 0,
                    width: 0,
                    top: 0,
                    left: 0
                  }

                  questionRefs.current.forEach((eachRef, index) => {
                    const { top, left, bottom, right, width, height } = eachRef.getBoundingClientRect()
                    // console.log(`top :${top} left:${left} bottom:${bottom} right:${right}`)
                    // console.log(`currentChoiceLocationX :${currentChoiceLocationX} currentChoiceLocationY :${currentChoiceLocationY}`)

                    if (currentChoiceLocationX < right && currentChoiceLocationX >= left) {
                      if (currentChoiceLocationY < bottom && currentChoiceLocationY >= top) {
                        overAQuestionLocal = true
                        overQuestionIndex = index
                        questionBound = { width, height, top, left }
                        console.log(`over element ${index}`)
                        console.log(`over question ${questions![index]}`)
                        console.log(`for choice ${choices![choiceMapIndex]}`)
                        console.log(questionRefs.current[index])
                      }
                    }
                  })


                  if (overAQuestionLocal) {
                    choiceRefs.current[choiceMapIndex].style.position = "absolute"
                    choiceRefs.current[choiceMapIndex].style.width = `${questionBound.width}px`
                    choiceRefs.current[choiceMapIndex].style.height = `${questionBound.height}px`
                    choiceRefs.current[choiceMapIndex].style.zIndex = `0`
                    choiceRefs.current[choiceMapIndex].style.top = `${questionBound.top}px`
                    choiceRefs.current[choiceMapIndex].style.left = `${questionBound.left}px`
                    choiceRefs.current[choiceMapIndex].classList.add(styles.fillUpChoice)

                    userAnswersSet(prevUserAnswers => {
                      const newArr = [...prevUserAnswers]
                      newArr[choiceMapIndex] = `${questions![overQuestionIndex]}${choices![choiceMapIndex]}`
                      return newArr
                    })
                  } else {
                    choiceRefs.current[choiceMapIndex].style.position = "static"
                    choiceRefs.current[choiceMapIndex].style.width = `auto`
                    choiceRefs.current[choiceMapIndex].style.zIndex = `1`
                    choiceRefs.current[choiceMapIndex].style.height = `auto`
                    choiceRefs.current[choiceMapIndex].style.top = `0px`
                    choiceRefs.current[choiceMapIndex].style.left = `0px`
                    choiceRefs.current[choiceMapIndex].classList.remove(styles.fillUpChoice)
                  }

                }}>
                {choice}
              </div>
            ))}
          </div>
          <button onClick={checkAnswers}>Check Answers</button>
          {gameWon && <p>Game completed</p>}
        </>
      ) : (
        <>
          <p>setup data</p>
          {amtQuestionsArr.current().map((temp, index) => (

            <div key={index}>
              <input type='text' placeholder={`Question ${index + 1}`} value={questions ? questions[index] : ""} onChange={(e) => {
                questionsSet((prevQuestions) => {
                  let newQuestionsArr: string[] = []
                  if (prevQuestions) newQuestionsArr = [...prevQuestions]
                  newQuestionsArr[index] = e.target.value
                  return newQuestionsArr
                })
              }} />
              <input type='text' placeholder={`Matching Choice ${index + 1}`} value={choices ? choices[index] : ""} onChange={(e) => {
                choicesSet((prevChoices) => {
                  let newChoicesArr: string[] = []
                  if (prevChoices) newChoicesArr = [...prevChoices]
                  newChoicesArr[index] = e.target.value
                  return newChoicesArr
                })
              }} />
            </div>


          ))}
          <button onClick={submit}>Save</button>
        </>
      )}
    </div>
  )
}



interface crosswordGameData { }
function Crossword() {
  return (
    <div>
      crossword
    </div>
  )
}

interface wordsToMEaningGameData { }
function WordsToMeaning() {
  return (
    <div>
      WordsToMeaning
    </div>
  )
}

interface pronounciationGameData { }
function Pronounciation() {
  return (
    <div>
      Pronounciation
    </div>
  )
}