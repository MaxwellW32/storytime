import React from 'react'
import PronounciationGM from './PronounciationGM'
import { gameObjType } from '@/app/page'
import WordsToMeaningGM from './WordsToMeaningGM'

export default function page() {


    return (
        <div>
            <WordsToMeaningGM isEditing={true} />
        </div>
    )
}
