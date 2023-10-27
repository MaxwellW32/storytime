import React, { useEffect, useState } from 'react'

export default function AddPassword({ password, storyPasswordSet, option }: { password: string, storyPasswordSet: React.Dispatch<React.SetStateAction<string>>, option: "story" | "gamemode" }) {

    return (
        <div style={{ backgroundColor: "var(--primaryColor)", padding: "1rem", }}>
            {option === "story" ? (
                <>
                    {password.length === 0 && <p>Please add a password for your story to continue </p>}

                    <div style={{ display: "flex", gap: "1rem", marginTop: "1rem", flexWrap: "wrap", alignItems: "center" }}>
                        <div>
                            <label style={{ fontSize: "1.5rem", color: "var(--textColor)" }}>Story Password:</label>

                            <input style={{ backgroundColor: "var(--textColorAnti)", color: "var(--textColor)", display: "block", padding: "1rem", }} type='text' value={password} placeholder='Password: ' onChange={(e) => {
                                storyPasswordSet(e.target.value)
                            }} />
                        </div>

                        <p style={{ width: "min(400px, 100%)" }}>Nothing personal - just something you can remember. This will allow only you to be able to make changes to this story</p>
                    </div>
                </>

            ) : (
                <>
                    <p>Add a gamemode password. Nothing related to the story password please. Can be simple. Just something to ensure only you can edit your gamemode.</p>
                    <input type='text' value={password} onChange={(e) => {
                        storyPasswordSet(e.target.value)
                    }} />
                </>
            )}
        </div>
    )
}
