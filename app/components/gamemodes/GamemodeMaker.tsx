"use client"

import { useState } from "react"
import CrosswordGM from "./CrosswordGM"
import MatchUpGM from "./MatchUpGM"
import PronounciationGM from "./PronounciationGM"
import WordsToMeaningGM from "./WordsToMeaningGM"
import { gameObjType, gameSelectionTypes } from "@/app/page"
import { v4 as uuidv4 } from "uuid";


export default function GamemodeMaker({ addGameMode }: { addGameMode?: (gamemode: gameObjType) => void }) {

    const [gameModeViewing, gameModeViewingSet] = useState<"cross" | "match" | "pro" | "wordmean">("match")

    return (
        <div style={{ backgroundColor: "rgba(20,20,20,0.7)" }}>
            <button onClick={() => { gameModeViewingSet("match") }}>Make Matchbup</button>
            <button onClick={() => { gameModeViewingSet("cross") }}>Make Crossword</button>
            <button onClick={() => { gameModeViewingSet("pro") }}>Make Pronounciation</button>
            <button onClick={() => { gameModeViewingSet("wordmean") }}>Make Word Meaning</button>

            <div>

                <div style={{ display: gameModeViewing === "match" ? "block" : "none" }}>
                    <MatchUpGM addGameMode={addGameMode} isEditing={true} />
                </div>
                <div style={{ display: gameModeViewing === "cross" ? "block" : "none" }}>
                    <CrosswordGM addGameMode={addGameMode} isEditing={true} />
                </div>
                <div style={{ display: gameModeViewing === "pro" ? "block" : "none" }}>
                    <PronounciationGM addGameMode={addGameMode} isEditing={true} />
                </div>
                <div style={{ display: gameModeViewing === "wordmean" ? "block" : "none" }}>
                    <WordsToMeaningGM />
                </div>
            </div>

        </div>
    )
}
