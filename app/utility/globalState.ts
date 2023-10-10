"use client"

import { atom, useAtom } from 'jotai'
import { StoryData } from '../page'

export const globalStorieArray = atom<StoryData[] | undefined>(undefined)


const myTheme: () => boolean = () => {
    const savedTheme = localStorage.getItem('savedTheme');
    if (savedTheme !== null) {
        return JSON.parse(savedTheme);
    }
    return true
}

export const globalTheme = atom<boolean>(myTheme());

