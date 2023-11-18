import Home from "./Home";
import { getStories } from "./utility/serverFunctions";

export default async function page() {
  let stories: StoryData[] = []
  let seenError: undefined | string = undefined

  try {
    stories = await getStories() ?? []

  } catch (error) {
    seenError = "error seen"
  }


  return (
    <>
      <Home seenError={seenError} allstories={stories} />
    </>
  )
}

//prisma has all final types of expected data - good for reading
//make a dataype to show what can be sent to prisma - undefined null

export interface textType { //default add
  boardObjId: string,
  storedText: string | null,
  boardType: "text",
}

export interface imageType {
  boardObjId: string,
  imageUrl: string | null,
  boardType: "image",
}

export interface videoType {
  boardObjId: string,
  videoUrl: string | null,
  boardType: "video",
}

export type gameDataType = matchupType | pronounceType | wordsToMeaningType | crosswordType
export type gameSelectionTypes = "matchup" | "crossword" | "pronounce" | "wordmeaning"

export interface gameObjType {
  boardObjId: string,
  gameSelection: gameSelectionTypes, //tell different types of gamemodes
  gameData: gameDataType | null,
  gamePass: string
}


export type storyBoardType = videoType | imageType | textType

export interface StoryData {//story is raw from database, storydata is what is usable
  title: string;
  storypass: string,
  storyid: string;
  createdat: Date;
  likes: number;
  rating: number;
  amtofratings: number;
  storyboard: storyBoardType[] | null;
  gamemodes: gameObjType[] | null;
  backgroundaudio: string | null;
  shortdescription: string | null;
}

export interface StoryDataSend {
  title: string,
  storypass: string,
  storyid: string | undefined, //will give a value if undefined
  createdat: Date | undefined,
  likes: number | undefined,
  rating: number | undefined;
  amtofratings: number | undefined;

  storyboard: string | null,
  gamemodes: string | null,
  backgroundaudio: string | null,
  shortdescription: string | null,
}


export interface matchupType {
  gameDataFor: "matchup",
  questionsArr: string[] | null,
  choicesArr: string[][] | null,
}

export interface pronounceType {
  gameDataFor: "pronounce",
  givenWords: string[] | null
}

export interface wordsToMeaningType {
  gameDataFor: "wordmeaning",
  wordMeaningsArr: string[][] | null,
}

export interface crosswordType {
  gameDataFor: "crossword",
  wordArray: string[] | null
  hintObj: {
    [hintTitle: string]: string;
  } | null
}













