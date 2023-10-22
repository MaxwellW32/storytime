"use client"

import './globals.css'
import { useAtom } from 'jotai'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { globalTheme } from './utility/globalState'
import homeBackgroundImage from "@/public/background.png"
import homeBackgroundImageDark from "@/public/backgroundDark.png"
import makeStoryBackground from "@/public/makestorybackground.png"
import makeStoryBackgroundDark from "@/public/makestorybackgroundDark.png"
import NavBar from './components/navbar/NavBar'
import { retreiveFromLocalStorage, saveToLocalStorage } from './utility/savestorage'
import { Roboto_Mono, Comic_Neue } from 'next/font/google'


const comin_nue = Comic_Neue({
  subsets: ['latin'],
  variable: '--font-comic-nue',
  weight: ["300", "400", "700"],
  display: 'swap',
})

const roboto_mono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-roboto-mono',
  display: 'swap',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const [theme, themeSet] = useAtom(globalTheme)

  useEffect(() => {
    const newTheme = retreiveFromLocalStorage("savedTheme") ?? true
    themeSet(newTheme)
  }, [])

  //save theme settings to storage
  useEffect(() => {
    if (theme !== null) {
      saveToLocalStorage("savedTheme", theme)
    }
  }, [theme])

  const themeStyles = useMemo(() => {

    let newThemeObj: {
      [key: string]: string
    } = {}

    if (theme !== null) {
      if (theme) {
        newThemeObj = {
          "--primaryColor": "#ffb200",
          "--secondaryColor": "purple",
          "--backgroundColor": "#ffe9cb",
          "--textColor": "#000",
          "--textColorAnti": "#fff",
          "--backdrop": `url(${homeBackgroundImage.src})`,
          "--editStoryBackdrop": `url(${makeStoryBackground.src})`,
          "--seeThroughBg": "rgba(0,0,0, 0.553)"
        }
      } else {
        newThemeObj = {
          "--primaryColor": "#7777ff",
          "--secondaryColor": "orange",
          "--backgroundColor": "#23201d",
          "--textColor": "#fff",
          "--textColorAnti": "#000",
          "--backdrop": `url(${homeBackgroundImageDark.src})`,
          "--editStoryBackdrop": `url(${makeStoryBackgroundDark.src})`,
          "--seeThroughBg": "rgba(255,255,255, 0.1)"
        }
      }
    }

    return newThemeObj
  }, [theme])

  //set metadata
  useEffect(() => {
    document.title = "Story Time"
  }, [])

  return (
    <html lang="en" style={{ backgroundImage: "var(--backdrop)", ...themeStyles }} className={`${roboto_mono.variable} ${comin_nue.variable}`}>
      <body style={{}}>
        {theme !== null && (
          <>
            <NavBar />
            {children}
          </>
        )}
      </body>
    </html>
  )
}
