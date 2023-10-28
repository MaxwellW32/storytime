"use client"
import { allServerFunctionsAtom } from '@/app/utility/globalState'
import { useAtom } from 'jotai'
import React, { useState } from 'react'
import ShowServerErrors from './ShowServerErrors'

export default function ChangePassword({ password, storyPasswordSet, option, storyId }: { password: string, storyPasswordSet: React.Dispatch<React.SetStateAction<string>>, storyId: string, option: "story" | "gamemode" }) {
    const [expanded, expandedSet] = useState(false)
    const [oldPass, oldPAssSet] = useState("")
    const [newPass, newPassSet] = useState("")
    const [allServerFunctions] = useAtom(allServerFunctionsAtom)

    const [errorsSeen, errorsSeenSet] = useState<{
        [key: string]: string
    }>()
    const [successChange, successChangeSet] = useState(false)

    return (
        <div style={{ padding: "1rem" }}>
            {successChange && <p>Password changed successfully</p>}

            <button className='utilityButton' onClick={() => { expandedSet(prev => !prev) }}>{expanded ? "Minimize" : "Change Pass?"}</button>

            {option === "story" ? (
                <div style={{ display: expanded ? "block" : "none", marginTop: "1rem" }}>
                    <div style={{ display: "flex", flexWrap: 'wrap', gap: "1rem" }}>
                        <div>
                            <label style={{ fontSize: "1.5rem", color: "var(--textColor)" }}>Old Password:</label>

                            <input style={{ backgroundColor: "var(--textColorAnti)", color: "var(--textColor)", display: "block", padding: "1rem", }} type='password' value={oldPass} placeholder='Password: ' onChange={(e) => {
                                oldPAssSet(e.target.value)
                            }} />
                        </div>

                        <div>
                            <label style={{ fontSize: "1.5rem", color: "var(--textColor)" }}>New Password:</label>

                            <input style={{ backgroundColor: "var(--textColorAnti)", color: "var(--textColor)", display: "block", padding: "1rem", }} type='password' value={newPass} placeholder='Password: ' onChange={(e) => {
                                newPassSet(e.target.value)
                            }} />
                        </div>
                    </div>

                    <ShowServerErrors errorsSeen={errorsSeen} />

                    <button className='utilityButton' onClick={async () => {
                        //takes in the new pass and story id
                        //listens to response errors
                        const serverMessageObj = await allServerFunctions!.updatePassword("story", storyId, oldPass, newPass)

                        if (serverMessageObj["message"].length !== 0) {
                            //error seen
                            errorsSeenSet(serverMessageObj)
                        } else {
                            successChangeSet(true)
                            expandedSet(false)
                            storyPasswordSet(newPass)
                        }
                    }}>Update Password</button>
                </div>
            ) : (
                <>
                </>
            )}
        </div>
    )
}
