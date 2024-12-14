export class ViewManager {
    static refreshHandlers = new Map();
    static listeners = new Map();

    static hideAllScreens() {
        const screens = document.querySelectorAll('[id$="Screen"]');
        screens.forEach(screen => {
            screen.style.display = 'none';
        });
    }

    static showScreen(screenId) {
        this.hideAllScreens();
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.style.display = 'block';
            this.refreshScreen(screenId); 
        }
    }

    static registerRefreshHandler(screenId, handler) {
        this.refreshHandlers.set(screenId, handler);
    }

    static refreshScreen(screenId) {
        const handler = this.refreshHandlers.get(screenId);
        if (handler) {
            handler();
        }
    }

    static refreshAll() {
        this.refreshHandlers.forEach((handler, screenId) => {
            const screen = document.getElementById(screenId);
            if (screen && screen.style.display !== 'none') {
                handler();
            }
        });
    }
}