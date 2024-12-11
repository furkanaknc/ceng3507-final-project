export class ViewManager {
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
        }
    }
}