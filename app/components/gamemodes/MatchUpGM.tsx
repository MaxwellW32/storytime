"use client"
import { useState, useEffect, useMemo, useRef } from "react"
import { v4 as uuidv4 } from "uuid";
import styles from "./style.module.css"
import { gameObjType, matchupType, storyBoardType } from "@/app/page";


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
import Container from "@/app/using/container";


export default function MatchUpGM({ gameSelection, boardObjId, shouldStartOnNewPage, gameFinished, gameData, isEditing = false, handleStoryBoard, sendUpdatedGameOver }: gameObjType & {
    isEditing?: boolean
    handleStoryBoard?: (option: string, seenBoardId: string, newBoardData?: storyBoardType) => void,
    sendUpdatedGameOver?: (seenObjId: string) => void
}) {


    const [questions, questionsSet] = useState<string[]>(() => {

        return { ...gameData as matchupType }.questionsArr ?? ["", "", "", ""]
    })

    const [choices, choicesSet] = useState<string[][]>(() => {

        return { ...gameData as matchupType }.choicesArr ?? questions.map(eachItem => {
            return [""]
        })
    })

    const [gameFinishedState, gameFinishedStateSet] = useState(gameFinished)

    const [userAnswers, userAnswersSet] = useState<string[][]>([])

    const [activeId, setActiveId] = useState<null>();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates
        })
    );

    const handleItemsWithChanges = () => {

        //get all data, questions, choices, display em
        let newItemObj: {
            [key: string]: any
        } = {

        }

        questions.forEach((eachQuestion, index) => {
            newItemObj[`container${index}`] = []
        })

        const choicesStringArray: string[] = []

        //flatten the array of arrays into 1 string array
        choices.forEach((choiceStrArr, index) => {
            choiceStrArr.forEach((strVal) => {

                if (strVal !== "") {
                    choicesStringArray.push(strVal)
                }
            })
        })

        //randomize string arrays
        for (let i = choicesStringArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [choicesStringArray[i], choicesStringArray[j]] = [choicesStringArray[j], choicesStringArray[i]];
        }

        newItemObj["root"] = choicesStringArray

        return { ...newItemObj }
    }

    const [items, setItems] = useState<any>(() => handleItemsWithChanges());

    function submitNewGameModeObj() {
        //local submit to parent make Story - saved to the storyTextboard
        const newGameMode: gameObjType = {
            gameSelection: gameSelection,
            gameData: {
                gameDataFor: "matchup",
                choicesArr: choices!,
                questionsArr: questions!
            },
            gameFinished: gameFinished,
            shouldStartOnNewPage: shouldStartOnNewPage,
            boardType: "gamemode",
            boardObjId: boardObjId
        }

        if (handleStoryBoard) {
            handleStoryBoard("update", boardObjId, newGameMode)
        }
    }

    function checkAnswers() {

        let globalAmtCorrect = 0

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

        if (globalAmtCorrect === questions.length) {
            gameFinishedStateSet(true)
        }
    }

    function refreshGame() {
        gameFinishedStateSet(false)
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
                    return newArr

                } else {
                    const clearUsrAnsArr = newArr.map((eachStrArr, index) => {
                        if (!eachStrArr) {
                            return [""]

                        } else {
                            return eachStrArr.filter(eachStr => {
                                if (eachStr !== seenText) {
                                    return eachStr
                                } else {
                                    return ""
                                }
                            })
                        }
                    })

                    clearUsrAnsArr[containerIndex] = [...clearUsrAnsArr[containerIndex], seenText]

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

    useEffect(() => {
        setItems(handleItemsWithChanges())
    }, [questions, choices])


    const [loadButtonClicked, loadButtonClickedSet] = useState(false)
    useEffect(() => {
        if (loadButtonClicked) {
            submitNewGameModeObj()
            loadButtonClickedSet(false)
        }

    }, [loadButtonClicked])

    //update global state if in final view and game finished
    useEffect(() => {
        if (gameFinishedState !== gameFinished && sendUpdatedGameOver) {
            sendUpdatedGameOver(boardObjId)
        }
    }, [gameFinishedState])

    const questionInputRefs = useRef<HTMLInputElement[]>([null!])
    const addQuestionInputsToRef = (ref: HTMLInputElement | null, indexToAdd: number) => {
        // console.log(`$seeing index ${indexToAdd}, ref`, ref);
        if (ref === null) return
        questionInputRefs.current[indexToAdd] = ref
    }

    const choiceInputRefs = useRef<HTMLInputElement[][]>([[null!]])
    const addChoiceInputsToRef = (ref: HTMLInputElement | null, largeIndexToAdd: number, smallIndexToAdd: number) => {
        // console.log(`$seeing largeindex ${largeIndexToAdd}, small ${smallIndexToAdd}, ref`, ref);

        if (ref === null) return

        if (!choiceInputRefs.current[largeIndexToAdd]) {
            choiceInputRefs.current[largeIndexToAdd] = []
        }

        if (!choiceInputRefs.current[largeIndexToAdd][smallIndexToAdd]) {
            choiceInputRefs.current[largeIndexToAdd][smallIndexToAdd] = ref
        }

        choiceInputRefs.current[largeIndexToAdd][smallIndexToAdd] = ref

    }

    const loadValues = () => {
        const newQuestionsArr: string[] = []
        questionInputRefs.current.forEach((eachInput, index) => {
            newQuestionsArr.push(eachInput.value)
            // console.log(`$questions pos ${index}`, eachInput.value);
        })
        questionsSet(newQuestionsArr)

        const newChoicesArr: string[][] = []
        choiceInputRefs.current.forEach((inputArr, index) => {
            newChoicesArr.push([])

            inputArr.forEach((eachChoiceInput, smallerIndex) => {
                newChoicesArr[index].push("")
                newChoicesArr[index][smallerIndex] = eachChoiceInput.value

                // console.log(`$choices large pos ${index}, smaller pos: ${smallerIndex}`, eachChoiceInput.value);
            })
        })
        choicesSet(newChoicesArr)

        loadButtonClickedSet(true)
    }

    return (
        <div className={styles.gmMainDiv} style={{ scale: gameFinishedState ? .9 : 1 }}>
            {isEditing ? (
                <>
                    {questions.map((temp, index) => (
                        <div className={styles.questionCont} key={uuidv4()}>
                            <div style={{ display: "flex", gap: ".7rem" }}>
                                <label>Question {index + 1}</label>

                                <svg className={styles.deleteQuestion}
                                    onClick={() => {
                                        questionInputRefs.current = questionInputRefs.current.filter((eq, seenIndex) => seenIndex !== index)
                                        choiceInputRefs.current = choiceInputRefs.current.filter((eachchoiceArr, seenIndex) => seenIndex !== index)
                                        loadValues()
                                    }}
                                    xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" /></svg>
                            </div>
                            <input ref={(e) => { addQuestionInputsToRef(e, index) }} style={{ width: "100%" }} type='text' placeholder={`Enter Question ${index + 1}`} defaultValue={questions[index]} />



                            {choices && choices[index] && (
                                <>
                                    <div className={styles.choicesDivCont}>
                                        {choices[index].map((choice, smallerIndex) => (
                                            <div style={{ display: "flex", gap: ".5rem" }}>
                                                <input ref={(e) => { addChoiceInputsToRef(e, index, smallerIndex) }} key={uuidv4()} type='text' placeholder={`Answer ${smallerIndex + 1}`}
                                                    defaultValue={choices[index][smallerIndex]} />

                                                <svg className={styles.deleteChoice}
                                                    onClick={() => {
                                                        choiceInputRefs.current = choiceInputRefs.current.map((eachchoiceArr, seenBigIndex) => {
                                                            if (seenBigIndex === index) {

                                                                if (eachchoiceArr.length > 1) {
                                                                    return eachchoiceArr.filter((eachChoice, smallseenIndex) => {
                                                                        if (smallseenIndex !== smallerIndex) {
                                                                            return eachChoice
                                                                        }
                                                                    })
                                                                } else {
                                                                    return eachchoiceArr
                                                                }
                                                            } else {
                                                                return eachchoiceArr
                                                            }
                                                        })
                                                        loadValues()
                                                    }}
                                                    xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" /></svg>

                                            </div>
                                        ))}
                                    </div>

                                    <button className='secondButton' onClick={() => {

                                        loadValues()


                                        choicesSet(prevArr => {
                                            const updatedChoices = prevArr.map((arr, i) => {
                                                if (i === index) {
                                                    return [...arr, ""];
                                                } else {
                                                    return arr;
                                                }

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

                        loadValues()


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

                    <button onClick={loadValues}>Load Game Board</button>


                    <DndContext
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

                            {questions?.map((eachQuestion, index) => {
                                return (
                                    <Container key={uuidv4()} id={`container${index}`} items={items[`container${index}`]} arrPos={index} questionAsked={eachQuestion} />
                                )
                            })}
                        </div>
                        <Container id="root" items={items.root} arrPos={4} />

                    </DndContext>

                    {gameFinishedState ? (
                        <button className='secondButton' onClick={refreshGame}>Game Finished - refresh?</button>
                    ) : (
                        <button className='secondButton' onClick={checkAnswers}>Check Answers</button>
                    )}

                </>
            ) : (


                <>
                    <DndContext
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



                    {gameFinishedState ? (
                        <button className='secondButton' onClick={refreshGame}>Game Finished - refresh?</button>
                    ) : (
                        <button className='secondButton' onClick={checkAnswers}>Check Answers</button>
                    )}
                </>
            )
            }
        </div>
    )

}
