import { revalidatePath } from "next/cache";
import Home from "./Home";
import { Prisma, PrismaClient, story } from "@prisma/client";
import backupStories from "../frequentBackup.json"
import saveDataToFile from "./utility/TempDb";

const prisma = new PrismaClient()



//if you're using maker its new

//if you're editing a story you can edit, from the list its gonna be a replace


async function updateStory(option: "story" | "likes" | "rating", sentStoryId: StoryData) {
  "use server";

  let responseObj = {
    message: "",
  }

  try {
    if (option === "story") {

      let checkStory = await prisma.story.findUnique(
        {
          where: {
            storyid: sentStoryId.storyid,
          },
        }
      )

      if (!checkStory) {
        responseObj.message += "Couldn't read records |"
        return responseObj
      }

      if (checkStory.storypass !== sentStoryId.storypass) {
        responseObj.message += "Wrong Password |"
        return responseObj
      }

      const savableStory: story = { ...sentStoryId, storyboard: sentStoryId.storyboard !== null ? JSON.stringify(sentStoryId.storyboard) : null, gamemodes: sentStoryId.gamemodes !== null ? JSON.stringify(sentStoryId.gamemodes) : null, storypass: checkStory.storypass }

      await prisma.story.update({
        where: {
          storyid: sentStoryId.storyid,
        },
        data: savableStory,
      })

    } else if (option === "likes") {
      await prisma.story.update({
        where: {
          storyid: sentStoryId.storyid,
        },
        data: {
          likes: {
            increment: 1
          }
        },
      })

    } else if (option === "rating") {

      await prisma.story.update({
        where: {
          storyid: sentStoryId.storyid,
        },
        data: {
          rating: {
            increment: sentStoryId.rating
          },
          amtofratings: {
            increment: 1
          }

        },
      })
    }

  } catch (error) {
    responseObj.message = "something else went wrong |"
  }

  revalidatePath("/")

  return responseObj
}

async function updatePassword(option: "story" | "gamemode", sentStoryId: string, oldPass: string, newPass: string) {
  "use server";

  let responseObj = {
    message: "",
  }

  try {
    if (option === "story") {

      let checkStory = await prisma.story.findUnique(
        {
          where: {
            storyid: sentStoryId,
          },
        }
      )

      if (!checkStory) {
        responseObj.message += "Couldn't read records |"
        return responseObj
      }

      if (checkStory.storypass !== oldPass) {
        responseObj.message += "Wrong Password, couldn't update |"
        return responseObj
      }

      await prisma.story.update({
        where: {
          storyid: sentStoryId,
        },
        data: {
          storypass: newPass
        },
      })

    } else if (option === "gamemode") {
      let checkStory = await prisma.story.findUnique(
        {
          where: {
            storyid: sentStoryId,
          },
        }
      )

      if (!checkStory) {
        responseObj.message += "Couldn't read records |"
        return responseObj
      }

      if (checkStory.storypass !== oldPass) {
        responseObj.message += "Wrong Password |"
        return responseObj
      }

      await prisma.story.update({
        where: {
          storyid: sentStoryId,
        },
        data: {
          storypass: newPass
        },
      })

    }

  } catch (error) {
    responseObj.message = "something else went wrong |"
  }

  revalidatePath("/")

  return responseObj
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

async function deleteStory(seenId: string, sentPAss: string) {
  "use server";

  let responseObj = {
    message: "",
  }

  try {

    const validateOldObj = await prisma.story.findUnique({
      where: { storyid: seenId },
    });

    if (validateOldObj?.storypass !== sentPAss) {
      responseObj.message += "Wrong password"
      return responseObj
    }

    await prisma.story.delete({
      where: { storyid: seenId },
    });

    console.log(`deleted specific ${seenId}`);

  } catch (error) {
    responseObj.message += "Some other event happened in error"

  }


  revalidatePath("/");

  return responseObj

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

        eachstory.storypass = ""

        return eachstory

      }) as StoryData[]

    }

    return usablestories
  } catch (error) {
    console.log(`$error`, error);
  }

}

export default async function page() {
  let stories = await getStories()

  if (!stories) {
    return <p>Loading Up Stories...</p>
  }


  return (
    <>
      <Home allstories={stories} getStories={getStories} deleteStory={deleteStory} newStory={newStory} updateStory={updateStory} updatePassword={updatePassword} newAllStory={newAllStory} updateGameModes={updateGameModes} />
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
  gamePassword: string
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













