import { useRef } from "react";
import ePub from "epubjs";
import type Section from "epubjs/types/section";

export default function AddEpubFile({ convertTextToStoryBoards }: { convertTextToStoryBoards: (passedText: string, indexToAdd?: number) => void }) {
    const inputRef = useRef<HTMLInputElement>(null)

    async function getChaptersFromEpub(epub: string | ArrayBuffer): Promise<string[]> {
        const book = ePub(epub);
        await book.ready;

        const sectionPromises: Promise<string>[] = [];

        book.spine.each((section: Section) => {
            const sectionPromise = (async () => {
                const chapter = await book.load(section.href);
                if (!(chapter instanceof Document) || !chapter.body?.textContent) {
                    return "";
                }
                return chapter.body.textContent.trim();
            })();

            sectionPromises.push(sectionPromise);
        });

        const content = await Promise.all(sectionPromises);
        return content.filter(text => text);
    }

    const handleFileSubmit = async () => {
        const myFile = inputRef.current?.files?.[0];
        if (myFile) {
            const reader = new FileReader();

            reader.onload = async (event) => {
                const fileContent = event!.target!.result ?? "";
                const chapters = await getChaptersFromEpub(fileContent);
                const newString = chapters.join('\n\n\n');

                convertTextToStoryBoards(newString, 0)
            };

            reader.readAsArrayBuffer(myFile);
        }
    };



    return (
        <div>
            <input type="file" ref={inputRef} />
            <button onClick={handleFileSubmit}>Add Ebook</button>
        </div>
    )
}