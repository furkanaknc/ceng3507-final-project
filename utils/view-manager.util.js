export class ViewManager {
    // Store refresh handlers and event listeners
    static refreshHandlers = new Map();
    static listeners = new Map();

    // Hide all screens with 'Screen' suffix in their IDs
    static hideAllScreens() {
        const screens = document.querySelectorAll('[id$="Screen"]');
        screens.forEach(screen => {
            screen.style.display = 'none';
        });
    }

    // Show specific screen and trigger its refresh handler
    static showScreen(screenId) {
        this.hideAllScreens();
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.style.display = 'block';
            this.refreshScreen(screenId); 
        }
    }

     // Register a refresh handler for specific screen
    static registerRefreshHandler(screenId, handler) {
        this.refreshHandlers.set(screenId, handler);
    }

    // Call refresh handler for specific screen
    static refreshScreen(screenId) {
        const handler = this.refreshHandlers.get(screenId);
        if (handler) {
            handler();
        }
    }

    // Refresh all visible screens
    static refreshAll() {
        this.refreshHandlers.forEach((handler, screenId) => {
            const screen = document.getElementById(screenId);
            if (screen && screen.style.display !== 'none') {
                handler();
            }
        });
    }
}