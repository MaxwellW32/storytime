"use client"
import { useState } from "react"
import styles from "./style.module.css"
import { imageType, storyBoardType } from "@/app/page"

export default function DisplayImage({ passedImageData, editing = false, handleStoryBoard }: { passedImageData: imageType, editing?: boolean, handleStoryBoard?: (option: string, seenBoardId: string, newBoardData?: storyBoardType) => void }) {
    const [imageObj, imageObjSet] = useState<imageType>({ ...passedImageData })


    return (
        <>

            {editing ? (
                <div style={{ color: "var(--textColor)", backgroundColor: "var(--backgroundColor)", padding: "1rem", display: "grid", gap: "1rem" }}>
                    <p>Add An Image</p>
                    <input style={{ width: '100%', color: "var(--textColor)", borderBottom: "2px solid var(--textColor)", backgroundColor: "var(--backgroundColor)" }} placeholder='Enter an Image url' type='text' value={imageObj.imageUrl ?? ""} onChange={(e) => {
                        imageObjSet(prevVideoObj => {
                            prevVideoObj.imageUrl = e.target.value
                            return { ...prevVideoObj }
                        })
                    }} onBlur={() => {
                        if (handleStoryBoard) {
                            handleStoryBoard("update", imageObj.boardObjId, imageObj)
                        }
                    }} />

                    {imageObj.imageUrl !== undefined && (
                        <div className={styles.imageCont}>
                            <img src={imageObj.imageUrl ?? ""}
                            />
                        </div>
                    )}

                </div>
            ) : (
                <div className={styles.imageCont}>
                    <img
                        src={imageObj.imageUrl ? imageObj.imageUrl : "https://images.pexels.com/photos/10497155/pexels-photo-10497155.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"}
                    />
                </div>
            )}

        </>

    )

}