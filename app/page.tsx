"use client"
import Image from 'next/image'
import { useMemo, useState, useRef, useEffect } from "react"
import { v4 as uuidv4 } from "uuid";
import styles from "./style.module.css"
import { atom, useAtom } from 'jotai'
import ReactPlayer from "react-player/youtube";
import updateGameModeObj, { gameObjGlobalUpdater } from './Updater';
import gameObjLocalUpdater from './Updater';

export const globalStorieArray = atom<StoryData[] | undefined>(undefined)

//this is the layout for the objects of each of my games that holds everything
export interface gamemodeInfo {
  typeOfGameMode: string,
  gameModeId: string,
  gameData?: matchupGameData | pronounciationGameData | wordsToMeaningGameData | crosswordGameData,
  shouldStartOnNewPage?: boolean,
  gameFinished?: boolean
}

export interface StoryData {
  title: string,
  storyId: string,
  rating?: number,
  storyTextBoard?: (gamemodeInfo | string)[],
  backgroundAudio?: string,
  shortDescription?: string
}

function Story({ title, rating, storyTextBoard, shortDescription, backgroundAudio, storyId }: StoryData) {
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

          {storyTextBoard?.map((eachElemnt, index) => {
            if (typeof eachElemnt === "string") {
              return (
                <div className={styles.storyTextboardHolder} style={{ display: "flex", flexDirection: "column", border: "3px solid red" }} key={uuidv4()}>
                  <p style={{}}>{eachElemnt}</p>
                </div>
              )
            } else {
              //getname of element and choose component that way
              return (
                <div className={styles.storyTextboardHolder} style={{ display: "flex", flexDirection: "column", border: "3px solid red" }} key={uuidv4()}>

                  {eachElemnt.typeOfGameMode === "MATHCUP" ? (
                    <MatchUp {...eachElemnt} storyId={storyId} />
                  ) : eachElemnt.typeOfGameMode === "CROSSWORD" ? (
                    <Crossword />
                  ) : eachElemnt.typeOfGameMode === "WORDSTOMEANING" ? (
                    <WordsToMeaning />
                  ) : (
                    <Pronounciation />
                  )}
                </div>
              )
            }

          })}
        </div>
      )}

      <div style={{ display: "none", opacity: 0, userSelect: "none" }}>
        <ReactPlayer
          loop={true}
          playing={reading}
          url={backgroundAudio ? backgroundAudio : "https://www.youtube.com/watch?v=NJuSStkIZBg"} />
      </div>
    </div>
  )
}

function MakeStory() {
  const [, storiesSet] = useAtom(globalStorieArray)

  const [storyTitle, storyTitleSet] = useState(`Story ${uuidv4()}`)
  const storyId = useRef(() => uuidv4())

  const [storyRating, storyRatingSet] = useState<undefined | number>(5)
  const [storyBgAudio, storyBgAudioSet] = useState<undefined | string>()
  const [storyShrtDescription, storyShrtDescriptionSet] = useState<undefined | string>("nice story")

  const [preProcessedText, preProcessedTextSet] = useState(`1 paragraph \n\n 2 paragraph \n\n 3 paragraph \n\n 4 paragraph \n\n 5 paragraph`)

  //game modes and story text
  const [storyTextBoardObjs, storyTextBoardObjsSet] = useState<(gamemodeInfo | string)[] | undefined>()

  function loadUpStoryTextBoardFresh() {
    //sets up my original array from text only blank
    storyTextBoardObjsSet(() => {
      const paragraphs = preProcessedText.split('\n\n');
      const storyBoardArr = paragraphs
      return storyBoardArr
    })
  }

  function addToStoryTextBoard(index: number, option = "newString") {

    if (option === "newString") {
      storyTextBoardObjsSet((prevStoryBoard) => {
        const newBoard = [...prevStoryBoard!]
        newBoard.splice(index + 1, 0, "")
        return newBoard
      })
    } else {
      storyTextBoardObjsSet((prevStoryBoard) => {
        const newBoard = [...prevStoryBoard!]
        newBoard.splice(index + 1, 0, makeNewGameModeObj(option))
        return newBoard
      })
    }

  }

  function makeNewGameModeObj(option: string) {
    let typeOfGameModeSet = option.toUpperCase()
    let gameModeIdSet: string = uuidv4()

    const gameModeObj: gamemodeInfo = {
      typeOfGameMode: typeOfGameModeSet,
      gameModeId: gameModeIdSet,
    }

    return { ...gameModeObj }
  }

  function updateGameModeObjLocal(stryBoardId: string, data: gamemodeInfo) {
    storyTextBoardObjsSet(gameObjLocalUpdater(storyTextBoardObjs, stryBoardId, data))
  }

  function handleSubmit() {
    const newStoryObj: StoryData = {
      storyId: storyId.current(),
      title: storyTitle,
      backgroundAudio: storyBgAudio,
      rating: storyRating,
      shortDescription: storyShrtDescription,
      storyTextBoard: storyTextBoardObjs
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

      {storyTextBoardObjs === undefined ? (

        <>
          <textarea style={{ backgroundColor: "wheat", resize: "vertical", minHeight: "100px", width: "100%", }} placeholder='Enter your story' value={preProcessedText} onChange={(e) => { preProcessedTextSet(e.target.value) }} />
          <button onClick={loadUpStoryTextBoardFresh}>Process</button>
        </>
      ) : (

        <>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {storyTextBoardObjs.map((eachElemnt, index) => {
              if (typeof eachElemnt === "string") {
                return (
                  <div className={styles.storyTextboardHolder} style={{ display: "flex", flexDirection: "column", border: "3px solid red" }} key={uuidv4()}>
                    <textarea style={{ backgroundColor: "wheat" }} defaultValue={eachElemnt} onBlur={(e) => {
                      storyTextBoardObjsSet(prevStoryBoard => {
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
                    <div className={styles.bttnHolder} style={{ display: "flex", gap: "1rem" }}>
                      <button style={{ marginRight: "1rem" }} onClick={() => {
                        addToStoryTextBoard(index)
                      }}>Add Below</button>

                      <button onClick={() => { addToStoryTextBoard(index, "MATHCUP") }}>Matchup</button>
                      <button onClick={() => { addToStoryTextBoard(index, "CROSSWORD") }}>Crossword</button>
                      <button onClick={() => { addToStoryTextBoard(index, "WORDSTOMEANING") }}>WordsToMeaning</button>
                      <button onClick={() => { addToStoryTextBoard(index, "PRONOUNCIATION") }}>Pronounciation</button>
                    </div>
                  </div>
                )
              } else {
                //getname of element and choose component that way
                return (
                  <div className={styles.storyTextboardHolder} style={{ display: "flex", flexDirection: "column", border: "3px solid red" }} key={uuidv4()}>

                    {eachElemnt.typeOfGameMode === "MATHCUP" ? (
                      <MatchUp {...eachElemnt} storyId={storyId.current()} updateGameModeObjLocal={updateGameModeObjLocal} />
                    ) : eachElemnt.typeOfGameMode === "CROSSWORD" ? (
                      <Crossword />
                    ) : eachElemnt.typeOfGameMode === "WORDSTOMEANING" ? (
                      <WordsToMeaning />
                    ) : (
                      <Pronounciation />
                    )}

                    <div className={styles.bttnHolder} style={{ display: "flex", gap: "1rem" }}>
                      <button style={{ marginRight: "1rem" }} onClick={() => {
                        addToStoryTextBoard(index)
                      }}>Add Below</button>

                      <button onClick={() => { addToStoryTextBoard(index, "MATHCUP") }}>Matchup</button>
                      <button onClick={() => { addToStoryTextBoard(index, "CROSSWORD") }}>Crossword</button>
                      <button onClick={() => { addToStoryTextBoard(index, "WORDSTOMEANING") }}>WordsToMeaning</button>
                      <button onClick={() => { addToStoryTextBoard(index, "PRONOUNCIATION") }}>Pronounciation</button>
                    </div>
                  </div>
                )
              }

            })}
          </div>

          <button onClick={handleSubmit}>Submit</button>
        </>
      )}


    </div>
  )
}

function saveToLocalStorage(keyName: any, item: any) {
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

  // useEffect(() => {
  //   function move(e) {
  //     console.log(`x${e.clientX} y${e.clientY}`);
  //   }

  //   document.addEventListener("mousemove", move)
  //   return () => document.removeEventListener("mousemove", move)
  // }, [])
  useEffect(() => {
    //save
    if (stories) {
      saveToLocalStorage("storiesArr", stories)
      makingStorySet(false)
    }
  }, [stories])

  useEffect(() => {
    const seenStories = retreiveFromLocalStorage("storiesArr")
    //save
    if (seenStories) {
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



// games
//match 4
interface matchupGameData {
  questionsArr?: string[],
  choicesArr?: string[],
  answersArr?: string[],
}

function MatchUp({ typeOfGameMode, gameModeId, gameData, shouldStartOnNewPage, gameFinished, storyId, updateGameModeObjLocal }: gamemodeInfo & { storyId: string, updateGameModeObjLocal?: (id: string, data: gamemodeInfo) => void } & {
  gameData?: matchupGameData
}) {

  //this function receives the entire object relating to it
  // questionsArr, choicesArr, answersArr, gameId, updateGameModeObj, gameFinishedInit 
  const [stories, storiesSet] = useAtom(globalStorieArray)

  const [questions, questionsSet] = useState<string[] | undefined>()
  const [choices, choicesSet] = useState<string[] | undefined>()
  const [answers, answersSet] = useState<string[] | undefined>()


  const [userAnswers, userAnswersSet] = useState<string[]>([])

  const [dataSeen, dataSeenSet] = useState(false)
  const choiceRefs = useRef<HTMLDivElement[]>([])
  const questionRefs = useRef<HTMLDivElement[]>([])

  useEffect(() => {
    if (gameData) {
      dataSeenSet(true)
      questionsSet(gameData.questionsArr)
      choicesSet(gameData.choicesArr)
      answersSet(gameData.answersArr)
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
    //local submit to parent make Story - saved to the storyTextboard
    const newGameModeData: gamemodeInfo = {
      gameModeId: gameModeId,
      typeOfGameMode: typeOfGameMode,
      gameData: {
        answersArr: answers,
        choicesArr: choices,
        questionsArr: questions
      },
      gameFinished: gameFinished,
      shouldStartOnNewPage: shouldStartOnNewPage
    }

    if (updateGameModeObjLocal) {
      updateGameModeObjLocal(gameModeId, newGameModeData)
    }
  }

  function updateGameModeObjGlobal() {
    //use this for updates about the obj like whether game finished or not

    const newGameModeData: gamemodeInfo = {
      gameModeId: gameModeId,
      typeOfGameMode: typeOfGameMode,
      gameData: {
        answersArr: answers,
        choicesArr: choices,
        questionsArr: questions
      },
      gameFinished: gameFinished,
      shouldStartOnNewPage: shouldStartOnNewPage
    }

    storiesSet(gameObjGlobalUpdater(stories, storyId, gameModeId, newGameModeData))
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
      gameFinished = true
      updateGameModeObjGlobal()
    }
  }

  return (
    <div style={{ scale: gameFinished ? .9 : 1 }}>
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
              <div className={styles.choices} style={{}} ref={addChoiceRef}
                onMouseDown={(e) => {
                  mouseIsDownSet(true)
                  choiceRefs.current[choiceMapIndex].style.width = `${70}px`
                  choiceRefs.current[choiceMapIndex].style.height = `${70}px`
                }}
                onMouseMove={(e) => {
                  if (mouseIsDown) {
                    const { width, height } = choiceRefs.current[choiceMapIndex].getBoundingClientRect();
                    choiceRefs.current[choiceMapIndex].style.position = "absolute"
                    choiceRefs.current[choiceMapIndex].style.zIndex = `1`

                    const newY = `${e.pageY - height - height / 2}px`
                    const newX = `${e.pageX - width / 2}px`

                    choiceRefs.current[choiceMapIndex].style.left = newX
                    choiceRefs.current[choiceMapIndex].style.top = newY
                    // console.log(`mpleft: ${newX} mptop: ${newY}`)

                    const { top, left } = choiceRefs.current[choiceMapIndex].getBoundingClientRect();
                    console.log(`rect currently has x:${left} y:${top}`)

                  }
                }}

                onMouseUp={(e) => {
                  mouseIsDownSet(false)
                  choiceRefs.current[choiceMapIndex].style.zIndex = `0`

                  //current choice selected
                  const { width: choiceWidth, height: choiceHeight } = choiceRefs.current[choiceMapIndex].getBoundingClientRect();
                  const currentChoiceLocationX = e.pageX
                  const currentChoiceLocationY = e.pageY

                  console.log(`mouse point currently has x:${currentChoiceLocationX} y:${currentChoiceLocationY}`)


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

                    if (currentChoiceLocationX < right && currentChoiceLocationX >= left) {
                      if (currentChoiceLocationY < bottom && currentChoiceLocationY >= top) {
                        overAQuestionLocal = true
                        overQuestionIndex = index
                        questionBound = { width, height, top, left }
                      }
                    }
                  })


                  if (overAQuestionLocal) {
                    choiceRefs.current[choiceMapIndex].style.position = "absolute"
                    choiceRefs.current[choiceMapIndex].style.width = `${questionBound.width}px`
                    choiceRefs.current[choiceMapIndex].style.height = `${questionBound.height}px`
                    choiceRefs.current[choiceMapIndex].style.top = `${questionBound.top - questionBound.height}px`
                    choiceRefs.current[choiceMapIndex].style.left = `${questionBound.left}px`
                    choiceRefs.current[choiceMapIndex].classList.add(styles.fillUpChoice)

                    userAnswersSet(prevUserAnswers => {
                      const newArr = [...prevUserAnswers]
                      newArr[choiceMapIndex] = `${questions![overQuestionIndex]}${choices![choiceMapIndex]}`
                      return newArr
                    })
                  } else {
                    choiceRefs.current[choiceMapIndex].style.position = "relative"
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
          {updateGameModeObjLocal && <button onClick={submit}>Save</button>}
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

interface wordsToMeaningGameData { }
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