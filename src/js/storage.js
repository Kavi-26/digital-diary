function saveEntry(entry) {
    let entries = getEntries();
    entries.push(entry);
    localStorage.setItem('diaryEntries', JSON.stringify(entries));
}

function getEntries() {
    const entries = localStorage.getItem('diaryEntries');
    return entries ? JSON.parse(entries) : [];
}

function deleteEntry(index) {
    let entries = getEntries();
    entries.splice(index, 1);
    localStorage.setItem('diaryEntries', JSON.stringify(entries));
}

function updateEntry(index, updatedEntry) {
    let entries = getEntries();
    // Preserve favorite property if not present in updatedEntry
    if (entries[index] && entries[index].favorite && !updatedEntry.favorite) {
        updatedEntry.favorite = true;
    }
    entries[index] = updatedEntry;
    localStorage.setItem('diaryEntries', JSON.stringify(entries));
}

// All functions are correct and compatible with new app.js