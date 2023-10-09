"use client"
import { title } from "process"
import styles from "./style.module.css"
import { useRef, useEffect, useState, useMemo } from "react"
import { crosswordType, gameObjType, storyBoardType } from "@/app/page"


export default function CrosswordGM({ gameObj, isEditing = false, handleStoryBoard }: { gameObj?: gameObjType, isEditing?: boolean, handleStoryBoard?: (option: string, seenBoardId: string, newBoardData?: storyBoardType) => void }) {

    const [wordsArray, wordsArraySet] = useState<string[]>([])
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
    const [gameFinished, gameFinishedSet] = useState(false)


    const amtOfAnswersLeft = useMemo(() => {
        return wordsArray.length - userAmountCorrect
    }, [userAmountCorrect, wordsArray.length])

    const handleSubmit = () => {
        //save to the storyboard arr

        const newObj: gameObjType = {
            boardObjId: gameObj!.boardObjId,
            gameSelection: gameObj!.gameSelection,
            gameFinished: gameObj!.gameFinished,
            boardType: "gamemode",
            shouldStartOnNewPage: gameObj!.shouldStartOnNewPage,
            gameData: { ...gameObj!.gameData as crosswordType, wordArray: wordsArray },
        }

        if (handleStoryBoard) {
            handleStoryBoard("update", gameObj!.boardObjId, newObj)
        }
    }

    const handleFinishedUpdate = () => {
        //globally save to stories that gamemode finished
    }

    //load up finish view
    useEffect(() => {
        if (!isEditing) {
            const gameObjGameData = gameObj!.gameData! as crosswordType
            wordsArraySet(gameObjGameData.wordArray!)
        }
    }, [])

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
                    // console.log(`$character ${seenLetter} selected`);

                }

            })


            userChosenWordSet(wordSelected)
            userChosenTileArraySet(selectedAnsArr)
            // console.log(`$word selected ${wordSelected}`);

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
                if (userChosenWord === eachWord || reversedUserChosenWord === eachWord) {
                    //apply correct
                    userAmountCorrectSet(prev => prev + 1)
                    applyStylesToTiles("correct")
                    gotCorrect = true
                }
            })

            if (!gotCorrect) {
                applyStylesToTiles("incorrect")
            }
        }
    }, [userChosenWord])

    const applyStylesToTiles = (option: "correct" | "incorrect") => {

        if (option === "correct") {
            userChosenTileArray.forEach(eachIndexSeen => {
                tileRefs.current[eachIndexSeen].style.backgroundColor = "pink"
                tileRefs.current[eachIndexSeen].classList.add(styles.correct)
            })

        } else {
            userChosenTileArray.forEach(eachIndexSeen => {
                tileRefs.current[eachIndexSeen].style.backgroundColor = "grey"
                tileRefs.current[eachIndexSeen].classList.add(styles.incorrect)

                setTimeout(() => {
                    userChosenTileArray.forEach(eachIndexSeen => {
                        tileRefs.current[eachIndexSeen].style.backgroundColor = "green"
                        tileRefs.current[eachIndexSeen].classList.remove(styles.incorrect)
                    })

                }, 3000)
            })
        }
    }

    //check if user got all correct
    useEffect(() => {
        if (userAmountCorrect === wordsArray.length) {
            console.log(`$beat the game`);
            gameFinishedSet(true)
        }
    }, [userAmountCorrect])


    const loadUpTiles = (wordsSeenArr: string[]) => {
        const spawnPoint = spawnPointRef.current!
        console.log(`$spawnbefore`, spawnPointRef.current);
        spawnPointRef.current.innerHTML = ""
        console.log(`$spawnAfter`, spawnPointRef.current);

        console.log(`$called here seeing`, wordsSeenArr);

        setTimeout(() => {


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

            spawnPoint.style.gridTemplateColumns = `repeat(${longestWordNum}, 1fr)`
            spawnPoint.style.gridTemplateRows = `repeat(${amountOfRows}, 1fr)`

            let elementCounter = 0

            const handleClick = (e: MouseEvent) => {
                // console.clear()

                const clickedElement = e.target as HTMLDivElement
                const clickedTileNum = clickedElement.getAttribute('data-tileNumber');
                // console.log('Custom Value:', clickedTileNum);
                const { top, bottom, left, right } = clickedElement.getBoundingClientRect()
                console.log(`$tile ${clickedTileNum} stats. top: ${top} bottom: ${bottom} left: ${left} right: ${right}`);

                const mouseX = e.clientX
                const mouseY = e.clientY


                clickedOnBoardAmtSet(prevAmt => {
                    const newClickedAmt = prevAmt + 1

                    if (newClickedAmt === 1) {
                        //set lower coords
                        xyCoordsSet(prevxyCoords => {
                            const newXyCoords = { ...prevxyCoords, xLowerBounds: mouseX, yLowerBounds: mouseY }
                            // console.log(`$running in here xy coords`);
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
                // console.log(`$mouse location x: ${mouseX} y: ${mouseY}`);
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
                    tileRefs.current[randSafeXIndexToStart + ranDomBuffer + wordIndex].style.backgroundColor = "yellow"
                }
                randSafeXIndexToStart += longestWordNum
            })


            //add word in 1st column
            let randSafeYIndexToStart = 0
            let ranDomBuffer = (Math.floor(Math.random() * (amountOfRows - newtwoItemArr[0].length))) * longestWordNum
            for (let wordIndex = 0; wordIndex < newtwoItemArr[0].length; wordIndex++) {
                tileRefs.current[randSafeYIndexToStart + ranDomBuffer].innerText = newtwoItemArr[0][wordIndex]
                tileRefs.current[randSafeYIndexToStart + ranDomBuffer].setAttribute('data-seenLetter', newtwoItemArr[0][wordIndex])
                tileRefs.current[randSafeYIndexToStart + ranDomBuffer].style.backgroundColor = "yellow"

                randSafeYIndexToStart += longestWordNum //everytime you add longest word num you skip a line
            }

            //add word in last column
            randSafeYIndexToStart = longestWordNum - 1
            ranDomBuffer = (Math.floor(Math.random() * (amountOfRows - newtwoItemArr[1].length))) * longestWordNum
            for (let wordIndex = 0; wordIndex < newtwoItemArr[1].length; wordIndex++) {
                tileRefs.current[randSafeYIndexToStart + ranDomBuffer].innerText = newtwoItemArr[1][wordIndex]
                tileRefs.current[randSafeYIndexToStart + ranDomBuffer].setAttribute('data-seenLetter', newtwoItemArr[1][wordIndex])
                tileRefs.current[randSafeYIndexToStart + ranDomBuffer].style.backgroundColor = "yellow"

                randSafeYIndexToStart += longestWordNum //everytime you add longest word num you skip a line
            }
        }, 5000)


    }

    //load up tiles
    useEffect(() => {
        loadUpTiles([...wordsArray])
    }, [wordsArray])

    const inputRef = useRef<HTMLInputElement>(null!)

    return (
        <div>
            {isEditing ? (
                <div onBlur={handleSubmit}>
                    <label>Enter Words you'd like to appear in the Crossword</label>
                    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>

                        {wordsArray.map((eachWord, index) => {
                            return (
                                <p key={index}>{eachWord}</p>
                            )
                        })}
                    </div>
                    <input ref={inputRef} type="text" />
                    <button onClick={() => {
                        wordsArraySet(prevwordsArr => {
                            if (prevwordsArr) {
                                return [...prevwordsArr, inputRef.current.value]
                            } else {
                                return [inputRef.current.value]
                            }

                        })

                        inputRef.current.focus()

                        setTimeout(() => {
                            inputRef.current.value = ""
                        }, 500)
                    }}>Submit Word</button>
                    {gameFinished && <p>Beat the Game!!!</p>}
                    <p>Words left to find {amtOfAnswersLeft}</p>
                    <div ref={spawnPointRef} className={styles.spawnArea}></div>
                </div>
            ) : (
                <>
                    <div ref={spawnPointRef} className={styles.spawnArea}></div>
                </>
            )}

        </div>
    )
}