"use server"
import { revalidatePath } from "next/cache";
import { Prisma, PrismaClient, story } from "@prisma/client";
import backupStories from "../../frequentBackup.json"
import saveDataToFile from "./../utility/TempDb";
import { StoryData, StoryDataSend, gameObjType } from "../page";

const prisma = new PrismaClient()

export async function updateStory(option: "story" | "likes" | "rating", sentStory: StoryData) {
    let responseObj = {
        message: "",
    }

    try {
        if (option === "story") {

            let oldStory = await prisma.story.findUnique(
                {
                    where: {
                        storyid: sentStory.storyid,
                    },
                }
            )

            if (!oldStory) {
                responseObj.message += "Couldn't read records |"
                return responseObj
            }

            if (oldStory.storypass !== sentStory.storypass) {
                responseObj.message += "Wrong Password |"
                return responseObj
            }

            //here manage gamemodes pass

            const oldStoryGamemodes = JSON.parse(oldStory.gamemodes ?? "[]") as unknown as gameObjType[]

            //gives me back passwords that were on server
            oldStoryGamemodes.forEach(eachOldGamemodeObj => {

                sentStory.gamemodes?.forEach(eachWantedGamemode => {

                    if (eachWantedGamemode.boardObjId === eachOldGamemodeObj.boardObjId) {
                        eachWantedGamemode.gamePass = eachOldGamemodeObj.gamePass
                        console.log(`$seenPassNow`, eachWantedGamemode.gamePass);
                        //new passwords from new gamemodes coming in from maksestory will be fine - old gamemodes are protected
                    }

                })
            })

            //go through oldStorygamemodes to see possible new gamemodes from user entry
            const gameModesSeenLeftOut: gameObjType[] = []

            oldStoryGamemodes.forEach(eachOldGameModeObj => {
                let foundInArr = false

                sentStory.gamemodes?.forEach(eachWantedGameObj => {
                    if (eachWantedGameObj.boardObjId === eachOldGameModeObj.boardObjId) {
                        foundInArr = true
                    }
                })

                if (!foundInArr) {
                    gameModesSeenLeftOut.push(eachOldGameModeObj)
                }
            })

            //add user entries to gamemode obj 
            if (!sentStory.gamemodes) sentStory.gamemodes = []
            sentStory.gamemodes = [...sentStory.gamemodes, ...gameModesSeenLeftOut]


            //now i have password gamemodes, along with any new gamemodes they sent with passwords already

            const savableStory: story = { ...sentStory, storyboard: sentStory.storyboard !== null ? JSON.stringify(sentStory.storyboard) : null, gamemodes: JSON.stringify(sentStory.gamemodes), storypass: oldStory.storypass }

            await prisma.story.update({
                where: {
                    storyid: sentStory.storyid,
                },
                data: savableStory,
            })

        } else if (option === "likes") {
            await prisma.story.update({
                where: {
                    storyid: sentStory.storyid,
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
                    storyid: sentStory.storyid,
                },
                data: {
                    rating: {
                        increment: sentStory.rating
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

export async function updatePassword(option: "story" | "gamemode", sentStoryId: string, oldPass: string, newPass: string, sentGameModeObjId?: string) {
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

            let oldStory = await prisma.story.findUnique(
                {
                    where: {
                        storyid: sentStoryId,
                    },
                }
            )

            if (!oldStory) {
                responseObj.message += "Couldn't read records |"
                return responseObj
            }

            if (!sentGameModeObjId) {
                responseObj.message += "GameModeOBjId not passed |"
                return responseObj
            }

            const oldGameModeObjs = oldStory.gamemodes ? JSON.parse(oldStory.gamemodes) as gameObjType[] : []

            let FoundAtIndex: null | number = null
            oldGameModeObjs.forEach(async (eachOldGamemode, eachOldGamemodeIndex) => {
                if (eachOldGamemode.boardObjId === sentGameModeObjId) {
                    FoundAtIndex = eachOldGamemodeIndex
                }
            })


            if (FoundAtIndex === null) {
                responseObj.message += "Gamemode not found |"
                return responseObj
            }

            if (oldGameModeObjs[FoundAtIndex].gamePass !== oldPass) {
                responseObj.message += "Wrong Gamemode Password |"
                return responseObj
            }

            oldGameModeObjs[FoundAtIndex].gamePass = newPass


            await prisma.story.update({
                where: {
                    storyid: sentStoryId,
                },
                data: {
                    gamemodes: JSON.stringify(oldGameModeObjs)
                },
            })
        }

    } catch (error) {
        responseObj.message = "something else went wrong |"
    }


    return responseObj
}

export async function updateGameModes(sentGameModeObj: gameObjType, storyId: string, option: "normal" | "delete") {

    let responseObj = {
        message: "",
    }

    const oldStory = await prisma.story.findUnique(
        {
            where: {
                storyid: storyId,
            },
        }
    )

    if (oldStory === null) {
        responseObj.message += "Couldn't read records |"
        return responseObj
    }

    let oldGameModeObjs: gameObjType[] = oldStory.gamemodes !== null ? JSON.parse(oldStory.gamemodes) : []

    if (option === "normal") {

        let foundInStory = false
        let foundAtIndex: null | number = null

        oldGameModeObjs.forEach((eachGameObj, index) => {
            if (eachGameObj.boardObjId === sentGameModeObj.boardObjId) {
                foundInStory = true
                foundAtIndex = index
            }
        })

        if (foundInStory && foundAtIndex !== null) {
            //update gameobj only if passwords correct

            if (oldGameModeObjs[foundAtIndex].gamePass !== sentGameModeObj.gamePass) {
                responseObj.message += "Wrong Password |"
                return responseObj
            }

            oldGameModeObjs[foundAtIndex] = sentGameModeObj

        } else {
            oldGameModeObjs = [sentGameModeObj, ...oldGameModeObjs]
        }

        const saveableGameModeArr = JSON.stringify(oldGameModeObjs)

        await prisma.story.update({
            where: {
                storyid: storyId,
            },
            data: {
                gamemodes: saveableGameModeArr
            },
        })

    } else if (option === "delete") {

        let foundInStory = false
        let foundAtIndex: null | number = null

        oldGameModeObjs.forEach((eachGameObj, index) => {
            if (eachGameObj.boardObjId === sentGameModeObj.boardObjId) {
                foundInStory = true
                foundAtIndex = index
            }
        })

        if (foundInStory && foundAtIndex !== null) {

            if (oldGameModeObjs[foundAtIndex].gamePass !== sentGameModeObj.gamePass && oldStory.storypass !== sentGameModeObj.gamePass) {
                responseObj.message += "Wrong Password |"
                return responseObj
            }
        }

        const filteredArr = oldGameModeObjs.filter(eachGObj => eachGObj.boardObjId !== sentGameModeObj.boardObjId)

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
    return responseObj

}

export async function newStory(newStory: StoryDataSend) {

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

export async function newAllStory(newStoriesArr: StoryData[]) {
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

export async function deleteStory(seenId: string, sentPAss: string) {

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

export async function getStories() {

    try {
        let rawStories = await prisma.story.findMany(
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

        //clear pass for gamemodes
        usablestories.forEach(eachStorie => {
            if (eachStorie.gamemodes) {
                eachStorie.gamemodes.forEach(eachGameMode => {
                    eachGameMode.gamePass = ""
                })
            }
        })

        return usablestories

    } catch (error) {
        console.log(`$error`, error);
    }
}