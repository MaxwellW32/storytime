"use client"
import React from 'react'
import CrosswordGM from './CrosswordGM'
import { crosswordType, gameObjType } from '@/app/page'


export default function page() {
    const testObj: gameObjType = {
        boardObjId: "1234ds",
        gameSelection: "crossword", //tell different types of gamemodes
        gameFinished: false,
        boardType: "gamemode",
        shouldStartOnNewPage: false,
        gameData: {
            gameDataFor: "crossword",
            wordArray: ["car", "bat"]
        } as crosswordType
    }

    return (
        <CrosswordGM isEditing={true} gameObj={testObj} />
    )
}
