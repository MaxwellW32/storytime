"use client"
import Image from 'next/image'
import { useMemo, useState, useRef, useEffect } from "react"
import { v4 as uuidv4 } from "uuid";
import styles from "./style.module.css"
import { atom, useAtom } from 'jotai'
import ReactPlayer from "react-player/youtube";
import updateGameModeObj, { gameObjGlobalUpdater } from './Updater';
import gameObjLocalUpdater from './Updater';
import tempbddata from "../tempdbdata.json"

import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import Container from "./using/container";
import { Item } from "./using/sortable_item";

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

const wrapperStyle: any = {
  display: "flex",
  flexDirection: "row"
};

const defaultAnnouncements: any = {
  onDragStart(id: any) {
    console.log(`Picked up draggable item ${id}.`);
  },
  onDragOver(id: any, overId: any) {
    if (overId) {
      console.log(
        `Draggable item ${id} was moved over droppable area ${overId}.`
      );
      return;
    }

    console.log(`Draggable item ${id} is no longer over a droppable area.`);
  },
  onDragEnd(id: any, overId: any) {
    if (overId) {
      console.log(
        `Draggable item ${id} was dropped over droppable area ${overId}`
      );
      return;
    }

    console.log(`Draggable item ${id} was dropped.`);
  },
  onDragCancel(id: any) {
    console.log(`Dragging was cancelled. Draggable item ${id} was dropped.`);
  }
};

const linksAndLineBreaksRegex = /(https?:\/\/[^\s]+\.(?:com|net|org|io)\/[^\s]+|\n\n)/g;

function makeLinksAndParagraphsArray(text: string) {
  return text.split(linksAndLineBreaksRegex).map(item => item.trim()).filter(Boolean);
}


function Story({ title, rating, storyTextBoard, shortDescription, backgroundAudio, storyId }: StoryData) {
  const [reading, readingSet] = useState(false)
  const [globalStories, globalStoriesSet] = useAtom(globalStorieArray)

  function deleteStory(id: string) {
    globalStoriesSet(prevGlobalStoryArr => {
      const newGlobalArr = prevGlobalStoryArr!.filter(eachStory => eachStory.storyId !== id)
      return newGlobalArr
    })
  }


  return (
    <div style={{ border: "1px solid red", display: "flex", gap: "1rem" }}>
      <h3>{title}</h3>
      {rating && <p>{rating}/5</p>}
      {shortDescription && <p>{shortDescription}</p>}
      <button style={{ backgroundColor: "yellow" }} onClick={() => { readingSet(true) }}>Let's Read</button>
      <button style={{ backgroundColor: "yellow" }} onClick={() => { deleteStory(storyId) }}>Delete Story</button>

      {/* storyboard container */}

      {reading && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", backgroundColor: "#aaa", position: "fixed", top: 0, left: 0, height: "100dvh", width: "100%", overflowY: "auto" }}>
          <button onClick={() => {
            readingSet(false)
          }}>close</button>
          {storyTextBoard?.map((eachElemnt, index) => {
            if (typeof eachElemnt === "string") {

              const isMedia = linksAndLineBreaksRegex.test(eachElemnt)

              if (isMedia) {
                return (
                  <>
                    <DisplayMedia url={eachElemnt} />
                  </>
                )
              } else {
                return (
                  <div className={styles.storyTextboardHolder} style={{ display: "flex", flexDirection: "column" }} key={uuidv4()}>

                    <p style={{ backgroundColor: "wheat" }}>{eachElemnt}</p>
                  </div>


                )
              }


            } else {
              //getname of element and choose component that way
              return (
                <div className={styles.storyTextboardHolder} style={{ display: "flex", flexDirection: "column", backgroundColor: "wheat" }} key={uuidv4()}>

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
function MakeStory({ makingStorySet }: { makingStorySet: React.Dispatch<React.SetStateAction<boolean>> }) {
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

      const storyBoardArr = makeLinksAndParagraphsArray(preProcessedText)
      console.log(`$d`, storyBoardArr);
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

  const textAreaRefs = useRef<HTMLTextAreaElement[]>([])

  //give textarea right size
  useEffect(() => {
    textAreaRefs.current.forEach((eachRef) => {
      eachRef.style.height = 'auto';
      eachRef.style.height = eachRef.scrollHeight + 'px';
    })
  }, [])

  const textAreaRefCal = (ref: HTMLTextAreaElement) => {
    console.log(`$ran again`);

    if (!textAreaRefs.current.includes(ref)) {
      textAreaRefs.current = [...textAreaRefs.current, ref];
    }
  }

  return (
    <div style={{ overflowY: "auto", position: "fixed", top: 0, left: 0, zIndex: 1, height: "100dvh", width: "100%", backgroundColor: "blue", display: "flex", flexDirection: "column", gap: "2rem" }}>
      <button onClick={() => { makingStorySet(false) }}>Close</button>
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
          <textarea ref={textAreaRefCal} className={styles.textAreaEdit} style={{ backgroundColor: "wheat", width: "100%", }} placeholder='Enter your story' value={preProcessedText}

            onChange={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';

              preProcessedTextSet(e.target.value)
            }} />
          <button onClick={loadUpStoryTextBoardFresh}>Process</button>
        </>
      ) : (

        <>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {storyTextBoardObjs.map((eachElemnt, index) => {
              if (typeof eachElemnt === "string") {
                return (
                  <div className={styles.storyTextboardHolder} style={{ display: "flex", flexDirection: "column" }} key={uuidv4()}>
                    <textarea style={{ backgroundColor: "wheat" }} defaultValue={eachElemnt}
                      onInput={(e) => {
                        const el = e.target as HTMLTextAreaElement
                        el.style.height = 'auto';
                        el.style.height = el.scrollHeight + 'px';
                      }}
                      onBlur={(e) => {
                        storyTextBoardObjsSet(prevStoryBoard => {
                          const newArr = [...prevStoryBoard!]
                          const paragraphsArrSeen = makeLinksAndParagraphsArray(e.target.value);



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

export function retreiveFromLocalStorage(keyName: string) {
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
    const seenStories = retreiveFromLocalStorage("storiesArr") as StoryData[]
    //load
    if (seenStories) {

      const seenStoriesClear = seenStories.filter(eachSeenStory => {

        let foundInArr = false
        tempbddata.forEach(eachTempStory => {
          if (eachTempStory.storyId === eachSeenStory.storyId) {
            foundInArr = true
          }
        })

        if (!foundInArr) {
          return eachSeenStory
        }
      })

      console.log(`$cleararr`, seenStoriesClear);
      storiesSet([...tempbddata, ...seenStoriesClear])
    } else {
      storiesSet(tempbddata)
      console.log(`$loaded save data from temp`);
    }
  }, [])

  return (
    <main>
      <p>Home Page</p>

      {makingStory ? <MakeStory makingStorySet={makingStorySet} /> : (
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
  choicesArr?: string[][],
}

function MatchUp({ typeOfGameMode, gameModeId, gameData, shouldStartOnNewPage, gameFinished, storyId, updateGameModeObjLocal }: gamemodeInfo & { storyId: string, updateGameModeObjLocal?: (id: string, data: gamemodeInfo) => void } & {
  gameData?: matchupGameData
}) {

  //this function receives the entire object relating to it
  // questionsArr, choicesArr, answersArr, gameId, updateGameModeObj, gameFinishedInit 
  const [stories, storiesSet] = useAtom(globalStorieArray)

  const [questions, questionsSet] = useState<string[] | undefined>(["", "", "", ""])
  const [choices, choicesSet] = useState<string[][] | undefined>(() => {
    return questions!.map(eachItem => {
      return [""]
    })
  })


  const [userAnswers, userAnswersSet] = useState<string[][]>([])

  const [dataSeen, dataSeenSet] = useState(false)

  const [activeId, setActiveId] = useState();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const [items, setItems] = useState<any>(() => {
    //get all data, questions, choices, display em
    let newItemObj: {
      [key: string]: any
    } = {}

    gameData?.questionsArr?.forEach((eachQuestion, index) => {
      newItemObj[`container${index}`] = []
    })

    const seenNewArr: string[] = []

    gameData?.choicesArr?.forEach((choiceStrArr, index) => {
      choiceStrArr.forEach((strVal) => {
        seenNewArr.push(strVal)
      })
    })

    newItemObj["root"] = seenNewArr
    console.log(`$items`, newItemObj);

    return { ...newItemObj }
  });

  useEffect(() => {
    if (gameData !== undefined) {
      dataSeenSet(true)
      questionsSet(gameData.questionsArr)
      choicesSet(gameData.choicesArr)

      // console.log(`$carr`, gameData.choicesArr);
    }
  }, [])


  function submit() {
    //local submit to parent make Story - saved to the storyTextboard
    const newGameModeData: gamemodeInfo = {
      gameModeId: gameModeId,
      typeOfGameMode: typeOfGameMode,
      gameData: {
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
        choicesArr: choices,
        questionsArr: questions
      },
      gameFinished: gameFinished,
      shouldStartOnNewPage: shouldStartOnNewPage
    }

    storiesSet(gameObjGlobalUpdater(stories, storyId, gameModeId, newGameModeData))
  }

  function checkAnswers() {
    let amtCorrect = 0
    // console.table(`usernanswer`, userAnswers);
    // console.table(`correct`, answers);

    //go through each useAnswers arr, in each value compare it to be found in the answers arr at that same index pos
    //if the amount found == the amount of answers in that index, got correct = true
    //then can look at the amount correct
    let globalAmtCorrect = 0

    userAnswers.forEach((userAnsStrArr, index) => {
      let correctCount = 0
      userAnsStrArr.forEach((eachAnsStr, smallIndex) => {
        choices![index].forEach(eachChoiceStr => {
          if (eachAnsStr === eachChoiceStr) {
            correctCount++
          }
        })

      })

      if (correctCount === choices![index].length) {
        globalAmtCorrect++
      }

    })


    if (globalAmtCorrect === questions!.length) {
      gameFinished = true
      updateGameModeObjGlobal()
    }
  }

  function refreshGame() {
    gameFinished = false
    updateGameModeObjGlobal()
  }

  function findContainer(id: any) {
    if (id in items) {
      return id;
    }

    return Object.keys(items).find((key) => items[key].includes(id));
  }

  function handleDragStart(event: any) {
    const { active } = event;
    const { id } = active;

    setActiveId(id);
  }

  function handleDragOver(event: any) {
    const { active, over, draggingRect } = event;
    const { id } = active;
    const { id: overId } = over;

    // console.log(`dragging ${id} over ${overId}`);
    // Find the containers
    const activeContainer = findContainer(id);
    const overContainer = findContainer(overId);

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer === overContainer
    ) {
      return;
    }

    setItems((prev: any) => {
      const activeItems = prev[activeContainer];
      const overItems = prev[overContainer];

      // Find the indexes for the items
      const activeIndex = activeItems.indexOf(id);
      const overIndex = overItems.indexOf(overId);

      let newIndex;
      if (overId in prev) {
        // We're at the root droppable of a container
        newIndex = overItems.length + 1;
      } else {
        const isBelowLastItem =
          over &&
          overIndex === overItems.length - 1 &&
          draggingRect?.offsetTop > over.rect.offsetTop + over.rect.height;

        const modifier = isBelowLastItem ? 1 : 0;

        newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
      }

      return {
        ...prev,
        [activeContainer]: [
          ...prev[activeContainer].filter((item: any) => item !== active.id)
        ],
        [overContainer]: [
          ...prev[overContainer].slice(0, newIndex),
          items[activeContainer][activeIndex],
          ...prev[overContainer].slice(newIndex, prev[overContainer].length)
        ]
      };
    });
  }

  function handleDragEnd(event: any) {
    const { active, over } = event;
    const { id } = active; //id is the info it contains
    const { id: overId } = over; //element already in the container 

    const activeContainer = findContainer(id);
    const overContainer = findContainer(overId);

    const containerIndex = event.active.data.current.arrPos
    const seenText = event.active.data.current.choiceText

    if (containerIndex !== 4) {
      //set it to my user answers arr
      userAnswersSet((prevUsrAnwers) => {
        const newArr = prevUsrAnwers.map(eachArr => eachArr)

        //its empty
        if (!newArr[containerIndex]) {
          newArr[containerIndex] = [seenText]
          console.log(`$sempty`, newArr);
          return newArr

        } else {
          //has string values
          //scan items inside, ensure it doesnt have seenText already
          const clearUsrAnsArr = newArr.map((eachStrArr, index) => {
            if (!eachStrArr) {
              // console.log(`$didnt see arr pos ${index}, added ""`);
              return [""]

            } else {
              return eachStrArr.filter(eachStr => {
                // console.log(`$str seen to filter `, eachStr);
                if (eachStr !== seenText) {
                  return eachStr
                } else {
                  return ""
                }
              })
            }
          })

          clearUsrAnsArr[containerIndex] = [...clearUsrAnsArr[containerIndex], seenText]

          // console.log(`$final, `, clearUsrAnsArr);
          return clearUsrAnsArr
        }
      })
    }

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer !== overContainer
    ) {
      return;
    }

    const activeIndex = items[activeContainer].indexOf(active.id);
    const overIndex = items[overContainer].indexOf(overId);

    if (activeIndex !== overIndex) {
      setItems((items: any) => ({
        ...items,
        [overContainer]: arrayMove(items[overContainer], activeIndex, overIndex)
      }));
    }

    setActiveId(null);
  }
  //add on to choice arr with a new element
  //add onto question arr

  return (
    <div style={{ scale: gameFinished ? .9 : 1 }}>
      {dataSeen ? (
        <>
          <p>seeing data - quiz time</p>


          <DndContext
            announcements={defaultAnnouncements}
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div style={wrapperStyle}>
              {questions!.map((eachQuestion, index) => {
                return (
                  <>
                    <Container id={`container${index}`} items={items[`container${index}`]} arrPos={index} questionAsked={eachQuestion} />
                  </>
                )
              })}
            </div>
            <Container id="root" items={items.root} arrPos={4} />
            {/* <DragOverlay>{activeId ? <Item id={activeId} /> : null}</DragOverlay> */}
          </DndContext>



          {!gameFinished ? (
            <button onClick={checkAnswers}>Check Answers</button>
          ) : (
            <button onClick={refreshGame}>Game Finished - refresh?</button>
          )}
        </>
      ) : (
        <>
          <p>setup data</p>
          {
            questions?.map((temp, index) => (

              <div key={index}>
                <input type='text' placeholder={`Question ${index + 1}`} value={questions ? questions[index] : ""} onChange={(e) => {
                  questionsSet((prevQuestions) => {
                    let newQuestionsArr: string[] = []
                    if (prevQuestions) newQuestionsArr = [...prevQuestions]
                    newQuestionsArr[index] = e.target.value
                    return newQuestionsArr
                  })
                }} />

                <div>
                  {choices && choices[index] ? (
                    choices[index].map((choice, smallerIndex) => (
                      <>
                        <input type='text' placeholder={`Choice ${smallerIndex + 1} for Q${index + 1}`} value={choices && choices[index] && choices[index][smallerIndex] ? choices[index][smallerIndex] : ""}
                          onChange={(e) => {
                            choicesSet(prevChoicesArr => {
                              const updatedChoices = prevChoicesArr ?? [];

                              if (!updatedChoices[index]) {
                                updatedChoices[index] = [];
                              }
                              if (!updatedChoices[index][smallerIndex]) {
                                updatedChoices[index][smallerIndex] = "";
                              }
                              updatedChoices[index][smallerIndex] = e.target.value;
                              return [...updatedChoices];
                            })
                          }} />

                      </>
                    ))
                  ) : (
                    null
                  )}
                </div>

                <button onClick={() => {
                  choicesSet(prevArr => {
                    const updatedChoices = prevArr!.map((arr, i) => {
                      if (i === index) {
                        return [...arr, ""];
                      }
                      return arr;
                    });

                    return updatedChoices;
                  })
                }}>Add choice</button>


              </div>
            ))
          }

          <button onClick={() => {
            questionsSet(prev => {
              if (prev) {
                return [...prev, ""]
              } else {
                return [""]
              }
            })


            choicesSet(prevChoicesArr => {
              let updatedChoices = [...prevChoicesArr!]
              const newArr = []

              updatedChoices.push([""])

              return updatedChoices
            })


          }}>Add Question</button>
          <br />
          {updateGameModeObjLocal && <button onClick={submit}>Save</button>}
        </>
      )
      }
    </div >
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


function DisplayMedia({ url }: { url: string }) {
  const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;

  const isYtVid = youtubeRegex.test(url)

  return (
    <div className={styles.mediaCont}>
      {isYtVid ? (
        <ReactPlayer
          loop={false}
          playing={false}
          url={url ? url : "https://www.youtube.com/watch?v=NJuSStkIZBg"}

        />
      ) : (
        <img src={url} />
      )}
    </div>
  )

}