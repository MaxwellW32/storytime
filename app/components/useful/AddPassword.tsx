import React, { useEffect, useState } from 'react'

export default function AddPassword({ password, storyPasswordSet, option, showFieldOnly }: { password: string, storyPasswordSet: React.Dispatch<React.SetStateAction<string>>, option: "story" | "gamemode", showFieldOnly?: boolean }) {

    return (
        <div style={{ backgroundColor: "var(--primaryColor)", padding: "1rem", }}>
            {option === "story" ? (
                <>
                    {password.length === 0 && !showFieldOnly && <p>Please add a password for your story to continue</p>}

                    <div style={{ display: "flex", gap: "1rem", marginTop: "1rem", flexWrap: "wrap", alignItems: "center" }}>
                        <div>
                            <label style={{ fontSize: "1.5rem", color: "var(--textColor)" }}>Story Password:</label>

                            <input style={{ backgroundColor: "var(--textColorAnti)", color: "var(--textColor)", display: "block", padding: "1rem", }} type='password' value={password} placeholder='Password: ' onChange={(e) => {
                                storyPasswordSet(e.target.value)
                            }} />
                        </div>

                        {!showFieldOnly && <p style={{ width: "min(400px, 100%)" }}>No personal info - just a simple word / phrase you can remember. This will allow only you to be able to make changes to this story</p>
                        }  </div>
                </>

            ) : (
                <>

                    {!showFieldOnly && <p>Add a gamemode password. Nothing related to the story password please. Can be simple. Just something to ensure only you can edit your gamemode.</p>}

                    <label style={{ fontSize: "1.5rem", color: "var(--textColor)" }}>Gamemode Password:</label>
                    <br />

                    <input style={{ backgroundColor: "var(--textColorAnti)", color: "var(--textColor)" }} type='password' value={password} onChange={(e) => {
                        storyPasswordSet(e.target.value)
                    }} placeholder='Please enter pass' />
                </>
            )}
        </div>
    )
}
