"use client"
import styles from "./style.module.css"
import { useRef, useEffect, useState, useMemo } from "react"
import { crosswordType, gameObjType, storyBoardType, updateGameModesParams } from "@/app/page"
import { handleStoriesWhereGameOver } from "@/app/utility/savestorage"
import DisplayGameOVer from "../useful/DisplayGameOver"
import { v4 as uuidv4 } from "uuid";
import { useAtom } from "jotai"
import { allServerFunctionsAtom } from "@/app/utility/globalState"


export default function CrosswordGM({ sentGameObj, isEditing = false, storyid, addGameModeLocally, updateGamemodeDirectly }:
    { sentGameObj?: gameObjType, isEditing?: boolean, storyid?: string, addGameModeLocally?: (gamemode: gameObjType) => void, updateGamemodeDirectly?: boolean, storyId?: string }) {

    const [allServerFunctions,] = useAtom(allServerFunctionsAtom)

    const initialState: gameObjType = {
        boardObjId: uuidv4(),
        gameData: {
            gameDataFor: "crossword",
            wordArray: null,
            hintObj: null
        } as crosswordType,
        gameSelection: "crossword"
    }

    const [gameObj, gameObjSet] = useState<gameObjType>(sentGameObj ? { ...sentGameObj } : { ...initialState })

    // const myWords = ["apple", "banana", "cherry", "dog", "elephant", "flower", "grape", "house", "igloo", "jacket", "kiwi", "lemon", "melon", "orange", "penguin", "queen", "rabbit", "strawberry", "turtle", "umbrella"];

    const [wordsArray, wordsArraySet] = useState<string[]>(() => {
        return { ...gameObj?.gameData as crosswordType }.wordArray ?? []
    })

    //each obj key is a word, the hint is the value

    const [hintObj, hintObjSet] = useState(() => {
        const newHintObj: {
            [key: string]: string
        } = {}

        wordsArray.forEach(eachWord => {
            newHintObj[eachWord] = ""
        })

        return { ...gameObj?.gameData as crosswordType }.hintObj ?? {}
    })

    //handle top level sentgameobj change
    const mounted = useRef(false)
    const amtTimesReset = useRef(0)

    useEffect(() => {
        if (mounted.current && sentGameObj) {
            const seenGameData = sentGameObj.gameData as crosswordType
            console.log(`$hey i should reset crossword gamestate now`);

            gameObjSet(sentGameObj)
            wordsArraySet(seenGameData.wordArray ?? [])
            hintObjSet(() => {
                const newHintObj: {
                    [key: string]: string
                } = {}

                wordsArray.forEach(eachWord => {
                    newHintObj[eachWord] = ""
                })

                return { ...gameObj?.gameData as crosswordType }.hintObj ?? {}
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

    const [wordArrSkipIndex, wordArrSkipIndexSet] = useState(0)

    const [gameFinishedState, gameFinishedStateSet] = useState(() => {
        if (!isEditing) {
            const isGameOver = handleStoriesWhereGameOver(storyid!, gameObj.boardObjId, "read")
            return isGameOver!
        } else {
            return false
        }
    })

    //function that gets current value from local storage
    //allow freely to switch back and forth


    const submit = () => {

        const newObj: gameObjType = {
            ...gameObj,
            gameData: { ...gameObj.gameData as crosswordType, wordArray: wordsArray, hintObj: hintObj }
        }

        if (addGameModeLocally) {
            addGameModeLocally(newObj)
        }

        if (updateGamemodeDirectly && storyid) {
            allServerFunctions!.updateGameModes(newObj, storyid, "normal")
        }

        // gameObjSet({ ...initialState })
        // wordsArraySet([])
    }

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


    const inputRef = useRef<HTMLInputElement>(null!)

    //load up tiles
    useEffect(() => {
        if (isEditing) inputRef.current.value = ""
    }, [wordsArray])


    const addWord = () => {
        if (inputRef.current.value) {
            wordsArraySet(prevwordsArr => {

                let newArr = []
                if (prevwordsArr) {
                    newArr = [...prevwordsArr, inputRef.current.value]
                } else {
                    newArr = [inputRef.current.value]
                }

                return newArr
            })
        }
    }

    //ensure wordArrSkipIndex is always in range - handle hintObjData
    useEffect(() => {
        if (wordArrSkipIndex > wordsArray.length - 1) {
            wordArrSkipIndexSet(wordsArray.length - 1 >= 0 ? wordsArray.length - 1 : 0)
        }

        //ensure word values not in array are removed from obj
        Object.keys(hintObj).forEach(eachHintKey => {
            let seenInArr = false

            wordsArray.forEach(eachWord => {
                if (eachWord === eachHintKey) {
                    seenInArr = true
                }
            })

            if (!seenInArr) {
                // hintObj
                hintObjSet(prevHintObj => {
                    const newHintObj = { ...prevHintObj }
                    delete newHintObj[eachHintKey];
                    return newHintObj
                })
            }

        })
    }, [wordsArray])

    const [refresher, refresherSet] = useState(0)

    const refresh = () => {
        refresherSet(prev => prev + 1)
        gameFinishedStateSet(false)
    }

    return (
        <div className={styles.crossWordMain} style={{}}>
            {isEditing ? (
                <div style={{ display: "grid" }} >
                    <label>Enter Words you&apos;d like to appear in the Crossword</label>

                    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", margin: "1rem" }}>
                        {wordsArray.map((eachWord, index) => {
                            return (
                                <div key={index} style={{ position: "relative", backgroundColor: "var(--thirdColor)", borderRadius: ".7rem", borderTopRightRadius: 0, padding: ".5rem" }}>
                                    <svg style={{ position: "absolute", top: 0, right: 0, width: ".8rem", fill: "white" }} onClick={() => {
                                        wordsArraySet(prevWordsArr => {
                                            const filteredArr = prevWordsArr.filter((eachWord, wordIndex) => index !== wordIndex)
                                            return filteredArr
                                        })
                                    }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" /></svg>

                                    <p>{eachWord}</p>
                                </div>
                            )
                        })}
                    </div>

                    <input ref={inputRef} placeholder="Enter a word" onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            addWord()
                        }
                    }} type="text" />

                    <button onClick={addWord}>Submit Word</button>

                    {wordsArray[wordArrSkipIndex] && (
                        <div style={{ display: "flex", flexWrap: "wrap", justifySelf: "center", gap: ".5rem", alignItems: "center" }}>
                            <button onClick={() => {
                                wordArrSkipIndexSet(prev => {
                                    let newNum = prev - 1
                                    return newNum >= 0 ? newNum : 0
                                })
                            }}>Prev Hint</button>

                            <div style={{ display: "flex", flexDirection: "column" }}>
                                <label>Set a hint for &apos;{wordsArray[wordArrSkipIndex]}&apos;?</label>
                                <input type="text" placeholder="Enter a hint" value={hintObj[wordsArray[wordArrSkipIndex]] ?? ""} onChange={(e) => {
                                    hintObjSet(prevHintObj => {
                                        const newHintObj = { ...prevHintObj }
                                        newHintObj[wordsArray[wordArrSkipIndex]] = e.target.value
                                        return newHintObj
                                    })
                                }} />
                            </div>

                            <button onClick={() => {
                                wordArrSkipIndexSet(prev => {
                                    let newNum = prev + 1
                                    const maxArrIndex = wordsArray.length - 1
                                    return newNum <= maxArrIndex ? newNum : maxArrIndex
                                })
                            }}>Next Hint</button>
                        </div>
                    )}

                    <DisplayCrossWord key={refresher} gameFinishedState={gameFinishedState} gameFinishedStateSet={gameFinishedStateSet} refresh={refresh} hintObj={hintObj} isEditing={true} wordsArray={wordsArray} />

                    <button style={{ marginTop: "1rem" }} onClick={submit}>Submit Gamemode</button>
                </div>

            ) : (
                <DisplayCrossWord key={refresher} gameFinishedState={gameFinishedState} gameFinishedStateSet={gameFinishedStateSet} refresh={refresh} hintObj={hintObj} isEditing={false} wordsArray={wordsArray} />
            )}
        </div>
    )
}












function DisplayCrossWord({ wordsArray, hintObj, isEditing, gameFinishedState, gameFinishedStateSet, refresh }: { wordsArray: string[], hintObj: { [key: string]: string }, isEditing: boolean, gameFinishedState: boolean, gameFinishedStateSet: React.Dispatch<React.SetStateAction<boolean>>, refresh: () => void }) {

    const spawnPointRef = useRef<HTMLDivElement>(null!)
    const tileRefs = useRef<HTMLDivElement[]>([])
    const initialXYCoordsValue = {
        xLowerBounds: 0,
        xHigherBounds: 0,
        yLowerBounds: 0,
        yHigherBounds: 0,
    }
    const [xyCoords, xyCoordsSet] = useState({ ...initialXYCoordsValue })
    const [clickedOnBoardAmt, clickedOnBoardAmtSet] = useState(0)

    const [userChosenWord, userChosenWordSet] = useState("")

    const [userChosenTileArray, userChosenTileArraySet] = useState<number[]>([])

    const [userAmountCorrect, userAmountCorrectSet] = useState(0)

    //check tiles intersection with selection
    useEffect(() => {
        if (clickedOnBoardAmt >= 2) {

            let wordSelected = ""
            let selectedAnsArr: number[] = []

            tileRefs.current.forEach(tileElement => {
                const { top, bottom, left, right } = tileElement.getBoundingClientRect()

                if (
                    // Horizontal match
                    (xyCoords.xLowerBounds >= left && xyCoords.xHigherBounds <= right &&
                        xyCoords.yLowerBounds >= top && xyCoords.yHigherBounds <= bottom) ||

                    // Vertical match
                    (xyCoords.xLowerBounds <= right && xyCoords.xHigherBounds >= left &&
                        xyCoords.yLowerBounds <= bottom && xyCoords.yHigherBounds >= top)
                ) {

                    const seenTileIndex = tileElement.getAttribute('data-tileNumber');
                    const seenLetter = tileElement.getAttribute('data-seenLetter');
                    wordSelected += seenLetter
                    selectedAnsArr.push(parseInt(seenTileIndex!))

                }

            })


            userChosenWordSet(wordSelected)
            userChosenTileArraySet(selectedAnsArr)
            clickedOnBoardAmtSet(0)
            xyCoordsSet({ ...initialXYCoordsValue })
        }
    }, [clickedOnBoardAmt])

    const [wordsMatchedAlready, wordsMatchedAlreadySet] = useState<string[]>([])

    const showHints = () => {
        console.log(`$called hint`);

        const wordsNotFoundAlready: string[] = []

        wordsArray.forEach(eachWord => {
            if (!wordsMatchedAlready.includes(eachWord)) {
                wordsNotFoundAlready.push(eachWord)
            }
        })

        if (wordsNotFoundAlready.length === 0) return

        const randIndex = Math.floor(Math.random() * wordsNotFoundAlready.length)
        const randomWordChosen = wordsNotFoundAlready[randIndex]
        const letterToShake = randomWordChosen[0]

        tileRefs.current.forEach(eachTileRef => {
            if (eachTileRef.innerText === letterToShake) {
                eachTileRef.classList.add(styles.quickShake)

                setTimeout(() => {
                    eachTileRef.classList.remove(styles.quickShake)
                }, 2000)
            }
        })


    }

    //check userchosen answers in crossword
    useEffect(() => {
        if (userChosenWord) {
            let gotCorrect = false

            wordsArray.forEach(eachWord => {
                const reversedUserChosenWord = userChosenWord.split('').reverse().join('')
                if ((userChosenWord === eachWord || reversedUserChosenWord === eachWord)) {
                    //apply correct
                    if (!wordsMatchedAlready.includes(userChosenWord)) {

                        userAmountCorrectSet(prev => prev + 1)
                    }
                    applyStylesToTiles("correct")

                    wordsMatchedAlreadySet(prevWords => {
                        const newarr = [...prevWords] ?? []
                        newarr.push(userChosenWord)

                        return newarr
                    })

                    gotCorrect = true
                }
            })

            if (!gotCorrect) {
                applyStylesToTiles("incorrect")
            }
        }
    }, [userChosenWord])


    //load up tiles
    useEffect(() => {
        loadUpTiles([...wordsArray])
    }, [wordsArray])


    const applyStylesToTiles = (option: "correct" | "incorrect") => {

        if (option === "correct") {
            userChosenTileArray.forEach(eachIndexSeen => {
                tileRefs.current[eachIndexSeen].style.backgroundColor = "var(--secondaryColor)"
                tileRefs.current[eachIndexSeen].classList.add(styles.correct)
            })

        } else {
            userChosenTileArray.forEach(eachIndexSeen => {
                tileRefs.current[eachIndexSeen].classList.add(styles.incorrect)

                setTimeout(() => {
                    userChosenTileArray.forEach(eachIndexSeen => {
                        tileRefs.current[eachIndexSeen].classList.remove(styles.incorrect)
                    })

                }, 3000)
            })
        }
    }

    //check if user got all correct
    useEffect(() => {
        if (userAmountCorrect === wordsArray.length && wordsArray.length > 0) {
            gameFinishedStateSet(true)
        }
    }, [userAmountCorrect])


    const loadUpTiles = (wordsSeenArr: string[]) => {

        //clear previous
        spawnPointRef.current.innerHTML = ""
        tileRefs.current = []

        //randomize array
        for (let i = wordsSeenArr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [wordsSeenArr[i], wordsSeenArr[j]] = [wordsSeenArr[j], wordsSeenArr[i]];
        }

        const sideWords = wordsSeenArr.length > 2 ? wordsSeenArr.splice(wordsSeenArr.length - 2, 2) : null

        const longestWordLength = () => {
            let myNum = 0
            wordsSeenArr.forEach(eachWord => {
                if (eachWord.length > myNum) {
                    myNum = eachWord.length
                }
            })

            if (sideWords !== null) {
                sideWords.forEach(eachWord => {
                    if (eachWord.length > myNum) {
                        myNum = eachWord.length
                    }
                })
            }

            return myNum
        }
        const getColumnAmt = () => {
            let myNum = 0
            myNum += longestWordLength()
            const extraColumns = Math.floor(Math.random() * 2) + 2
            myNum += extraColumns

            return myNum

        }

        const getRowAmt = () => {
            let myNum = 0
            const extraRowsAmt = Math.floor(Math.random() * 3) + 2
            const longestWord = longestWordLength()

            if (wordsSeenArr.length > longestWord) {
                myNum = wordsSeenArr.length + extraRowsAmt
            } else {
                myNum = longestWord + extraRowsAmt
            }

            return myNum

        }

        let amountOfColumns = getColumnAmt() //becomes amout of columns

        let amountOfRows = getRowAmt()  //amt of rows

        const spawnPoint = spawnPointRef.current!
        spawnPoint.style.gridTemplateColumns = `repeat(${amountOfColumns}, 1fr)`
        spawnPoint.style.gridTemplateRows = `repeat(${amountOfRows}, 1fr)`

        const handleClick = (e: MouseEvent) => {

            const clickedElement = e.target as HTMLDivElement
            const { top, bottom, left, right } = clickedElement.getBoundingClientRect()

            const mouseX = e.clientX
            const mouseY = e.clientY


            clickedOnBoardAmtSet(prevAmt => {
                const newClickedAmt = prevAmt + 1

                if (newClickedAmt === 1) {
                    //set lower coords
                    xyCoordsSet(prevxyCoords => {
                        const newXyCoords = { ...prevxyCoords, xLowerBounds: mouseX, yLowerBounds: mouseY }
                        return newXyCoords
                    })
                } else if (newClickedAmt === 2) {
                    //set high tier coords
                    xyCoordsSet(prevxyCoords => {
                        const newXyCoords = { ...prevxyCoords, xHigherBounds: mouseX, yHigherBounds: mouseY }
                        return newXyCoords
                    })
                }

                return newClickedAmt
            })
        }

        let elementCounter = 0
        const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']

        for (let index = 0; index < amountOfRows; index++) {
            for (let smallerIndex = 0; smallerIndex < amountOfColumns; smallerIndex++) {
                const newElement = document.createElement("div")

                const randomAlphabetLetter = alphabet[Math.floor(Math.random() * alphabet.length)]

                newElement.setAttribute("class", styles.tile)
                newElement.setAttribute('data-tileNumber', elementCounter.toString());
                newElement.setAttribute('data-seenLetter', randomAlphabetLetter)

                newElement.addEventListener("click", handleClick)
                newElement.innerText = `${randomAlphabetLetter}`

                tileRefs.current.push(newElement)
                spawnPoint.appendChild(newElement)
                elementCounter++
            }
        }

        let extraRowAmt = amountOfRows - wordsSeenArr.length
        let rowXStarter = 0

        wordsSeenArr.forEach((eachWord, wordArrIndex) => {
            if (extraRowAmt > 0) {
                //skip a row every now and then
                const overHalf = Math.random() * 1
                if (overHalf > 0.4) {
                    rowXStarter += amountOfColumns //skip a column space
                    extraRowAmt--
                }
            }

            const ranDomXBuffer = (Math.floor(Math.random() * ((amountOfColumns - 1) - eachWord.length))) + 1
            for (let wordIndex = 0; wordIndex < eachWord.length; wordIndex++) {
                tileRefs.current[rowXStarter + ranDomXBuffer + wordIndex].innerText = eachWord[wordIndex]
                tileRefs.current[rowXStarter + ranDomXBuffer + wordIndex].setAttribute('data-seenLetter', eachWord[wordIndex])

                if (isEditing) {
                    tileRefs.current[rowXStarter + ranDomXBuffer + wordIndex].style.backgroundColor = "var(--secondaryColor)"
                }
            }
            rowXStarter += amountOfColumns //go to new row
        })


        //add word in 1st column
        if (sideWords !== null) {
            let firstColumnLocation = 0
            let ranDomBuffer = (Math.floor(Math.random() * (amountOfRows - sideWords[0].length))) * amountOfColumns
            for (let wordIndex = 0; wordIndex < sideWords[0].length; wordIndex++) {
                tileRefs.current[firstColumnLocation + ranDomBuffer].innerText = sideWords[0][wordIndex]
                tileRefs.current[firstColumnLocation + ranDomBuffer].setAttribute('data-seenLetter', sideWords[0][wordIndex])
                if (isEditing) {
                    tileRefs.current[firstColumnLocation + ranDomBuffer].style.backgroundColor = "var(--secondaryColor)"
                }

                firstColumnLocation += amountOfColumns //everytime you add longest word num you skip a line
            }

            //add word in last column
            let lastColumnLocation = amountOfColumns - 1
            ranDomBuffer = (Math.floor(Math.random() * (amountOfRows - sideWords[1].length))) * amountOfColumns
            for (let wordIndex = 0; wordIndex < sideWords[1].length; wordIndex++) {
                tileRefs.current[lastColumnLocation + ranDomBuffer].innerText = sideWords[1][wordIndex]
                tileRefs.current[lastColumnLocation + ranDomBuffer].setAttribute('data-seenLetter', sideWords[1][wordIndex])
                if (isEditing) {
                    tileRefs.current[lastColumnLocation + ranDomBuffer].style.backgroundColor = "var(--secondaryColor)"
                }

                lastColumnLocation += amountOfColumns //everytime you add longest word num you skip a line
            }
        }
    }


    const amtOfAnswersLeft = useMemo(() => {
        return wordsArray.length - userAmountCorrect
    }, [userAmountCorrect, wordsArray.length])


    return (
        <div style={{}}>
            <div>
                <p className={styles.leftToFind}>Words left to find {amtOfAnswersLeft}</p>
                <p onClick={showHints} style={{ textAlign: "end", marginBottom: "1rem", cursor: "pointer" }}>hint?</p>
            </div>

            <div>
                <DisplayGameOVer gameOver={gameFinishedState}>
                    <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(min(200px, 100%), 1fr))" }}>
                        <div ref={spawnPointRef} className={styles.spawnArea}></div>

                        <div style={{ display: Object.values(hintObj).length > 0 ? "flex" : "none", flexDirection: "column", gap: "1rem" }}>
                            {Object.values(hintObj).map((eachHint, clueIndex) => {
                                let seenEl = wordsMatchedAlready.includes(Object.keys(hintObj)[clueIndex])

                                return (
                                    <p style={{ color: seenEl ? "var(--thirdColor)" : "var(--textColor)", textTransform: "capitalize" }} key={clueIndex}>{eachHint}:</p>
                                )
                            })}
                        </div>
                    </div>
                </DisplayGameOVer>
            </div>

            {gameFinishedState && (
                <div style={{ flex: 1 }}>
                    <p>Beat the Game!!!</p>
                    <button onClick={refresh}>Refresh</button>
                </div>
            )}
        </div>
    )
}