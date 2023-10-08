"use client"
import Image from 'next/image'
import { useMemo, useState, useRef, useEffect } from "react"
import { v4 as uuidv4 } from "uuid";
import styles from "./style.module.css"
import { atom, useAtom } from 'jotai'
import ReactPlayer from "react-player/youtube";
import updateBoardObjWithBoardDataGlobal from './Updater';
import tempbddata from "../tempdbdata1.json"
import { Roboto } from 'next/font/google'
import { saveToLocalStorage, retreiveFromLocalStorage } from './utility/savestorage';

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '700']
})

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
import { request } from 'http';
import NavBar from './components/navbar/NavBar';

const globalStorieArray = atom<StoryData[] | undefined>(undefined)
export const globalTheme = atom<boolean>(false)

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


function makeLinksAndParagraphsArray(text: string) {
  return text.split(ISLINKORBREAK).map(item => item.trim()).filter(Boolean);
}



let regNewLineLimit = "\n\n\n";
const ISLINKORBREAK = new RegExp(`(https?:\/\/[^\s]+\.(?:com|net|org|io)\/[^\s]+|${regNewLineLimit})`, 'g');


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

  const descRef = useRef<HTMLParagraphElement>(null)
  const [showDescriptionFull, showDescriptionFullSet] = useState(false)
  const [descOverFlowing, descOverFlowingSet] = useState(false)

  useEffect(() => {
    const element = descRef.current;
    if (element) {
      descOverFlowingSet(element.scrollHeight > element.clientHeight);
    }
  }, [])



  return (
    <div style={{ width: "95%", margin: "0 auto", borderRadius: ".7rem", padding: "1rem", backgroundColor: "var(--backgroundColor)" }}>

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
        <div className={roboto.className} style={{ display: "flex", flexDirection: "column", gap: "1rem", backgroundColor: "#aaa", position: "fixed", top: 0, left: 0, height: "100dvh", width: "100%", overflowY: "auto" }}>
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
      {/* audio */}
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

    console.log(`$new`, newStoryObj);

    storiesSet(prevStoriesArr => {
      console.log(`$got in set`);
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

  const [gameModeButtonClicked, gameModeButtonClickedSet] = useState(false)

  return (
    <div className={styles.makeStoryMainDiv}>
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


                  <div className={styles.bttnHolder} style={{}}>
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
                    <div style={{}}>

                      <button onClick={() => {
                        gameModeButtonClickedSet(prev => !prev)
                      }}>add new gamemode</button>

                      {gameModeButtonClicked && (
                        <div style={{ display: "flex", flexWrap: "wrap" }}>
                          <button onClick={() => {
                            addSpecificStoryToBoard(index, "newgamemode", "matchup")
                            gameModeButtonClickedSet(false)
                          }}>Matchup</button>

                          <button onClick={() => {
                            addSpecificStoryToBoard(index, "newgamemode", "crossword")
                            gameModeButtonClickedSet(false)
                          }}>Crossword</button>

                          <button onClick={() => {
                            addSpecificStoryToBoard(index, "newgamemode", "pronounce")
                            gameModeButtonClickedSet(false)
                          }}>Pronounciation</button>

                          <button onClick={() => {
                            addSpecificStoryToBoard(index, "newgamemode", "wordmeaning")
                            gameModeButtonClickedSet(false)
                          }}>Words to Meanings</button>
                        </div>
                      )}

                    </div>
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
  const [makingStory, makingStorySet] = useState(true)

  const [theme, themeSet] = useAtom(globalTheme)


  const themeStyles = useMemo(() => {

    if (theme) {
      return {
        "--primaryColor": "Red",
        "--secondaryColor": "purple",
        "--backgroundColor": "#ffe9cb",
        "--textColor": "black",
        "--textColorAnti": "white",
        "--backdrop": `url(https://lh3.googleusercontent.com/fife/AK0iWDzq8om75zyiW7-rA4lFrq0ozmEAQ8zbPT12OE7Jx3hvuuTvcwFENpngXQSF1UpbTd4xsMsUc_INKL5LJF3Hnf-HeMbK57uFsdKLrMnJcWIbM3mMCeex8X0gS90NzJlblmuvLrN4G-EShyYOegMx9QcaAeQz18ton2JFmUprKgJUjJ-Hsm7fTND7eU-XmxUBh9crLBbjBTWQI4YS1Z-9euS_X2yJTf_DaOGA_zQ75Q5SqpF5COQYBrqR_q_6rI5IIWG3jwbcmVKFv7fobysTtcpuHCKIigYk_esdcxle34BOjs1fmz5c-BFeL_i9dUt3on_y8dU412uShQSWBcDyR_FcABMwbks1SJgxfr-1_vCEzO6UeYU-0LL7ZoopuewjHT7QuBRxskaZ2hcx54EkResnNvvAht-MT3UICnEOIeWH3GeRLqMQoUutpZ8308HwIYCjjgNUNm5lHtQkMdWhJX6BWLPx9VYNJgKlTmAo-Mbo16zClG-6XN8EPtnlnGtp3FiyYqHxOgTbdqQo3kGkO2eXhpsBuYL1XPmUbh1jOVpldgH1qTwa6TzIZ9EXc-gqbg1i1WVHVBBMD3r7tscdQY0bl8LhZMu5Wkg9U_kUhBE6hx6ufLWu0YF-atYhYws6bIn3pvyef85RyWfX9_zyfL-b-sl6rs8EyvOMPdng9JK6LyFogqIrNiRcRYJcLoB1IXOUB6ghQ_AD_ln5JfDdjyQyZeOkzi3lGtGORdCYppamgd411EAMgvR62kaqdgBAqaz0tjIPxSQ7wMvw7EZ2ZDhflFVpg_jRS5JhJNnYdxQIj3D9Z1hm0QoR8YkLPRUjpeyMvqNcEm-hAKaURuKce_JL7Vy764LUgF5ipm3mMUl40mQWLVCJkK4wsLMFIneDfvjlt6Xzo7xUW5koEDGfY1XbWwqezb3eHzZa6S7t9Ebw9OTLH8CBGjIqv6HrnO33ZU5C7tqnbM70fFFIbnOpQWcWDHBPFJQttX0FSxpOpPkSL-LYraS8mrAUI6EAJYpcVTEPIzuaeYpB11rVuvtAzQoFSqwnCO9FNBohcAhQVnD3ZXUrZ3SOsPncDr9YrlEeOJtxGiw_-q8-hJvZAyomAcKBWm44WAGbZHOnYPcdS38X5fp2N3gn9qrSq3deEDZb52JOhpdPUicXi-gcWwCl34anERVhT_yTcUcStsLT9C1IzLdyB1u4kzNHqFe2B8UgxvBnXh7zuqcdOZmB5A9YY5bYhiv-rU_LLbIn3GWJIvzk3as9hmqVH8ZKtc2BlNhvm-EGmkjEqMu21HnqLckjyWy1lwKEvnjzsCScH0WjF14kiOIboULrbLl_84Et68Rj5BJL7HCBBqqECdBZg0TyWCXHBLnaG2jmVnqUj-hUwcpsyxaPYhOYNtHFDZ9x9T5VKoerLCV-ENuBiOSz50YLmn3FM7mPbZgwg2PponFbrIPdxNpo8iv7DnVKBcPGCju0y4g86aP4fQ3uVedeLBlTFESDXNlECaZEAv1sr902t4xE7XnGelWiOZ6RXAsbimuRjR1nZytpNLRGO_brtT79GnWUiaFtzMe4PdRgklMM6mnvfdzSncvIffWV=w1920-h892)`,
        // "--navBarColor": "#ffe9cb"
      }
    } else {
      return {
        "--primaryColor": "blue",
        "--secondaryColor": "orange",
        "--backgroundColor": "#23201d",
        "--textColor": "white",
        "--textColorAnti": "black",
        "--backdrop": `url(https://lh3.googleusercontent.com/fife/AK0iWDyDKJc9zISjiKJ0wzlhh38Dly1h35VA74rWHahC5r4jLoYoEjmA3kjw7A-1UHigxO1ybZlhIWdY5d8ki95nCylitjaxlhLUVL76hj-JX75RDRoOHEQZYpHfl4PRPVCbH1l6gdze6b9lzv9MvJLN_h8GKGteyfZrOiMc9j013IZ9sbIGzLs_NnNFUav0c_ZQS3XaTbOywRxKc2eDpHfIzPd9bNhKnT7rymJGyoy1-ljd8bllEVayuXHMDdJGx0vjIGpESxMvBlk6vBldNsOAbB2fXVwr_mLRKQ3Ma8mBlKqdNwn8W1OcT-LcAzsyE8YSVZykIEH9P9buBjGT7P4ZVz9gXGiMpTou32Jv10adiOnn-uLZdC41NfuMjPbuTHI8fe7nq2n3U8CRqn5mFfmpQ8-43otano_7kmQfDwKfRsVIR99_jRljgCK8et_pdCcxhXSiinRbCtKY43Dh-g7myGwATCecTGw6NTS_-vgPIhqi_ykboT9Kp_08dUMb8Alc6tvVrMCpA3_daJAhCLujfzf5Xg7v_k8vA5zh6CN7K9kZhptuIcYv_Thm7QBWYcGoUk2mycno87Vn88kkDvJ49Ap6sfb7HBAo8YnoP6yq8iW7E3JIhdiMKolsYkhO29lKxLl1GWgsg8inAICI_rAbHP-PahQcJyOiKZwaXTSN_1_WUsorTsDn6nfQvhrr4QUxvw4oRFoP8GEbcoAdcxOMRDvMHAY15qMI04pCwoiJFOtEJFeUJ0gCpi3MsWaC_L2OyiPei8jH46-3GYjhnIxQVeJIRBryGpb5JhfNKijCTIa91ddADdIpD9JLVHCe2vg2I4_7qGMCysL4Sfef_U0VbZdqlPu-NdjDrccUvLcle4bDCGse2pphIyG8BpadAFu_2UUUvv8erGJibzPcuWPWoSU6b_zxWzpYDiN-jH5F-mYwrRMmQ581_0NSaBNW6ln2YARWD3N524qe0VLyx5E-IFrsLx36_V3vJFPGil4COJ87omzd-0ge6Crtta30xclJyS8AKmsAyXCOYGG77VX73lS4NRBMyO4BxxhfSUBfh3_e7NGgvQFD0u64bZ5-x2bGMMZ_i0qMxeK4KRk4tkVA0qruk-qG9zzdTuw8N2yQiYz3hlRTdTwOTEQtgGi8KnW0zYY1IyCykgmG93B_Qj0JBiPu8Xeh1IVlYCw_STk8lcR9oD6B25OMA3Yqv8alWbxhsIUvoFMmBzzDzifgDJQDug9SvsBb1rfwrMzwerr_4XNyfudsyHo2pEhdFNryf1PwrLAtGWtwOuxTjT3IKoBS7q2cQIYCBJb6ERiAWb5oN_iF-4uuLxnJhdDnfnGOUIFS7R-TsuurQDSPmS1SqKXrmq-qVatgCfR5x8TN4GFcUVcP5RPiE_mc8I4w7gyyKzyC_1QuZPlFTHy0lEJPzSrx1gbNgLiqZum_TJknzV6HKnpx_hl01xDO_uRwn-Inm8R7SHrRW_lp4oI3UCWmtj9O35aiIDx5__7Wshe4ro5aiPxCzyMvhKV0R1TjD86eDsGpikPnoWqYKlKYG8QVQh-vtXpAWMqUYWiDnfElShWoKP9oRkOtehVUap7Y=w1920-h892)`,
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
      console.log(`$thus reran too loader`);

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
    <main id='homeDiv' style={{ display: "flex", flexDirection: "column", gap: "1rem", backgroundImage: themeStyles['--backdrop'], ...themeStyles }}>

      <NavBar />
      {makingStory
        ? <MakeStory makingStorySet={makingStorySet} />
        : (<button onClick={() => { makingStorySet(true) }}>Add a Story</button>)
      }

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
    </div>
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
    <>

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
        <div style={{}} className={styles.imageCont}>
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