"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import styles from "./style.module.css"
import { gameObjType, matchupType, wordsToMeaningType } from "@/app/page"
import { useAtom } from "jotai"
import { allServerFunctionsAtom, globalTheme } from "@/app/utility/globalState"
import { v4 as uuidv4 } from "uuid";
import { handleStoriesWhereGameOver } from "@/app/utility/savestorage"
import DisplayGameOVer from "../useful/DisplayGameOver"
import shuffle from "../useful/shuffleArray"

export default function WordsToMeaningGM({ sentGameObj, isEditing = false, storyid, addGameModeLocally, updateGamemodeDirectly }
    : { isEditing?: boolean, sentGameObj?: gameObjType, storyid?: string, addGameModeLocally?: (gamemode: gameObjType) => void, updateGamemodeDirectly?: boolean, storyId?: string }) {

    const [allServerFunctions,] = useAtom(allServerFunctionsAtom)

    const initialState: gameObjType = {
        boardObjId: uuidv4(),
        gameSelection: "wordmeaning",
        gameData: {
            gameDataFor: "wordmeaning",
            wordMeaningsArr: null
        } as wordsToMeaningType,
    }

    const [gameObj, gameObjSet] = useState<gameObjType>(sentGameObj ?? { ...initialState })

    let wordMeaningPairs: string[][] | null = [
        ['Serendipity', 'The occurrence of events by chance in a happy or beneficial way.'],
        ['Ephemeral', 'Lasting for a very short time.'], ['Ubiquitous', 'Present, appearing, or found everywhere.'],
        ['Eloquent', 'Fluent or persuasive in speaking or writing.'],
        ['Mellifluous', 'Sweet-sounding; smoothly flowing.'],
        ['Sycophant', 'A person who acts obsequiously towards someone important in order to gain advantage.'],
        ['Quixotic', 'Exceedingly idealistic; unrealistic and impractical.'],
        ['Benevolent', 'Well-meaning and kindly.'],
        ['Cacophony', 'A harsh, discordant mixture of sounds.'],
        ['Pernicious', 'Having a harmful effect, especially in a gradual or subtle way.']
    ];

    // wordMeaningPairs = null

    const [wordMeaningsArr, wordMeaningsArrSet] = useState<string[][]>(() => {
        return { ...gameObj?.gameData as wordsToMeaningType }.wordMeaningsArr ?? [[]]
    })


    //handle top level sentgameobj change
    const mounted = useRef(false)
    const amtTimesReset = useRef(0)
    useEffect(() => {
        if (mounted.current && sentGameObj) {
            const seenGameData = sentGameObj.gameData as wordsToMeaningType
            console.log(`$hey i should reset wordsToMeaning gamestate now`);

            gameObjSet({ ...sentGameObj })
            wordMeaningsArrSet(() => {
                return seenGameData.wordMeaningsArr ? [...seenGameData.wordMeaningsArr] : [[]]
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



    const submit = () => {

        const newObj: gameObjType = {
            ...gameObj,
            gameData: { ...gameObj.gameData as wordsToMeaningType, wordMeaningsArr: wordMeaningsArr }
        }

        if (addGameModeLocally) {
            addGameModeLocally(newObj)
        }

        if (updateGamemodeDirectly && storyid) {
            allServerFunctions!.updateGameModes(newObj, storyid, "normal")
        }
    }

    const [refresher, refresherset] = useState(0)

    const refreshGame = () => {
        refresherset(prev => prev + 1)
    }

    const [gameFinishedState, gameFinishedStateSet] = useState(() => {
        if (!isEditing) {
            const isGameOver = handleStoriesWhereGameOver(storyid!, gameObj.boardObjId, "read")
            return isGameOver!
        } else {
            return false
        }
    })

    return (
        <div className={`${styles.wordMeaningMainDiv} niceScrollbar`} style={{}}>
            {isEditing ? (
                <>
                    <div className={`${styles.wordMeaningMapCont} niceScrollbar`} style={{}}>
                        {wordMeaningsArr.map((eachWordArr, eachWordArrIndex) => {
                            return (
                                <div key={eachWordArrIndex} className={styles.eachWordMEaningDiv}>
                                    <div>
                                        <label>Word {wordMeaningsArr.length - eachWordArrIndex}</label>

                                        <input placeholder="Please enter a word" type="text" value={eachWordArr[0] ?? ""}
                                            onChange={(e) => {
                                                wordMeaningsArrSet(prevArr => {
                                                    const newArr = [...prevArr]
                                                    newArr[eachWordArrIndex][0] = e.target.value
                                                    return newArr
                                                })
                                            }} />
                                    </div>

                                    <div>
                                        <label>Word {wordMeaningsArr.length - eachWordArrIndex}&apos;s meaning</label>

                                        <input placeholder={eachWordArr[0] ? `Enter ${eachWordArr[0]}'s meaning` : "Enter a meaning"} type="text" value={eachWordArr[1] ?? ""}
                                            onChange={(e) => {
                                                wordMeaningsArrSet(prevArr => {
                                                    const newArr = [...prevArr]
                                                    newArr[eachWordArrIndex][1] = e.target.value
                                                    return newArr
                                                })
                                            }} />
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <button style={{ marginTop: "1rem" }} onClick={() => {
                        wordMeaningsArrSet(prevArr => {
                            const newArr = [[], ...prevArr]
                            return newArr
                        })
                    }}>Add another</button>

                    <DisplayWordMeanings key={refresher} refreshGame={refreshGame} wordMeaningsArr={wordMeaningsArr} isEditing={true} gameObj={gameObj} gameFinishedState={gameFinishedState} gameFinishedStateSet={gameFinishedStateSet} />
                    <button style={{}} onClick={submit}>Submit Gamemode</button>
                </>
            ) : (
                <>
                    <DisplayWordMeanings key={refresher} refreshGame={refreshGame} wordMeaningsArr={wordMeaningsArr} gameObj={gameObj} gameFinishedState={gameFinishedState} gameFinishedStateSet={gameFinishedStateSet} />
                </>
            )}
        </div>
    )
}


function DisplayWordMeanings({ isEditing = false, wordMeaningsArr, storyid, gameObj, gameFinishedState, gameFinishedStateSet, refreshGame }: { isEditing?: boolean, wordMeaningsArr: string[][], storyid?: string, gameObj: gameObjType, refreshGame: () => void, gameFinishedState: boolean, gameFinishedStateSet: React.Dispatch<React.SetStateAction<boolean>> }) {
    //isediting here used to send off gamestate to local storage or not

    const wordMeaningsAnswersArr = useMemo(() => {
        return [...wordMeaningsArr]
    }, [wordMeaningsArr])

    const shuffledWords = useMemo(() => {

        const flattendedArr: string[] = []
        wordMeaningsArr.forEach(eachStrArr => {
            flattendedArr.push(eachStrArr[0])
        })

        if (!isEditing) {
            //final mode
            const shuffleArr: string[] = shuffle(flattendedArr)
            return shuffleArr
        }

        return flattendedArr
    }, [wordMeaningsArr])

    const [userAnswersArr, userAnswersArrSet] = useState<string[][]>([])



    const seenOnPhone = useRef<boolean>(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))

    //write change to local storage
    const gameFinishedOnce = useRef(false)
    useEffect(() => {
        if (gameFinishedState) {
            gameFinishedOnce.current = true
        }

        if (gameFinishedOnce.current && !isEditing) {
            handleStoriesWhereGameOver(storyid!, gameObj.boardObjId, "update")
        }

    }, [gameFinishedState])

    //refs for each container
    const meaningWordHolders = useRef<HTMLDivElement[]>([])
    const addDivsTomeaningWordHolders = (e: HTMLDivElement | null, arrIndex: number) => {
        if (e !== null) {
            meaningWordHolders.current[arrIndex] = e
        }
    }

    //refs for each word
    const wordDivs = useRef<HTMLDivElement[]>([])
    const addDivsToWordDivs = (e: HTMLDivElement | null, arrIndex: number) => {
        if (e !== null) {
            wordDivs.current[arrIndex] = e
        }
    }

    const dragging = useRef<{ dx: number; dy: number } | null>(null);

    const activePos = useRef<{ x: number, y: number } | undefined>()

    const wordMapCont = useRef<HTMLDivElement>(null)

    const [isDragging, isDraggingSet] = useState(false)

    const displayWordMeaningsMapCont = useRef<HTMLDivElement>(null)

    const DisplayWordMeaningsMainDiv = useRef<HTMLDivElement>(null)

    function start(event: React.PointerEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) {
        event.preventDefault();
        isDraggingSet(true)

        if (seenOnPhone.current) {
            // console.log(`$hey started - touch`);

            event = event as React.TouchEvent<HTMLDivElement>
            const eventTouch = event.changedTouches?.[0]

            let { x, y } = { x: eventTouch?.clientX ?? 0, y: eventTouch?.clientY ?? 0 };

            activePos.current = { x: x, y: y }

            dragging.current = { dx: x, dy: y };

            const newEl = event.target as HTMLDivElement;
            newEl.style.position = "fixed"
            newEl.style.top = `${y}px`
            newEl.style.left = `${x}px`
            styleElMove(newEl, { x: 0, y: 0 })

        } else {
            event = event as React.PointerEvent<HTMLDivElement>

            // console.log(`$hey started - Pointer`);

            if (event.button! !== 0) return; // left button only

            let { x, y } = { x: event.clientX, y: event.clientY };

            activePos.current = { x: x, y: y }

            dragging.current = { dx: x, dy: y };

            const newEl = event.target as HTMLDivElement;
            newEl.setPointerCapture(event.pointerId!);

            newEl.style.position = "fixed"
            newEl.style.top = `${y}px`
            newEl.style.left = `${x}px`
            styleElMove(newEl, { x: 0, y: 0 })
        }
    }

    function end(event: React.PointerEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) {

        isDraggingSet(false)

        const seenWordEl = event.target as HTMLDivElement

        if (seenOnPhone.current) {
            // console.log(`$ended for touch`);
            dragging.current = null;
            findClosestElement(seenWordEl)

            seenWordEl.style.position = "relative"
            seenWordEl.style.translate = "0 0"
            seenWordEl.style.top = `${0}px`
            seenWordEl.style.left = `${0}px`

        } else {
            // console.log(`$ended for pointer`);
            dragging.current = null;
            findClosestElement(seenWordEl)

            seenWordEl.style.position = "relative"
            seenWordEl.style.translate = "0 0"
            seenWordEl.style.top = `${0}px`
            seenWordEl.style.left = `${0}px`
        }
    }

    const findClosestElement = (seenWordEl: HTMLDivElement) => {
        //get closest element
        meaningWordHolders.current.forEach((eachHolderDiv, eachHolderDivIndex) => {
            const { left, right, top, bottom } = eachHolderDiv.getBoundingClientRect()

            if (activePos.current!.x >= left && activePos.current!.x <= right) {
                if (activePos.current!.y >= top && activePos.current!.y <= bottom) {

                    const secondChild = eachHolderDiv.children[1];
                    eachHolderDiv.insertBefore(seenWordEl, secondChild);

                    userAnswersArrSet(prevUserAnswersArr => {
                        const newArr = prevUserAnswersArr.map(e => {
                            if (!e) e = []

                            //remove word if in array already on move
                            if (e[0] === seenWordEl.innerText) {
                                e[0] = ""
                            }

                            return e
                        })

                        newArr[eachHolderDivIndex] = [seenWordEl.innerText, eachHolderDiv.innerText]

                        //ensure that words ref divs are mapped correctly to the array

                        //get the topmost word seen in each containerindex, and assign it to the 0 index in word array
                        meaningWordHolders.current.forEach((eachContainerDiv, eachContainerDivIndex) => {
                            const secondChild = eachContainerDiv.children[1] as HTMLDivElement

                            if (secondChild) {
                                newArr[eachContainerDivIndex][0] = secondChild.innerText
                            }

                        })

                        return newArr
                    })
                }
            }
        })
    }

    function move(event: React.PointerEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) {
        event.preventDefault();

        scrollElement(event)

        if (!dragging.current) return


        if (seenOnPhone.current) {
            // console.log(`$moving touch`);
            event = event as React.TouchEvent<HTMLDivElement>

            if (!event.changedTouches) return

            const eventTouch = event.changedTouches[0]

            let { x, y } = { x: eventTouch.clientX, y: eventTouch.clientY };

            activePos.current = { x: x, y: y }

            if (!dragging.current) dragging.current = { dx: x - 1, dy: y - 1 }
            const activeOffset = { x: dragging.current!.dx - x, y: dragging.current!.dy - y }
            activeOffset.x *= -1
            activeOffset.y *= -1

            styleElMove(event.target as HTMLDivElement, { ...activeOffset })
        } else {
            // console.log(`$moving pointer`);
            event = event as React.PointerEvent<HTMLDivElement>

            let { x, y } = { x: event.clientX, y: event.clientY };

            activePos.current = { x: x, y: y }

            if (!dragging.current) dragging.current = { dx: x - 1, dy: y - 1 }
            const activeOffset = { x: dragging.current!.dx - x, y: dragging.current!.dy - y }
            activeOffset.x *= -1
            activeOffset.y *= -1
            styleElMove(event.target as HTMLDivElement, { ...activeOffset })
        }

    }

    const styleElMove = (element: HTMLDivElement, position: { x: number, y: number }) => {
        // const {width, height} = element.getBoundingClientRect()
        position.x -= element.clientWidth / 2
        position.y -= element.clientHeight / 2
        element.style.translate = `${position.x}px ${position.y}px`
    }

    const checkAnswers = () => {
        let amtCorrect = 0
        wordMeaningsAnswersArr.map((eachStrArr, eachStrArrIndex) => {
            if (!eachStrArr) eachStrArr = []

            if (eachStrArr[0] === userAnswersArr[eachStrArrIndex][0]) {
                amtCorrect += 1
            }
        })

        if (amtCorrect === wordMeaningsAnswersArr.length) {
            gameFinishedStateSet(true)
        }
    }

    const scrollElement = (event: React.PointerEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        if (!isDragging) return

        let posObj: { seenX: number, seenY: number } | undefined = undefined

        if (seenOnPhone.current) {
            event = event as React.TouchEvent<HTMLDivElement>

            if (!event.changedTouches) return

            const eventTouch = event.changedTouches[0]
            posObj = { seenX: eventTouch.clientX, seenY: eventTouch.clientY }

        } else {
            event = event as React.PointerEvent<HTMLDivElement>
            posObj = { seenX: event.clientX, seenY: event.clientY }

        }
        const { left: windowMin, right: windowMax } = DisplayWordMeaningsMainDiv.current!.getBoundingClientRect()
        const rangeBuffer = 60

        if (!posObj) return

        if (posObj.seenX >= windowMin && posObj.seenX <= windowMin + rangeBuffer) {
            displayWordMeaningsMapCont.current!.scrollLeft -= 4
        } else if (posObj.seenX >= windowMax - rangeBuffer && posObj.seenX <= windowMax) {
            displayWordMeaningsMapCont.current!.scrollLeft += 4
        }
    }

    const [theme, themeSet] = useAtom(globalTheme)

    return (
        <div className={styles.DisplayWordMeaningsMainDiv} ref={DisplayWordMeaningsMainDiv}>
            <DisplayGameOVer gameOver={gameFinishedState}>
                <div ref={displayWordMeaningsMapCont} className={`${styles.displayWordMeaningsMapCont} niceScrollbar`}>
                    {wordMeaningsAnswersArr.map((eachWordArray, eachWordArrayIndex) => {
                        return (
                            <div key={eachWordArrayIndex} className="niceScrollbar" style={{ backgroundColor: theme ? "#ffe0b2" : "var(--textColorAnti)" }} ref={(e) => addDivsTomeaningWordHolders(e, eachWordArrayIndex)}
                            >
                                {eachWordArray[1]}
                                <svg onClick={() => {
                                    const firstWordEl = meaningWordHolders.current[eachWordArrayIndex].children[1] as HTMLDivElement
                                    const seenWord = firstWordEl.innerText

                                    //remove word if in array already
                                    userAnswersArrSet(prevUserAnswersArr => {
                                        const newArr = prevUserAnswersArr.map(e => {
                                            if (!e) e = []

                                            if (e[0] === seenWord) {
                                                e[0] = ""
                                            }

                                            return e
                                        })

                                        return newArr

                                    })

                                    wordDivs.current.forEach((eachDiv) => {
                                        if (eachDiv.innerText === seenWord) {
                                            const parentEl = wordMapCont.current!
                                            const firstChild = parentEl.firstChild;
                                            parentEl!.insertBefore(eachDiv, firstChild);
                                        }
                                    })

                                }} className={styles.closeWord} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"></path></svg>
                            </div>
                        )
                    })}
                </div>

                <div className={`${styles.displayWordsMap} niceScrollbar`} ref={wordMapCont}>
                    {shuffledWords.map((eachWord, eachWordIndex) => {
                        return (
                            <div className={styles.displayWordsMapwords} key={eachWordIndex} draggable={false} ref={(e) => { addDivsToWordDivs(e, eachWordIndex) }}

                                onPointerDown={(e) => {
                                    if (!seenOnPhone.current) {
                                        start(e)
                                    }
                                }}
                                onPointerMove={(e) => {
                                    if (!seenOnPhone.current) {
                                        move(e)
                                    }
                                }}
                                onPointerUp={(e) => {
                                    if (!seenOnPhone.current) {
                                        end(e)
                                    }
                                }}
                                onPointerCancel={(e) => {
                                    if (!seenOnPhone.current) {
                                        end(e)
                                    }
                                }}

                                //handles mobile actions
                                onTouchStart={start}
                                onTouchMove={move}
                                onTouchEnd={end}
                                onTouchCancel={end}
                            >
                                {eachWord}
                            </div>
                        )
                    })}
                </div>
            </DisplayGameOVer>


            {!gameFinishedState && wordMapCont.current?.children.length === 0 && <button onClick={checkAnswers}>Check Answers</button>}
            {gameFinishedState && <button onClick={() => {
                refreshGame()
                gameFinishedStateSet(false)
            }}>Refresh</button>}
        </div>
    )

}


