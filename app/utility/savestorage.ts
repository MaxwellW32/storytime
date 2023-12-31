"use client"

import { revalidatePath } from "next/cache";

export function saveToLocalStorage(keyName: any, item: any) {
    localStorage.setItem(keyName, JSON.stringify(item));
}

export function retreiveFromLocalStorage(keyName: string): any {
    const keyItem = localStorage.getItem(keyName);

    if (keyItem !== null) {
        const keyItemParsed = JSON.parse(keyItem);
        return keyItemParsed
    } else {
        return null
    }
}

export function handleStoriesWhereGameOver(seenStoryId: string, seenObjId: string, option: "read" | "update") {

    // game finished - obj with storyid's as index, each has an array with obj id's check there if game finished / save changes

    type seenObjtype = {
        [key: string]: string[]
    }

    let seenObj: seenObjtype | null = retreiveFromLocalStorage("storiesWhereGameOver")

    if (option === "read") {
        if (!seenObj) return false

        if (!seenObj[seenStoryId]) seenObj[seenStoryId] = []

        return seenObj[seenStoryId].includes(seenObjId)

    } else if (option === "update") {
        //make sure it is an object
        if (!seenObj) seenObj = {}

        //make sure the obj key exists with an array value to start
        if (!seenObj[seenStoryId]) seenObj[seenStoryId] = []


        if (seenObj[seenStoryId].includes(seenObjId)) {

            const newArr = seenObj[seenStoryId].filter(eachObjId => eachObjId !== seenObjId)
            seenObj[seenStoryId] = newArr

        } else {
            const newArr = [...seenObj[seenStoryId], seenObjId]
            seenObj[seenStoryId] = newArr
        }

        saveToLocalStorage("storiesWhereGameOver", seenObj)
    }
}

export function handleLikedStories(seenStoryId: string, option: "check" | "add") {

    // game finished - obj with storyid's as index, each has an array with obj id's check there if game finished / save changes

    type seenObjtype = {
        [key: string]: boolean
    }

    let seenObj: seenObjtype | null = retreiveFromLocalStorage("storiesLiked")

    if (!seenObj) seenObj = {}

    if (option === "check") {
        return seenObj[seenStoryId] ? true : false

    } else if (option === "add") {
        seenObj[seenStoryId] = true
        saveToLocalStorage("storiesLiked", seenObj)
    }
}

export function saveRecentlySeenStories(seenStoryId: string) {

    let seenStories: string[] | null = retreiveFromLocalStorage("recentlySeenStories")

    if (!seenStories) seenStories = []

    if (!seenStories.includes(seenStoryId)) {
        seenStories = [seenStoryId, ...seenStories]
        saveToLocalStorage("recentlySeenStories", seenStories)
    }
}