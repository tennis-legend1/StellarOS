let currentZIndex = 100;
let runningWindows = [];

function focusWindow(element) {
    currentZIndex++;
    element.style.zIndex = currentZIndex;
}

function closeWindow(windowId) {
    const win = document.getElementById(windowId);
    if (win) {
        win.remove();
        runningWindows = runningWindows.filter(w => win.id !== windowId);
    }
}

function openApp(appType) {
    const template = document.getElementById(appType + '-template');
    if (!template) return;

    const newWin = template.cloneNode(true);
    newWin.id = 'window-' + Date.now();
    newWin.classList.remove('hidden');
    
    newWin.style.position = 'absolute';
    newWin.style.left = (Math.random() * 150 + 80) + 'px';
    newWin.style.top = (Math.random() * 100 + 60) + 'px';
    newWin.style.zIndex = currentZIndex++;

    newWin.onmousedown = function() {
        focusWindow(newWin);
    };

    const header = newWin.querySelector('.window-header');
    if (header) {
        let isMoving = false;
        let startX = 0;
        let startY = 0;

        header.onmousedown = function(e) {
            if (e.target.tagName === 'BUTTON') return;
            isMoving = true;
            focusWindow(newWin);
            startX = e.clientX - newWin.offsetLeft;
            startY = e.clientY - newWin.offsetTop;
        };

        document.addEventListener('mousemove', function(e) {
            if (isMoving) {
                newWin.style.left = (e.clientX - startX) + 'px';
                newWin.style.top = (e.clientY - startY) + 'px';
            }
        });

        document.addEventListener('mouseup', function() {
            isMoving = false;
        });
    }

    const closeBtn = newWin.querySelector('.close');
    if (closeBtn) {
        closeBtn.onclick = function(e) {
            e.stopPropagation();
            closeWindow(newWin.id);
        };
    }

    if (appType === 'terminal') {
        const output = newWin.querySelector('.terminal-output');
        const input = newWin.querySelector('.terminal-input input');
        if (output) {
            output.innerHTML = '<div>System ready.</div><div>Type "help" for info.</div><br>';
        }
        if (input) {
            input.onkeydown = function(e) {
                if (e.key === 'Enter') {
                    const text = input.value.trim().toLowerCase();
                    input.value = '';
                    if (text === '') return;
                    output.innerHTML += '<div><span style="color: #00ff88;">>> ' + text + '</span></div>';
                    if (text === 'help') {
                        output.innerHTML += '<div>Commands: help, clear, date, hello</div>';
                    } else if (text === 'clear') {
                        output.innerHTML = '';
                    } else if (text === 'date') {
                        output.innerHTML += '<div>Date: ' + new Date().toLocaleDateString() + '</div>';
                    } else if (text === 'hello') {
                        output.innerHTML += '<div>Hello from the script layout!</div>';
                    } else {
                        output.innerHTML += '<div>Unknown command.</div>';
                    }
                    output.scrollTop = output.scrollHeight;
                }
            };
        }
    }

    if (appType === 'calculator') {
        const display = newWin.querySelector('.calculator-display');
        const buttons = newWin.querySelectorAll('.calc-btn');
        let currentString = '';
        
        for (let i = 0; i < buttons.length; i++) {
            buttons[i].onclick = function() {
                const val = buttons[i].innerText;
                if (val === 'C') {
                    currentString = '';
                    display.innerText = '0';
                } else if (val === '=') {
                    if (currentString !== '') {
                        try {
                            let expression = currentString.replace('×', '*').replace('÷', '/').replace('−', '-');
                            display.innerText = eval(expression);
                            currentString = display.innerText;
                        } catch (err) {
                            display.innerText = 'Error';
                            currentString = '';
                        }
                    }
                } else {
                    let dataVal = buttons[i].getAttribute('data-value');
                    currentString = currentString + dataVal;
                    display.innerText = currentString;
                }
            };
        }
    }

    if (appType === 'browser') {
        const urlInput = newWin.querySelector('#browser-url');
        const goBtn = newWin.querySelector('#browser-go');
        const frame = newWin.querySelector('#browser-iframe');
        
        if (frame && urlInput) {
            frame.src = "https://wikipedia.org";
            urlInput.value = "wikipedia.org";
        }
        
        if (goBtn && urlInput && frame) {
            goBtn.onclick = function() {
                let url = urlInput.value.trim();
                if (url === '') return;
                
                if (url.includes('.') && !url.includes(' ')) {
                    if (!url.startsWith('http://') && !url.startsWith('https://')) {
                        url = 'https://' + url;
                    }
                    frame.src = url;
                } else {
                    frame.src = "https://wikipedia.org/wiki/" + encodeURIComponent(url);
                }
            };
            urlInput.onkeydown = function(e) {
                if (e.key === 'Enter') goBtn.click();
            };
        }
    }

    document.getElementById('desktop').appendChild(newWin);
}

document.addEventListener('DOMContentLoaded', function() {
    const iconTerminal = document.getElementById('icon-terminal');
    const iconNotes = document.getElementById('icon-notes');
    const iconCalculator = document.getElementById('icon-calculator');
    const iconBrowser = document.getElementById('icon-browser');

    if (iconTerminal) iconTerminal.ondblclick = function() { openApp('terminal'); };
    if (iconNotes) iconNotes.ondblclick = function() { openApp('notes'); };
    if (iconCalculator) iconCalculator.ondblclick = function() { openApp('calculator'); };
    if (iconBrowser) iconBrowser.ondblclick = function() { openApp('browser'); };

    const startBtn = document.getElementById('startButton');
    const menu = document.getElementById('startMenu');
    if (startBtn && menu) {
        startBtn.onclick = function(e) {
            e.stopPropagation();
            menu.classList.toggle('hidden');
        };
        document.onclick = function() {
            menu.classList.add('hidden');
        };
        menu.onclick = function(e) {
            e.stopPropagation();
        };
    }

    const startApps = document.querySelectorAll('.start-app');
    for (let j = 0; j < startApps.length; j++) {
        startApps[j].onclick = function() {
            const type = startApps[j].getAttribute('data-app');
            openApp(type);
            if (menu) menu.classList.add('hidden');
        };
    }

    function runClock() {
        const el = document.getElementById('clock');
        if (el) {
            const d = new Date();
            let h = d.getHours();
            let m = d.getMinutes();
            let s = d.getSeconds();
            h = h < 10 ? '0' + h : h;
            m = m < 10 ? '0' + m : m;
            s = s < 10 ? '0' + s : s;
            el.textContent = h + ':' + m + ':' + s;
        }
    }
    runClock();
    setInterval(runClock, 1000);
});

window.windowManager = {
    createWindow: function(type) {
        openApp(type);
    },
    closeWindow: function() {},
    getActiveWindow: function() { return null; }
};
