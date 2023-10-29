"use client"
import { atom } from 'jotai'
import { StoryData, StoryDataSend, updateGameModesParams } from "../page";

// export const globalTheme = atom<boolean>(retreiveFromLocalStorage("savedTheme") ?? true);
export const globalTheme = atom<boolean | null>(null);

export const allServerFunctionsAtom = atom<{
    "getStories": () => Promise<StoryData[] | undefined>,
    "deleteStory": (seenId: string, sentPAss: string) => Promise<{ message: string }>,
    "newStory": (newStory: StoryDataSend) => Promise<void>,
    "updateStory": (option: "story" | "likes" | "rating", seenStory: StoryData) => Promise<{ message: string }>,
    "newAllStory": (newStoriesArr: StoryData[]) => Promise<void>,
    "updateGameModes": updateGameModesParams,
    "updatePassword": (option: "story" | "gamemode", sentStoryId: string, oldPass: string, newPass: string, sentGameModeObjId?: string) => Promise<{ message: string }>
} | null>(null);

