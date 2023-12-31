import { atom, useAtom } from 'jotai'
import { globalTheme, search } from '@/app/utility/globalState'
import styles from "./style.module.css"
import Link from 'next/link'

export default function NavBar() {
    const [theme, themeSet] = useAtom(globalTheme)
    const [searchStr, searchStrSet] = useAtom(search)

    return (
        <nav style={{ backgroundColor: "var(--primaryColor)", position: "sticky", top: 0, zIndex: 1, display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "space-around", alignItems: "center", padding: ".5rem", borderBottom: "2px solid var(--textColor)" }}>
            <li style={{ display: "flex" }}>
                <Link href={"/"}>
                    <svg className={styles.navIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M575.8 255.5c0 18-15 32.1-32 32.1h-32l.7 160.2c0 2.7-.2 5.4-.5 8.1V472c0 22.1-17.9 40-40 40H456c-1.1 0-2.2 0-3.3-.1c-1.4 .1-2.8 .1-4.2 .1H416 392c-22.1 0-40-17.9-40-40V448 384c0-17.7-14.3-32-32-32H256c-17.7 0-32 14.3-32 32v64 24c0 22.1-17.9 40-40 40H160 128.1c-1.5 0-3-.1-4.5-.2c-1.2 .1-2.4 .2-3.6 .2H104c-22.1 0-40-17.9-40-40V360c0-.9 0-1.9 .1-2.8V287.6H32c-18 0-32-14-32-32.1c0-9 3-17 10-24L266.4 8c7-7 15-8 22-8s15 2 21 7L564.8 231.5c8 7 12 15 11 24z" /></svg>
                </Link>
            </li>

            <li style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "1rem" }}>
                <input style={{ backgroundColor: "var(--textColorAnti)" }} type='text' value={searchStr} onChange={(e) => {
                    searchStrSet(e.target.value.trimStart())
                }} placeholder='Search' />

                <div style={{ rotate: theme ? "0deg" : "230deg", display: "grid", justifyItems: "center", alignItems: "center", transition: "rotate 1s" }} onClick={() => { themeSet(prev => !prev) }}>
                    {theme ? (
                        <svg
                            className={styles.navIcon}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 512 512"
                        >
                            <path d="M361.5 1.2c5 2.1 8.6 6.6 9.6 11.9L391 121l107.9 19.8c5.3 1 9.8 4.6 11.9 9.6s1.5 10.7-1.6 15.2L446.9 256l62.3 90.3c3.1 4.5 3.7 10.2 1.6 15.2s-6.6 8.6-11.9 9.6L391 391 371.1 498.9c-1 5.3-4.6 9.8-9.6 11.9s-10.7 1.5-15.2-1.6L256 446.9l-90.3 62.3c-4.5 3.1-10.2 3.7-15.2 1.6s-8.6-6.6-9.6-11.9L121 391 13.1 371.1c-5.3-1-9.8-4.6-11.9-9.6s-1.5-10.7 1.6-15.2L65.1 256 2.8 165.7c-3.1-4.5-3.7-10.2-1.6-15.2s6.6-8.6 11.9-9.6L121 121 140.9 13.1c1-5.3 4.6-9.8 9.6-11.9s10.7-1.5 15.2 1.6L256 65.1 346.3 2.8c4.5-3.1 10.2-3.7 15.2-1.6zM352 256c0 53-43 96-96 96s-96-43-96-96s43-96 96-96s96 43 96 96zm32 0c0-70.7-57.3-128-128-128s-128 57.3-128 128s57.3 128 128 128s128-57.3 128-128z" />
                        </svg>
                    ) : (
                        <svg
                            className={styles.navIcon}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 512 512"
                        >
                            <path d="M223.5 32C100 32 0 132.3 0 256S100 480 223.5 480c60.6 0 115.5-24.2 155.8-63.4c5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-9.8 1.7-19.8 2.6-30.1 2.6c-96.9 0-175.5-78.8-175.5-176c0-65.8 36-123.1 89.3-153.3c6.1-3.5 9.2-10.5 7.7-17.3s-7.3-11.9-14.3-12.5c-6.3-.5-12.6-.8-19-.8z" />
                        </svg>
                    )}
                </div>
            </li>


        </nav>
    )
}
