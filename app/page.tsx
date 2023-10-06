"use client"
import Image from 'next/image'
import { useMemo, useState, useRef, useEffect } from "react"
import { v4 as uuidv4 } from "uuid";
import styles from "./style.module.css"
import { atom, useAtom } from 'jotai'
import ReactPlayer from "react-player/youtube";
import updateBoardObjWithBoardDataGlobal from './Updater';
import tempbddata from "../tempdbdata1.json"

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

const globalStorieArray = atom<StoryData[] | undefined>(undefined)

//this is the layout for the objects of each of my games that holds everything


interface textType { //default add
  boardObjId: string,
  storedText: string | undefined,
  boardType: "text",
}

interface imageType {
  boardObjId: string,
  imageUrl: string | undefined,
  boardType: "image",
}

interface videoType {
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


interface matchupType {
  gameDataFor: "matchup",
  questionsArr: string[],
  choicesArr: string[][],
}

interface pronounceType {
  gameDataFor: "pronounce",

}

interface wordsToMeaningType {
  gameDataFor: "wordmeaning",

}

interface crosswordType {
  gameDataFor: "crossword",

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

function makeLinksAndParagraphsArray(text: string) {
  return text.split(ISLINKORBREAK).map(item => item.trim()).filter(Boolean);
}



const ISLINKORBREAK = /(https?:\/\/[^\s]+\.(?:com|net|org|io)\/[^\s]+|\n\n\n)/g;
const ISLINK = /(https?:\/\/[^\s]+\.(?:com|net|org|io)\/[^\s]+)/g;
const ISYTVID = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;



function ViewStory({ title, rating, storyBoard, shortDescription, backgroundAudio, storyId }: StoryData) {
  const [reading, readingSet] = useState(false)
  const [globalStories, globalStoriesSet] = useAtom(globalStorieArray)

  function deleteStory(id: string) {
    globalStoriesSet(prevGlobalStoryArr => {
      const newGlobalArr = prevGlobalStoryArr!.filter(eachStory => eachStory.storyId !== id)
      return newGlobalArr
    })
  }


  return (
    <div style={{ backgroundColor: "white", padding: "1rem", display: "flex", gap: "1rem" }}>
      <h3>{title}</h3>
      {rating && <p>{rating}/5</p>}
      {shortDescription && <p>{shortDescription}</p>}
      <button style={{ backgroundColor: "yellow" }} onClick={() => { readingSet(true) }}>Let&apos;s Read</button>
      <button style={{ backgroundColor: "yellow" }} onClick={() => { deleteStory(storyId) }}>Delete Story</button>

      {/* storyboard container */}

      {reading && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", backgroundColor: "#aaa", position: "fixed", top: 0, left: 0, height: "100dvh", width: "100%", overflowY: "auto" }}>
          <button onClick={() => {
            readingSet(false)
          }}>close</button>
          {storyBoard?.map((eachElemnt, index) => {

            if (eachElemnt.boardType === "text") {
              return (
                <div key={uuidv4()} className={styles.storyTextboardHolder} style={{ display: "flex", flexDirection: "column" }}>
                  <p style={{ backgroundColor: "wheat", whiteSpace: "pre-wrap" }}>{eachElemnt.storedText}</p>
                </div>
              )
            } else if (eachElemnt.boardType === "image") {
              console.log(`$eachseen`, eachElemnt);
              return (
                <DisplayImage key={uuidv4()} passedImageData={eachElemnt} />
              )

            } else if (eachElemnt.boardType === "video") {
              return (
                <DisplayVideo key={uuidv4()} passedVideoData={eachElemnt} />
              )


            } else if (eachElemnt.boardType === "gamemode") {
              return (
                <div key={uuidv4()} className={styles.storyTextboardHolder} style={{ display: "flex", flexDirection: "column", backgroundColor: "wheat" }} >

                  {eachElemnt.gameSelection === "matchup" ? (
                    <MatchUpGM {...eachElemnt} storyId={storyId} />
                  ) : eachElemnt.gameSelection === "crossword" ? (
                    <CrosswordGM />
                  ) : eachElemnt.gameSelection === "wordmeaning" ? (
                    <WordsToMeaningGM />
                  ) : eachElemnt.gameSelection === "pronounce" ? (
                    <PronounciationGM />
                  ) : null}
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
  const storyId = useRef(uuidv4())

  const [storyRating, storyRatingSet] = useState<undefined | number>(5)
  const [storyBgAudio, storyBgAudioSet] = useState<undefined | string>()
  const [storyShrtDescription, storyShrtDescriptionSet] = useState<undefined | string>("nice story")

  const [preProcessedText, preProcessedTextSet] = useState(`1 paragraph \n\n\n 2 paragraph \n\n\n 3 paragraph \n\n\n 4 paragraph \n\n\n 5 paragraph`)
  const [storyBoards, storyBoardsSet] = useState<storyBoardType[]>()


  function convertTextToStoryBoards(passedText: string, indexToAdd?: number) {
    //sets up my original array from text only blank

    if (indexToAdd !== undefined) {
      console.log(`$hi lets add to the array`);
      console.clear()

      storyBoardsSet(prevStoryBoardArr => {

        const ObjsArray = makeLinksAndParagraphsArray(passedText).map(eachStr => {
          //run test on each str to see if its text, image or video
          //then return an obj with different properties
          const isLink = ISLINK.test(eachStr)


          if (isLink) {
            const isVideo = ISYTVID.test(eachStr)

            if (isVideo) {
              const newYtObj: videoType = {
                boardObjId: uuidv4(),
                boardType: "video",
                videoUrl: eachStr,
              }
              return newYtObj

            } else {
              //return image obj
              const newImgObj: imageType = {
                boardObjId: uuidv4(),
                boardType: "image",
                imageUrl: eachStr,

              }
              return newImgObj
            }


          } else {
            //return text obj
            const newWordObj: textType = {
              boardObjId: uuidv4(),
              boardType: "text",
              storedText: eachStr
            }

            return newWordObj
          }

          //check eachStr if 
        })

        const newArr = prevStoryBoardArr!.map(each => each)
        newArr.splice(indexToAdd, 1);

        ObjsArray.forEach((eachObj, smallIndex) => {
          newArr.splice(indexToAdd + smallIndex, 0, eachObj);
        })

        return newArr
      })


    } else {
      storyBoardsSet(() => {

        const storyBoardArr = makeLinksAndParagraphsArray(passedText) //just text array
        const ObjsArray = storyBoardArr.map(eachStr => {
          //run test on each str to see if its text, image or video
          //then return an obj with different properties
          const isLink = ISLINK.test(eachStr)

          if (isLink) {
            const isVideo = ISYTVID.test(eachStr)

            if (isVideo) {
              const newVidObj: videoType = {
                boardObjId: uuidv4(),
                boardType: "video",
                videoUrl: eachStr,
              }
              return newVidObj

            } else {
              //return image obj
              const newImgObj: imageType = {
                boardObjId: uuidv4(),
                boardType: "image",
                imageUrl: eachStr,
              }
              return newImgObj
            }


          } else {
            //return text obj
            const newWordObj: textType = {
              boardObjId: uuidv4(),
              boardType: "text",
              storedText: eachStr,
            }

            return newWordObj
          }
        })

        console.log(`new created`, ObjsArray);
        return ObjsArray
      })
    }
  }

  function addSpecificStoryToBoard(index: number, option: string, gmOption?: gameSelectionTypes) {

    if (option === "newstring") {
      storyBoardsSet((prevStoryBoard) => {
        const newBoard = [...prevStoryBoard!]
        const newStrObj: textType = {
          boardType: "text",
          storedText: undefined,
          boardObjId: uuidv4()
        }
        newBoard.splice(index + 1, 0, newStrObj)
        return newBoard
      })
    } else if (option === "newvideo") {
      storyBoardsSet((prevStoryBoard) => {
        const newBoard = [...prevStoryBoard!]
        const newVidObj: videoType = {
          boardType: "video",
          videoUrl: undefined,
          boardObjId: uuidv4()
        }
        newBoard.splice(index + 1, 0, newVidObj)
        return newBoard
      })
    } else if (option === "newimage") {
      storyBoardsSet((prevStoryBoard) => {
        const newBoard = [...prevStoryBoard!]
        const newImgObj: imageType = {
          boardType: "image",
          imageUrl: undefined,
          boardObjId: uuidv4()
        }
        newBoard.splice(index + 1, 0, newImgObj)
        return newBoard
      })
    } else if (option === "newgamemode") {
      if (gmOption) {

        const gameModeObj: gameObjType = {
          gameSelection: gmOption,
          boardType: "gamemode", //gives appropriate name
          gameFinished: false,
          boardObjId: uuidv4(),
          shouldStartOnNewPage: undefined,
          gameData: undefined
        }

        storyBoardsSet((prevStoryBoard) => {
          const newBoard = [...prevStoryBoard!]

          newBoard.splice(index + 1, 0, gameModeObj)
          return newBoard
        })
      }
    }


  }

  function handleStoryBoard(option: string, seenBoardId: string, newBoardData?: storyBoardType) {

    if (option === "update") {
      storyBoardsSet(prevStoryBoards => {
        const newArr = prevStoryBoards!.map(eachStoryBoard => {
          if (eachStoryBoard.boardObjId === seenBoardId) {
            return { ...eachStoryBoard, ...newBoardData }
          } else {
            return eachStoryBoard
          }
        })

        return newArr
      })

    } else if (option === "delete") {
      storyBoardsSet(prevStoryBoards => {
        const filteredArr = prevStoryBoards!.filter(eachBoard => eachBoard.boardObjId !== seenBoardId)
        return filteredArr
      })
    }

  }

  function handleSubmit() {
    const newStoryObj: StoryData = {
      storyId: storyId.current,
      title: storyTitle,
      backgroundAudio: storyBgAudio,
      rating: storyRating,
      shortDescription: storyShrtDescription,
      storyBoard: storyBoards
    }

    storiesSet(prevStoriesArr => {
      if (prevStoriesArr) {
        return [...prevStoriesArr, newStoryObj]
      } else {
        return [newStoryObj]
      }
    })

    makingStorySet(false)
  }

  const textAreaRefs = useRef<HTMLTextAreaElement[]>([])

  const addToTextAreaRefs = (ref: HTMLTextAreaElement, index: number) => {
    textAreaRefs.current[index] = ref
  }

  //give textarea right size
  useEffect(() => {
    console.log(`$tarefs`, textAreaRefs.current);
    textAreaRefs.current.forEach((eachRef) => {
      if (eachRef) {
        eachRef.style.height = 'auto';
        eachRef.style.height = eachRef.scrollHeight + 'px';
      }
    })

    // return () => textAreaRefs.current = []
  }, [storyBoards])


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







      {storyBoards === undefined ? (

        <>
          <textarea className={styles.textAreaEdit} style={{ backgroundColor: "wheat", width: "100%", }} placeholder='Enter your story' value={preProcessedText}

            onChange={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';

              preProcessedTextSet(e.target.value)
            }} />
          <button onClick={() => { convertTextToStoryBoards(preProcessedText) }}>Process</button>
        </>
      ) : (

        <>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {storyBoards.map((eachElemnt, index) => {

              return (
                <div key={uuidv4()} className={styles.addMore}>

                  {eachElemnt.boardType === "text" ? (

                    <textarea key={uuidv4()} className={styles.textAreaEdit2} defaultValue={eachElemnt.storedText} ref={(e: HTMLTextAreaElement) => { addToTextAreaRefs(e, index) }} style={{ backgroundColor: "wheat" }}
                      onInput={(e) => {
                        const el = e.target as HTMLTextAreaElement
                        el.style.height = 'auto';
                        el.style.height = el.scrollHeight + 'px';
                      }}
                      onBlur={(e) => {
                        convertTextToStoryBoards(e.target.value, index)
                      }} />

                  ) : eachElemnt.boardType === "image" ? (
                    <DisplayImage passedImageData={eachElemnt} editing={true} handleStoryBoard={handleStoryBoard} />
                  ) : eachElemnt.boardType === "video" ? (
                    <DisplayVideo passedVideoData={eachElemnt} editing={true} handleStoryBoard={handleStoryBoard} />
                  ) : eachElemnt.boardType === "gamemode" ? (
                    <div className={styles.storyTextboardHolder} style={{ display: "flex", flexDirection: "column", backgroundColor: "wheat" }}>

                      {eachElemnt.gameSelection === "matchup" ? (
                        <MatchUpGM {...eachElemnt} storyId={storyId.current} handleStoryBoard={handleStoryBoard} />
                      ) : eachElemnt.gameSelection === "crossword" ? (
                        <CrosswordGM />
                      ) : eachElemnt.gameSelection === "wordmeaning" ? (
                        <WordsToMeaningGM />
                      ) : eachElemnt.gameSelection === "pronounce" ? (
                        <PronounciationGM />
                      ) : null}

                    </div>

                  ) : null}


                  <div className={styles.bttnHolder} style={{ display: "flex", gap: "1rem" }}>
                    <button onClick={() => {
                      addSpecificStoryToBoard(index, "newstring")
                    }}>add new text</button>
                    <button onClick={() => {
                      addSpecificStoryToBoard(index, "newimage")
                    }}

                    >add new image</button>
                    <button onClick={() => {
                      addSpecificStoryToBoard(index, "newvideo")
                    }}>add new youtube</button>
                    <button onClick={() => {
                      addSpecificStoryToBoard(index, "newgamemode", "matchup")
                    }}>add new gamemode</button>
                  </div>
                </div>
              )
            })}

          </div>

          <button onClick={handleSubmit}>Submit</button>
        </>
      )}


    </div>
  )
}

export default function Home() {
  const [stories, storiesSet] = useAtom(globalStorieArray)
  const [makingStory, makingStorySet] = useState(false)

  useEffect(() => {
    //save
    if (stories) {
      saveToLocalStorage("storiesArr", stories)
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

      storiesSet([...tempbddata as StoryData[], ...seenStoriesClear])
    }
    else {
      storiesSet(tempbddata as StoryData[])
    }
  }, [])

  return (
    <main style={{ display: "grid", gap: "1rem" }}>
      <p>Home Page</p>

      {makingStory ? <MakeStory makingStorySet={makingStorySet} /> : (
        <button onClick={() => {
          makingStorySet(true)
        }}>Add a Story</button>
      )}

      {stories?.map(eachStory => (
        <ViewStory key={eachStory.storyId} {...eachStory} />
      ))}
    </main>
  )
}



function MatchUpGM({ gameSelection, boardObjId, shouldStartOnNewPage, gameFinished, storyId, gameData, handleStoryBoard }: gameObjType & {
  storyId: string,
  gameData: gameDataType | undefined,
  handleStoryBoard?: (option: string, seenBoardId: string, newBoardData?: storyBoardType) => void
}) {

  const [stories, storiesSet] = useAtom(globalStorieArray)

  const [questions, questionsSet] = useState<string[] | undefined>(["", "", "", ""])
  const [choices, choicesSet] = useState<string[][] | undefined>(() => {
    return questions!.map(eachItem => {
      return [""]
    })
  })


  const [userAnswers, userAnswersSet] = useState<string[][]>([])

  const [dataSeen, dataSeenSet] = useState(false)

  const [activeId, setActiveId] = useState<null>();

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

    gameData = gameData as matchupType


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
      gameData = gameData as matchupType

      dataSeenSet(true)
      questionsSet(gameData.questionsArr)
      choicesSet(gameData.choicesArr)

      // console.log(`$carr`, gameData.choicesArr);
    }
  }, [])


  function submitNewGameModeObj() {
    //local submit to parent make Story - saved to the storyTextboard

    const newGameMode: gameObjType = {
      gameSelection: gameSelection,
      gameData: {
        choicesArr: choices,
        questionsArr: questions
      } as matchupType,
      gameFinished: gameFinished,
      shouldStartOnNewPage: shouldStartOnNewPage,
      boardType: "gamemode",
      boardObjId: uuidv4()
    }

    if (handleStoryBoard) {
      handleStoryBoard("update", boardObjId, newGameMode)
    }
  }

  function updateGameModeObjGlobal() {
    //for updates to gameFinished

    const newGameModeData: gameObjType = {
      boardObjId: boardObjId,
      boardType: "gamemode",
      gameSelection: gameSelection,
      gameData: {
        choicesArr: choices,
        questionsArr: questions
      } as matchupType,
      gameFinished: gameFinished,
      shouldStartOnNewPage: shouldStartOnNewPage
    }

    storiesSet(updateBoardObjWithBoardDataGlobal(stories!, storyId, boardObjId, newGameModeData))
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
          <DndContext
            // announcements={defaultAnnouncements}
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div style={{
              display: "flex",
              flexDirection: "row"
            }}>
              {questions!.map((eachQuestion, index) => {
                return (
                  <Container key={uuidv4()} id={`container${index}`} items={items[`container${index}`]} arrPos={index} questionAsked={eachQuestion} />
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
          {
            questions?.map((temp, index) => (

              <div key={uuidv4()}>
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
                      <input key={uuidv4()} type='text' placeholder={`Choice ${smallerIndex + 1} for Q${index + 1}`} value={choices && choices[index] && choices[index][smallerIndex] ? choices[index][smallerIndex] : ""}
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

                    ))
                  ) :
                    null
                  }
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

              updatedChoices.push([""])

              return updatedChoices
            })


          }}>Add Question</button>
          <br />
          {handleStoryBoard && <button onClick={submitNewGameModeObj}>Save</button>}
        </>
      )
      }
    </div >
  )

}

function CrosswordGM() {
  return (
    <div>
      crossword
    </div>
  )
}

function WordsToMeaningGM() {
  return (
    <div>
      WordsToMeaning
    </div>
  )
}

function PronounciationGM() {
  return (
    <div>
      Pronounciation
    </div>
  )
}


function DisplayImage({ passedImageData, editing = false, handleStoryBoard }: { passedImageData: imageType, editing?: boolean, handleStoryBoard?: (option: string, seenBoardId: string, newBoardData?: storyBoardType) => void }) {
  const [imageObj, imageObjSet] = useState<imageType>({ ...passedImageData })


  return (
    <div>

      {editing ? (
        <>
          <p>Add some text</p>
          <textarea value={imageObj.imageUrl} onChange={(e) => {
            imageObjSet(prevVideoObj => {
              prevVideoObj.imageUrl = e.target.value
              return { ...prevVideoObj }
            })
          }} />

          {imageObj.imageUrl !== undefined && (
            <img src={imageObj.imageUrl}
              className={styles.imageCont}
            />
          )}

          <button onClick={() => {
            if (handleStoryBoard) {
              handleStoryBoard("update", imageObj.boardObjId, imageObj)
            }
          }}>Save Changes</button>
        </>
      ) : (
        <div style={{}}>
          <img
            src={imageObj.imageUrl ? imageObj.imageUrl : "https://images.pexels.com/photos/10497155/pexels-photo-10497155.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"}
            className={styles.imageCont}
          />
        </div>
      )}

    </div>

  )

}

function DisplayVideo({ passedVideoData, editing = false, handleStoryBoard }: { passedVideoData: videoType, editing?: boolean, handleStoryBoard?: (option: string, seenBoardId: string, newBoardData?: storyBoardType) => void }) {
  const [videoObj, videoObjSet] = useState<videoType>({ ...passedVideoData })


  return (
    <div className={styles.videoCont}>

      {editing ? (
        <>
          <p>Add some text</p>
          <textarea value={videoObj.videoUrl} onChange={(e) => {
            videoObjSet(prevVideoObj => {
              prevVideoObj.videoUrl = e.target.value
              return { ...prevVideoObj }
            })
          }} />

          <ReactPlayer
            loop={false}
            playing={false}
            url={videoObj.videoUrl}
          />

          <button onClick={() => {
            if (handleStoryBoard) {
              handleStoryBoard("update", videoObj.boardObjId, videoObj)
            }
          }}>Save Changes</button>
        </>
      ) : (
        <div style={{ overflow: "hidden", maxWidth: "100dvw" }}>
          <ReactPlayer
            loop={false}
            playing={false}
            url={videoObj.videoUrl ? videoObj.videoUrl : "https://www.youtube.com/watch?v=NJuSStkIZBg"}
          />
        </div>
      )}

    </div>

  )

}