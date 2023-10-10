"use client"
import Image from 'next/image'
import { useMemo, useState, useRef, useEffect } from "react"
import { v4 as uuidv4 } from "uuid";
import styles from "./style.module.css"
import { atom, useAtom } from 'jotai'
import ReactPlayer from "react-player/youtube";
import { globalStorieArray } from '@/app/utility/globalState'
import MakeStory from '../maker/MakeStory';
import Link from 'next/link';
import DisplayImage from '../display/DisplayImage';
import DisplayVideo from '../display/DisplayVideo';
import MatchUpGM from '../gamemodes/MatchUpGM';
import CrosswordGM from '../gamemodes/CrosswordGM';
import WordsToMeaningGM from '../gamemodes/WordsToMeaningGM';
import PronounciationGM from '../gamemodes/PronounciationGM';
import { StoryData } from '@/app/page';

export default function ViewStory({ title, rating, storyBoard, shortDescription, backgroundAudio, storyId, fullData, paramSeen }: StoryData & { fullData?: StoryData, paramSeen?: string }) {

    const [reading, readingSet] = useState(() => {
        if (paramSeen) {
            return true
        } else {
            return false
        }
    })

    const [globalStories, globalStoriesSet] = useAtom(globalStorieArray)

    function deleteStory(id: string) {
        globalStoriesSet(prevGlobalStoryArr => {
            const newGlobalArr = prevGlobalStoryArr!.filter(eachStory => eachStory.storyId !== id)
            return newGlobalArr
        })
    }

    const descRef = useRef<HTMLParagraphElement>(null)
    const [showDescriptionFull, showDescriptionFullSet] = useState(false)
    const [descOverFlowing, descOverFlowingSet] = useState(false)

    useEffect(() => {
        const element = descRef.current;
        if (element) {
            descOverFlowingSet(element.scrollHeight > element.clientHeight);
        }
    }, [])

    const [editClicked, editClickedSet] = useState(false)

    return (
        <div style={{ width: "95%", margin: "0 auto", borderRadius: ".7rem", padding: "1rem", backgroundColor: "var(--backgroundColor)", position: "relative" }}>

            {editClicked && <MakeStory passedData={fullData} editClickedSet={editClickedSet} />}

            <div className={styles.titleCont}>

                <h3>{title}</h3>

                <div className="flex flex-col gap-1 items-center">
                    {rating && <p>{rating}/5</p>}
                    <Image height={20} alt='ratingstars' src={require("../../../public/threestars.png")} style={{ objectFit: "contain" }} />
                </div>

                <div style={{ display: "flex", gap: "1rem" }}>
                    <button onClick={() => { readingSet(true) }}>
                        <Link href={`/${storyId}`}>
                            Let&apos;s Read
                        </Link>
                    </button>
                    <button style={{}} onClick={() => { deleteStory(storyId) }}>Delete Story</button>
                </div>
            </div>

            <div className={`italic`} style={{ fontSize: ".9em", marginTop: "var(--medium-margin)", display: "grid", gap: ".3rem", alignSelf: "flex-end" }}>
                {shortDescription && (
                    <>
                        <p >Description -</p>
                        <p ref={descRef} className={styles.descText} style={{ display: showDescriptionFull ? "block" : "-webkit-box" }}>{shortDescription}</p>
                        {descOverFlowing && <p className={styles.highlighted} onClick={() => {
                            showDescriptionFullSet(prev => !prev)
                        }}>{showDescriptionFull ? "Show Less" : "Show More"}</p>}
                    </>
                )}
            </div>

            {/* storyboard container */}
            {reading && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", position: "fixed", top: 0, left: 0, height: "100dvh", width: "100%", overflowY: "auto", backgroundColor: "var(--backgroundColor)", zIndex: 1, color: "var(--textColor)" }}>
                    <button style={{ margin: ".5rem 0 0 .5rem" }} onClick={() => {
                        readingSet(false)
                    }}>
                        <Link href={`/`}>close</Link>
                    </button>
                    <h3 style={{ textAlign: "center", fontSize: "2rem" }}>{title}</h3>

                    {storyBoard?.map((eachElemnt, index) => {

                        if (eachElemnt.boardType === "text") {
                            return (
                                <div key={uuidv4()} className={styles.storyTextboardHolder} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                    <p style={{ whiteSpace: "pre-wrap", padding: "1rem", borderRadius: ".7rem", maxWidth: "750px", fontSize: "var(--medium-font-size)" }}>{eachElemnt.storedText}</p>
                                </div>
                            )
                        } else if (eachElemnt.boardType === "image") {
                            return (
                                <DisplayImage key={uuidv4()} passedImageData={eachElemnt} />
                            )

                        } else if (eachElemnt.boardType === "video") {
                            return (
                                <DisplayVideo key={uuidv4()} passedVideoData={eachElemnt} />
                            )


                        } else if (eachElemnt.boardType === "gamemode") {
                            return (
                                <div key={uuidv4()} className={styles.storyTextboardHolder} style={{ display: "flex", flexDirection: "column", backgroundColor: "var(--backgroundColor)" }} >

                                    {eachElemnt.gameSelection === "matchup" ? (
                                        <MatchUpGM {...eachElemnt} storyId={storyId} />
                                    ) : eachElemnt.gameSelection === "crossword" ? (
                                        <CrosswordGM gameObj={eachElemnt} />
                                    ) : eachElemnt.gameSelection === "wordmeaning" ? (
                                        <WordsToMeaningGM />
                                    ) : eachElemnt.gameSelection === "pronounce" ? (
                                        <PronounciationGM />
                                    ) : null}
                                </div>
                            )
                        }
                    })}
                </div>
            )}
            {/* audio */}
            <svg style={{ fill: "var(--secondaryColor)", width: "var(--nav-icon-size)", marginLeft: "auto" }} onClick={() => { editClickedSet(true) }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1v32c0 8.8 7.2 16 16 16h32zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z" /></svg>

            <div style={{ display: "none", opacity: 0, userSelect: "none" }}>
                <ReactPlayer
                    loop={true}
                    playing={reading}
                    url={backgroundAudio ? backgroundAudio : "https://www.youtube.com/watch?v=NJuSStkIZBg"} />
            </div>
        </div>
    )
}