const fs = require('fs');



const myObj = [
    {
        "storyId": "f86bd82d-d7a4-4529-b95a-fc12b0b299b2",
        "title": "The Curious Kitten",
        "rating": 5,
        "shortDescription": "Kitten Exploration",
        "storyBoard": [
            {
                "boardObjId": "09caef76-a033-42f6-8357-4a365c418456",
                "boardType": "text",
                "storedText": "Once upon a time in a cozy little house, there lived a kitten named Mittens. Mittens had a heart full of curiosity and a spirit eager for adventure. Every morning, she would wake up with a sparkle in her eyes, ready to explore the world beyond her doorstep."
            },
            {
                "boardObjId": "9147ce95-d24d-4bc7-abcb-d69ca6a548fd",
                "boardType": "text",
                "storedText": "One sunny day, Mittens spotted a tall bookshelf in the corner of the room. Without a second thought, she began her ascent, little paws climbing higher and higher. Up she went, until she reached the very top. From there, she could see the entire room like never before. Mittens felt a rush of excitement, her heart pounding with the thrill of discovery."
            },
            {
                "boardObjId": "0a47f1dc-6bc9-4ad8-98e3-3ab90557862a",
                "boardType": "text",
                "storedText": "However, Mittens' adventurous spirit sometimes led her into tricky situations. There were moments when she would slip or lose her balance, sending her tumbling down. But Mittens was never discouraged. With each fall, she learned something new about balance and perseverance. She would dust herself off and try again, determined to conquer the heights."
            },
            {
                "boardObjId": "0d7742e9-ee89-4947-bf2b-4a08736cdf48",
                "boardType": "image",
                "imageUrl": "https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            },
            {
                "gameSelection": "matchup",
                "boardType": "gamemode",
                "gameFinished": false,
                "boardObjId": "6938e50a-a8ff-4cbb-8a31-a802144aafbc",
                "gameData": {
                    "choicesArr": [
                        [
                            "Mittens"
                        ],
                        [
                            "excitement"
                        ],
                        [
                            "Yes, Mittens faced challenges "
                        ],
                        [
                            "Mittens' family admired her "
                        ]
                    ],
                    "questionsArr": [
                        "What was the name of the curious kitten?",
                        "How did Mittens feel when she reached the top of the bookshelf?",
                        "Did Mittens ever face challenges during her adventures? How did she handle them?",
                        "How did Mittens' family support her in her explorations?"
                    ]
                }
            },
            {
                "boardObjId": "3e3e7131-11b6-4f02-8ba7-8dc1dd44c6bd",
                "boardType": "text",
                "storedText": "Mittens' zest for exploration made her a beloved member of the household. Her family admired her courage and cheered her on in her quests. They provided soft cushions for her landings and gentle encouragement for her journeys. Mittens grew into a wise and fearless explorer, her days filled with wonder and excitement.\n            \""
            }
        ]
    }
]

export default function saveDataToFile() {
    const jsonData = JSON.stringify(myObj);

    fs.writeFile('tempdbdata1.json', jsonData, 'utf8', (err) => {
        if (err) {
            console.error('Error writing to file:', err);
        } else {
            console.log('Data saved to data.json');
        }
    });
}

