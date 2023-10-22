"use client"

import { useState } from "react"
import CrosswordGM from "./CrosswordGM"
import MatchUpGM from "./MatchUpGM"
import PronounciationGM from "./PronounciationGM"
import WordsToMeaningGM from "./WordsToMeaningGM"
import { gameObjType, gameSelectionTypes, updateGameModesParams } from "@/app/page"
import { v4 as uuidv4 } from "uuid";


export default function GamemodeMaker({ addGameMode, updateGameModes, storyId }: { addGameMode?: (gamemode: gameObjType) => void, updateGameModes?: updateGameModesParams, storyId?: string }) {

    const [gameModeViewing, gameModeViewingSet] = useState<"cross" | "match" | "pro" | "wordmean">()

    const [showObjList, showObjListSet] = useState({
        "cross": true,
        "match": true,
        "pro": true,
        "wordmean": true
    })
    return (
        <div style={{ backgroundColor: "rgba(20,20,20,0.7)" }}>
            <button onClick={() => { gameModeViewingSet("match") }}>Make Matchbup</button>
            <button onClick={() => { gameModeViewingSet("cross") }}>Make Crossword</button>
            <button onClick={() => { gameModeViewingSet("pro") }}>Make Pronounciation</button>
            <button onClick={() => { gameModeViewingSet("wordmean") }}>Make Word Meaning</button>

            <div>
                {gameModeViewing === undefined && <p>Add a Gamemode here</p>}
                {gameModeViewing !== undefined && <button onClick={() => {
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

                <div style={{ display: gameModeViewing === "match" ? "block" : "none" }}>
                    {showObjList["match"] && <MatchUpGM addGameMode={addGameMode} isEditing={true} updateGameModes={updateGameModes} storyid={storyId} />}
                </div>
                <div style={{ display: gameModeViewing === "cross" ? "block" : "none" }}>
                    {showObjList["cross"] && <CrosswordGM addGameMode={addGameMode} updateGameModes={updateGameModes} isEditing={true} storyid={storyId} />}
                </div>
                <div style={{ display: gameModeViewing === "pro" ? "block" : "none" }}>
                    {showObjList["pro"] && <PronounciationGM addGameMode={addGameMode} updateGameModes={updateGameModes} storyid={storyId} isEditing={true} />}
                </div>
                <div style={{ display: gameModeViewing === "wordmean" ? "block" : "none" }}>
                    {showObjList["wordmean"] && <WordsToMeaningGM />}
                </div>
            </div>

        </div>
    )
}
