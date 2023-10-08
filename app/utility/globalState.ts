"use client"

import { atom, useAtom } from 'jotai'
import { StoryData } from '../page'

export const globalStorieArray = atom<StoryData[] | undefined>(undefined)
export const globalTheme = atom<boolean>(false)