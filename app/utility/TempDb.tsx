const fs = require('fs');


export default function saveDataToFile(seenData: any, name: string) {
    const jsonData = JSON.stringify(seenData);

    fs.writeFile(`${name}.json`, jsonData, 'utf8', (err: Error) => {
        if (err) {
            console.error('Error writing to file:', err);
        } else {
            console.log('Data saved to data.json');
        }
    });
}

