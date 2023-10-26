"use client"

import { useRef, useState } from "react"
import CrosswordGM from "./CrosswordGM"
import MatchUpGM from "./MatchUpGM"
import PronounciationGM from "./PronounciationGM"
import WordsToMeaningGM from "./WordsToMeaningGM"
import { gameObjType, gameSelectionTypes, updateGameModesParams } from "@/app/page"
import { v4 as uuidv4 } from "uuid";
import styles from "./style.module.css"


export default function GamemodeMaker({ addGameModeLocally, updateGamemodeDirectly, storyId, showDefault }: { addGameModeLocally?: (gamemode: gameObjType) => void, updateGamemodeDirectly?: boolean, storyId?: string, showDefault?: boolean }) {

    const [gameModeViewing, gameModeViewingSet] = useState<"cross" | "match" | "pro" | "wordmean" | undefined>(showDefault ? "match" : undefined)

    const [showObjList, showObjListSet] = useState({
        "cross": true,
        "match": true,
        "pro": true,
        "wordmean": true
    })

    const canDoubleClick = useRef(false)

    const handleDoubleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (canDoubleClick.current) {
            gameModeViewingSet(undefined)
            const newEl = e.target as HTMLButtonElement
            newEl.classList.add(styles.bright)

            setTimeout(() => {
                newEl.classList.remove(styles.bright)
            }, 400)


        }

        canDoubleClick.current = true

        setTimeout(() => {
            canDoubleClick.current = false
        }, 400)
    }


    return (
        <div style={{}}>

            <button onClick={(e) => { gameModeViewingSet("match"); handleDoubleClick(e) }}>Make Matchbup</button>
            <button onClick={(e) => { gameModeViewingSet("cross"); handleDoubleClick(e) }}>Make Crossword</button>
            <button onClick={(e) => { gameModeViewingSet("pro"); handleDoubleClick(e) }}>Make Pronounciation</button>
            <button onClick={(e) => { gameModeViewingSet("wordmean"); handleDoubleClick(e) }}>Make Word Meaning</button>

            <br />
            {gameModeViewing === undefined ? <p>Add Gamemodes Here</p> : <button onClick={() => {
                showObjListSet(prevShowObjList => {
                    const newObjList = { ...prevShowObjList }
                    newObjList[gameModeViewing] = false
                    return newObjList
                })

                setTimeout(() => {
                    showObjListSet(prevShowObjList => {
                        const newObjList = { ...prevShowObjList }
                        newObjList[gameModeViewing] = true
                        return newObjList
                    })
                }, 0)
            }}>Reset</button>}


            <div className={styles.gameMakerDisplayDivs} style={{ display: gameModeViewing === "match" ? "grid" : "none" }}>
                {showObjList["match"] && <MatchUpGM addGameModeLocally={addGameModeLocally} isEditing={true} updateGamemodeDirectly={updateGamemodeDirectly} storyid={storyId} />}
            </div>
            <div className={styles.gameMakerDisplayDivs} style={{ display: gameModeViewing === "cross" ? "grid" : "none" }}>
                {showObjList["cross"] && <CrosswordGM addGameModeLocally={addGameModeLocally} updateGamemodeDirectly={updateGamemodeDirectly} isEditing={true} storyid={storyId} />}
            </div>
            <div className={styles.gameMakerDisplayDivs} style={{ display: gameModeViewing === "pro" ? "grid" : "none" }}>
                {showObjList["pro"] && <PronounciationGM addGameModeLocally={addGameModeLocally} updateGamemodeDirectly={updateGamemodeDirectly} storyid={storyId} isEditing={true} />}
            </div>
            <div className={styles.gameMakerDisplayDivs} style={{ display: gameModeViewing === "wordmean" ? "grid" : "none" }}>
                {showObjList["wordmean"] && <WordsToMeaningGM addGameModeLocally={addGameModeLocally} updateGamemodeDirectly={updateGamemodeDirectly} storyid={storyId} isEditing={true} />}
            </div>

        </div>
    )
}
