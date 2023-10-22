const fs = require('fs');


export default function saveDataToFile(seenData) {
    const jsonData = JSON.stringify(seenData);

    fs.writeFile('backupbeforerewrite.json', jsonData, 'utf8', (err) => {
        if (err) {
            console.error('Error writing to file:', err);
        } else {
            console.log('Data saved to data.json');
        }
    });
}

