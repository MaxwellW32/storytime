"use client"

import { ReactNode } from "react"

export default function DisplayGameOVer({ children, gameOver }: { children: ReactNode, gameOver: boolean }) {

    const normalStyles: React.CSSProperties = {}
    const gameOVerStyles: React.CSSProperties = { scale: ".9", filter: "brightness(.7)" }
    return (
        <div style={gameOver ? gameOVerStyles : normalStyles}>
            {children}
        </div>

    )
}