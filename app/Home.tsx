"use client"
import { useState } from "react"
import { v4 as uuidv4 } from "uuid";
import styles from "./style.module.css"
import MakeStory from './components/maker/MakeStory';
import ViewStory from './components/viewer/ViewStory';
import { StoryData, StoryDataSend } from "./page";


export default function Home({ allstories, updateStory, newStory, deleteStory }: { allstories: StoryData[], updateStory: (seeBoard: StoryData) => Promise<void>, newStory: (newStory: StoryDataSend) => Promise<void>, deleteStory: (seenId: string) => Promise<void> }) {

    const [makingStory, makingStorySet] = useState(false)

    return (
        <main className={styles.homeDiv}>

            {makingStory
                ? <MakeStory newStory={newStory} makingStorySet={makingStorySet} />
                : (<button style={{ margin: ".5rem 0 0 .5rem" }} onClick={() => { makingStorySet(true) }}>Add a Story</button>)
            }

            {allstories?.map((eachStory: StoryData) => (
                <ViewStory deleteStory={deleteStory} updateStory={updateStory} key={uuidv4()} fullData={eachStory} />
            ))}
        </main>
    )
}


//this is the layout for the objects of each of my games that holds everything

