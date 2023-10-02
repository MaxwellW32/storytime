const fs = require('fs');

export default function saveDataToFile(data) {
    const jsonData = JSON.stringify(data);

    fs.writeFile('tempdbdata.json', jsonData, 'utf8', (err) => {
        if (err) {
            console.error('Error writing to file:', err);
        } else {
            console.log('Data saved to data.json');
        }
    });
}

