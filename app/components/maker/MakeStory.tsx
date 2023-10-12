"use client"
import { useState, useRef, useEffect } from "react"
import { v4 as uuidv4 } from "uuid";
import styles from "./style.module.css"
import { StoryData, StoryDataSend, gameObjType, gameSelectionTypes, imageType, storyBoardType, textType, videoType } from "@/app/page";
import DisplayImage from "../display/DisplayImage";
import DisplayVideo from "../display/DisplayVideo";
import MatchUpGM from "../gamemodes/MatchUpGM";
import CrosswordGM from "../gamemodes/CrosswordGM";
import WordsToMeaningGM from "../gamemodes/WordsToMeaningGM";
import PronounciationGM from "../gamemodes/PronounciationGM";


function makeLinksAndParagraphsArray(text: string) {
    return text.split(ISLINKORBREAK).map(item => item.trim()).filter(Boolean);
}



let regNewLineLimit = "\n\n\n";
const ISLINKORBREAK = new RegExp(`(https?:\/\/[^\s]+\.(?:com|net|org|io)\/[^\s]+|${regNewLineLimit})`, 'g');


const ISLINK = /(https?:\/\/[^\s]+\.(?:com|net|org|io)\/[^\s]+)/g;
const ISYTVID = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;



export default function MakeStory({ makingStorySet, editClickedSet, passedData, newStory, updateStory }: { makingStorySet?: React.Dispatch<React.SetStateAction<boolean>>, editClickedSet?: React.Dispatch<React.SetStateAction<boolean>>, newStory?: (newStory: StoryDataSend) => Promise<void>, updateStory?: (seeBoard: StoryData) => Promise<void>, passedData?: StoryData, }) {

    const [storyTitle, storyTitleSet] = useState(``)
    const [storyId, storyIdSet] = useState("")

    const [storyRating, storyRatingSet] = useState<number | null>(null)
    const [storyBgAudio, storyBgAudioSet] = useState<null | string>(null)
    const [storyShrtDescription, storyShrtDescriptionSet] = useState<null | string>("")

    const [preProcessedText, preProcessedTextSet] = useState("")
    const [storyBoards, storyBoardsSet] = useState<storyBoardType[] | null>(null)

    const [gmShowingArr, gmShowingArrSet] = useState<Boolean[]>(() => {
        return storyBoards?.map(eachBoard => false) ?? []
    })

    //load data if passed - edit
    useEffect(() => {
        if (passedData) {
            storyTitleSet(passedData.title)
            storyIdSet(passedData.storyid)
            storyRatingSet(passedData.rating)
            storyBgAudioSet(passedData.backgroundaudio)
            storyShrtDescriptionSet(passedData.shortdescription)
            storyBoardsSet(passedData.storyboard)
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

        if (indexToAdd !== null) {
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

                const newArr = prevStoryBoardArr?.map(each => each) ?? []
                newArr.splice(indexToAdd as number, 1);

                ObjsArray.forEach((eachObj, smallIndex) => {
                    newArr.splice(indexToAdd as number + smallIndex, 0, eachObj);
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
                    storedText: null,
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
                    videoUrl: null,
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
                    imageUrl: null,
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
                    boardObjId: uuidv4(),
                    shouldStartOnNewPage: null,
                    gameData: null
                }

                storyBoardsSet((prevStoryBoard) => {
                    const newBoard = [...prevStoryBoard!]

                    newBoard.splice(index + 1, 0, gameModeObj)
                    return newBoard
                })
            }
        }


    }

    function handleStoryBoard(option: string, seenBoardId: string, newBoard?: storyBoardType) {

        if (option === "update") {

            storyBoardsSet(prevStoryBoards => {
                const newArr = prevStoryBoards!.map(eachStoryBoard => {
                    if (eachStoryBoard.boardObjId === seenBoardId) {
                        return { ...eachStoryBoard, ...newBoard }
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

        if (updateStory) {
            const updatedStoryObj: StoryData = {
                storyid: passedData!.storyid,
                createdat: passedData!.createdat,
                likes: passedData!.likes,
                title: storyTitle,
                backgroundaudio: storyBgAudio,
                rating: storyRating,
                shortdescription: storyShrtDescription,
                storyboard: storyBoards
            }
            updateStory(updatedStoryObj)
        }

        if (newStory) {
            const newStoryObj: StoryDataSend = {
                storyid: undefined,
                createdat: undefined,
                likes: undefined,
                title: storyTitle,
                backgroundaudio: storyBgAudio,
                rating: storyRating,
                shortdescription: storyShrtDescription,
                storyboard: JSON.stringify(storyBoards)
            }

            newStory(newStoryObj)
        }

        if (editClickedSet) {
            editClickedSet(false)
        }

        if (makingStorySet) {
            makingStorySet(false)
        }

    }

    const textAreaRefs = useRef<HTMLTextAreaElement[]>([])

    const makeRefCorrectSize = (ref: HTMLTextAreaElement) => {
        if (ref) {
            ref.style.height = 'auto';
            ref.style.height = ref.scrollHeight + 'px';
        }
    }

    const addToTextAreaRefs = (ref: HTMLTextAreaElement, index: number) => {
        textAreaRefs.current[index] = ref
        makeRefCorrectSize(ref)
    }

    //give textarea right size
    useEffect(() => {
        textAreaRefs.current.forEach((eachRef) => {
            makeRefCorrectSize(eachRef)
        })
    }, [storyBoards])


    return (
        <div className={styles.makeStoryMainDiv}>
            <button style={{ margin: ".5rem .5rem 0 auto" }}
                onClick={() => {
                    if (passedData !== null) {
                        editClickedSet!(false)
                    } else {
                        makingStorySet!(false)
                    }

                }}>Cancel</button>
            <h3 style={{ color: "#fff", textAlign: "center" }}>Lets make a wonderful story</h3>

            <div className={styles.makeStoryLabelInputCont}>
                <label htmlFor='msTitle'>Title</label>
                <input id='msTitle' type='text' placeholder='Enter a title ' value={storyTitle} onChange={(e) => {
                    storyTitleSet(e.target.value)
                }} />
            </div>

            <div className={styles.makeStoryLabelInputCont}>
                <label htmlFor='msShDescription'>Short Description</label>
                <input id='msShDescription' type='text' placeholder='Enter a Description ' value={storyShrtDescription ?? ""} onChange={(e) => {
                    storyShrtDescriptionSet(e.target.value)
                }} />
            </div>

            <div className={styles.makeStoryLabelInputCont}>
                <label htmlFor='msRating'>Rating</label>
                <input id='msRating' type='number' placeholder='Enter a Rating /5 ' value={storyRating ?? undefined} onChange={(e) => {
                    storyRatingSet(parseInt(e.target.value))
                }} />
            </div>

            <div className={styles.makeStoryLabelInputCont}>
                <label htmlFor='msAudio'>Audio</label>
                <input id='msAudio' type='text' placeholder='Background Music? ' value={storyBgAudio ?? ""} onChange={(e) => {
                    storyBgAudioSet(e.target.value)
                }} />
            </div>


            <div className={styles.storyBoardCont}>
                <h3 style={{ color: "#fff", textAlign: "center" }}>Story Board</h3>

                {!storyBoards ? (
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

                                            <textarea key={uuidv4()} className={styles.textAreaEdit2} defaultValue={eachElemnt.storedText ?? ""} ref={(e: HTMLTextAreaElement) => { addToTextAreaRefs(e, index) }}
                                                onInput={(e) => {
                                                    const el = e.target as HTMLTextAreaElement
                                                    el.style.height = 'auto';
                                                    el.style.height = el.scrollHeight + 'px';
                                                }}
                                                onBlur={(e) => {
                                                    const seenTextObj = storyBoards[index] as textType

                                                    if (e.target.value !== seenTextObj.storedText) {
                                                        convertTextToStoryBoards(e.target.value, index)
                                                    }
                                                }} />

                                        ) : eachElemnt.boardType === "image" ? (
                                            <DisplayImage passedImageData={eachElemnt} editing={true} handleStoryBoard={handleStoryBoard} />
                                        ) : eachElemnt.boardType === "video" ? (
                                            <DisplayVideo passedVideoData={eachElemnt} editing={true} handleStoryBoard={handleStoryBoard} />
                                        ) : eachElemnt.boardType === "gamemode" ? (
                                            <div className={styles.storyTextboardHolder} style={{ display: "flex", flexDirection: "column", backgroundColor: "var(--backgroundColor)" }}>

                                                {eachElemnt.gameSelection === "matchup" ? (
                                                    <MatchUpGM isEditing={true} {...eachElemnt} handleStoryBoard={handleStoryBoard} />
                                                ) : eachElemnt.gameSelection === "crossword" ? (
                                                    <CrosswordGM gameObj={eachElemnt} isEditing={true} handleStoryBoard={handleStoryBoard} />
                                                ) : eachElemnt.gameSelection === "wordmeaning" ? (
                                                    <WordsToMeaningGM />
                                                ) : eachElemnt.gameSelection === "pronounce" ? (
                                                    <PronounciationGM gameObj={eachElemnt} isEditing={true} handleStoryBoard={handleStoryBoard} />
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
