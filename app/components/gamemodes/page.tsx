import React from 'react'
import PronounciationGM from './PronounciationGM'
import { gameObjType } from '@/app/page'
import WordsToMeaningGM from './WordsToMeaningGM'
import MatchUpGM from './MatchUpGM'

export default function page() {


    return (
        <div>
            <MatchUpGM isEditing={true} />
            {/* <WordsToMeaningGM isEditing={true} /> */}
        </div>
    )
}
