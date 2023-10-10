"use client"

import { atom } from 'jotai'
import { StoryData } from '../page'

export const globalStorieArray = atom<StoryData[] | undefined>(undefined)

export const globalTheme = atom<boolean>(true);

