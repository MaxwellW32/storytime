"use client"

export function saveToLocalStorage(keyName: any, item: any) {
    localStorage.setItem(keyName, JSON.stringify(item));
}

export function retreiveFromLocalStorage(keyName: string) {
    const keyItem = localStorage.getItem(keyName);

    if (keyItem) {
        const keyItemParsed = JSON.parse(keyItem);
        return keyItemParsed
    } else {
        return null
    }
}
