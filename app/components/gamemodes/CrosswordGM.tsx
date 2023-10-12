"use client"
import styles from "./style.module.css"
import { useRef, useEffect, useState, useMemo } from "react"
import { crosswordType, gameObjType, storyBoardType } from "@/app/page"
import { handleStoriesWhereGameOver } from "@/app/utility/savestorage"
import DisplayGameOVer from "../useful/DisplayGameOver"


export default function CrosswordGM({ gameObj, isEditing = false, storyid, handleStoryBoard }:
    {
        gameObj: gameObjType, isEditing?: boolean, storyid?: string
        handleStoryBoard?: (option: string, seenBoardId: string, newBoardData?: storyBoardType) => void
    }) {

    const [wordsArray, wordsArraySet] = useState<string[]>(() => {
        const gameObjGameData = gameObj.gameData as crosswordType

        return gameObjGameData?.wordArray ?? []
    })

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
    const [wordsMatchedAlready, wordsMatchedAlreadySet] = useState<string[]>([])

    const [userChosenWord, userChosenWordSet] = useState("")

    const [userChosenTileArray, userChosenTileArraySet] = useState<number[]>([])
    const [userAmountCorrect, userAmountCorrectSet] = useState(0)
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


    const amtOfAnswersLeft = useMemo(() => {
        return wordsArray.length - userAmountCorrect
    }, [userAmountCorrect, wordsArray.length])

    const handleSubmit = () => {
        //local submit to storyboard

        const newObj: gameObjType = {
            ...gameObj,
            gameData: { gameDataFor: "crossword", wordArray: wordsArray }
        }

        if (handleStoryBoard) {
            handleStoryBoard!("update", gameObj!.boardObjId, newObj)
        }
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


    const showHints = () => {

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
        if (userAmountCorrect === wordsArray.length) {
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

        let longestWordNum = 0
        wordsSeenArr.forEach(eachWord => {
            if (eachWord.length > longestWordNum) {
                longestWordNum = eachWord.length
            }
        })
        longestWordNum += Math.floor(Math.random() * 2) + 2 //becomes amout of columns

        let newtwoItemArr //becomes the text on first and last column
        if (wordsSeenArr.length > 2) {
            newtwoItemArr = wordsSeenArr.splice(wordsSeenArr.length - 2, 2)
        } else {
            newtwoItemArr = ["", ""]
        }

        let rowBuffer = Math.floor(Math.random() * 3) + 2
        let amountOfRows = longestWordNum + rowBuffer

        if (wordsSeenArr.length > longestWordNum) {
            amountOfRows = wordsSeenArr.length + rowBuffer
        }

        const spawnPoint = spawnPointRef.current!
        spawnPoint.style.gridTemplateColumns = `repeat(${longestWordNum}, 1fr)`
        spawnPoint.style.gridTemplateRows = `repeat(${amountOfRows}, 1fr)`

        let elementCounter = 0

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

        const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']

        for (let index = 0; index < amountOfRows; index++) {
            for (let smallerIndex = 0; smallerIndex < longestWordNum; smallerIndex++) {
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

        let randSafeXIndexToStart = 0
        wordsSeenArr.forEach(eachWord => {
            if (rowBuffer > 0) {
                //allows us to skip a row every now and then
                const overHalf = Math.random() * 1
                if (overHalf > 0.4) {
                    randSafeXIndexToStart += longestWordNum
                    rowBuffer--
                }
            }

            const ranDomBuffer = (Math.floor(Math.random() * ((longestWordNum - 1) - eachWord.length))) + 1
            for (let wordIndex = 0; wordIndex < eachWord.length; wordIndex++) {
                tileRefs.current[randSafeXIndexToStart + ranDomBuffer + wordIndex].innerText = eachWord[wordIndex]
                tileRefs.current[randSafeXIndexToStart + ranDomBuffer + wordIndex].setAttribute('data-seenLetter', eachWord[wordIndex])

                if (isEditing) {
                    tileRefs.current[randSafeXIndexToStart + ranDomBuffer + wordIndex].style.backgroundColor = "var(--secondaryColor)"
                }
            }
            randSafeXIndexToStart += longestWordNum
        })


        //add word in 1st column
        let randSafeYIndexToStart = 0
        let ranDomBuffer = (Math.floor(Math.random() * (amountOfRows - newtwoItemArr[0].length))) * longestWordNum
        for (let wordIndex = 0; wordIndex < newtwoItemArr[0].length; wordIndex++) {
            tileRefs.current[randSafeYIndexToStart + ranDomBuffer].innerText = newtwoItemArr[0][wordIndex]
            tileRefs.current[randSafeYIndexToStart + ranDomBuffer].setAttribute('data-seenLetter', newtwoItemArr[0][wordIndex])
            if (isEditing) {
                tileRefs.current[randSafeYIndexToStart + ranDomBuffer].style.backgroundColor = "var(--secondaryColor)"
            }

            randSafeYIndexToStart += longestWordNum //everytime you add longest word num you skip a line
        }

        //add word in last column
        randSafeYIndexToStart = longestWordNum - 1
        ranDomBuffer = (Math.floor(Math.random() * (amountOfRows - newtwoItemArr[1].length))) * longestWordNum
        for (let wordIndex = 0; wordIndex < newtwoItemArr[1].length; wordIndex++) {
            tileRefs.current[randSafeYIndexToStart + ranDomBuffer].innerText = newtwoItemArr[1][wordIndex]
            tileRefs.current[randSafeYIndexToStart + ranDomBuffer].setAttribute('data-seenLetter', newtwoItemArr[1][wordIndex])
            if (isEditing) {
                tileRefs.current[randSafeYIndexToStart + ranDomBuffer].style.backgroundColor = "var(--secondaryColor)"
            }

            randSafeYIndexToStart += longestWordNum //everytime you add longest word num you skip a line
        }


    }

    //load up tiles
    const didMount = useRef(false)
    useEffect(() => {
        didMount.current = true

        if (didMount.current) {
            loadUpTiles([...wordsArray])

            if (isEditing) {
                inputRef.current.value = ""
            }
        }
    }, [wordsArray])

    const inputRef = useRef<HTMLInputElement>(null!)

    const addWord = () => {
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

    //monitor changes and save em
    useEffect(() => {
        const passedArray: string[] = !gameObj.gameData ? [] : { ...gameObj.gameData as crosswordType }.wordArray ?? []

        if (passedArray.length !== wordsArray.length) {
            handleSubmit()
        }
    }, [wordsArray.length])

    return (
        <div className={styles.crossWordMain} style={{ padding: "1rem" }}>
            {isEditing ? (
                <div >
                    <label>Enter Words you&apos;d like to appear in the Crossword</label>
                    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", margin: "1rem" }}>
                        {wordsArray.map((eachWord, index) => {
                            return (
                                <div key={index} style={{ position: "relative", backgroundColor: "var(--primaryColor)", borderRadius: ".7rem", borderTopRightRadius: 0, padding: ".5rem" }}>

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
                    <input ref={inputRef} onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            addWord()
                        }
                    }} type="text" />
                    <button onClick={addWord}>Submit Word</button>
                    {gameFinishedState && <p>Beat the Game!!!</p>}
                    <p className={styles.leftToFind}>Words left to find {amtOfAnswersLeft}</p>
                    <div ref={spawnPointRef} className={styles.spawnArea}></div>
                </div>
            ) : (
                <>
                    <p className={styles.leftToFind}>Words left to find {amtOfAnswersLeft}</p>
                    <p onClick={showHints} style={{ textAlign: "end", marginBottom: "1rem", cursor: "pointer" }}>hint?</p>
                    <DisplayGameOVer gameOver={gameFinishedState}>
                        <div ref={spawnPointRef} className={styles.spawnArea}></div>
                    </DisplayGameOVer>
                    {gameFinishedState && (
                        <>
                            <p>Beat the Game!!!</p>
                            <button onClick={() => { gameFinishedStateSet(false) }}>Refresh</button>
                        </>
                    )}
                </>
            )}

        </div>
    )
}