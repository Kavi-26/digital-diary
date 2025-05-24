class NotificationManager {
    constructor() {
        this.container = document.getElementById('notifications') || this.createContainer();
        this.notifications = [];
    }

    createContainer() {
        const container = document.createElement('div');
        container.id = 'notifications';
        container.className = 'notifications-container';
        document.body.appendChild(container);
        return container;
    }

    show(message, type = 'info', duration = 4000) {
        const notification = this.createNotification(message, type);
        this.container.appendChild(notification);
        this.notifications.push(notification);

        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 10);

        // Auto remove
        setTimeout(() => {
            this.remove(notification);
        }, duration);

        return notification;
    }

    createNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        notification.style.transition = 'all 0.3s ease';

        const icon = this.getIcon(type);
        
        notification.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        return notification;
    }

    getIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    remove(notification) {
        if (notification && notification.parentElement) {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.parentElement.removeChild(notification);
                }
            }, 300);

            const index = this.notifications.indexOf(notification);
            if (index > -1) {
                this.notifications.splice(index, 1);
            }
        }
    }

    clear() {
        this.notifications.forEach(notification => {
            this.remove(notification);
        });
        this.notifications = [];
    }
}

// Create global notification manager
const notificationManager = new NotificationManager();

// Global function for easy access
window.showNotification = function(message, type = 'info', duration = 4000) {
    return notificationManager.show(message, type, duration);
};