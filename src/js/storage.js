// --- Firebase Setup ---
let firebaseApp, db, firebaseReady = false;

(async function initFirebase() {
    // Only initialize once
    if (window.firebase) return;
    // Add Firebase SDK script dynamically if not present
    if (!window.firebase) {
        const script = document.createElement('script');
        script.src = "https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js";
        script.onload = loadFirestore;
        document.head.appendChild(script);
    } else {
        loadFirestore();
    }
    function loadFirestore() {
        const script2 = document.createElement('script');
        script2.src = "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js";
        script2.onload = configureFirebase;
        document.head.appendChild(script2);
    }
    function configureFirebase() {
        // TODO: Replace with your Firebase config
    const firebaseConfig = {
        apiKey: "AIzaSyDV-mSjzcoy_RgM_tEqpIgFYG9EnU96FxM",
        authDomain: "digitaldiary-83e15.firebaseapp.com",
        projectId: "digitaldiary-83e15",
        storageBucket: "digitaldiary-83e15.firebasestorage.app",
        messagingSenderId: "768574869179",
        appId: "1:768574869179:web:f3c17ce7a64ea5f044239e",
        measurementId: "G-ZWDG7BNCKT"
};
        firebaseApp = firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        firebaseReady = true;
    }
})();

// --- Firestore CRUD Helpers ---
async function firestoreAddEntry(entry) {
    if (!firebaseReady) return localStorageFallback.saveEntry(entry);
    if (entry.id) {
        // Use provided ID for updates or specific inserts
        await db.collection('diaryEntries').doc(entry.id.toString()).set(entry, { merge: true });
    } else {
        // Let Firestore auto-generate ID for new entries
        await db.collection('diaryEntries').add(entry);
    }
}
async function firestoreGetEntries() {
    if (!firebaseReady) return localStorageFallback.getEntries();
    const snapshot = await db.collection('diaryEntries').get();
    return snapshot.docs.map(doc => ({ ...doc.data(), _id: doc.id }));
}
async function firestoreDeleteEntry(id) {
    if (!firebaseReady) return localStorageFallback.deleteEntry(id);
    await db.collection('diaryEntries').doc(id).delete();
}
async function firestoreUpdateEntry(id, updatedEntry) {
    if (!firebaseReady) return localStorageFallback.updateEntry(id, updatedEntry);
    await db.collection('diaryEntries').doc(id).set(updatedEntry, { merge: true });
}

// --- LocalStorage Fallback ---
const localStorageFallback = {
    saveEntry(entry) {
        let entries = this.getEntries();
        entries.push(entry);
        localStorage.setItem('diaryEntries', JSON.stringify(entries));
    },
    getEntries() {
        const entries = localStorage.getItem('diaryEntries');
        return entries ? JSON.parse(entries) : [];
    },
    deleteEntry(index) {
        let entries = this.getEntries();
        entries.splice(index, 1);
        localStorage.setItem('diaryEntries', JSON.stringify(entries));
    },
    updateEntry(index, updatedEntry) {
        let entries = this.getEntries();
        // Preserve favorite property if not present in updatedEntry
        if (entries[index] && entries[index].favorite && !updatedEntry.favorite) {
            updatedEntry.favorite = true;
        }
        entries[index] = updatedEntry;
        localStorage.setItem('diaryEntries', JSON.stringify(entries));
    }
};

// --- Exported Functions (Async) ---
window.saveEntry = async function(entry) {
    // If entry has id, use as doc id, else let Firestore auto-generate
    if (firebaseReady) {
        await firestoreAddEntry(entry);
    } else {
        localStorageFallback.saveEntry(entry);
    }
};
window.getEntries = function() {
    // Returns a Promise for Firebase, or array for localStorage
    if (firebaseReady) {
        return firestoreGetEntries();
    } else {
        return localStorageFallback.getEntries();
    }
};
window.deleteEntry = async function(indexOrId) {
    if (firebaseReady) {
        // indexOrId is Firestore doc id
        await firestoreDeleteEntry(indexOrId);
    } else {
        localStorageFallback.deleteEntry(indexOrId);
    }
};
window.updateEntry = async function(indexOrId, updatedEntry) {
    if (firebaseReady) {
        await firestoreUpdateEntry(indexOrId, updatedEntry);
    } else {
        localStorageFallback.updateEntry(indexOrId, updatedEntry);
    }
};