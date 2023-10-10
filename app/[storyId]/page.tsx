"use client"
import { atom, useAtom } from 'jotai'
import { globalStorieArray } from '../utility/globalState'
import { useEffect, useMemo, useState } from 'react'
import { StoryData, ViewStory } from '../page'
import { retreiveFromLocalStorage } from '../utility/savestorage'

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
                <ViewStory {...eachStory} fullData={eachStory} params={params} />
            ))}
        </div>
    )
}