make // diary.js

const entryForm = document.getElementById('entry-form');
const entryList = document.getElementById('entry-list');
const clearBtn = document.getElementById('clearBtn');
const cancelBtn = document.getElementById('cancelBtn');
let diaryEntries = [];
let editIndex = null;

// Load entries from local storage
function loadEntries() {
    const entries = JSON.parse(localStorage.getItem('diaryEntries')) || [];
    diaryEntries = entries;
    renderEntries();
}

// Save entries to local storage
function saveEntries() {
    localStorage.setItem('diaryEntries', JSON.stringify(diaryEntries));
}

// Render diary entries
function renderEntries() {
    entryList.innerHTML = '';
    diaryEntries.forEach((entry, idx) => {
        const div = document.createElement('div');
        div.className = 'entry-item';
        div.innerHTML = `
            <h3>${entry.title}</h3>
            <p>${entry.content}</p>
            <button data-edit="${idx}">Edit</button>
            <button data-delete="${idx}">Delete</button>
        `;
        entryList.appendChild(div);
    });
}

// Handle form submit for add/edit
entryForm.onsubmit = function(e) {
    e.preventDefault();
    const title = entryForm.title.value.trim();
    const content = entryForm.content.value.trim();
    if (!title || !content) return;

    if (editIndex !== null) {
        diaryEntries[editIndex] = { title, content };
        editIndex = null;
        entryForm.querySelector('button[type="submit"]').textContent = 'Add Entry';
    } else {
        diaryEntries.push({ title, content });
    }
    saveEntries();
    renderEntries();
    entryForm.reset();
};

// Handle edit and delete buttons
entryList.onclick = function(e) {
    if (e.target.dataset.edit !== undefined) {
        const idx = +e.target.dataset.edit;
        entryForm.title.value = diaryEntries[idx].title;
        entryForm.content.value = diaryEntries[idx].content;
        editIndex = idx;
        entryForm.querySelector('button[type="submit"]').textContent = 'Update Entry';
    }
    if (e.target.dataset.delete !== undefined) {
        diaryEntries.splice(+e.target.dataset.delete, 1);
        saveEntries();
        renderEntries();
        entryForm.reset();
        editIndex = null;
        entryForm.querySelector('button[type="submit"]').textContent = 'Add Entry';
    }
};

// Clear button: clears the form and resets edit state
if (clearBtn) {
    clearBtn.onclick = function() {
        entryForm.reset();
        editIndex = null;
        entryForm.querySelector('button[type="submit"]').textContent = 'Add Entry';
    };
}

// Cancel button: same as clear, but can also scroll to top or close modal if needed
if (cancelBtn) {
    cancelBtn.onclick = function() {
        entryForm.reset();
        editIndex = null;
        entryForm.querySelector('button[type="submit"]').textContent = 'Add Entry';
    };
}

// Initialize

loadEntries();document.addEventListener('DOMContentLoaded', loadEntries);