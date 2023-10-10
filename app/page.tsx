"use client"
import Image from 'next/image'
import { useMemo, useState, useRef, useEffect } from "react"
import { v4 as uuidv4 } from "uuid";
import styles from "./style.module.css"
import { atom, useAtom } from 'jotai'
import ReactPlayer from "react-player/youtube";
import updateBoardObjWithBoardDataGlobal from './Updater';
// import tempbddata from "../tempdbdata1.json"
import { saveToLocalStorage, retreiveFromLocalStorage } from './utility/savestorage';
import { globalTheme, globalStorieArray } from '@/app/utility/globalState'
import homeBackgroundImage from "@/public/background.png"
import homeBackgroundImageDark from "@/public/backgroundDark.png"
import makeStoryBackground from "@/public/makestorybackground.png"
import makeStoryBackgroundDark from "@/public/makestorybackgroundDark.png"

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
import NavBar from './components/navbar/NavBar';
import CrosswordGM from './components/crosswordGamemode/CrosswordGM';


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

export interface crosswordType {
  gameDataFor: "crossword",
  wordArray: string[] | undefined
}


function makeLinksAndParagraphsArray(text: string) {
  return text.split(ISLINKORBREAK).map(item => item.trim()).filter(Boolean);
}



let regNewLineLimit = "\n\n\n";
const ISLINKORBREAK = new RegExp(`(https?:\/\/[^\s]+\.(?:com|net|org|io)\/[^\s]+|${regNewLineLimit})`, 'g');


const ISLINK = /(https?:\/\/[^\s]+\.(?:com|net|org|io)\/[^\s]+)/g;
const ISYTVID = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;

function ViewStory({ title, rating, storyBoard, shortDescription, backgroundAudio, storyId, fullData }: StoryData & { fullData?: StoryData }) {

  const [reading, readingSet] = useState(false)
  const [globalStories, globalStoriesSet] = useAtom(globalStorieArray)

  function deleteStory(id: string) {
    globalStoriesSet(prevGlobalStoryArr => {
      const newGlobalArr = prevGlobalStoryArr!.filter(eachStory => eachStory.storyId !== id)
      return newGlobalArr
    })
  }

  const descRef = useRef<HTMLParagraphElement>(null)
  const [showDescriptionFull, showDescriptionFullSet] = useState(false)
  const [descOverFlowing, descOverFlowingSet] = useState(false)

  useEffect(() => {
    const element = descRef.current;
    if (element) {
      descOverFlowingSet(element.scrollHeight > element.clientHeight);
    }
  }, [])


  const [editClicked, editClickedSet] = useState(false)

  return (
    <div style={{ width: "95%", margin: "0 auto", borderRadius: ".7rem", padding: "1rem", backgroundColor: "var(--backgroundColor)", position: "relative" }}>

      {editClicked && <MakeStory passedData={fullData} editClickedSet={editClickedSet} />}

      <div className={styles.titleCont}>

        <h3>{title}</h3>

        <div className="flex flex-col gap-1 items-center">
          {rating && <p>{rating}/5</p>}
          <Image height={20} alt='ratingstars' src={require("../public/threestars.png")} style={{ objectFit: "contain" }} />
        </div>

        <div style={{ display: "flex", gap: "1rem" }}>
          <button onClick={() => { readingSet(true) }}>Let&apos;s Read</button>
          <button style={{}} onClick={() => { deleteStory(storyId) }}>Delete Story</button>
        </div>
      </div>

      <div className={`italic`} style={{ fontSize: ".9em", marginTop: "var(--medium-margin)", display: "grid", gap: ".3rem", alignSelf: "flex-end" }}>
        {shortDescription && (
          <>
            <p >Description -</p>
            <p ref={descRef} className={styles.descText} style={{ display: showDescriptionFull ? "block" : "-webkit-box" }}>{shortDescription}</p>
            {descOverFlowing && <p className={styles.highlighted} onClick={() => {
              showDescriptionFullSet(prev => !prev)
            }}>{showDescriptionFull ? "Show Less" : "Show More"}</p>}
          </>
        )}
      </div>

      {/* storyboard container */}
      {reading && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", position: "fixed", top: 0, left: 0, height: "100dvh", width: "100%", overflowY: "auto", backgroundColor: "var(--backgroundColor)", zIndex: 1 }}>
          <button style={{ margin: ".5rem 0 0 .5rem" }} onClick={() => {
            readingSet(false)
          }}>close</button>

          <h3 style={{ textAlign: "center", fontSize: "2rem" }}>{title}</h3>

          {storyBoard?.map((eachElemnt, index) => {

            if (eachElemnt.boardType === "text") {
              return (
                <div key={uuidv4()} className={styles.storyTextboardHolder} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <p style={{ whiteSpace: "pre-wrap", padding: "1rem", borderRadius: ".7rem", maxWidth: "750px", fontSize: "var(--medium-font-size)" }}>{eachElemnt.storedText}</p>
                </div>
              )
            } else if (eachElemnt.boardType === "image") {
              return (
                <DisplayImage key={uuidv4()} passedImageData={eachElemnt} />
              )

            } else if (eachElemnt.boardType === "video") {
              return (
                <DisplayVideo key={uuidv4()} passedVideoData={eachElemnt} />
              )


            } else if (eachElemnt.boardType === "gamemode") {
              return (
                <div key={uuidv4()} className={styles.storyTextboardHolder} style={{ display: "flex", flexDirection: "column", backgroundColor: "var(--backgroundColor)" }} >

                  {eachElemnt.gameSelection === "matchup" ? (
                    <MatchUpGM {...eachElemnt} storyId={storyId} />
                  ) : eachElemnt.gameSelection === "crossword" ? (
                    <CrosswordGM gameObj={eachElemnt} />
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
      {/* audio */}
      <svg style={{ fill: "var(--secondaryColor)", width: "var(--nav-icon-size)", marginLeft: "auto" }} onClick={() => { editClickedSet(true) }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1v32c0 8.8 7.2 16 16 16h32zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z" /></svg>

      <div style={{ display: "none", opacity: 0, userSelect: "none" }}>
        <ReactPlayer
          loop={true}
          playing={reading}
          url={backgroundAudio ? backgroundAudio : "https://www.youtube.com/watch?v=NJuSStkIZBg"} />
      </div>
    </div>
  )
}

function MakeStory({ makingStorySet, editClickedSet, passedData }: { makingStorySet?: React.Dispatch<React.SetStateAction<boolean>>, editClickedSet?: React.Dispatch<React.SetStateAction<boolean>>, passedData?: StoryData }) {

  const [, storiesSet] = useAtom(globalStorieArray)

  const [storyTitle, storyTitleSet] = useState(``)
  const storyId = useRef(uuidv4())

  const [storyRating, storyRatingSet] = useState<undefined | number>()
  const [storyBgAudio, storyBgAudioSet] = useState<undefined | string>()
  const [storyShrtDescription, storyShrtDescriptionSet] = useState<undefined | string>("")

  const [preProcessedText, preProcessedTextSet] = useState("")
  const [storyBoards, storyBoardsSet] = useState<storyBoardType[]>()

  const [gmShowingArr, gmShowingArrSet] = useState<Boolean[]>(() => {
    return storyBoards?.map(eachBoard => false) ?? []
  })

  //load data if passed - edit
  useEffect(() => {
    if (passedData) {
      storyTitleSet(passedData!.title)
      storyId.current = passedData!.storyId
      storyRatingSet(passedData!.rating)
      storyBgAudioSet(passedData!.backgroundAudio)
      storyShrtDescriptionSet(passedData!.shortDescription)
      storyBoardsSet(passedData!.storyBoard)
    }
  }, [])

  //keey gmshowingarray mapped to the storyboard
  useEffect(() => {
    if (storyBoards) {
      gmShowingArrSet(storyBoards.map(each => false))
    }
  }, [storyBoards?.length])


  function convertTextToStoryBoards(passedText: string, indexToAdd?: number) {
    //sets up my original array from text only blank

    if (indexToAdd !== undefined) {
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

  function deleteBoardAtIndex(seenIndex: number) {
    storyBoardsSet(prevStoryBoards => {
      const filterdArr = prevStoryBoards!.filter((eachBoard, index) => index !== seenIndex)
      return filterdArr
    })
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

    console.log(`$new`, newStoryObj);

    if (passedData !== undefined) {
      storiesSet(prevStories => {

        if (prevStories) {
          const newStories = prevStories!.map(eachStory => {
            if (eachStory.storyId === newStoryObj.storyId) {
              return newStoryObj
            } else {
              return eachStory
            }
          })

          return newStories

        } else {
          return [newStoryObj]
        }
      })

    } else {
      console.log(`$got in expected else`);
      storiesSet(prevStoriesArr => {
        if (prevStoriesArr) {
          return [...prevStoriesArr, newStoryObj]
        } else {
          return [newStoryObj]
        }
      })
    }

    if (passedData !== undefined) {
      editClickedSet!(false)
    } else {
      makingStorySet!(false)
    }
  }

  const textAreaRefs = useRef<HTMLTextAreaElement[]>([])

  const addToTextAreaRefs = (ref: HTMLTextAreaElement, index: number) => {
    textAreaRefs.current[index] = ref
  }

  //give textarea right size
  useEffect(() => {
    textAreaRefs.current.forEach((eachRef) => {
      if (eachRef) {
        eachRef.style.height = 'auto';
        eachRef.style.height = eachRef.scrollHeight + 'px';
      }
    })

  }, [storyBoards])


  return (
    <div className={styles.makeStoryMainDiv}>
      <button style={{ margin: ".5rem .5rem 0 auto" }}
        onClick={() => {
          if (passedData !== undefined) {
            editClickedSet!(false)
          } else {
            makingStorySet!(false)
          }

        }}>Close</button>
      <h3 style={{ color: "#fff", textAlign: "center" }}>Lets make a wonderful story</h3>

      <div className={styles.makeStoryLabelInputCont}>
        <label htmlFor='msTitle'>Title</label>
        <input id='msTitle' type='text' placeholder='Enter a title ' value={storyTitle} onChange={(e) => {
          storyTitleSet(e.target.value)
        }} />
      </div>

      <div className={styles.makeStoryLabelInputCont}>
        <label htmlFor='msShDescription'>Short Description</label>
        <input id='msShDescription' type='text' placeholder='Enter a Description ' value={storyShrtDescription} onChange={(e) => {
          storyShrtDescriptionSet(e.target.value)
        }} />
      </div>

      <div className={styles.makeStoryLabelInputCont}>
        <label htmlFor='msRating'>Rating</label>
        <input id='msRating' type='number' placeholder='Enter a Rating /5 ' value={storyRating} onChange={(e) => {
          storyRatingSet(parseInt(e.target.value))
        }} />
      </div>

      <div className={styles.makeStoryLabelInputCont}>
        <label htmlFor='msAudio'>Audio</label>
        <input id='msAudio' type='text' placeholder='Background Music? ' value={storyBgAudio} onChange={(e) => {
          storyBgAudioSet(e.target.value)
        }} />
      </div>


      <div className={styles.storyBoardCont}>
        <h3 style={{ color: "#fff", textAlign: "center" }}>Story Board</h3>

        {storyBoards === undefined ? (
          <>
            <textarea className={styles.textAreaEdit} style={{ width: "100%", }} placeholder='Enter your story - seen image and Youtube urls will be automaitcally loaded' value={preProcessedText}

              onChange={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';

                preProcessedTextSet(e.target.value)
              }} />
            <button disabled={preProcessedText === ""} onClick={() => { convertTextToStoryBoards(preProcessedText) }}>{preProcessedText ? "Process" : "Enter text to Process"}</button>
          </>
        ) : (

          <>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

              {/* if no storyboards still show options to add */}
              {storyBoards.length === 0 && (
                <div style={{ display: 'flex', flexWrap: "wrap" }}>
                  <button onClick={() => {
                    addSpecificStoryToBoard(0, "newstring")
                  }}>add new text</button>
                  <button onClick={() => {
                    addSpecificStoryToBoard(0, "newimage")
                  }}

                  >add new image</button>
                  <button onClick={() => {
                    addSpecificStoryToBoard(0, "newvideo")
                  }}>add new youtube</button>

                  <div>
                    <button onClick={() => {
                      console.log(`$seen mouse click on AddMore`);
                      gmShowingArrSet(prevArr => {
                        prevArr[0] = true
                        return [...prevArr]
                      })
                    }}>add new gamemode</button>

                    {gmShowingArr[0] && (
                      <div className={styles.gmChoiceCont} onClick={() => {
                        gmShowingArrSet(prevArr => {
                          prevArr[0] = false
                          return [...prevArr]
                        })
                      }}>
                        <button className='secondButton' onClick={() => {
                          addSpecificStoryToBoard(0, "newgamemode", "matchup")
                        }}>Matchup</button>

                        <button className='secondButton' onClick={() => {
                          addSpecificStoryToBoard(0, "newgamemode", "crossword")
                        }}>Crossword</button>

                        <button className='secondButton' onClick={() => {
                          addSpecificStoryToBoard(0, "newgamemode", "pronounce")
                        }}>Pronounciation</button>

                        <button className='secondButton' onClick={() => {
                          addSpecificStoryToBoard(0, "newgamemode", "wordmeaning")
                        }}>Words to Meanings</button>
                      </div>
                    )}

                  </div>
                </div>
              )}

              {storyBoards.map((eachElemnt, index) => {

                return (
                  <div key={uuidv4()} tabIndex={0} className={styles.addMore}>

                    <svg className={styles.deleteBoardBttn} onClick={() => {
                      deleteBoardAtIndex(index)
                    }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" /></svg>

                    {eachElemnt.boardType === "text" ? (

                      <textarea key={uuidv4()} className={styles.textAreaEdit2} defaultValue={eachElemnt.storedText} ref={(e: HTMLTextAreaElement) => { addToTextAreaRefs(e, index) }}
                        onInput={(e) => {
                          const el = e.target as HTMLTextAreaElement
                          el.style.height = 'auto';
                          el.style.height = el.scrollHeight + 'px';
                        }}
                        onBlur={(e) => {
                          const seenTextObj = storyBoards[index] as textType

                          if (e.target.value !== seenTextObj.storedText) {
                            console.log(`$seen as not equal`);
                            convertTextToStoryBoards(e.target.value, index)
                          }
                        }} />

                    ) : eachElemnt.boardType === "image" ? (
                      <DisplayImage passedImageData={eachElemnt} editing={true} handleStoryBoard={handleStoryBoard} />
                    ) : eachElemnt.boardType === "video" ? (
                      <DisplayVideo passedVideoData={eachElemnt} editing={true} handleStoryBoard={handleStoryBoard} />
                    ) : eachElemnt.boardType === "gamemode" ? (
                      <div className={styles.storyTextboardHolder} style={{ display: "flex", flexDirection: "column", backgroundColor: "var(--background)" }}>

                        {eachElemnt.gameSelection === "matchup" ? (
                          <MatchUpGM {...eachElemnt} storyId={storyId.current} handleStoryBoard={handleStoryBoard} />
                        ) : eachElemnt.gameSelection === "crossword" ? (
                          <CrosswordGM gameObj={eachElemnt} isEditing={true} handleStoryBoard={handleStoryBoard} />
                        ) : eachElemnt.gameSelection === "wordmeaning" ? (
                          <WordsToMeaningGM />
                        ) : eachElemnt.gameSelection === "pronounce" ? (
                          <PronounciationGM />
                        ) : null}

                      </div>

                    ) : null}


                    <div className={styles.bttnHolder}>
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

                      <div>
                        <button onClick={() => {
                          console.log(`$seen mouse click on AddMore`);
                          gmShowingArrSet(prevArr => {
                            prevArr[index] = true
                            return [...prevArr]
                          })
                        }}>add new gamemode</button>

                        {gmShowingArr[index] && (
                          <div className={styles.gmChoiceCont} onClick={() => {
                            gmShowingArrSet(prevArr => {
                              prevArr[index] = false
                              return [...prevArr]
                            })
                          }}>
                            <button className='secondButton' onClick={() => {
                              addSpecificStoryToBoard(index, "newgamemode", "matchup")
                            }}>Matchup</button>

                            <button className='secondButton' onClick={() => {
                              addSpecificStoryToBoard(index, "newgamemode", "crossword")
                            }}>Crossword</button>

                            <button className='secondButton' onClick={() => {
                              addSpecificStoryToBoard(index, "newgamemode", "pronounce")
                            }}>Pronounciation</button>

                            <button className='secondButton' onClick={() => {
                              addSpecificStoryToBoard(index, "newgamemode", "wordmeaning")
                            }}>Words to Meanings</button>
                          </div>
                        )}

                      </div>
                    </div>
                  </div>
                )
              })}

            </div>
            <button style={{ marginTop: "4rem" }} onClick={handleSubmit}>Submit Story</button>
          </>
        )}
      </div>

    </div>
  )
}

export default function Home() {
  const [stories, storiesSet] = useAtom(globalStorieArray)
  const [makingStory, makingStorySet] = useState(false)

  const [theme, themeSet] = useAtom(globalTheme)


  const themeStyles = useMemo(() => {

    if (theme) {
      return {
        "--primaryColor": "#ffb200",
        "--secondaryColor": "purple",
        "--backgroundColor": "#ffe9cb",
        "--textColor": "#000",
        "--textColorAnti": "#fff",
        "--backdrop": `url(${homeBackgroundImage.src})`,
        "--editStoryBackdrop": `url(${makeStoryBackground.src})`,
        "--seeThroughBg": "rgba(0,0,0, 0.553)"
        // "--navBarColor": "#ffe9cb"
      }
    } else {
      return {
        "--primaryColor": "#7777ff",
        "--secondaryColor": "orange",
        "--backgroundColor": "#23201d",
        "--textColor": "#fff",
        "--textColorAnti": "#000",
        "--backdrop": `url(${homeBackgroundImageDark.src})`,
        "--editStoryBackdrop": `url(${makeStoryBackgroundDark.src})`,
        "--seeThroughBg": "rgba(255,255,255, 0.1)"
        // "--navBarColor": "#00132b"
      }
    }
  }, [theme])


  //save stories
  useEffect(() => {
    if (stories) {
      console.log(`$reran`);
      saveToLocalStorage("storiesArr", stories)
    }
  }, [stories])

  useEffect(() => {
    const seenStories = retreiveFromLocalStorage("storiesArr") as StoryData[]
    //load
    if (seenStories) {
      storiesSet(seenStories)

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
    <main className={styles.homeDiv} style={{ backgroundImage: themeStyles['--backdrop'], ...themeStyles }}>

      <NavBar />

      {makingStory
        ? <MakeStory makingStorySet={makingStorySet} />
        : (<button style={{ margin: ".5rem 0 0 .5rem" }} onClick={() => { makingStorySet(true) }}>Add a Story</button>)
      }

      {stories?.map((eachStory: StoryData) => (
        <ViewStory key={uuidv4()} {...eachStory} fullData={eachStory} />
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

    const choicesStringArray: string[] = []

    gameData?.choicesArr?.forEach((choiceStrArr, index) => {
      choiceStrArr.forEach((strVal) => {
        choicesStringArray.push(strVal)
      })
    })

    for (let i = choicesStringArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [choicesStringArray[i], choicesStringArray[j]] = [choicesStringArray[j], choicesStringArray[i]];
    }

    newItemObj["root"] = choicesStringArray

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
    <div className={styles.gmMainDiv} style={{ scale: gameFinished ? .9 : 1 }}>
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
              flexDirection: "row",
              flexWrap: "wrap"
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
            <button className='secondButton' onClick={checkAnswers}>Check Answers</button>
          ) : (
            <button className='secondButton' onClick={refreshGame}>Game Finished - refresh?</button>
          )}
        </>
      ) : (
        <>
          {
            questions?.map((temp, index) => (

              <div className={styles.questionCont} key={uuidv4()}>
                <label>Question {index + 1}</label>
                <input style={{ width: "100%" }} type='text' placeholder={`Enter Question ${index + 1}`} defaultValue={questions ? questions[index] : ""} onBlur={(e) => {
                  questionsSet((prevQuestions) => {
                    let newQuestionsArr: string[] = []
                    if (prevQuestions) newQuestionsArr = [...prevQuestions]
                    newQuestionsArr[index] = e.target.value
                    return newQuestionsArr
                  })
                }} />

                {choices && choices[index] && (

                  <>

                    <div className={styles.choicesDivCont}>

                      {choices[index].map((choice, smallerIndex) => (
                        <input key={uuidv4()} type='text' placeholder={`Answer ${smallerIndex + 1}`} defaultValue={choices && choices[index] && choices[index][smallerIndex] ? choices[index][smallerIndex] : ""}
                          onBlur={(e) => {
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

                      ))}

                    </div>
                    <button className='secondButton' onClick={() => {
                      choicesSet(prevArr => {
                        const updatedChoices = prevArr!.map((arr, i) => {
                          if (i === index) {
                            return [...arr, ""];
                          }
                          return arr;
                        });

                        return updatedChoices;
                      })
                    }}>Add Answer</button>
                  </>



                )}
              </div>
            ))
          }

          <button className='secondButton' style={{ borderRadius: ".2rem" }} onClick={() => {
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
          {handleStoryBoard && <button style={{ margin: "0 auto" }} onClick={submitNewGameModeObj}>Save GameMode</button>}
        </>
      )
      }
    </div>
  )

}


function WordsToMeaningGM() {
  return (
    <div>
      WordsToMeaning - coming soon
    </div>
  )
}

function PronounciationGM() {
  return (
    <div>
      Pronounciation - coming soon
    </div>
  )
}


function DisplayImage({ passedImageData, editing = false, handleStoryBoard }: { passedImageData: imageType, editing?: boolean, handleStoryBoard?: (option: string, seenBoardId: string, newBoardData?: storyBoardType) => void }) {
  const [imageObj, imageObjSet] = useState<imageType>({ ...passedImageData })


  return (
    <>

      {editing ? (
        <div style={{ color: "var(--textColor)", backgroundColor: "var(--backgroundColor)", padding: "1rem", display: "grid", gap: "1rem" }}>
          <p>Add An Image</p>
          <input style={{ width: '100%', color: "var(--textColor)", borderBottom: "2px solid var(--textColor)", backgroundColor: "var(--backgroundColor)" }} placeholder='Enter an Image url' type='text' value={imageObj.imageUrl} onChange={(e) => {
            imageObjSet(prevVideoObj => {
              prevVideoObj.imageUrl = e.target.value
              return { ...prevVideoObj }
            })
          }} onBlur={() => {
            if (handleStoryBoard) {
              handleStoryBoard("update", imageObj.boardObjId, imageObj)
            }
          }} />

          {imageObj.imageUrl !== undefined && (
            <div className={styles.imageCont}>
              <img src={imageObj.imageUrl}
              />
            </div>
          )}

        </div>
      ) : (
        <div className={styles.imageCont}>
          <img
            src={imageObj.imageUrl ? imageObj.imageUrl : "https://images.pexels.com/photos/10497155/pexels-photo-10497155.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"}
          />
        </div>
      )}

    </>

  )

}

function DisplayVideo({ passedVideoData, editing = false, handleStoryBoard }: { passedVideoData: videoType, editing?: boolean, handleStoryBoard?: (option: string, seenBoardId: string, newBoardData?: storyBoardType) => void }) {
  const [videoObj, videoObjSet] = useState<videoType>({ ...passedVideoData })

  return (
    <div className={styles.videoCont}>

      {editing ? (
        <>
          <p>Add A Video</p>
          <input style={{ backgroundColor: "var(--backgroundColor)", color: "var(--textColor)", borderBottom: "2px solid var(--textColor)" }} type='text' placeholder='Enter a Youtube Url' value={videoObj.videoUrl} onChange={(e) => {
            videoObjSet(prevVideoObj => {
              prevVideoObj.videoUrl = e.target.value
              return { ...prevVideoObj }
            })
          }} onBlur={() => {
            if (handleStoryBoard) {
              handleStoryBoard("update", videoObj.boardObjId, videoObj)
            }
          }} />

          <div style={{ overflow: "hidden", maxWidth: "90dvw" }}>
            <ReactPlayer
              loop={false}
              playing={false}
              url={videoObj.videoUrl}
            />
          </div>
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