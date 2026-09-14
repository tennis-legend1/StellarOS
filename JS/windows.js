class WindowManager {
    constructor() {
        this.windows = [];
        this.zIndex = 100;
        this.activeWindow = null;
        this.windowTemplates = {
            terminal: document.getElementById('terminal-template').cloneNode(true),
            notes: document.getElementById('notes-template').cloneNode(true),
            calculator: document.getElementById('calculator-template').cloneNode(true),
            browser: document.getElementById('browser-template').cloneNode(true),
            settings: document.getElementById('settings-template').cloneNode(true)
        };
        this.windowList = document.getElementById('windowList');
    }

    createWindow(appType, x = 100, y = 100) {
        const template = this.windowTemplates[appType];
        if (!template) return null;

        const window = template.cloneNode(true);
        window.id = `window-${Date.now()}`;
        window.style.left = `${x}px`;
        window.style.top = `${y}px`;
        window.style.zIndex = this.zIndex++;

        this.addWindowControls(window);
        this.makeDraggable(window);

        document.getElementById('windows').appendChild(window);

        this.windows.push({
            id: window.id,
            element: window,
            appType: appType,
            title: window.querySelector('.window-title').textContent
        });

        this.setActiveWindow(window.id);
        this.updateWindowList();
        this.initApp(window, appType);

        return window;
    }

    addWindowControls(window) {
        window.querySelector('.minimize')?.addEventListener('click', (e) => {
            e.stopPropagation(); this.minimizeWindow(window.id);
        });
        window.querySelector('.maximize')?.addEventListener('click', (e) => {
            e.stopPropagation(); this.maximizeWindow(window.id);
        });
        window.querySelector('.close')?.addEventListener('click', (e) => {
            e.stopPropagation(); this.closeWindow(window.id);
        });
    }

    makeDraggable(window) {
        const header = window.querySelector('.window-header');
        let isDragging = false, offsetX, offsetY;

        header.addEventListener('mousedown', (e) => {
            if (e.target.closest('button')) return;
            isDragging = true;
            this.setActiveWindow(window.id);
            const rect = window.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            window.style.left = `${e.clientX - offsetX}px`;
            window.style.top = `${e.clientY - offsetY}px`;
        });

        document.addEventListener('mouseup', () => { isDragging = false; });
    }

    setActiveWindow(windowId) {
        this.windows.forEach(win => {
            if (win.id === windowId) {
                win.element.style.zIndex = this.zIndex++;
                this.activeWindow = win;
            }
        });
        this.updateWindowList();
    }

    minimizeWindow(windowId) {
        const window = this.windows.find(w => w.id === windowId);
        if (window) window.element.style.display = 'none';
        this.updateWindowList();
    }

    maximizeWindow(windowId) {
        const window = this.windows.find(w => w.id === windowId);
        if (window) {
            if (window.element.style.width === '100vw' && window.element.style.height === 'calc(100vh - 45px)') {
                window.element.style.width = ''; window.element.style.height = '';
                window.element.style.left = ''; window.element.style.top = '';
            } else {
                window.element.style.width = '100vw'; window.element.style.height = 'calc(100vh - 45px)';
                window.element.style.left = '0'; window.element.style.top = '0';
            }
        }
    }

    closeWindow(windowId) {
        const index = this.windows.findIndex(w => w.id === windowId);
        if (index !== -1) {
            this.windows[index].element.remove();
            this.windows.splice(index, 1);
            if (this.activeWindow?.id === windowId) this.activeWindow = null;
            this.updateWindowList();
        }
    }

    updateWindowList() {
        this.windowList.innerHTML = '';
        this.windows.forEach(window => {
            const tab = document.createElement('div');
            tab.className = `window-tab ${this.activeWindow?.id === window.id ? 'active' : ''}`;
            tab.textContent = window.title;
            tab.onclick = () => {
                window.element.style.display = window.element.style.display === 'none' ? 'block' : 'none';
                this.setActiveWindow(window.id);
            };
            this.windowList.appendChild(tab);
        });
    }

    initApp(window, appType) {
        switch (appType) {
            case 'terminal': this.initTerminal(window); break;
            case 'calculator': this.initCalculator(window); break;
            case 'browser': this.initBrowser(window); break;
        }
    }

    initTerminal(window) {
        const output = window.querySelector('.terminal-output');
        const input = window.querySelector('.terminal-input input');
        output.innerHTML = '<div>StellarOS Terminal [v1.0]</div><div>Type "help" for commands.</div><br>';
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmd = input.value; input.value = '';
                if (cmd.trim() === '') return;
                output.innerHTML += `<div><span style="color: #00ff88;">>> ${cmd}</span></div>`;
                this.processCommand(cmd, output);
                output.scrollTop = output.scrollHeight;
            }
        });
    }

    processCommand(cmd, output) {
        const commands = {
            'help': () => output.innerHTML += '<div>Commands: help, clear, date, time, hello, secret</div>',
            'clear': () => output.innerHTML = '',
            'date': () => output.innerHTML += `<div>Date: ${new Date().toLocaleDateString()}</div>`,
            'time': () => output.innerHTML += `<div>Time: ${new Date().toLocaleTimeString()}</div>`,
            'hello': () => output.innerHTML += '<div>Hello, Explorer! ✨</div>',
            'secret': () => output.innerHTML += "<div>You found the secret! Here's a star: ⭐</div>"
        };
        if (commands[cmd.toLowerCase()]) commands[cmd.toLowerCase()]();
        else output.innerHTML += `<div>Command not found: ${cmd}</div>`;
    }

    initCalculator(window) {
        const display = window.querySelector('.calculator-display');
        const buttons = window.querySelectorAll('.calc-btn');
        let currentValue = '0', previousValue = '', operation = null, resetScreen = false;

        buttons.forEach(button => {
            button.addEventListener('click', () => {
                const value = button.dataset.value;
                if (/[0-9]/.test(value)) {
                    if (currentValue === '0' || resetScreen) currentValue = value, resetScreen = false;
                    else currentValue += value;
                } else if (value === '.') {
                    if (!currentValue.includes('.')) currentValue += value;
                } else if (value === 'C') {
                    currentValue = '0'; previousValue = ''; operation = null;
                } else if (value === '=') {
                    if (operation && previousValue !== '') {
                        currentValue = this.calculate(previousValue, currentValue, operation);
                        operation = null; resetScreen = true;
                    }
                } else {
                    if (operation && !resetScreen) currentValue = this.calculate(previousValue, currentValue, operation);
                    previousValue = currentValue; operation = value; resetScreen = true;
                }
                display.textContent = currentValue;
            });
        });
    }

    calculate(a, b, op) {
        const numA = parseFloat(a);
        const numB = parseFloat(b);
        switch (op) {
            case '+': return (numA + numB).toString();
            case '-': return (numA - numB).toString();
            case '*': return (numA * numB).toString();
            case '/': return (numA / numB).toString();
            default: return b;
        }
    }

    initBrowser(window) {
        const urlInput = window.querySelector('#browser-url');
        const goButton = window.querySelector('#browser-go');
        const iframe = window.querySelector('#browser-iframe');

        iframe.src = "https://www.wikipedia.org";
        urlInput.value = "wikipedia.org";

        goButton.addEventListener('click', () => {
            let url = urlInput.value.trim();
            if (!url) return;

            if (url.includes('.') && !url.includes(' ')) {
                if (!url.startsWith('http://') && !url.startsWith('https://')) {
                    url = 'https://' + url;
                }
                iframe.src = url;
            } else {
                const searchUrl = `https://crossref.org{encodeURIComponent(url)}&rows=10`;
                
                fetch(searchUrl)
                    .then(response => response.json())
                    .then(data => {
                        const items = data.message.items || [];
                        
                        let htmlContent = `
                            <html lang="en">
                            <head>
                                <style>
                                    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 20px; background: #0f111a; color: #ffffff; }
                                    .search-header { border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 12px; margin-bottom: 20px; font-size: 14px; color: #8b9bb4; }
                                    .result-item { margin-bottom: 24px; }
                                    .result-title { font-size: 18px; font-weight: 600; margin-bottom: 4px; }
                                    .result-title a { color: #00d4ff; text-decoration: none; }
                                    .result-title a:hover { text-decoration: underline; }
                                    .result-url { color: #00ffa3; font-size: 12px; margin-bottom: 6px; word-break: break-all; }
                                    .result-snippet { color: #b4c6ef; font-size: 14px; line-height: 1.5; }
                                </style>
                            </head>
                            <body>
                                <div class="search-header">Global Search Results for: <b>${url}</b></div>
                        `;

                        if (items.length === 0) {
                            htmlContent += `<p style="color: #8b9bb4;">No web results found in this sector.</p>`;
                        } else {
                            items.forEach(item => {
                                const title = item.title ? item.title[0] : 'Web Directory Link';
                                const link = item.URL || 'https://google.com';
                                const snippet = item.publisher || 'Global indexed network database content.';
                                htmlContent += `
                                    <div class="result-item">
                                        <div class="result-title"><a href="${link}" target="_blank">${title}</a></div>
                                        <div class="result-url">${link}</div>
                                        <div class="result-snippet">${snippet}</div>
                                    </div>
                                `;
                            });
                        }

                        htmlContent += `</body></html>`;
                        
                        iframe.src = "about:blank";
                        setTimeout(() => {
                            const doc = iframe.contentDocument || iframe.contentWindow.document;
                            doc.open();
                            doc.write(htmlContent);
                            doc.close();
                        }, 10);
                    })
                    .catch(() => {
                        iframe.src = "https://www.wikipedia.org/wiki/" + encodeURIComponent(url);
                    });
            }
        });

        urlInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                goButton.click();
            }
        });
    }


}

const windowManager = new WindowManager();