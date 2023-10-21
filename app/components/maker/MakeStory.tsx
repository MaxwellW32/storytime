"use client"
import { useState, useRef, useEffect, useMemo } from "react"
import { v4 as uuidv4 } from "uuid";
import styles from "./style.module.css"
import { StoryData, StoryDataSend, gameObjType, gameSelectionTypes, imageType, storyBoardType, textType, videoType } from "@/app/page";
import DisplayImage from "../display/DisplayImage";
import DisplayVideo from "../display/DisplayVideo";
import MatchUpGM from "../gamemodes/MatchUpGM";
import CrosswordGM from "../gamemodes/CrosswordGM";
import WordsToMeaningGM from "../gamemodes/WordsToMeaningGM";
import PronounciationGM from "../gamemodes/PronounciationGM";
import GamemodeMaker from "../gamemodes/GamemodeMaker";




const ISLINK = /(https?:\/\/[^\s]+\.(?:com|net|org|io)\/[^\s]+)/g;
const ISYTVID = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;



export default function MakeStory({ passedData, newStory, updateStory, makingStorySet, editClickedSet }: { updateStory?: (option: "story" | "likes", seeBoard: StoryData) => Promise<void>, passedData?: StoryData, makingStorySet?: React.Dispatch<React.SetStateAction<boolean>>, editClickedSet?: React.Dispatch<React.SetStateAction<boolean>>, newStory?: (newStory: StoryDataSend) => Promise<void> }) {

    const [storyTitle, storyTitleSet] = useState(passedData?.title ?? "")

    const [storyId, storyIdSet] = useState(passedData?.storyid ?? undefined)
    const [likes, likesSet] = useState(passedData?.likes ?? undefined)
    const [createdAt, createdAtSet] = useState(passedData?.createdat ?? undefined)

    const [storyRating, storyRatingSet] = useState<number | null>(passedData?.rating ?? null)
    const [storyBgAudio, storyBgAudioSet] = useState<null | string>(passedData?.backgroundaudio ?? null)
    const [storyShrtDescription, storyShrtDescriptionSet] = useState<null | string>(passedData?.shortdescription ?? null)

    const [preProcessedText, preProcessedTextSet] = useState("")

    const [storyBoards, storyBoardsSet] = useState<storyBoardType[] | null>(passedData?.storyboard ?? null)
    const [gameModes, gameModesSet] = useState<gameObjType[] | null>(passedData?.gamemodes ?? null)

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

                return ObjsArray
            })
        }
    }

    function addSpecificStoryToBoard(index: number, option: string) {

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

    function addGameMode(gamemode: gameObjType) {
        gameModesSet(prevGameModes => {

            let newGameModes = prevGameModes === null ? [] : [...prevGameModes]

            let foundInArr = false
            let indexFound = null
            newGameModes.forEach((eachGameMode, index) => {
                if (gamemode.boardObjId === eachGameMode.boardObjId) {
                    foundInArr = true
                    indexFound = index
                }
            })

            if (foundInArr && indexFound !== null) {
                newGameModes[indexFound] = gamemode
            } else {
                newGameModes = [...newGameModes, gamemode]
            }

            return newGameModes
        })
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
                storyid: storyId!,
                createdat: createdAt!,
                likes: likes!,
                title: storyTitle,
                backgroundaudio: storyBgAudio,
                rating: storyRating,
                shortdescription: storyShrtDescription,
                storyboard: storyBoards,
                gamemodes: gameModes,
            }
            updateStory("story", updatedStoryObj)
        }

        if (newStory) {
            const newStoryObj: StoryDataSend = {
                storyid: storyId,
                createdat: createdAt,
                likes: likes,
                title: storyTitle,
                backgroundaudio: storyBgAudio,
                rating: storyRating,
                shortdescription: storyShrtDescription,
                storyboard: storyBoards as unknown as string,
                gamemodes: gameModes as unknown as string
            }
            //using unkown here cause its not a string, i convert it to a string in the update function
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

    function makeLinksAndParagraphsArray(text: string) {
        return text.split(ISLINKORBREAK).map(item => item.trim()).filter(Boolean);
    }

    const [regNewLineLimit, regNewLineLimitSet] = useState(3)
    const ISLINKORBREAK = useMemo(() => {
        let newStr = ""
        for (let index = 0; index < regNewLineLimit; index++) {
            newStr += "\n"
        }

        return new RegExp(`(https?:\/\/[^\s]+\.(?:com|net|org|io)\/[^\s]+|${newStr})`, 'g');
    }, [regNewLineLimit])

    const [contentMaking, contentMakingSet] = useState<"story" | "gamemode">("story")

    return (
        <div className={styles.makeStoryMainDiv}>
            <button style={{ margin: ".5rem .5rem 0 auto" }}
                onClick={() => {
                    if (passedData !== undefined) {
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




            <div>
                {/* make gamemode / make story switch */}
                <button onClick={() => { contentMakingSet("story") }}>Make Story</button>
                <button onClick={() => { contentMakingSet("gamemode") }} style={{ opacity: storyBoards !== null ? 1 : 0, userSelect: storyBoards !== null ? "auto" : "none" }}>Make Gamemode</button>
            </div>

            <div className={styles.editCont}>

                <div style={{ display: contentMaking === "story" ? "block" : "none" }} className={styles.storyContent}>
                    <h3 style={{ color: "#fff", textAlign: "center" }}>Story Board</h3>
                    <p style={{ color: "#fff", textAlign: "center" }}>Make new paragraph after {regNewLineLimit} {regNewLineLimit === 1 ? "linebreak" : "linebreaks"}</p>
                    <div style={{ margin: "0 auto", display: "flex", gap: "1rem" }}>
                        <button onClick={() => {
                            regNewLineLimitSet(prev => {
                                const newNum = prev - 1

                                if (newNum >= 1) {
                                    return newNum
                                } else {
                                    return 1
                                }
                            })
                        }}>Decrease</button>
                        <button onClick={() => { regNewLineLimitSet(prev => prev + 1) }}>Increase</button>
                    </div>


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


                                            </div>
                                        </div>
                                    )
                                })}

                            </div>
                        </>
                    )}

                </div>

                <div style={{ display: contentMaking === "gamemode" ? "block" : "none" }} className={styles.gamemodeContent}>
                    <GamemodeMaker addGameMode={addGameMode} />

                    <div style={{ marginTop: "6rem" }}>
                        <p>Gamemodes added</p>

                        {gameModes?.map((eachGameObj, index) => {
                            let chosenEl: JSX.Element | null = null

                            if (eachGameObj.gameSelection === "matchup") {
                                chosenEl = <MatchUpGM addGameMode={addGameMode} gameObj={eachGameObj} isEditing={true} />
                            } else if (eachGameObj.gameSelection === "crossword") {
                                chosenEl = <CrosswordGM addGameMode={addGameMode} sentGameObj={eachGameObj} isEditing={true} />
                            } else if (eachGameObj.gameSelection === "pronounce") {
                                chosenEl = <PronounciationGM addGameMode={addGameMode} sentGameObj={eachGameObj} isEditing={true} />
                            } else if (eachGameObj.gameSelection === "wordmeaning") {
                                chosenEl = <WordsToMeaningGM />
                            }


                            return (
                                <div key={uuidv4()}>
                                    <p onClick={() => {
                                        gameModesSet(prevGameModes => {
                                            return prevGameModes!.filter((e, eindex) => eindex !== index)
                                        })
                                    }}>x</p>
                                    {chosenEl}
                                </div>
                            )
                        })}
                    </div>

                </div>
            </div>




            <button style={{ marginTop: "4rem" }} onClick={handleSubmit}>Submit</button>









        </div>
    )
}
