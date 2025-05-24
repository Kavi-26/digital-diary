document.addEventListener('DOMContentLoaded', () => {
    const exportPDFBtn = document.getElementById('exportPDF');
    const exportJSONBtn = document.getElementById('exportJSON');
    const importJSONBtn = document.getElementById('importJSON');
    const importFileInput = document.getElementById('importFile');

    if (exportPDFBtn) {
        exportPDFBtn.addEventListener('click', exportToPDF);
    }

    if (exportJSONBtn) {
        exportJSONBtn.addEventListener('click', exportToJSON);
    }

    if (importJSONBtn) {
        importJSONBtn.addEventListener('click', () => {
            importFileInput.click();
        });
    }

    if (importFileInput) {
        importFileInput.addEventListener('change', handleImport);
    }
});

function exportToPDF() {
    const entries = getEntries();
    if (entries.length === 0) {
        showNotification('No entries to export', 'warning');
        return;
    }

    const printWindow = window.open('', '_blank');
    const content = generatePDFContent(entries);
    
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
    
    showNotification('PDF export initiated', 'success');
}

function generatePDFContent(entries) {
    const sortedEntries = entries.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    let content = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Digital Diary Export</title>
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .header {
                    text-align: center;
                    border-bottom: 2px solid #6366f1;
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                }
                .entry {
                    margin-bottom: 30px;
                    padding: 20px;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    page-break-inside: avoid;
                }
                .entry-title {
                    font-size: 1.3em;
                    font-weight: bold;
                    color: #6366f1;
                    margin-bottom: 10px;
                }
                .entry-meta {
                    font-size: 0.9em;
                    color: #64748b;
                    margin-bottom: 15px;
                }
                .entry-content {
                    white-space: pre-wrap;
                    line-height: 1.8;
                }
                .entry-tags {
                    margin-top: 15px;
                    font-size: 0.8em;
                    color: #8b5cf6;
                }
                @media print {
                    body { margin: 0; }
                    .entry { break-inside: avoid; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Digital Diary</h1>
                <p>Exported on ${new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })}</p>
                <p>Total Entries: ${entries.length}</p>
            </div>
    `;
    
    sortedEntries.forEach(entry => {
        const entryDate = new Date(entry.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const tags = entry.tags && entry.tags.length > 0 
            ? `<div class="entry-tags">Tags: ${entry.tags.map(tag => '#' + tag).join(', ')}</div>`
            : '';
        
        content += `
            <div class="entry">
                <div class="entry-title">${entry.title}</div>
                <div class="entry-meta">
                    ${entryDate} | Mood: ${getMoodEmoji(entry.mood)} ${entry.mood || 'Not specified'} | 
                    Category: ${entry.category || 'Personal'} | 
                    Words: ${entry.wordCount || entry.content.split(/\s+/).length}
                </div>
                <div class="entry-content">${entry.content}</div>
                ${tags}
            </div>
        `;
    });
    
    content += `
        </body>
        </html>
    `;
    
    return content;
}

function exportToJSON() {
    const entries = getEntries();
    if (entries.length === 0) {
        showNotification('No entries to export', 'warning');
        return;
    }

    const dataStr = JSON.stringify(entries, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `diary-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showNotification('Entries exported successfully', 'success');
}

function handleImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedEntries = JSON.parse(e.target.result);
            
            if (Array.isArray(importedEntries)) {
                const existingEntries = getEntries();
                const mergedEntries = [...existingEntries, ...importedEntries];
                
                // Remove duplicates based on ID
                const uniqueEntries = mergedEntries.filter((entry, index, self) => 
                    index === self.findIndex(e => e.id === entry.id)
                );
                
                localStorage.setItem('diaryEntries', JSON.stringify(uniqueEntries));
                
                showNotification(`Successfully imported ${importedEntries.length} entries`, 'success');
                
                if (typeof loadAndDisplayEntries === 'function') {
                    loadAndDisplayEntries();
                }
                if (window.updateStatistics) {
                    window.updateStatistics();
                }
            }
        } catch (error) {
            showNotification('Error importing file. Please check the file format.', 'error');
        }
    };
    
    reader.readAsText(file);
    event.target.value = '';
}

// All functions are compatible with new entry structure.

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
    return moodEmojis[mood] || '😊';
}