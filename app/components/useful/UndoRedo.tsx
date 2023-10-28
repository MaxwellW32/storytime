"use client"
import { storyBoardType } from "@/app/page"
import { useState, useEffect } from "react"

export default function UndoRedo<T>({ seenArray, stateSetterFromHistory }: { seenArray: T[], stateSetterFromHistory: React.Dispatch<React.SetStateAction<T[]>> }) {

    const [history, historySet] = useState<T[][]>([])
    const [runningIndex, runningIndexSet] = useState(0)
    const [viewingHistory, viewingHistorySet] = useState(false)

    //everytime seenArr changes please update history - runningIndex
    useEffect(() => {
        if (viewingHistory) return

        console.log(`$ran update history`);

        historySet(prevHistory => {
            if (prevHistory.length >= 50) prevHistory.shift()

            const newHistory = [...prevHistory, seenArray]

            runningIndexSet(newHistory.length - 1)
            return newHistory
        })

    }, [seenArray])


    const onTopStyle = {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        zIndex: 1,
        backgroundColor: "var(--primaryColor)",
        padding: "1rem",
        borderBottom: "1px solid var(--textColor)"
    } as React.CSSProperties

    return (
        <div style={viewingHistory ? onTopStyle : {}}>
            <div style={{ display: "flex", gap: "1rem" }}>
                <button style={{ opacity: runningIndex === 0 ? "0" : "1" }} className="utilityButton" onClick={() => {
                    viewingHistorySet(true)
                    if (!viewingHistory) return

                    let localRunningIndex = runningIndex

                    if (localRunningIndex > 0) {
                        localRunningIndex -= 1
                    }

                    stateSetterFromHistory(history[localRunningIndex])

                    runningIndexSet(localRunningIndex)
                }}>Undo</button>

                <button style={{ opacity: runningIndex !== history.length - 1 && history.length > 0 ? "1" : "0" }} className="utilityButton" onClick={() => {
                    viewingHistorySet(true)
                    if (!viewingHistory) return

                    let localRunningIndex = runningIndex

                    if (localRunningIndex < history.length - 1) {
                        localRunningIndex += 1
                    }

                    stateSetterFromHistory(history[localRunningIndex])

                    runningIndexSet(localRunningIndex)
                }}>Redo</button>
            </div>

            {viewingHistory && (
                <div >
                    <br />
                    <p>Viewing History</p>

                    <div style={{ display: "flex", gap: "1rem", marginTop: "1rem", flexWrap: "wrap" }}>
                        <button className="utilityButton" onClick={() => {
                            viewingHistorySet(false)
                            stateSetterFromHistory(history[history.length - 1])
                            runningIndexSet(history.length - 1)
                        }}>Cancel</button>

                        {runningIndex !== history.length - 1 &&
                            <button className="utilityButton" onClick={() => {
                                viewingHistorySet(false)
                                historySet(prevHistory => {
                                    const newHistory = [...prevHistory]
                                    const wantedHistory = newHistory.slice(0, runningIndex)
                                    return wantedHistory
                                })
                            }}>Continue editing from here?</button>}
                    </div>
                </div>
            )}
        </div>
    )
}
