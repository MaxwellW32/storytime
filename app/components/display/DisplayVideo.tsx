"use client"
import { useState } from "react"
import styles from "./style.module.css"
import { imageType, storyBoardType, videoType } from "@/app/page"
import ReactPlayer from "react-player"


export default function DisplayVideo({ passedVideoData, editing = false, handleStoryBoard }: { passedVideoData: videoType, editing?: boolean, handleStoryBoard?: (option: string, seenBoardId: string, newBoardData?: storyBoardType) => void }) {
    const [videoObj, videoObjSet] = useState<videoType>({ ...passedVideoData })

    return (
        <div className={styles.videoCont}>

            {editing ? (
                <>
                    <p>Add A Video</p>
                    <input style={{ backgroundColor: "var(--backgroundColor)", color: "var(--textColor)", borderBottom: "2px solid var(--textColor)" }} type='text' placeholder='Enter a Youtube Url' value={videoObj.videoUrl} onChange={(e) => {
                        videoObjSet(prevVideoObj => {
                            prevVideoObj.videoUrl = e.target.value
                            return { ...prevVideoObj }
                        })
                    }} onBlur={() => {
                        if (handleStoryBoard) {
                            handleStoryBoard("update", videoObj.boardObjId, videoObj)
                        }
                    }} />

                    <div style={{ overflow: "hidden", maxWidth: "90dvw" }}>
                        <ReactPlayer
                            loop={false}
                            playing={false}
                            url={videoObj.videoUrl}
                        />
                    </div>
                </>
            ) : (
                <div style={{ overflow: "hidden", maxWidth: "100dvw" }}>
                    <ReactPlayer
                        loop={false}
                        playing={false}
                        url={videoObj.videoUrl ? videoObj.videoUrl : "https://www.youtube.com/watch?v=NJuSStkIZBg"}
                    />
                </div>
            )}

        </div>

    )

}