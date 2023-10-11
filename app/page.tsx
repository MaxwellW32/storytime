import { revalidatePath } from "next/cache";
import Home from "./Home";
import { Prisma, PrismaClient, story } from "@prisma/client";

const prisma = new PrismaClient()

async function updateStory(seenStory: StoryData) {
  "use server";

  const savableStory: story = { ...seenStory, storyboard: JSON.stringify(seenStory.storyboard) }


  await prisma.story.update({
    where: {
      storyid: seenStory.storyid,
    },
    data: savableStory,
  })

  revalidatePath("/")

}

async function newStory(newStory: StoryDataSend) {
  "use server";

  try {

    await prisma.story.create({
      data: newStory,
    });

  } catch (error) {
    console.log(`$something wrong`, error);
  }

  revalidatePath("/");
}

async function deleteStory(seenId: string) {
  "use server";


  await prisma.story.delete({
    where: { storyid: seenId },
  });
  console.log(`deleted specific ${seenId}`);
  revalidatePath("/");

  //   const validateOldObj = await prisma.base.findUnique({
  //     where: { id: input },
  //   });


}

async function getStories() {
  "use server";

  try {
    let rawStories = [] as story[]
    rawStories = await prisma.story.findMany(
      {
        orderBy: {
          likes: 'asc',
        },
      }
    );

    let usablestories = [] as StoryData[]
    if (rawStories) {
      usablestories = rawStories.map(eachstory => {
        if (eachstory.storyboard !== null) {
          eachstory.storyboard = JSON.parse(eachstory.storyboard)
          return eachstory
        } else {
          return eachstory
        }
      }) as StoryData[]
    }

    return usablestories
  } catch (error) {
    console.log(`$error`, error);
  }

}


export default async function page() {
  const stories = await getStories()

  if (!stories) {
    return <p>Loading Up Stories...</p>
  }

  return (
    <>
      <Home allstories={stories} deleteStory={deleteStory} newStory={newStory} updateStory={updateStory} />
    </>
  )
}



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
  boardType: "gamemode",
  shouldStartOnNewPage: boolean | null,
  gameData: gameDataType | null,
}


export type storyBoardType = gameObjType | videoType | imageType | textType
export interface StoryData {//story is raw from database, storydata is what is usable
  title: string;
  storyid: string;
  createdat: Date;
  likes: number;
  storyboard: storyBoardType[] | null;
  rating: number | null;
  backgroundaudio: string | null;
  shortdescription: string | null;
}

export interface StoryDataSend {
  title: string,

  storyid: string | undefined, //will give a value if undefined
  createdat: Date | undefined,
  likes: number | undefined,

  rating: number | null, //will get stored as literal null
  storyboard: string | null,
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

}

export interface wordsToMeaningType {
  gameDataFor: "wordmeaning",

}

export interface crosswordType {
  gameDataFor: "crossword",
  wordArray: string[] | null
}













