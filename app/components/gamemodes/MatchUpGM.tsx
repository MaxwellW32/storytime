"use client"
import { useState, useEffect, useMemo, useRef, ReactNode } from "react"
import { v4 as uuidv4 } from "uuid";
import styles from "./style.module.css"
import { gameObjType, gameSelectionTypes, matchupType, storyBoardType, updateGameModesParams } from "@/app/page";

import { handleStoriesWhereGameOver } from "@/app/utility/savestorage";
import DisplayGameOVer from "../useful/DisplayGameOver";
import { useAtom } from "jotai";
import { allServerFunctionsAtom, globalTheme } from "@/app/utility/globalState";
import shuffle from "../useful/shuffleArray";
import ChangePassword from "../useful/ChangePassword";
import AddPassword from "../useful/AddPassword";
import ShowServerErrors from "../useful/ShowServerErrors";


export default function MatchUpGM({ gameObj, isEditing = false, storyid, addGameModeLocally, updateGamemodeDirectly, sentDirectlyFromMaker }: {
    gameObj?: gameObjType,
    isEditing?: boolean,
    storyid?: string,
    addGameModeLocally?: (gamemode: gameObjType) => void,
    updateGamemodeDirectly?: boolean,
    sentDirectlyFromMaker?: boolean
}) {

    const [allServerFunctions,] = useAtom(allServerFunctionsAtom)

    const gameSelection = useRef<gameSelectionTypes>(gameObj?.gameSelection ?? "matchup")

    const boardObjId = useRef<string>(gameObj?.boardObjId ?? uuidv4())

    const [gameData, gameDataSet] = useState<matchupType>(() => {
        const newObj: matchupType = {
            gameDataFor: "matchup",
            choicesArr: null,
            questionsArr: null
        }

        const seenData = gameObj?.gameData as matchupType
        return seenData ? { ...seenData } : { ...newObj }
    })

    const [questions, questionsSet] = useState<string[]>(() => {
        return gameData.questionsArr ?? [""]
    })

    const [choices, choicesSet] = useState<string[][]>(() => {
        return gameData.choicesArr ?? questions.map(() => [""])
    })

    const [gameFinishedState, gameFinishedStateSet] = useState<boolean>(() => {
        if (!isEditing) {
            const isGameOver = handleStoriesWhereGameOver(storyid!, boardObjId.current, "read")
            return isGameOver!
        } else {
            return false
        }
    })

    const [gamePass, gamePassSet] = useState("")

    const [errorsSeen, errorsSeenSet] = useState<{
        [key: string]: string
    }>()

    const [clickedSubmitOnce, clickedSubmitOnceSet] = useState(false)

    //handle top level sentgameobj change
    const mounted = useRef(false)
    const amtTimesReset = useRef(0)
    useEffect(() => {
        if (mounted.current && gameObj) {
            const seenGameData = gameObj.gameData as matchupType
            console.log(`$hey i should reset the gamestate now`);

            gameDataSet(seenGameData)
            questionsSet(seenGameData.questionsArr ?? ["", "", "", ""])
            choicesSet(() => {
                return seenGameData.choicesArr ?? questions.map(eachItem => {
                    return [""]
                })
            })
            gameSelection.current = gameObj.gameSelection ?? "matchup"
            boardObjId.current = gameObj.boardObjId ?? uuidv4()
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
    }, [gameObj])


    async function submit() {
        if (sentDirectlyFromMaker) {
            clickedSubmitOnceSet(true)
        }
        //local submit to parent make Story - saved to the storyTextboard
        const newGameMode: gameObjType = {
            gameSelection: gameSelection.current,
            gameData: {
                ...gameData,
                choicesArr: choices,
                questionsArr: questions
            },
            boardObjId: boardObjId.current,
            gamePass: gamePass
        }

        if (addGameModeLocally) {
            addGameModeLocally(newGameMode)
        }

        if (updateGamemodeDirectly && storyid) {

            const serverMessageObj = await allServerFunctions!.updateGameModes(newGameMode, storyid, "normal")

            if (serverMessageObj["message"].length !== 0) {
                errorsSeenSet(serverMessageObj)
            } else {
                errorsSeenSet(undefined)
            }
        }
    }

    //write change to local storage
    const gameFinishedOnce = useRef(false)
    useEffect(() => {
        if (gameFinishedState) {
            gameFinishedOnce.current = true
        }

        if (gameFinishedOnce.current && !isEditing) {
            handleStoriesWhereGameOver(storyid!, boardObjId.current, "update")
        }

    }, [gameFinishedState])

    const questionInputMapCont = useRef<HTMLDivElement>(null)

    const [refresher, refresherSet] = useState(0)
    function refreshGame() {
        gameFinishedStateSet(false)
        refresherSet(prev => prev + 1)
    }

    return (
        <div className={styles.gmMainDiv} style={{}}>
            {isEditing ? (
                <>
                    <div ref={questionInputMapCont} className={`${styles.questionInputMapCont} niceScrollbar`}>
                        {questions.map((temp, questionsIndex) => (
                            <div className={styles.questionDiv} key={questionsIndex}>
                                <div style={{ display: "flex", gap: ".7rem" }}>
                                    <label>Question {questionsIndex + 1}</label>

                                    <svg className={styles.deleteQuestion}
                                        onClick={() => {
                                            if (questions.length > 1) {
                                                questionsSet(prevQuestions => {
                                                    return prevQuestions.filter((eachQuestion, qindex) => qindex !== questionsIndex)
                                                })

                                                choicesSet(prevChoices => {
                                                    return prevChoices.filter((eachStrArr, seeIn) => questionsIndex !== seeIn)
                                                })
                                            }
                                        }}
                                        xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" /></svg>
                                </div>

                                <input style={{ width: "100%" }} type='text' placeholder={`Enter Question ${questionsIndex + 1}`} value={questions[questionsIndex] ?? ""} onChange={(e) => {
                                    questionsSet(prevQuestions => {
                                        const newQuestions = [...prevQuestions]

                                        newQuestions[questionsIndex] = e.target.value

                                        return newQuestions
                                    })
                                }} />

                                <div className={styles.choicesMapCont}>
                                    {choices[questionsIndex]?.map((eachChoice, smallerIndex) => (
                                        <div key={`${questionsIndex}${smallerIndex}`} className={styles.choiceInputDiv} style={{}}>
                                            <input type='text' placeholder={`Choice ${smallerIndex + 1}`}
                                                value={choices[questionsIndex][smallerIndex] ?? ""} onChange={(e) => {
                                                    choicesSet(prevChoices => {
                                                        const newChoices = prevChoices.map(e => {
                                                            if (!e) e = []
                                                            return e
                                                        })

                                                        newChoices[questionsIndex][smallerIndex] = e.target.value

                                                        return newChoices
                                                    })
                                                }} />

                                            <svg className={styles.deleteChoice}
                                                onClick={() => {
                                                    if (choices[questionsIndex].length > 1) {
                                                        choicesSet(prevChoices => {
                                                            const newChoices = prevChoices.map(e => {
                                                                if (!e) e = []
                                                                return e
                                                            })
                                                            newChoices[questionsIndex] = newChoices[questionsIndex].filter((each, eachInd) => eachInd !== smallerIndex)
                                                            return newChoices
                                                        })
                                                    }
                                                }}
                                                xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" /></svg>
                                        </div>
                                    ))}
                                </div>

                                <button className='secondButton' onClick={() => {
                                    choicesSet(prevArr => {
                                        const updatedChoices = prevArr.map(e => e)
                                        updatedChoices[questionsIndex] = [...updatedChoices[questionsIndex], ""]
                                        return updatedChoices;
                                    })

                                }}>Add Choice</button>
                            </div>
                        ))}
                    </div>

                    <button className='secondButton' style={{ borderRadius: ".2rem" }} onClick={() => {

                        questionsSet(prevQuestions => {
                            const newQuestions = [...prevQuestions, ""]
                            return newQuestions
                        })


                        choicesSet(prevArr => {
                            const updatedChoices = [...prevArr, [""]]

                            return updatedChoices;
                        })

                        setTimeout(() => {
                            questionInputMapCont.current!.scrollLeft = questionInputMapCont.current!.scrollWidth - questionInputMapCont.current!.clientWidth
                        }, 100)

                    }}>Add Question</button>

                    <DisplayMatchupGM key={refresher} questions={questions} choices={choices} isEditing={true} refreshGame={refreshGame} gameFinishedState={gameFinishedState} gameFinishedStateSet={gameFinishedStateSet} />

                    <ShowServerErrors errorsSeen={errorsSeen} />
                    {/* Do local function first entirely */}

                    {addGameModeLocally && (
                        <>
                            {sentDirectlyFromMaker && !clickedSubmitOnce && <AddPassword option="gamemode" password={gamePass} storyPasswordSet={gamePassSet} />}

                            {(gamePass || !sentDirectlyFromMaker) && <button onClick={() => {
                                submit()
                            }}>Submit Gamemode</button>}
                        </>
                    )}

                    {updateGamemodeDirectly && (
                        <>
                            {!sentDirectlyFromMaker && <ChangePassword option="gamemode" password={gamePass} storyId={storyid!} storyPasswordSet={gamePassSet} gamemodeObjId={gameObj!.boardObjId} />}

                            {<AddPassword option="gamemode" password={gamePass} storyPasswordSet={gamePassSet} showFieldOnly={sentDirectlyFromMaker ? true : undefined} />}

                            {gamePass && <button onClick={() => {
                                submit()
                            }}>Submit Gamemode</button>}
                        </>
                    )}
                </>
            ) : (
                <div >
                    <DisplayMatchupGM key={refresher} isEditing={false} questions={questions} choices={choices} refreshGame={refreshGame} gameFinishedState={gameFinishedState} gameFinishedStateSet={gameFinishedStateSet} />
                </div>
            )}

        </div>
    )

}

function DisplayMatchupGM({ questions, choices, isEditing, gameFinishedState, gameFinishedStateSet, refreshGame }: { questions: string[], choices: string[][], isEditing: boolean, gameFinishedState: boolean, gameFinishedStateSet: React.Dispatch<React.SetStateAction<boolean>>, refreshGame: () => void }) {

    const [userAnswers, userAnswersSet] = useState<string[][]>([])

    const [shuffledChoices, shuffledChoicesSet] = useState<string[]>([])

    useEffect(() => {
        let flattendedArr = [...[] as string[]].concat(...choices)

        if (!isEditing) {
            //final mode
            let currentIndex = choices.length, randomIndex;

            // While there remain elements to shuffle.
            while (currentIndex > 0) {

                // Pick a remaining element.
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex--;

                // And swap it with the current element.
                [choices[currentIndex], choices[randomIndex]] = [choices[randomIndex], choices[currentIndex]];
                [questions[currentIndex], questions[randomIndex]] = [questions[randomIndex], questions[currentIndex]];
            }

            flattendedArr = [...[] as string[]].concat(...choices)

            shuffledChoicesSet(shuffle(flattendedArr))
            return
        }

        shuffledChoicesSet(flattendedArr)
    }, [choices])

    function checkAnswers() {

        let globalAmtCorrect = 0

        // console.log(`$userAnswers`, userAnswers);
        // console.log(`$choices`, choices);

        userAnswers.forEach((userAnsStrArr, index) => {
            let correctCount = 0
            userAnsStrArr.forEach((eachAnsStr, smallIndex) => {
                choices[index].forEach(eachChoiceStr => {
                    if (eachAnsStr === eachChoiceStr) {
                        correctCount++
                    }
                })

            })

            if (correctCount === choices[index].length) {
                globalAmtCorrect++
            }

        })


        // console.log(`$seen globalAmtCorrect ${globalAmtCorrect} questions.length ${questions.length} `);
        if (globalAmtCorrect === questions.length) {
            // console.log(`$seen correct`);
            gameFinishedStateSet(true)
        }
    }



    const seenOnPhone = useRef<boolean>(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))

    const ogChoicesHolder = useRef<HTMLDivElement>(null)

    const dragging = useRef<{ dx: number; dy: number } | null>(null);

    const activePos = useRef<{ x: number, y: number } | undefined>()

    //refs for each container
    const questionsContainers = useRef<HTMLDivElement[]>([])
    const addToQuestionsContainers = (e: HTMLDivElement | null, arrIndex: number) => {
        if (e !== null) {
            questionsContainers.current[arrIndex] = e
        }
    }

    //refs for each word
    const choiceDivs = useRef<HTMLDivElement[]>([])
    const addToChoiceDivs = (e: HTMLDivElement | null, arrIndex: number) => {
        if (e !== null) {
            choiceDivs.current[arrIndex] = e
        }
    }

    function start(event: React.PointerEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) {
        event.preventDefault();

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
        questionsContainers.current.forEach((eachContDiv, eachContDivIndex) => {
            const { left, right, top, bottom } = eachContDiv.getBoundingClientRect()

            if (activePos.current!.x >= left && activePos.current!.x <= right) {
                if (activePos.current!.y >= top && activePos.current!.y <= bottom) {

                    eachContDiv.insertBefore(seenWordEl, eachContDiv.children[0]);

                    userAnswersSet(prevUserAns => {

                        if (!prevUserAns[eachContDivIndex]) prevUserAns[eachContDivIndex] = []

                        //filter from array
                        const filteredArr = prevUserAns.map(eachStrArr => {
                            return eachStrArr.filter(eachStr => eachStr !== seenWordEl.innerText)
                        })

                        filteredArr[eachContDivIndex] = [seenWordEl.innerText, ...filteredArr[eachContDivIndex]]

                        return filteredArr
                    })
                }
            }
        })
    }

    function move(event: React.PointerEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) {
        event.preventDefault();

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
        position.x -= element.clientWidth / 2
        position.y -= element.clientHeight / 2
        element.style.translate = `${position.x}px ${position.y}px`
    }

    return (
        <div className={styles.displayMathcupMainDiv} style={{}}>
            <DisplayGameOVer gameOver={gameFinishedState}>
                <div className={`${styles.questionsGrid} niceScrollbar`} style={{}}>
                    {questions?.map((eachQuestion, questionContIndex) => {
                        return (
                            <div key={questionContIndex} className={`${styles.eachQuestionCont} niceScrollbar`} ref={(e) => { addToQuestionsContainers(e, questionContIndex) }}>
                                {eachQuestion}
                            </div>
                        )
                    })}
                </div>

                <div className={styles.choiceDisplayMapCont} ref={ogChoicesHolder}>{shuffledChoices.map((eachChoice, eachChoiceIndex) => {
                    return (
                        <div className={styles.eachChoice} key={eachChoiceIndex} ref={(e) => { addToChoiceDivs(e, eachChoiceIndex) }}

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
                            onTouchCancel={end}>{eachChoice}</div>
                    )
                })}
                </div>
            </DisplayGameOVer>

            {gameFinishedState ? (
                <button className='secondButton' onClick={refreshGame}>Game Finished - refresh?</button>
            ) : (
                <>
                    {ogChoicesHolder.current?.children.length === 0 && <button className='secondButton' onClick={checkAnswers}>Check Answers</button>}
                </>
            )}
        </div>
    )
}

