export class ViewManager {
    static hideAllScreens() {
        const screens = document.querySelectorAll('[id$="Screen"]');
        screens.forEach(screen => {
            screen.style.display = 'none';
        });
    }

    static showScreen(screenId) {
        // First hide all screens
        this.hideAllScreens();

        // Then show the requested screen
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.style.display = 'block';
        }
    }
}