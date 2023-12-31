"use client"
import { useState } from "react"
import styles from "./style.module.css"
import { imageType, storyBoardType } from "@/app/page"

export default function DisplayImage({ passedImageData, editing = false, handleStoryBoard }: { passedImageData: imageType, editing?: boolean, handleStoryBoard?: (option: string, seenBoardId: string, newBoardData?: storyBoardType) => void }) {
    const [imageObj, imageObjSet] = useState<imageType>({ ...passedImageData })


    return (
        <>

            {editing ? (
                <div style={{ backgroundColor: "var(--primaryColor)", padding: "1rem", display: "grid", gap: "1rem" }}>
                    <p className="bold">Add An Image</p>
                    <input style={{ width: '100%', borderBottom: "2px solid var(--textColor)" }} placeholder='Enter an Image url' type='text' value={imageObj.imageUrl ?? ""} onChange={(e) => {
                        imageObjSet(prevVideoObj => {
                            prevVideoObj.imageUrl = e.target.value
                            return { ...prevVideoObj }
                        })
                    }} onBlur={() => {
                        if (handleStoryBoard) {
                            handleStoryBoard("update", imageObj.boardObjId, imageObj)
                        }
                    }} />

                    {imageObj.imageUrl !== null && imageObj.imageUrl !== "" && (
                        <div className={styles.imageCont}>
                            <img src={imageObj.imageUrl}
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