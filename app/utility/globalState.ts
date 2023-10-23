"use client"
import { atom } from 'jotai'
import { StoryData, StoryDataSend, updateGameModesParams } from "../page";

// export const globalTheme = atom<boolean>(retreiveFromLocalStorage("savedTheme") ?? true);
export const globalTheme = atom<boolean | null>(null);

export const allServerFunctionsAtom = atom<{
    "getStories": () => Promise<StoryData[] | undefined>,
    "deleteStory": (seenId: string) => Promise<void>,
    "newStory": (newStory: StoryDataSend) => Promise<void>,
    "updateStory": (option: "story" | "likes", seenStory: StoryData) => Promise<void>,
    "newAllStory": (newStoriesArr: StoryData[]) => Promise<void>,
    "updateGameModes": updateGameModesParams,
} | null>(null);

