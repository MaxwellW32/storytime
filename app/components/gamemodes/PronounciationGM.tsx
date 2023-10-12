"use client"
import 'regenerator-runtime/runtime'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'
import { useEffect, useMemo, useRef, useState } from 'react';
import { v4 as uuidv4 } from "uuid";
import DisplayGameOVer from '../useful/DisplayGameOver';
import { gameObjType, pronounceType, storyBoardType } from '@/app/page';
import styles from "./style.module.css"
import { handleStoriesWhereGameOver } from '@/app/utility/savestorage';


export default function PronounciationGM({ isEditing = false, gameObj, storyid, handleStoryBoard }: {
    isEditing?: boolean,
    gameObj: gameObjType,
    storyid?: string,
    handleStoryBoard?: (option: string, seenBoardId: string, newBoardData?: storyBoardType) => void
}) {
    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();

    const [givenWords, givenWordsSet] = useState<string[]>(() => {
        const lowerCaseArr: string[] = []
        const seenArr = { ...gameObj.gameData as pronounceType }.givenWords ?? []
        seenArr?.forEach(eachWord => {
            lowerCaseArr.push(eachWord.toLowerCase())
        })

        return lowerCaseArr
    })
    const [userMatchedWords, userMatchedWordsSet] = useState<string[]>([])
    const [gameOverState, gameOverStateSet] = useState<boolean>(() => {
        if (!isEditing) {
            const isGameOver = handleStoriesWhereGameOver(storyid!, gameObj.boardObjId, "read")
            return isGameOver!
        } else {
            return false
        }
    })

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

                            eachTileRef.style.backgroundColor = "var(--primaryColor)"
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
                    eachTileRef.style.backgroundColor = "var(--primaryColor)"
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

    const [wantsToSubmit, wantsToSubmitSet] = useState(false)
    useEffect(() => {
        if (wantsToSubmit) {
            handleSubmit()
        }
    }, [wantsToSubmit])

    const handleSubmit = () => {
        //local submit to storyboard

        const newObj: gameObjType = {
            ...gameObj,
            gameData: { gameDataFor: "pronounce", givenWords: givenWords }
        }

        if (handleStoryBoard) {
            handleStoryBoard!("update", gameObj!.boardObjId, newObj)
        }
    }

    const refreshGame = () => {
        userMatchedWordsSet([])
    }

    const start = () => {
        SpeechRecognition.startListening()
    }

    if (!browserSupportsSpeechRecognition) {
        return <span>Can&apos;t play this game, browser doesn&apos;t support speech recognition.</span>;
    }
    return (
        <div style={{ padding: "1rem" }}>
            {isEditing ? (
                <div style={{ display: "grid", justifyItems: "center" }}>

                    <div>
                        <input type='text' ref={inputRef} placeholder='Add a word to pronounce here' />
                        <button onClick={() => {
                            wantsToSubmitSet(true)
                            givenWordsSet(prevWords => {
                                const newArr = [...prevWords, inputRef.current.value]
                                return newArr
                            })
                        }}>Submit</button>
                    </div>


                    <DisplayGameOVer gameOver={gameOverState}>
                        <div style={{ display: "grid", gap: ".5rem", width: "100%" }}>

                            <p>Amount left to match {wordsLeftToMAtch.length}</p>

                            <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>

                                {givenWords.map((eachWord, index) => {
                                    return (
                                        <div key={uuidv4()} style={{ display: "flex", alignItems: "start" }}>
                                            <p ref={(e) => { addWordTilesToRef(e, index) }} style={{ backgroundColor: "var(--secondaryColor)", borderRadius: ".7rem", padding: ".5rem", textTransform: "capitalize" }}>{eachWord}</p>

                                            <svg style={{ width: ".8rem", fill: "var(--textColor)" }}
                                                onClick={() => {
                                                    wantsToSubmitSet(true)
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

                                        {wordsLeftToMAtch.map((eachWord) => {
                                            return (
                                                <div key={uuidv4()}>
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
