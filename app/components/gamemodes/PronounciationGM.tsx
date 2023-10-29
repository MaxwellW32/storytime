"use client"
import 'regenerator-runtime/runtime'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'
import { useEffect, useMemo, useRef, useState } from 'react';
import { v4 as uuidv4 } from "uuid";
import DisplayGameOVer from '../useful/DisplayGameOver';
import { gameObjType, pronounceType, storyBoardType, updateGameModesParams } from '@/app/page';
import styles from "./style.module.css"
import { handleStoriesWhereGameOver } from '@/app/utility/savestorage';
import { useAtom } from 'jotai';
import { allServerFunctionsAtom } from '@/app/utility/globalState';
import ShowServerErrors from '../useful/ShowServerErrors';
import AddPassword from '../useful/AddPassword';
import ChangePassword from '../useful/ChangePassword';


export default function PronounciationGM({ isEditing = false, sentGameObj, storyid, addGameModeLocally, updateGamemodeDirectly, sentDirectlyFromMaker }: {
    isEditing?: boolean,
    sentGameObj?: gameObjType,
    storyid?: string,
    addGameModeLocally?: (gamemode: gameObjType) => void,
    updateGamemodeDirectly?: boolean, storyId?: string,
    sentDirectlyFromMaker?: boolean

}) {
    const [allServerFunctions,] = useAtom(allServerFunctionsAtom)

    const [gamePass, gamePassSet] = useState("")

    const [errorsSeen, errorsSeenSet] = useState<{
        [key: string]: string
    }>()


    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();

    const initialState: gameObjType = {
        boardObjId: uuidv4(),
        gameData: {
            gameDataFor: "pronounce",
            givenWords: null
        } as pronounceType,
        gameSelection: "pronounce",
        gamePass: gamePass
    }

    const [gameObj, gameObjSet] = useState<gameObjType>(sentGameObj ? { ...sentGameObj } : { ...initialState })

    // const myWords = ["APPLE", "BANANA", "CHerry", "doG", "ELEphant", "flower", "grape", "house", "igloo", "jacket", "kiwi", "lemon", "melon", "orange", "penguin", "queen", "rabbit", "strawberry", "turtle", "umbrella"];

    const [givenWords, givenWordsSet] = useState<string[]>(() => {
        let seenArr = { ...gameObj.gameData as pronounceType }.givenWords ?? []
        seenArr = seenArr.map(eachWord => {
            return eachWord.toLowerCase()
        })
        return seenArr
    })

    //handle top level sentgameobj change
    const mounted = useRef(false)
    const amtTimesReset = useRef(0)
    useEffect(() => {
        if (mounted.current && sentGameObj) {
            const seenGameData = sentGameObj.gameData as pronounceType
            console.log(`$hey i should reset pronounce gamestate now`);

            gameObjSet({ ...sentGameObj })
            givenWordsSet(() => {
                let seenArr = seenGameData.givenWords ? [...seenGameData.givenWords] : []
                seenArr = seenArr.map(eachWord => {
                    return eachWord.toLowerCase()
                })
                return seenArr
            })

        }

        mounted.current = true
        return () => {
            if (amtTimesReset.current < 1) {
                mounted.current = false
            }

            if (!mounted.current) {
                amtTimesReset.current = 1
            }
        }
    }, [sentGameObj])

    const [userMatchedWords, userMatchedWordsSet] = useState<string[]>([])
    const [gameOverState, gameOverStateSet] = useState<boolean>(() => {
        if (!isEditing) {
            const isGameOver = handleStoriesWhereGameOver(storyid!, gameObj.boardObjId, "read")
            return isGameOver!
        } else {
            return false
        }
    })

    const [clickedSubmitOnce, clickedSubmitOnceSet] = useState(false)

    const wordsLeftToMAtch = useMemo(() => {

        return givenWords.filter(eachGivenWord => {

            let foundAlready = false
            userMatchedWords.forEach(eachMatchedWord => {
                if (eachMatchedWord === eachGivenWord) {
                    foundAlready = true
                }
            })

            if (!foundAlready) {
                return eachGivenWord
            }

        })

    }, [userMatchedWords, givenWords])

    const setTimer = useRef<NodeJS.Timeout | undefined>(undefined)
    const runHighlight = () => {
        if (isEditing) {
            //add some color
            const workingTranscript = transcript.toLowerCase()
            const transcriptArr = workingTranscript.split(" ")

            if (transcriptArr.length > 1) {
                transcriptArr.forEach(seenTranscript => {
                    wordTileRefs.current.forEach(eachTileRef => {
                        if (eachTileRef.innerText.toLowerCase() === seenTranscript) {

                            eachTileRef.style.backgroundColor = "var(--thirdColor)"
                            setTimeout(() => {
                                eachTileRef.classList.remove(styles.highlightText)
                                eachTileRef.style.backgroundColor = "var(--secondaryColor)"
                            }, 1500)
                        }
                    })

                })
            }

            wordTileRefs.current.forEach(eachTileRef => {
                if (eachTileRef.innerText.toLowerCase() === workingTranscript) {
                    eachTileRef.style.backgroundColor = "var(--thirdColor)"
                    setTimeout(() => {
                        eachTileRef.style.backgroundColor = "var(--secondaryColor)"
                    }, 1500)
                }
            })
        }
    }
    //make usermatched words everytime voice input changes
    useEffect(() => {
        if (!isEditing && transcript.length > 0) {
            const workingTranscript = transcript.toLowerCase()
            const transcriptArr = workingTranscript.split(" ")

            if (transcriptArr.length > 1) {
                transcriptArr.forEach(newTranscript => {
                    if (givenWords.includes(newTranscript) && !userMatchedWords.includes(newTranscript)) {
                        userMatchedWordsSet(prev => {
                            const newArr = [...prev, newTranscript]
                            return newArr
                        })
                    }
                })
            }

            if (givenWords.includes(workingTranscript) && !userMatchedWords.includes(workingTranscript)) {
                userMatchedWordsSet(prev => {
                    const newArr = [...prev, workingTranscript]
                    return newArr
                })
            }

        }


        if (setTimer.current === undefined) {
            setTimer.current = setTimeout(() => { runHighlight() }, 3000)
        }

        return () => {
            if (setTimer.current !== undefined) {
                clearTimeout(setTimer.current)
                setTimer.current = undefined
            }
        }

    }, [transcript])

    //watch and make game finished
    const canStartWatching = useRef(false)
    useEffect(() => {
        if (userMatchedWords.length > 0) {
            canStartWatching.current = true
        }

        if (canStartWatching.current && wordsLeftToMAtch.length === 0) {
            gameOverStateSet(true)
        }
    }, [wordsLeftToMAtch.length])


    const gameFinishedOnce = useRef(false)
    useEffect(() => {
        if (gameOverState) {
            gameFinishedOnce.current = true
        }

        if (gameFinishedOnce.current && !isEditing) {
            handleStoriesWhereGameOver(storyid!, gameObj.boardObjId, "update")
        }

    }, [gameOverState])

    const inputRef = useRef<HTMLInputElement>(null!)

    const wordTileRefs = useRef<HTMLDivElement[]>([])
    const addWordTilesToRef = (ref: HTMLDivElement | null, indexToAdd: number) => {
        if (ref === null) return

        if (!wordTileRefs.current[indexToAdd]) {
            wordTileRefs.current[indexToAdd] = ref
        } else {
            wordTileRefs.current[indexToAdd] = ref
        }
    }

    const handleSubmit = async () => {

        if (sentDirectlyFromMaker) {
            clickedSubmitOnceSet(true)
        }

        const newObj: gameObjType = {
            ...gameObj,
            gameData: { ...gameObj.gameData as pronounceType, givenWords: givenWords },
            gamePass: gamePass
        }

        if (addGameModeLocally) {
            addGameModeLocally(newObj)
        }

        if (updateGamemodeDirectly && storyid) {
            const serverMessageObj = await allServerFunctions!.updateGameModes(newObj, storyid, "normal")

            if (serverMessageObj["message"].length !== 0) {
                errorsSeenSet(serverMessageObj)
            } else {
                errorsSeenSet(undefined)
            }
        }

        // gameObjSet({ ...initialState })
        // givenWordsSet([])
    }

    const refreshGame = () => {
        userMatchedWordsSet([])
    }

    const start = () => {
        SpeechRecognition.startListening()
    }

    const handleAddWord = () => {
        givenWordsSet(prevWords => {
            const newArr = [...prevWords, inputRef.current.value.toLowerCase()]

            setTimeout(() => {
                inputRef.current.value = ""
                inputRef.current.focus()
            }, 50)
            return newArr
        })
    }

    if (!browserSupportsSpeechRecognition) {
        return <span>Can&apos;t play this game, browser doesn&apos;t support speech recognition.</span>;
    }
    return (
        <div style={{ padding: "1rem", maxWidth: "100dvw" }}>
            {isEditing ? (
                <div style={{ display: "grid", justifyItems: "center", gap: "1rem" }}>
                    <div style={{}}>
                        <input style={{ backgroundColor: "var(--textColorAnti)" }} type='text' ref={inputRef} placeholder='Add a word to pronounce here' onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleAddWord()
                            }
                        }} />
                        <button onClick={handleAddWord}>Add</button>
                    </div>

                    <DisplayGameOVer gameOver={gameOverState}>
                        <div style={{ display: "grid", gap: ".5rem", width: "100%" }}>
                            <p>Amount left to match {wordsLeftToMAtch.length}</p>

                            <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
                                {givenWords.map((eachWord, index) => {
                                    return (
                                        <div key={index} style={{ display: "flex", alignItems: "start" }}>
                                            <p ref={(e) => { addWordTilesToRef(e, index) }} style={{ backgroundColor: "var(--secondaryColor)", borderRadius: ".7rem", padding: ".5rem", textTransform: "capitalize" }}>{eachWord}</p>

                                            <svg style={{ width: ".8rem", fill: "var(--textColor)" }}
                                                onClick={() => {
                                                    givenWordsSet(prevGivenWords => {
                                                        const newArr = prevGivenWords.filter((eachWord, seenIndex) => seenIndex !== index)
                                                        return newArr
                                                    })
                                                }}
                                                xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" /></svg>
                                        </div>
                                    )
                                })}
                            </div>

                            <p>Words To Pronounce</p>

                            <p>{transcript}</p>
                            <p>Microphone: {listening ? 'on' : 'off'}</p>

                            <div className={styles.probuttonholderread} style={{ display: "flex", gap: ".3rem" }}>
                                <button onClick={start}>Start</button>
                                <button onClick={SpeechRecognition.stopListening}>Stop</button>
                                <button onClick={resetTranscript}>Reset</button>
                            </div>
                        </div>
                    </DisplayGameOVer>


                    <ShowServerErrors errorsSeen={errorsSeen} />
                    {/* Do local function first entirely */}

                    {addGameModeLocally && (
                        <>
                            {sentDirectlyFromMaker && !clickedSubmitOnce && <AddPassword option="gamemode" password={gamePass} storyPasswordSet={gamePassSet} />}

                            {(gamePass || !sentDirectlyFromMaker) && <button onClick={() => {
                                handleSubmit()
                            }}>Submit Gamemode</button>}
                        </>
                    )}

                    {updateGamemodeDirectly && (
                        <>
                            {!sentDirectlyFromMaker && <ChangePassword option="gamemode" password={gamePass} storyId={storyid!} storyPasswordSet={gamePassSet} gamemodeObjId={gameObj!.boardObjId} />}

                            {<AddPassword option="gamemode" password={gamePass} storyPasswordSet={gamePassSet} showFieldOnly={sentDirectlyFromMaker ? true : undefined} />}

                            {gamePass && <button onClick={() => {
                                handleSubmit()
                            }}>Submit Gamemode</button>}
                        </>
                    )}
                </div>
            ) : (
                <>
                    <DisplayGameOVer gameOver={gameOverState}>
                        <div className={styles.pronounceMainDiv}>

                            <div style={{ display: "flex", gap: "1rem", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
                                <p>Amount left to match {wordsLeftToMAtch.length}</p>

                                <div>
                                    <p>Words To Pronounce</p>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", margin: "1rem", justifyContent: "center" }}>

                                        {wordsLeftToMAtch.map((eachWord, eachWordIndex) => {
                                            return (
                                                <div key={eachWordIndex}>
                                                    <p style={{ backgroundColor: "var(--secondaryColor)", borderRadius: ".7rem", padding: ".5rem" }}>{eachWord}</p>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                <p>{transcript}</p>
                                <div style={{ justifySelf: "flex-end" }}>
                                    <p >Microphone: {listening ? 'on' : 'off'}</p>
                                </div>

                            </div>

                            <div className={styles.probuttonholder} style={{ padding: "1rem", display: "grid", justifyItems: "stretch", gap: ".2rem" }}>
                                <button onClick={start}>Start</button>
                                <button onClick={SpeechRecognition.stopListening}>Stop</button>
                                <button onClick={resetTranscript}>Reset</button>
                            </div>
                        </div>

                    </DisplayGameOVer>

                    {gameOverState && (
                        <>
                            <p>Game Completed!</p>
                            <button onClick={() => {
                                gameOverStateSet(false)
                                refreshGame()
                            }}>Refresh</button>
                        </>
                    )}
                </>
            )}

        </div>
    )
}
