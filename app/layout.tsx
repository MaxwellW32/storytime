"use client"

import './globals.css'
import { useAtom } from 'jotai'
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { globalTheme } from './utility/globalState'
import homeBackgroundImage from "@/public/background.png"
import homeBackgroundImageDark from "@/public/backgroundDark.png"
import makeStoryBackground from "@/public/makestorybackground.png"
import makeStoryBackgroundDark from "@/public/makestorybackgroundDark.png"
import NavBar from './components/navbar/NavBar'
import { retreiveFromLocalStorage, saveToLocalStorage } from './utility/savestorage'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {


  const [theme, themeSet] = useAtom(globalTheme)

  //load old theme settings from storage
  useLayoutEffect(() => {
    const seenTheme = retreiveFromLocalStorage("savedTheme")
    if (seenTheme !== null) {
      themeSet(seenTheme)
    }
  }, [])


  const didMount = useRef(false)
  //save theme settings to storage
  useEffect(() => {
    if (didMount.current) {
      saveToLocalStorage("savedTheme", theme)
    }

    didMount.current = true
  }, [theme])

  const themeStyles = useMemo(() => {

    let newThemeObj: {
      [key: string]: string
    } = {}

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


    return newThemeObj
  }, [theme])

  //set metadata
  useEffect(() => {
    document.title = "Story Time"
  }, [])

  return (
    <html lang="en" style={{ backgroundImage: "var(--backdrop)", ...themeStyles }}>
      <body>
        <NavBar />
        {children}
      </body>
    </html>
  )
}
