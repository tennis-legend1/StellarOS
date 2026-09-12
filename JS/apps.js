class AppManager {
    constructor() {
        this.init();
    }
    init() {
        document.querySelectorAll('.icon').forEach(icon => {
            const appType = icon.dataset.app;
            icon.addEventListener('dblclick', (e) => { e.preventDefault(); this.launchApp(appType); });
        });

        const startButton = document.getElementById('startButton');
        const startMenu = document.getElementById('startMenu');
        startButton.addEventListener('click', (e) => { e.stopPropagation(); startMenu.classList.toggle('hidden'); });
        document.addEventListener('click', () => startMenu.classList.add('hidden'));
        startMenu.addEventListener('click', (e) => e.stopPropagation());

        document.querySelectorAll('.start-app').forEach(app => {
            const appType = app.dataset.app;
            app.addEventListener('click', () => { this.launchApp(appType); startMenu.classList.add('hidden'); });
        });
    }
    launchApp(appType) {
        const x = Math.random() * 200 + 100;
        const y = Math.random() * 100 + 50;
        windowManager.createWindow(appType, x, y);
    }
}

class ThemeManager {
    constructor() {
        this.themes = ['light', 'dark', 'starry', 'sunset'];
        this.currentTheme = 'dark';
        this.init();
    }
    init() {
        const savedTheme = localStorage.getItem('stellarOS-theme');
        if (savedTheme && this.themes.includes(savedTheme)) this.currentTheme = savedTheme;
        this.applyTheme(this.currentTheme);
        document.getElementById('themeToggle')?.addEventListener('click', () => {
            const currentIndex = this.themes.indexOf(this.currentTheme);
            const nextIndex = (currentIndex + 1) % this.themes.length;
            this.applyTheme(this.themes[nextIndex]);
        });
        const themeSelect = document.getElementById('theme-select');
        if (themeSelect) {
            themeSelect.value = this.currentTheme;
            themeSelect.addEventListener('change', () => this.applyTheme(themeSelect.value));
        }
    }
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        localStorage.setItem('stellarOS-theme', theme);
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) themeToggle.textContent = theme === 'dark' || theme === 'starry' ? '☀️' : '🌙';
    }
}

class ClockManager {
    constructor() {
        this.clockElement = document.getElementById('clock');
        this.init();
    }
    init() {
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
    }
    updateClock() {
        if (this.clockElement) {
            const now = new Date();
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            const seconds = now.getSeconds().toString().padStart(2, '0');
            this.clockElement.textContent = `🕐 ${hours}:${minutes}:${seconds}`;
        }
    }
}

const appManager = new AppManager();
const themeManager = new ThemeManager();
const clockManager = new ClockManager();