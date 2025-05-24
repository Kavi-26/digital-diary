document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');
    const tabContents = document.querySelectorAll('.tab-content');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetTab = item.dataset.tab;
            
            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Update active tab content
            tabContents.forEach(content => content.classList.remove('active'));
            const targetContent = document.getElementById(`${targetTab}-tab`);
            if (targetContent) {
                targetContent.classList.add('active');
            }
            
            // Load specific content if needed
            if (targetTab === 'stats') {
                setTimeout(() => {
                    if (window.updateStatistics) {
                        updateStatistics();
                    }
                }, 100);
            } else if (targetTab === 'calendar') {
                setTimeout(() => {
                    loadCalendar();
                }, 100);
            }
        });
    });
    
    // Calendar navigation
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('calendar-prev')) {
            const cal = document.getElementById('calendar');
            const year = +cal.dataset.year;
            const month = +cal.dataset.month;
            let newMonth = month - 1, newYear = year;
            if (newMonth < 0) { newMonth = 11; newYear--; }
            loadCalendar(newYear, newMonth);
        }
        if (e.target.classList.contains('calendar-next')) {
            const cal = document.getElementById('calendar');
            const year = +cal.dataset.year;
            const month = +cal.dataset.month;
            let newMonth = month + 1, newYear = year;
            if (newMonth > 11) { newMonth = 0; newYear++; }
            loadCalendar(newYear, newMonth);
        }
    });
});

function loadCalendar(year, month) {
    const calendarContainer = document.getElementById('calendar');
    if (!calendarContainer) return;
    
    const entries = getEntries().filter(e => !e.draft);
    let today = new Date();
    let currentMonth = typeof month === 'number' ? month : today.getMonth();
    let currentYear = typeof year === 'number' ? year : today.getFullYear();
    
    calendarContainer.innerHTML = generateCalendarHTML(currentYear, currentMonth, entries);
    calendarContainer.dataset.year = currentYear;
    calendarContainer.dataset.month = currentMonth;

    // Add click event to days with entries
    calendarContainer.querySelectorAll('.calendar-day.has-entry').forEach(dayEl => {
        dayEl.addEventListener('click', function() {
            const day = this.querySelector('.day-number').textContent;
            const y = +calendarContainer.dataset.year;
            const m = +calendarContainer.dataset.month;
            const date = new Date(y, m, +day);
            const dateString = date.toDateString();
            const dayEntries = entries.filter(entry =>
                new Date(entry.date).toDateString() === dateString
            );
            if (dayEntries.length > 0) {
                let msg = `<b>Entries for ${dateString}:</b><ul style="margin:0;padding-left:1.2em;">`;
                dayEntries.forEach(e => {
                    msg += `<li><b>${e.title}</b>: ${e.content.replace(/<[^>]+>/g, '').slice(0, 80)}${e.content.length > 80 ? '...' : ''}</li>`;
                });
                msg += '</ul>';
                showNotification(msg, 'info', 8000);
            }
        });
        dayEl.style.cursor = 'pointer';
    });
}

function generateCalendarHTML(year, month, entries) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    
    let html = `
        <div class="calendar-header">
            <button class="calendar-prev" title="Previous Month">&lt;</button>
            <h3>${monthNames[month]} ${year}</h3>
            <button class="calendar-next" title="Next Month">&gt;</button>
        </div>
        <div class="calendar-grid">
            <div class="calendar-day-header">Sun</div>
            <div class="calendar-day-header">Mon</div>
            <div class="calendar-day-header">Tue</div>
            <div class="calendar-day-header">Wed</div>
            <div class="calendar-day-header">Thu</div>
            <div class="calendar-day-header">Fri</div>
            <div class="calendar-day-header">Sat</div>
    `;
    
    // Empty cells for days before the first day of month
    for (let i = 0; i < startingDay; i++) {
        html += '<div class="calendar-day empty"></div>';
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateString = date.toDateString();
        const hasEntry = entries.some(entry => 
            new Date(entry.date).toDateString() === dateString
        );
        
        const isToday = dateString === new Date().toDateString();
        
        html += `
            <div class="calendar-day ${hasEntry ? 'has-entry' : ''} ${isToday ? 'today' : ''}">
                <span class="day-number">${day}</span>
                ${hasEntry ? '<div class="entry-indicator"></div>' : ''}
            </div>
        `;
    }
    
    html += '</div>';
    return html;
}