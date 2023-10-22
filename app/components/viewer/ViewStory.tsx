"use client"
import Image from 'next/image'
import { useState, useRef, useEffect, useMemo } from "react"
import { v4 as uuidv4 } from "uuid";
import styles from "./style.module.css"
import ReactPlayer from "react-player/youtube";
import MakeStory from '../maker/MakeStory';
import DisplayImage from '../display/DisplayImage';
import DisplayVideo from '../display/DisplayVideo';
import MatchUpGM from '../gamemodes/MatchUpGM';
import CrosswordGM from '../gamemodes/CrosswordGM';
import WordsToMeaningGM from '../gamemodes/WordsToMeaningGM';
import PronounciationGM from '../gamemodes/PronounciationGM';
import { StoryData, gameObjType, updateGameModesParams } from '@/app/page';
import GamemodeMaker from '../gamemodes/GamemodeMaker';


export default function ViewStory({ fullData, updateStory, deleteStory, updateGameModes }: { fullData: StoryData, updateStory: (option: "story" | "likes", seeBoard: StoryData) => Promise<void>, deleteStory: (seenId: string) => Promise<void>, updateGameModes: updateGameModesParams }) {

    const [reading, readingSet] = useState(false)

    const descRef = useRef<HTMLParagraphElement>(null)
    const [showDescriptionFull, showDescriptionFullSet] = useState(false)
    const [descOverFlowing, descOverFlowingSet] = useState(false)
    const [userTriedToDelete, userTriedToDeleteSet] = useState(false)
    const [reloader, reloaderSet] = useState(true)

    useEffect(() => {
        reloaderSet(false)
        setTimeout(() => {
            reloaderSet(true)
        }, 5)
    }, [fullData.gamemodes])

    useEffect(() => {
        const element = descRef.current;
        if (element) {
            descOverFlowingSet(element.scrollHeight > element.clientHeight);
        }
    }, [])

    const [editClicked, editClickedSet] = useState(false)
    const [sentLikesAlready, sentLikesAlreadySet] = useState(false)

    const [gameModesShowing, gameModesShowingSet] = useState(false)
    const [showNewGameModeButton, showNewGameModeButtonSet] = useState(false)

    return (
        <div style={{ width: "95%", margin: "0 auto", borderRadius: ".7rem", padding: "1rem", backgroundColor: "var(--backgroundColor)", position: "relative" }}>

            {editClicked && <MakeStory updateStory={updateStory} passedData={fullData} editClickedSet={editClickedSet} />}

            <div className={styles.titleCont}>

                <h3>{fullData.title}</h3>

                <div className="flex flex-col gap-1 items-center">
                    {fullData.rating && <p>{fullData.rating}/5</p>}
                    <Image height={20} alt='ratingstars' src={require("../../../public/threestars.png")} style={{ objectFit: "contain" }} />
                </div>

                <div style={{ display: "flex", gap: "1rem" }}>
                    <button onClick={() => { readingSet(true) }}> Let&apos;s Read </button>
                    {!userTriedToDelete ? (
                        <button style={{}} onClick={() => { userTriedToDeleteSet(true) }}>Delete Story</button>

                    ) : (
                        <div >
                            <p>Are you sure you want to delete?</p>
                            <div style={{ display: "flex", width: "100%", justifyContent: "center", gap: ".5rem", marginTop: ".5rem" }}>
                                <button onClick={() => {
                                    deleteStory(fullData.storyid!)
                                    userTriedToDeleteSet(false)
                                }}>Yes</button>
                                <button onClick={() => {
                                    userTriedToDeleteSet(false)
                                }}>No</button>
                            </div>
                        </div>

                    )}

                </div>
            </div>

            <div className={`italic`} style={{ marginTop: "var(--medium-margin)", display: "grid", gap: ".3rem", alignSelf: "flex-end" }}>
                {fullData.shortdescription && (
                    <>
                        <p ref={descRef} className={styles.descText} style={{ display: showDescriptionFull ? "block" : "-webkit-box", maxWidth: "850px" }}>{fullData.shortdescription}</p>
                        {descOverFlowing && <p className={styles.highlighted} onClick={() => {
                            showDescriptionFullSet(prev => !prev)
                        }}>{showDescriptionFull ? "Show Less" : "Show More"}</p>}
                    </>
                )}

                {fullData.likes > 0 && (
                    <p>{fullData.likes} {fullData.likes === 1 ? "Like" : "Likes"}</p>
                )}
            </div>

            {/* storyboard container */}
            {reading && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", position: "fixed", top: 0, left: 0, height: "100dvh", width: "100%", overflowY: "auto", backgroundColor: "var(--backgroundColor)", zIndex: 1, color: "var(--textColor)" }} className={styles.readingDiv}>

                    <div style={{ backgroundColor: "green", width: "100%", height: "100dvh", overflowY: "auto", maxWidth: "800px", position: "fixed", top: 0, right: 0, translate: gameModesShowing ? "0px 0px" : "100% 0px", zIndex: 2, transition: "translate 600ms", display: "grid" }}>

                        <div>
                            <div>
                                <button onClick={() => { gameModesShowingSet(false) }}>Close</button>
                                <button onClick={() => { showNewGameModeButtonSet(prev => !prev) }}>{showNewGameModeButton ? "View Games" : "Add Game"}</button>
                            </div>

                            {showNewGameModeButton && (
                                <div>
                                    <GamemodeMaker updateGameModes={updateGameModes} storyId={fullData.storyid} />

                                    <p style={{ marginTop: "5rem", }}>Edit gamemodes here</p>
                                    <div style={{}}>
                                        {reloader && fullData.gamemodes?.map((eachGameObj, gameModeIndex) => {
                                            let chosenEl: JSX.Element | null = null

                                            if (eachGameObj.gameSelection === "matchup") {
                                                chosenEl = <MatchUpGM isEditing={true} gameObj={eachGameObj} updateGameModes={updateGameModes} storyid={fullData.storyid} />
                                            } else if (eachGameObj.gameSelection === "crossword") {
                                                chosenEl = <CrosswordGM isEditing={true} sentGameObj={eachGameObj} updateGameModes={updateGameModes} storyid={fullData.storyid} />
                                            } else if (eachGameObj.gameSelection === "pronounce") {
                                                chosenEl = <PronounciationGM isEditing={true} sentGameObj={eachGameObj} updateGameModes={updateGameModes} storyid={fullData.storyid} />
                                            } else if (eachGameObj.gameSelection === "wordmeaning") {
                                                chosenEl = <WordsToMeaningGM />
                                            }


                                            return (
                                                <div key={eachGameObj.boardObjId} style={{ marginBottom: "2rem" }}>
                                                    {chosenEl}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                        </div>

                        <div className={styles.gameModeOverFlowCont} style={{ backgroundColor: "red", width: "100%", display: showNewGameModeButton ? "none" : "flex", overflowX: "scroll", gap: "1rem" }}>
                            {reloader && fullData.gamemodes?.map((eachGameObj, gmIndex) => {
                                let chosenEl: JSX.Element | null = null

                                if (eachGameObj.gameSelection === "matchup") {
                                    chosenEl = <MatchUpGM gameObj={eachGameObj} />
                                } else if (eachGameObj.gameSelection === "crossword") {
                                    chosenEl = <CrosswordGM sentGameObj={eachGameObj} />
                                } else if (eachGameObj.gameSelection === "pronounce") {
                                    chosenEl = <PronounciationGM sentGameObj={eachGameObj} />
                                } else if (eachGameObj.gameSelection === "wordmeaning") {
                                    chosenEl = <WordsToMeaningGM />
                                }


                                return (
                                    <div key={eachGameObj.boardObjId} style={{ width: "100%", height: "100%", overflowY: "auto", background: "grey", flex: "0 0 auto" }}>
                                        {chosenEl}
                                    </div>
                                )
                            })}
                        </div>

                    </div>
                    <div style={{ display: "flex", gap: ".5rem", alignItems: "center", padding: ".5rem" }}>
                        <button style={{}} onClick={() => { readingSet(false) }}>close</button>
                        {fullData.gamemodes !== null && <button style={{}} onClick={() => { gameModesShowingSet(true) }}>Play Some Games</button>}
                    </div>
                    <h3 style={{ textAlign: "center", fontSize: "2rem" }}>{fullData.title}</h3>

                    <div style={{ alignSelf: "flex-end", textAlign: "center" }}>
                        {fullData.likes > 0 && <p>{fullData.likes} {fullData.likes === 1 ? "Like" : "Likes"}</p>}
                        <div style={{ display: "flex", gap: ".5rem", alignItems: "center", padding: ".5rem", cursor: "pointer" }}>
                            <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><path d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z" /></svg>

                            <p style={{ fontSize: ".6rem" }} onClick={() => {
                                if (!sentLikesAlready) {
                                    const newStoryObj: StoryData = { ...fullData, likes: 1 }
                                    updateStory("likes", newStoryObj)
                                }
                                sentLikesAlreadySet(true)
                            }}>I like this</p>
                        </div>
                    </div>

                    {fullData.storyboard?.map((eachElemnt, index) => {

                        if (eachElemnt.boardType === "text") {
                            return (
                                <div key={index} className={styles.storyTextboardHolder} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                    <p style={{ whiteSpace: "pre-wrap", padding: "1rem", borderRadius: ".7rem", maxWidth: "750px", fontSize: "var(--medium-font-size)" }}>{eachElemnt.storedText}</p>
                                </div>
                            )
                        } else if (eachElemnt.boardType === "image") {
                            return (
                                <DisplayImage key={index} passedImageData={eachElemnt} />
                            )

                        } else if (eachElemnt.boardType === "video") {
                            return (
                                <DisplayVideo key={index} passedVideoData={eachElemnt} />
                            )
                        }
                    })}
                </div>
            )}
            {/* audio */}
            <svg style={{ fill: "var(--secondaryColor)", width: "var(--nav-icon-size)", marginLeft: "auto" }} onClick={() => { editClickedSet(true) }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1v32c0 8.8 7.2 16 16 16h32zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z" /></svg>

            <div style={{ display: "none" }}>
                <ReactPlayer
                    loop={true}
                    playing={reading}
                    url={fullData.backgroundaudio ? fullData.backgroundaudio : "https://www.youtube.com/watch?v=NJuSStkIZBg"} />
            </div>
        </div>
    )
}