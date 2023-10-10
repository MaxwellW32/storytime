"use client"
import { atom, useAtom } from 'jotai'
import { globalStorieArray } from '../utility/globalState'
import { useEffect, useMemo, useState } from 'react'
import { StoryData } from '../page'
import ViewStory from '../components/viewer/ViewStory'
import { retreiveFromLocalStorage } from '../utility/savestorage'
import { v4 as uuidv4 } from "uuid";

export default function Page({ params }: { params: { storyId: string } }) {
    const [globalStories, globalStoriesSet] = useAtom(globalStorieArray)

    //load
    useEffect(() => {
        const seenStories = retreiveFromLocalStorage("storiesArr") as StoryData[]
        if (seenStories) {
            globalStoriesSet(seenStories)
        }
    }, [])

    console.log(`$stories`, globalStories);
    const seenStoryArr = useMemo(() => {
        return globalStories?.filter(eachStory => eachStory.storyId === params.storyId)
    }, [globalStories])

    if (!seenStoryArr) {
        return <p>story not found</p>
    }

    return (
        <div>
            {seenStoryArr.map(eachStory => (
                <ViewStory key={uuidv4()} {...eachStory} fullData={eachStory} paramSeen={params.storyId} />
            ))}
        </div>
    )
}