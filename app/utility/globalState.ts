"use client"
import { atom } from 'jotai'

export const globalTheme = atom<boolean | null>(null);

export const search = atom<string>("");
