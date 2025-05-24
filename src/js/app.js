document.addEventListener('DOMContentLoaded', () => {
    const entryForm = document.getElementById('entry-form');
    const entryList = document.getElementById('entry-list');
    const searchInput = document.getElementById('searchEntries');
    const moodFilter = document.getElementById('moodFilter');
    const categoryFilter = document.getElementById('categoryFilter');
    const sortFilter = document.getElementById('sortFilter');
    const clearFormBtn = document.getElementById('clearForm');
    const cancelEditBtn = document.getElementById('cancelEdit');
    const saveAsDraftBtn = document.getElementById('saveAsDraft');
    const entryContentDiv = document.getElementById('entryContent');
    const wordCountSpan = document.getElementById('wordCount');
    const entryTagsInput = document.getElementById('entryTags');
    const tagContainer = document.getElementById('tagContainer');
    const viewBtns = document.querySelectorAll('.view-btn');
    const loadMoreBtn = document.getElementById('loadMore');
    const loadMoreContainer = document.getElementById('loadMoreContainer');
    const fab = document.getElementById('quickEntry');
    const clearSearchBtn = document.getElementById('clearSearch');

    let editingIndex = -1;
    let currentView = 'cards';
    let entriesPerPage = 10;
    let currentPage = 1;
    let allEntriesCache = [];

    // --- Tag System ---
    function parseTags(str) {
        return str.split(',').map(t => t.trim()).filter(Boolean);
    }
    function renderTags(tags) {
        tagContainer.innerHTML = '';
        tags.forEach(tag => {
            const tagEl = document.createElement('span');
            tagEl.className = 'tag';
            tagEl.innerHTML = `${tag} <button class="remove-tag" title="Remove tag">&times;</button>`;
            tagEl.querySelector('.remove-tag').onclick = () => {
                const newTags = tags.filter(t => t !== tag);
                entryTagsInput.value = newTags.join(', ');
                renderTags(newTags);
            };
            tagContainer.appendChild(tagEl);
        });
    }
    entryTagsInput?.addEventListener('input', () => {
        renderTags(parseTags(entryTagsInput.value));
    });

    // --- Word Count ---
    function updateWordCount() {
        const text = entryContentDiv.innerText || '';
        const count = text.trim() ? text.trim().split(/\s+/).length : 0;
        wordCountSpan.textContent = count;
    }
    entryContentDiv?.addEventListener('input', updateWordCount);

    // --- Editor Toolbar ---
    document.querySelectorAll('.format-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.execCommand(btn.dataset.command, false, null);
            entryContentDiv.focus();
        });
    });

    // --- View Switch ---
    viewBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            viewBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentView = btn.dataset.view;
            displayEntries(allEntriesCache);
        });
    });

    // --- Load More ---
    loadMoreBtn?.addEventListener('click', () => {
        currentPage++;
        displayEntries(allEntriesCache);
    });

    // --- Clear Search ---
    clearSearchBtn?.addEventListener('click', () => {
        searchInput.value = '';
        filterEntries();
    });

    // --- FAB Quick Entry ---
    fab?.addEventListener('click', () => {
        document.querySelector('.entry-form').scrollIntoView({ behavior: 'smooth' });
        entryForm.querySelector('input, [contenteditable]').focus();
    });

    // --- Save as Draft ---
    saveAsDraftBtn?.addEventListener('click', () => {
        const entry = getFormEntry(true);
        if (!entry.title && !entry.content) {
            showNotification('Cannot save empty draft', 'warning');
            return;
        }
        saveEntry(entry);
        showNotification('Draft saved', 'success');
        entryForm.reset();
        entryContentDiv.innerHTML = '';
        renderTags([]);
        updateWordCount();
        loadAndDisplayEntries();
    });

    // --- Clear Form ---
    clearFormBtn?.addEventListener('click', clearForm);
    cancelEditBtn?.addEventListener('click', clearForm);
    function clearForm() {
        entryForm.reset();
        entryContentDiv.innerHTML = '';
        renderTags([]);
        updateWordCount();
        editingIndex = -1;
        document.getElementById('submit-text').textContent = 'Save Entry';
        document.getElementById('form-title').textContent = 'New Diary Entry';
    }

    // --- Form Submit ---
    entryForm.addEventListener('submit', handleFormSubmit);

    function getFormEntry(isDraft = false) {
        return {
            id: editingIndex >= 0 ? getEntries()[editingIndex].id : Date.now(),
            title: entryForm.title.value.trim(),
            content: entryContentDiv.innerHTML.trim(),
            mood: entryForm.mood.value,
            category: entryForm.category.value,
            weather: entryForm.weather.value,
            tags: parseTags(entryTagsInput.value),
            wordCount: (entryContentDiv.innerText || '').trim().split(/\s+/).filter(Boolean).length,
            date: new Date().toISOString(),
            dateString: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
            draft: isDraft
        };
    }

    function handleFormSubmit(event) {
        event.preventDefault();
        const entry = getFormEntry(false);
        if (!entry.title || !entry.content) {
            showNotification('Title and content are required', 'error');
            return;
        }
        if (editingIndex >= 0) {
            updateEntry(editingIndex, entry);
            showNotification('Entry updated', 'success');
            editingIndex = -1;
            document.getElementById('submit-text').textContent = 'Save Entry';
            document.getElementById('form-title').textContent = 'New Diary Entry';
        } else {
            saveEntry(entry);
            showNotification('Entry saved', 'success');
        }
        entryForm.reset();
        entryContentDiv.innerHTML = '';
        renderTags([]);
        updateWordCount();
        loadAndDisplayEntries();
    }

    // --- Load and Display Entries ---
    function loadAndDisplayEntries() {
        const entries = getEntries();
        allEntriesCache = entries;
        currentPage = 1;
        displayEntries(entries);
    }

    // --- Favorite Toggle ---
    function toggleFavorite(entryId) {
        let entries = getEntries();
        const idx = entries.findIndex(e => e.id === entryId);
        if (idx > -1) {
            entries[idx].favorite = !entries[idx].favorite;
            localStorage.setItem('diaryEntries', JSON.stringify(entries));
            showNotification(entries[idx].favorite ? 'Marked as favorite' : 'Removed from favorites', 'success');
            loadAndDisplayEntries();
        }
    }

    // --- Export Single Entry ---
    function exportSingleEntry(entry) {
        const dataStr = JSON.stringify(entry, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `diary-entry-${entry.id}.json`;
        link.click();
        showNotification('Entry exported as JSON', 'success');
    }

    // --- Copy Content ---
    function copyEntryContent(content) {
        const temp = document.createElement('textarea');
        temp.value = content.replace(/<[^>]+>/g, '');
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
        showNotification('Entry content copied', 'success');
    }

    // --- Display Entries with new features ---
    function displayEntries(entries) {
        // Filtering, sorting, pagination
        let filtered = entries.filter(e => !e.draft);
        // Search
        const searchTerm = searchInput.value.toLowerCase();
        if (searchTerm) {
            filtered = filtered.filter(entry =>
                entry.title.toLowerCase().includes(searchTerm) ||
                (entry.content || '').toLowerCase().includes(searchTerm) ||
                (entry.tags || []).some(tag => tag.toLowerCase().includes(searchTerm))
            );
        }
        // Mood filter
        if (moodFilter.value) {
            filtered = filtered.filter(e => e.mood === moodFilter.value);
        }
        // Category filter
        if (categoryFilter && categoryFilter.value) {
            filtered = filtered.filter(e => e.category === categoryFilter.value);
        }
        // Favorites filter
        const favoritesOnly = document.getElementById('favoritesOnly')?.checked;
        if (favoritesOnly) {
            filtered = filtered.filter(e => e.favorite);
        }
        // Sort
        if (sortFilter) {
            if (sortFilter.value === 'oldest') {
                filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
            } else if (sortFilter.value === 'title') {
                filtered.sort((a, b) => a.title.localeCompare(b.title));
            } else if (sortFilter.value === 'mood') {
                filtered.sort((a, b) => (a.mood || '').localeCompare(b.mood || ''));
            } else {
                filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
            }
        }
        // Pagination
        const start = 0;
        const end = currentPage * entriesPerPage;
        const paged = filtered.slice(start, end);

        entryList.innerHTML = '';
        if (paged.length === 0) {
            entryList.innerHTML = '<p class="no-entries">No entries found. Start writing your first diary entry!</p>';
            loadMoreContainer.style.display = 'none';
            return;
        }
        entryList.classList.toggle('list-view', currentView === 'list');
        paged.forEach((entry, index) => {
            const idx = entries.indexOf(entry);
            const entryElement = document.createElement('div');
            entryElement.className = 'entry' + (entry.draft ? ' draft' : '');
            entryElement.innerHTML = `
                <div class="entry-header">
                    <h3>${entry.title}</h3>
                    <span class="mood-indicator">${getMoodEmoji(entry.mood)}</span>
                    <button class="favorite-btn" title="${entry.favorite ? 'Unstar' : 'Star'}" style="background:none;border:none;cursor:pointer;font-size:1.2em;">
                        <i class="fas fa-star" style="color:${entry.favorite ? 'gold' : '#ccc'}"></i>
                    </button>
                </div>
                <div class="entry-meta">
                    <span class="category-badge">${entry.category || 'Personal'}</span>
                    ${entry.weather ? `<span class="weather-indicator">${getWeatherEmoji(entry.weather)}</span>` : ''}
                    <span class="word-count-badge">Words: ${entry.wordCount || 0}</span>
                    ${entry.draft ? '<span class="entry-tag" style="color:var(--warning-color)">Draft</span>' : ''}
                </div>
                <div class="entry-content">${entry.content}</div>
                <div class="entry-tags">
                    ${(entry.tags || []).map(tag => `<span class="entry-tag">#${tag}</span>`).join('')}
                </div>
                <div class="entry-footer">
                    <small class="entry-date">${entry.dateString}</small>
                    <div class="entry-actions">
                        <button class="edit-btn" onclick="editEntry(${idx})">✏️ Edit</button>
                        <button class="delete-btn" onclick="deleteEntryConfirm(${idx})">🗑️ Delete</button>
                        <button class="copy-btn" title="Copy Content" style="background:var(--background-tertiary);color:var(--text-secondary);border:none;padding:8px 12px;border-radius:6px;cursor:pointer;" onclick="window.copyEntryContentHandler(${entry.id})"><i class="fas fa-copy"></i></button>
                        <button class="export-btn" title="Export Entry" style="background:var(--background-tertiary);color:var(--text-secondary);border:none;padding:8px 12px;border-radius:6px;cursor:pointer;" onclick="window.exportEntryHandler(${entry.id})"><i class="fas fa-file-export"></i></button>
                    </div>
                </div>
            `;
            // Favorite button event
            entryElement.querySelector('.favorite-btn').onclick = () => toggleFavorite(entry.id);
            entryList.appendChild(entryElement);
        });
        // Load more
        if (filtered.length > paged.length) {
            loadMoreContainer.style.display = '';
        } else {
            loadMoreContainer.style.display = 'none';
        }
    }

    // --- Filter Entries ---
    function filterEntries() {
        displayEntries(allEntriesCache);
    }
    searchInput?.addEventListener('input', filterEntries);
    moodFilter?.addEventListener('change', filterEntries);
    categoryFilter?.addEventListener('change', filterEntries);
    sortFilter?.addEventListener('change', filterEntries);

    // --- Mood/Weather Emoji ---
    function getMoodEmoji(mood) {
        const moodEmojis = {
            happy: '😊',
            sad: '😢',
            excited: '🎉',
            calm: '😌',
            anxious: '😰',
            grateful: '🙏',
            loved: '❤️',
            productive: '⚡',
            reflective: '🤔'
        };
        return moodEmojis[mood] || '😐';
    }
    function getWeatherEmoji(weather) {
        const weatherEmojis = {
            sunny: '☀️',
            cloudy: '☁️',
            rainy: '🌧️',
            snowy: '❄️',
            stormy: '⛈️'
        };
        return weatherEmojis[weather] || '';
    }

    // --- Edit/Delete Handlers ---
    window.editEntry = function(index) {
        const entries = getEntries();
        const entry = entries[index];
        entryForm.title.value = entry.title;
        entryContentDiv.innerHTML = entry.content;
        entryForm.mood.value = entry.mood || '';
        entryForm.category.value = entry.category || 'personal';
        entryForm.weather.value = entry.weather || '';
        entryTagsInput.value = (entry.tags || []).join(', ');
        renderTags(entry.tags || []);
        updateWordCount();
        editingIndex = index;
        document.getElementById('submit-text').textContent = 'Update Entry';
        document.getElementById('form-title').textContent = 'Edit Diary Entry';
        document.querySelector('.entry-form').scrollIntoView({ behavior: 'smooth' });
    };

    window.deleteEntryConfirm = function(index) {
        if (confirm('Are you sure you want to delete this entry?')) {
            deleteEntry(index);
            showNotification('Entry deleted', 'success');
            loadAndDisplayEntries();
        }
    };

    // --- Statistics ---
    window.updateStatistics = function() {
        const entries = getEntries().filter(e => !e.draft);

        // Entries per Month
        const months = Array.from({length: 12}, (_, i) => new Date(0, i).toLocaleString('en', {month: 'short'}));
        const entriesPerMonth = Array(12).fill(0);
        entries.forEach(e => {
            const d = new Date(e.date);
            entriesPerMonth[d.getMonth()]++;
        });

        // Mood Distribution
        const moodCounts = {};
        entries.forEach(e => {
            if (!e.mood) return;
            moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
        });
        const moodLabels = Object.keys(moodCounts);
        const moodData = moodLabels.map(m => moodCounts[m]);

        // Category Breakdown
        const catCounts = {};
        entries.forEach(e => {
            const cat = e.category || 'personal';
            catCounts[cat] = (catCounts[cat] || 0) + 1;
        });
        const catLabels = Object.keys(catCounts);
        const catData = catLabels.map(c => catCounts[c]);

        // Destroy old charts if exist
        if (window.entriesPerMonthChartObj) window.entriesPerMonthChartObj.destroy();
        if (window.moodDistributionChartObj) window.moodDistributionChartObj.destroy();
        if (window.categoryBreakdownChartObj) window.categoryBreakdownChartObj.destroy();

        // Entries per Month Chart
        const ctx1 = document.getElementById('entriesPerMonthChart').getContext('2d');
        window.entriesPerMonthChartObj = new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: months,
                datasets: [{
                    label: 'Entries',
                    data: entriesPerMonth,
                    backgroundColor: 'rgba(99,102,241,0.7)'
                }]
            },
            options: {
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, precision:0 } }
            }
        });

        // Mood Distribution Chart
        const ctx2 = document.getElementById('moodDistributionChart').getContext('2d');
        window.moodDistributionChartObj = new Chart(ctx2, {
            type: 'pie',
            data: {
                labels: moodLabels,
                datasets: [{
                    data: moodData,
                    backgroundColor: [
                        '#6366f1','#f59e0b','#10b981','#ef4444','#818cf8','#fbbf24','#34d399','#f87171','#a78bfa'
                    ]
                }]
            },
            options: {
                plugins: { legend: { position: 'bottom' } }
            }
        });

        // Category Breakdown Chart
        const ctx3 = document.getElementById('categoryBreakdownChart').getContext('2d');
        window.categoryBreakdownChartObj = new Chart(ctx3, {
            type: 'doughnut',
            data: {
                labels: catLabels,
                datasets: [{
                    data: catData,
                    backgroundColor: [
                        '#6366f1','#f59e0b','#10b981','#ef4444','#818cf8','#fbbf24','#34d399','#f87171'
                    ]
                }]
            },
            options: {
                plugins: { legend: { position: 'bottom' } }
            }
        });
    };

    // --- Initial Load ---
    loadAndDisplayEntries();

    const favoritesOnlyToggle = document.createElement('label');
    favoritesOnlyToggle.style.display = 'flex';
    favoritesOnlyToggle.style.alignItems = 'center';
    favoritesOnlyToggle.innerHTML = `
        <input type="checkbox" id="favoritesOnly" style="margin-right:6px;">
        <span><i class="fas fa-star" style="color:gold"></i> Favorites Only</span>
    `;
    // Insert into filter section
    const filterContainer = document.querySelector('.filter-container');
    if (filterContainer) filterContainer.appendChild(favoritesOnlyToggle);

    // --- Handlers for copy/export single entry ---
    window.copyEntryContentHandler = function(entryId) {
        const entry = getEntries().find(e => e.id === entryId);
        if (entry) copyEntryContent(entry.content);
    };
    window.exportEntryHandler = function(entryId) {
        const entry = getEntries().find(e => e.id === entryId);
        if (entry) exportSingleEntry(entry);
    };

    // --- Favorites Only toggle event ---
    document.getElementById('favoritesOnly')?.addEventListener('change', filterEntries);
});