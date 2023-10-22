"use client"

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
    let seenObj: seenObjtype = retreiveFromLocalStorage("storiesWhereGameOver") as seenObjtype

    if (option === "read") {
        if (seenObj === null) {
            return false //no obj seen so gamefinished is false
        } else {

            if (!seenObj[seenStoryId]) {
                seenObj[seenStoryId] = []
            }
            return seenObj[seenStoryId].includes(seenObjId)
        }

    } else if (option === "update") {
        //make sure it is an object
        if (seenObj === null) {
            seenObj = {}
        }

        //make sure the obj key exists with an array value to start
        if (seenObj[seenStoryId] === undefined) {
            seenObj[seenStoryId] = []
        }

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
