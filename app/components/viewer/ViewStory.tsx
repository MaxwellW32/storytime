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
import { useAtom } from 'jotai';
import { allServerFunctionsAtom } from '@/app/utility/globalState';
import { handleLikedStories, retreiveFromLocalStorage, saveToLocalStorage } from '@/app/utility/savestorage';
import AddPassword from '../useful/AddPassword';
import ShowServerErrors from '../useful/ShowServerErrors';

function HandleRating({ rating, ratingAmt, seenStory }: { rating: number, ratingAmt: number, seenStory: StoryData }) {
    const [allServerFunctions,] = useAtom(allServerFunctionsAtom)
    const [userRating, userRatingSet] = useState<number | undefined>(ratingAmt > 0 ? rating / ratingAmt : undefined)
    const [canShowButton, canShowButtonSet] = useState(userRating !== undefined ? false : true)

    const sendOffRating = () => {
        allServerFunctions!.updateStory("rating", { ...seenStory, rating: userRating! })

        canShowButtonSet(false)
    }

    return (
        <div onClick={() => {
            if (!canShowButton) {
                canShowButtonSet(true)
            }
        }}>
            <DisplayStars starRating={userRating} userRatingSet={userRatingSet} />
            {userRating !== undefined && canShowButton && <button style={{ marginTop: ".5rem" }} onClick={sendOffRating}>Send</button>}
        </div>
    )
}

function DisplayStars({ starRating, userRatingSet }: { starRating: number | undefined, userRatingSet?: React.Dispatch<React.SetStateAction<number | undefined>> }) {
    let amtOfFullStars = 5
    const halfStarPresent = (starRating ?? 5) % 1 >= 0.5

    const starArray = useMemo(() => {
        const fullSvgArray: JSX.Element[] = []

        const fullstar = <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 576 512"><path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z" /></svg>

        const halfStar = <svg style={{ fill: "var(--secondaryColor)" }} xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 640 512"><path d="M320 376.4l.1-.1 26.4 14.1 85.2 45.5-16.5-97.6-4.8-28.7 20.7-20.5 70.1-69.3-96.1-14.2-29.3-4.3-12.9-26.6L320.1 86.9l-.1 .3V376.4zm175.1 98.3c2 12-3 24.2-12.9 31.3s-23 8-33.8 2.3L320.1 439.8 191.8 508.3C181 514 167.9 513.1 158 506s-14.9-19.3-12.9-31.3L169.8 329 65.6 225.9c-8.6-8.5-11.7-21.2-7.9-32.7s13.7-19.9 25.7-21.7L227 150.3 291.4 18c5.4-11 16.5-18 28.8-18s23.4 7 28.8 18l64.3 132.3 143.6 21.2c12 1.8 22 10.2 25.7 21.7s.7 24.2-7.9 32.7L470.5 329l24.6 145.7z" /></svg>

        for (let index = 0; index < amtOfFullStars; index++) {
            fullSvgArray.push(fullstar)
        }


        if (halfStarPresent) {
            fullSvgArray.pop()
            fullSvgArray.push(halfStar)
        }

        return fullSvgArray
    }, [starRating])

    return (
        <div style={{ display: "flex", gap: ",2rem", justifyContent: "center" }}>
            {starArray.map((eachSvg, svgIndex) => (
                <div key={svgIndex} style={{ fill: starRating !== undefined && svgIndex + 1 <= starRating ? "var(--secondaryColor)" : "white" }} onClick={() => {
                    if (userRatingSet) {
                        userRatingSet(svgIndex + 1)
                    }
                }}>
                    {eachSvg}
                </div>
            ))}
        </div>
    )
}

export default function ViewStory({ fullData }: { fullData: StoryData }) {

    const [allServerFunctions,] = useAtom(allServerFunctionsAtom)

    const [reading, readingSet] = useState(false)

    const descRef = useRef<HTMLParagraphElement>(null)
    const [showDescriptionFull, showDescriptionFullSet] = useState(false)
    const [descOverFlowing, descOverFlowingSet] = useState(false)
    const [userTriedToDelete, userTriedToDeleteSet] = useState(false)
    const [wantsToEditCurrentGamemodes, wantsToEditCurrentGamemodesSet] = useState(false)
    const [canPlayAudio, canPlayAudioSet] = useState(false)

    const [typedPass, typedPassSet] = useState("")
    const [errorsSeen, errorsSeenSet] = useState<{
        [key: string]: string
    }>()

    const [errorsSeenForGamemode, errorsSeenForGamemodeSet] = useState<{
        [key: string]: string
    }>()

    const [wantsToDeleteGamemodeArr, wantsToDeleteGamemodeArrSet] = useState<boolean[]>([])

    //monitor reading or not, for sound
    useEffect(() => {
        canPlayAudioSet(reading)
    }, [reading])

    useEffect(() => {
        const element = descRef.current;
        if (element) {
            descOverFlowingSet(element.scrollHeight > element.clientHeight);
        }
    }, [])

    const [editClicked, editClickedSet] = useState(false)
    const [sentLikesAlready, sentLikesAlreadySet] = useState(() => {
        return handleLikedStories(fullData.storyid, "check")
    })

    const [gameModesShowing, gameModesShowingSet] = useState(false)
    const [showNewGameModeButton, showNewGameModeButtonSet] = useState(false)

    const [showedHelpOnce, showedHelpOnceSet] = useState<boolean>(retreiveFromLocalStorage("ShowedMultipleGamemodesTip") ?? false)

    const [passForDelete, passForDeleteSet] = useState("")


    return (
        <div style={{ width: "95%", margin: "0 auto", borderRadius: ".7rem", padding: "1rem", backgroundColor: "var(--primaryColor)", position: "relative", display: "grid" }}>

            {editClicked && <MakeStory shouldUpdateStory={true} passedData={fullData} editClickedSet={editClickedSet} />}

            <div className={styles.titleCont}>
                <h3 style={{ justifySelf: "flex-start" }}>{fullData.title}</h3>

                <div className="flex flex-col gap-1 items-center">
                    <DisplayStars starRating={fullData.amtofratings > 0 ? fullData.rating / fullData.amtofratings : undefined} />
                </div>

                <div style={{ display: "grid", gap: "1rem", gridAutoFlow: "column", gridTemplateColumns: "1fr 20px" }}>
                    {!userTriedToDelete ? (
                        <>
                            <button onClick={() => { readingSet(true) }}> Let&apos;s Read </button>
                            <svg style={{ fill: "var(--secondaryColor)" }} onClick={() => { userTriedToDeleteSet(true) }} xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><path d="M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z" /></svg>
                        </>
                    ) : (
                        <div>
                            <p>Are you sure you want to delete?</p>
                            <AddPassword option='story' password={typedPass} storyPasswordSet={typedPassSet} showFieldOnly={true} />
                            <ShowServerErrors errorsSeen={errorsSeen} />
                            <div style={{ display: "flex", width: "100%", justifyContent: "center", gap: ".5rem", marginTop: ".5rem" }}>
                                <button onClick={async () => {

                                    const serverMessageObj = await allServerFunctions!.deleteStory(fullData.storyid, typedPass)

                                    if (serverMessageObj["message"].length !== 0) {
                                        errorsSeenSet(serverMessageObj)
                                    } else {
                                        userTriedToDeleteSet(false)
                                    }

                                }}>Delete Story</button>
                                <button onClick={() => {
                                    userTriedToDeleteSet(false)
                                }}>Cancel</button>
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
                <div className={`${styles.readingArea} niceScrollbar`} style={{ gridTemplateColumns: gameModesShowing ? "1fr 1fr" : "1fr" }}>
                    <div>
                        <span style={{ width: "1rem", aspectRatio: "1/1", position: "absolute", right: 0, margin: "1rem", fill: "var(--textColor)" }} onClick={() => { canPlayAudioSet(prev => !prev) }}>
                            {canPlayAudio ? (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M48 64C21.5 64 0 85.5 0 112V400c0 26.5 21.5 48 48 48H80c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zm192 0c-26.5 0-48 21.5-48 48V400c0 26.5 21.5 48 48 48h32c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H240z" /></svg>
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z" /></svg>
                                </>)
                            }
                        </span>

                        <span style={{ display: "flex", gap: ".5rem", alignItems: "center", padding: ".5rem" }}>
                            <button style={{}} onClick={() => { readingSet(false) }}>Home</button>

                            {true && <button style={{}} onClick={() => { gameModesShowingSet(true) }}>Story Games</button>}
                        </span>

                        <h3 style={{ textAlign: "center", fontSize: "2rem" }}>{fullData.title}</h3>

                        <div style={{ alignSelf: "flex-end", textAlign: "center", marginRight: "1rem" }}>
                            {fullData.likes > 0 && <p>{fullData.likes} {fullData.likes === 1 ? "Like" : "Likes"}</p>}

                            <div onClick={() => {
                                if (!sentLikesAlready) {
                                    const newStoryObj: StoryData = { ...fullData, likes: 1 }
                                    allServerFunctions!.updateStory("likes", newStoryObj)
                                }
                                sentLikesAlreadySet(true)
                                handleLikedStories(fullData.storyid, "add")
                            }} style={{ display: "flex", gap: ".5rem", alignItems: "center", padding: ".5rem", cursor: "pointer" }}>
                                <svg style={{ fill: sentLikesAlready ? "var(--secondaryColor)" : "var(--textColor)" }} xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><path d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z" /></svg>

                                <p style={{ fontSize: ".6rem", color: sentLikesAlready ? "var(--secondaryColor)" : "var(--textColor)" }} >I like{sentLikesAlready && "'d"} this</p>
                            </div>

                            <HandleRating rating={fullData.rating} ratingAmt={fullData.amtofratings} seenStory={fullData} />
                        </div>

                        {fullData.storyboard?.map((eachElemnt, index) => {

                            if (eachElemnt.boardType === "text") {
                                return (
                                    <div key={index} className={styles.storyTextboardHolder}>
                                        <p>{eachElemnt.storedText}</p>
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


                    <div className={styles.gameModeParty} style={{ display: gameModesShowing ? "grid" : "none" }}>
                        <div>
                            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: ".5rem", padding: ".5rem", justifyContent: "space-between" }}>
                                <svg style={{ height: "2.5rem", fill: "var(--secondaryColor)", cursor: "pointer", rotate: "180deg" }} onClick={() => { gameModesShowingSet(false) }} xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><path d="M217.9 105.9L340.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L217.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1L32 320c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM352 416l64 0c17.7 0 32-14.3 32-32l0-256c0-17.7-14.3-32-32-32l-64 0c-17.7 0-32-14.3-32-32s14.3-32 32-32l64 0c53 0 96 43 96 96l0 256c0 53-43 96-96 96l-64 0c-17.7 0-32-14.3-32-32s14.3-32 32-32z" /></svg>

                                <button onClick={() => { showNewGameModeButtonSet(prev => !prev) }}>{showNewGameModeButton ? "Play Games" : "Add Game"}</button>

                                {!showedHelpOnce && fullData.gamemodes && fullData.gamemodes.length > 1 && (
                                    <div style={{ flex: 1, display: "flex", paddingRight: "3rem", gap: "1rem" }}>
                                        <h3 style={{ flex: 1, textAlign: "end" }}>Multiple Gamemodes - Swipe Left</h3>

                                        <svg style={{ fill: "var(--secondaryColor)" }} onClick={() => {
                                            showedHelpOnceSet(true)
                                            saveToLocalStorage("ShowedMultipleGamemodesTip", true)
                                        }} xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><path d="M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z" /></svg>
                                    </div>
                                )}
                            </div>

                            <div style={{ display: showNewGameModeButton ? "block" : "none" }}>
                                <GamemodeMaker updateGamemodeDirectly={true} storyId={fullData.storyid} />

                                {fullData.gamemodes && <button className='switchTabButton' style={{ marginTop: "70%", marginBottom: "1rem" }} onClick={() => {
                                    wantsToEditCurrentGamemodesSet(prev => !prev)
                                }}>Edit Story Gamemodes</button>}

                                <div style={{ display: "grid", gap: "5rem" }}>
                                    {wantsToEditCurrentGamemodes && fullData.gamemodes?.map((eachGameObj, gameModeIndex) => {
                                        let chosenEl: JSX.Element | null = null

                                        if (eachGameObj.gameSelection === "matchup") {
                                            chosenEl = <MatchUpGM isEditing={true} gameObj={eachGameObj} updateGamemodeDirectly={true} storyid={fullData.storyid} />
                                        } else if (eachGameObj.gameSelection === "crossword") {
                                            chosenEl = <CrosswordGM isEditing={true} sentGameObj={eachGameObj} updateGamemodeDirectly={true} storyid={fullData.storyid} />
                                        } else if (eachGameObj.gameSelection === "pronounce") {
                                            chosenEl = <PronounciationGM isEditing={true} sentGameObj={eachGameObj} updateGamemodeDirectly={true} storyid={fullData.storyid} />
                                        } else if (eachGameObj.gameSelection === "wordmeaning") {
                                            chosenEl = <WordsToMeaningGM isEditing={true} sentGameObj={eachGameObj} updateGamemodeDirectly={true} storyid={fullData.storyid} />
                                        }


                                        return (
                                            <div key={eachGameObj.boardObjId} style={{ display: "grid" }}>
                                                <div style={{ padding: "1rem" }}>
                                                    <svg style={{ width: "1.5rem", fill: "var(--textColor)", cursor: "pointer" }} onClick={() => {
                                                        wantsToDeleteGamemodeArrSet(prev => {
                                                            const newArr = [...prev]
                                                            newArr[gameModeIndex] = true
                                                            return newArr
                                                        })
                                                    }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M170.5 51.6L151.5 80h145l-19-28.4c-1.5-2.2-4-3.6-6.7-3.6H177.1c-2.7 0-5.2 1.3-6.7 3.6zm147-26.6L354.2 80H368h48 8c13.3 0 24 10.7 24 24s-10.7 24-24 24h-8V432c0 44.2-35.8 80-80 80H112c-44.2 0-80-35.8-80-80V128H24c-13.3 0-24-10.7-24-24S10.7 80 24 80h8H80 93.8l36.7-55.1C140.9 9.4 158.4 0 177.1 0h93.7c18.7 0 36.2 9.4 46.6 24.9zM80 128V432c0 17.7 14.3 32 32 32H336c17.7 0 32-14.3 32-32V128H80zm80 64V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16z" /></svg>


                                                    {wantsToDeleteGamemodeArr[gameModeIndex] && (
                                                        <>
                                                            <p>Are you sure you want to delete</p>

                                                            <p>Gamemode Password or Story Password is accepted to delete</p>

                                                            <ShowServerErrors errorsSeen={errorsSeenForGamemode} />

                                                            <AddPassword option='gamemode' password={passForDelete} storyPasswordSet={passForDeleteSet} showFieldOnly={true} />

                                                            <button className='utilityButton' onClick={async () => {
                                                                const serverMessageObj = await allServerFunctions!.updateGameModes({ ...eachGameObj, gamePass: passForDelete }, fullData.storyid, "delete")

                                                                if (serverMessageObj["message"].length !== 0) {
                                                                    errorsSeenForGamemodeSet(serverMessageObj)
                                                                } else {
                                                                    errorsSeenForGamemodeSet(undefined)
                                                                    wantsToDeleteGamemodeArrSet(prev => {
                                                                        const newArr = [...prev]
                                                                        newArr[gameModeIndex] = false
                                                                        return newArr
                                                                    })
                                                                }

                                                            }}>Yes</button>

                                                            <button className='utilityButton' onClick={() => {
                                                                wantsToDeleteGamemodeArr[gameModeIndex]
                                                                wantsToDeleteGamemodeArrSet(prev => {
                                                                    const newArr = [...prev]
                                                                    newArr[gameModeIndex] = false
                                                                    return newArr
                                                                })
                                                            }}>Cancel</button>
                                                        </>
                                                    )}

                                                </div>

                                                {chosenEl}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className={`${styles.gameModeDisplayMapCont} niceScrollbar`} style={{ display: showNewGameModeButton ? "none" : "grid" }}>
                            {fullData.gamemodes?.map((eachGameObj) => {
                                let chosenEl: JSX.Element | null = null

                                if (eachGameObj.gameSelection === "matchup") {
                                    chosenEl = <MatchUpGM gameObj={eachGameObj} />
                                } else if (eachGameObj.gameSelection === "crossword") {
                                    chosenEl = <CrosswordGM sentGameObj={eachGameObj} />
                                } else if (eachGameObj.gameSelection === "pronounce") {
                                    chosenEl = <PronounciationGM sentGameObj={eachGameObj} />
                                } else if (eachGameObj.gameSelection === "wordmeaning") {
                                    chosenEl = <WordsToMeaningGM sentGameObj={eachGameObj} />
                                }


                                return (
                                    <div key={eachGameObj.boardObjId} className={`${styles.eachGameModeDisplay} niceScrollbar`} style={{}}>
                                        {chosenEl}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            )
            }















































            {/* audio */}
            <svg style={{ fill: "var(--secondaryColor)", width: "var(--nav-icon-size)", marginLeft: "auto" }} onClick={() => { editClickedSet(true) }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1v32c0 8.8 7.2 16 16 16h32zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z" /></svg>

            <div style={{ display: "none" }}>
                <ReactPlayer
                    loop={true}
                    playing={canPlayAudio}
                    url={fullData.backgroundaudio ? fullData.backgroundaudio : "https://www.youtube.com/watch?v=NJuSStkIZBg"} />
            </div>
        </div >
    )
}