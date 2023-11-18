"use client"

import { useRef, useState } from "react"
import CrosswordGM from "./CrosswordGM"
import MatchUpGM from "./MatchUpGM"
import PronounciationGM from "./PronounciationGM"
import WordsToMeaningGM from "./WordsToMeaningGM"
import { gameObjType } from "@/app/page"
import styles from "./style.module.css"


export default function GamemodeMaker({ addGameModeLocally, updateGamemodeDirectly, storyId, showDefault }: { addGameModeLocally?: (gamemode: gameObjType) => void, updateGamemodeDirectly?: boolean, storyId?: string, showDefault?: boolean }) {

    const [gameModeViewing, gameModeViewingSet] = useState<"cross" | "match" | "pro" | "wordmean" | undefined>(showDefault ? "match" : undefined)

    const [showObjList, showObjListSet] = useState({
        "cross": true,
        "match": true,
        "pro": true,
        "wordmean": true
    })

    return (
        <div style={{ backgroundColor: "var(--primaryColor)", padding: "1rem", borderRadius: "1rem" }}>
            <button style={{ borderTop: gameModeViewing === "match" ? "1px solid #fff" : "none" }} className="switchTabButton" onClick={() => { gameModeViewingSet("match") }}>Matchbup</button>
            <button style={{ borderTop: gameModeViewing === "cross" ? "1px solid #fff" : "none" }} className="switchTabButton" onClick={() => { gameModeViewingSet("cross") }}>Crossword</button>
            <button style={{ borderTop: gameModeViewing === "pro" ? "1px solid #fff" : "none" }} className="switchTabButton" onClick={() => { gameModeViewingSet("pro") }}>Pronounciation</button>
            <button style={{ borderTop: gameModeViewing === "wordmean" ? "1px solid #fff" : "none" }} className="switchTabButton" onClick={() => { gameModeViewingSet("wordmean") }}>Word Meaning</button>

            {gameModeViewing === undefined ? <p style={{ marginTop: "1rem", fontSize: "1.5rem" }}>Add Gamemodes Here</p> : (
                <div>
                    <button className="utilityButton" onClick={() => {
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
                    }}>Reset</button>
                    <button className="utilityButton" onClick={() => {
                        gameModeViewingSet(undefined)
                    }}>Minimize</button>
                </div>
            )}

            <div className={styles.gameMakerDisplayDivs} style={{ display: gameModeViewing === "match" ? "grid" : "none" }}>
                {showObjList["match"] && <MatchUpGM sentDirectlyFromMaker={true} addGameModeLocally={addGameModeLocally} isEditing={true} updateGamemodeDirectly={updateGamemodeDirectly} storyid={storyId} />}
            </div>

            <div className={styles.gameMakerDisplayDivs} style={{ display: gameModeViewing === "cross" ? "grid" : "none" }}>
                {showObjList["cross"] && <CrosswordGM sentDirectlyFromMaker={true} addGameModeLocally={addGameModeLocally} updateGamemodeDirectly={updateGamemodeDirectly} isEditing={true} storyid={storyId} />}
            </div>

            <div className={styles.gameMakerDisplayDivs} style={{ display: gameModeViewing === "pro" ? "grid" : "none" }}>
                {showObjList["pro"] && <PronounciationGM sentDirectlyFromMaker={true} addGameModeLocally={addGameModeLocally} updateGamemodeDirectly={updateGamemodeDirectly} isEditing={true} storyid={storyId} />}
            </div>

            <div className={styles.gameMakerDisplayDivs} style={{ display: gameModeViewing === "wordmean" ? "grid" : "none" }}>
                {showObjList["wordmean"] && <WordsToMeaningGM sentDirectlyFromMaker={true} addGameModeLocally={addGameModeLocally} updateGamemodeDirectly={updateGamemodeDirectly} isEditing={true} storyid={storyId} />}
            </div>
        </div>
    )
}
