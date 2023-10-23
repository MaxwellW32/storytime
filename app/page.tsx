import { revalidatePath } from "next/cache";
import Home from "./Home";
import { Prisma, PrismaClient, story } from "@prisma/client";
import backupStories from "../frequentBackup.json"
import saveDataToFile from "./utility/TempDb";

const prisma = new PrismaClient()

const cantDeleteList = [
  '873d3425-0c04-4d1c-b204-383b190823b3',
  '9ccd61b1-d75a-41fd-a28e-7b53977441ef',
  'a1a9f994-8516-478f-b37b-ae4ed5793336',
  'da8cd1c6-2aa2-443d-911e-07678ead954b',
]

//if you're using maker its new

//if you're editing a story you can edit, from the list its gonna be a replace


async function updateStory(option: "story" | "likes", seenStory: StoryData) {
  "use server";

  if (option === "story") {
    if (cantDeleteList.includes(seenStory.storyid)) return

    const savableStory: story = { ...seenStory, storyboard: seenStory.storyboard !== null ? JSON.stringify(seenStory.storyboard) : null, gamemodes: seenStory.gamemodes !== null ? JSON.stringify(seenStory.gamemodes) : null }

    await prisma.story.update({
      where: {
        storyid: seenStory.storyid,
      },
      data: savableStory,
    })


  } else if (option === "likes") {
    await prisma.story.update({
      where: {
        storyid: seenStory.storyid,
      },
      data: {
        likes: {
          increment: 1
        }
      },
    })
  }

  revalidatePath("/")
}

export type updateGameModesParams = (sentGameModeObj: gameObjType, storyId: string, option: "normal" | "delete") => Promise<void>
const updateGameModes: updateGameModesParams = async (sentGameModeObj, storyId, option) => {
  "use server";

  const seenStory = await prisma.story.findUnique(
    {
      where: {
        storyid: storyId,
      },
    }
  )
  if (seenStory === null) return

  let gameModeObjs: gameObjType[] = seenStory.gamemodes !== null ? JSON.parse(seenStory.gamemodes) : []

  if (option === "normal") {

    let foundInStory = false
    let foundAtIndex: null | number = null
    gameModeObjs.forEach((eachGameObj, index) => {
      if (eachGameObj.boardObjId === sentGameModeObj.boardObjId) {
        foundInStory = true
        foundAtIndex = index
      }
    })

    if (foundInStory && foundAtIndex !== null) {
      gameModeObjs[foundAtIndex] = sentGameModeObj
    } else {
      gameModeObjs = [sentGameModeObj, ...gameModeObjs]
    }

    const saveableGameModeArr = JSON.stringify(gameModeObjs)

    await prisma.story.update({
      where: {
        storyid: storyId,
      },
      data: {
        gamemodes: saveableGameModeArr
      },
    })

  } else if (option === "delete") {

    const filteredArr = gameModeObjs.filter(eachGObj => eachGObj.boardObjId !== sentGameModeObj.boardObjId)

    await prisma.story.update({
      where: {
        storyid: storyId,
      },
      data: {
        gamemodes: JSON.stringify(filteredArr)
      },
    })

  }


  revalidatePath("/")

}

async function newStory(newStory: StoryDataSend) {
  "use server";

  try {
    const savableStory: StoryDataSend = { ...newStory, storyboard: newStory.storyboard !== null ? JSON.stringify(newStory.storyboard) : null, gamemodes: newStory.gamemodes !== null ? JSON.stringify(newStory.gamemodes) : null }

    await prisma.story.create({
      data: savableStory,
    });

  } catch (error) {
    console.log(`$something wrong`, error);
  }

  revalidatePath("/");
}

async function newAllStory(newStoriesArr: StoryData[]) {
  "use server";
  return

  try {
    const savableStoriesArr = newStoriesArr.map(eachStory => {
      return { ...eachStory, storyboard: JSON.stringify(eachStory.storyboard), gamemodes: JSON.stringify(eachStory.gamemodes) }
    })

    await prisma.story.createMany({
      data: savableStoriesArr,
    });

  } catch (error) {
    console.log(`$something wrong`, error);
  }

  revalidatePath("/");
}

async function deleteStory(seenId: string) {
  "use server";

  if (cantDeleteList.includes(seenId)) return


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
          likes: 'desc',
        },
      }
    );

    // saveDataToFile(rawStories, "frequentBackup") //backup database
    // rawStories = backupStories as unknown as story[] //use own records

    let usablestories = [] as StoryData[]

    if (rawStories) {

      usablestories = rawStories.map(eachstory => {
        if (eachstory.storyboard !== null) {
          eachstory.storyboard = JSON.parse(eachstory.storyboard)
        }

        if (eachstory.gamemodes !== null) {
          eachstory.gamemodes = JSON.parse(eachstory.gamemodes)
        }

        return eachstory
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
      <Home allstories={stories} getStories={getStories} deleteStory={deleteStory} newStory={newStory} updateStory={updateStory} newAllStory={newAllStory} updateGameModes={updateGameModes} />
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
  gameData: gameDataType | null,
}


export type storyBoardType = videoType | imageType | textType
export interface StoryData {//story is raw from database, storydata is what is usable
  title: string;
  storyid: string;
  createdat: Date;
  likes: number;
  storyboard: storyBoardType[] | null;
  gamemodes: gameObjType[] | null;
  rating: number | null;
  backgroundaudio: string | null;
  shortdescription: string | null;
}

export interface StoryDataSend {
  title: string,

  storyid: string | undefined, //will give a value if undefined
  createdat: Date | undefined,
  likes: number | undefined,

  rating: number | null,
  storyboard: string | null, //send as string to be saved
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

}

export interface crosswordType {
  gameDataFor: "crossword",
  wordArray: string[] | null
  hintObj: {
    [hintTitle: string]: string;
  } | null
}













