document.addEventListener('DOMContentLoaded', () => {
    // Welcome message
    const welcome = document.createElement('div');
    welcome.innerHTML = '<h1>🌟 Welcome to StellarOS!</h1><p>Double-click icons to open apps<br>Click Start to see all applications</p><small>v1.0</small>';
    welcome.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;color:var(--text-color);background:var(--window-bg);backdrop-filter:blur(10px);padding:30px;border-radius:15px;border:1px solid var(--window-border);box-shadow:var(--shadow);z-index:50;max-width:400px';
    document.getElementById('desktop').appendChild(welcome);
    setTimeout(() => { welcome.style.opacity='0'; welcome.style.transition='opacity 0.5s ease'; setTimeout(() => welcome.remove(), 500); }, 5000);
    welcome.addEventListener('click', () => { welcome.style.opacity='0'; welcome.style.transition='opacity 0.5s ease'; setTimeout(() => welcome.remove(), 500); });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 't') { e.preventDefault(); windowManager.createWindow('terminal', 100, 100); }
        if (e.ctrlKey && e.key === 'n') { e.preventDefault(); windowManager.createWindow('notes', 150, 150); }
        if (e.ctrlKey && e.key === 'c') { e.preventDefault(); windowManager.createWindow('calculator', 200, 200); }
        if (e.ctrlKey && e.key === 'b') { e.preventDefault(); windowManager.createWindow('browser', 250, 250); }
        if (e.ctrlKey && e.key === 's') { e.preventDefault(); windowManager.createWindow('settings', 300, 300); }
        if (e.key === 'Escape') { const active = windowManager.getActiveWindow(); if (active) windowManager.closeWindow(active.id); }
    });

    // Draggable icons
    document.querySelectorAll('.icon').forEach(icon => {
        let isDragging = false, offsetX, offsetY;
        icon.addEventListener('mousedown', (e) => {
            if (e.detail === 1) {
                isDragging = true;
                const rect = icon.getBoundingClientRect();
                offsetX = e.clientX - rect.left; offsetY = e.clientY - rect.top;
                e.preventDefault();
            }
        });
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            icon.style.left = `${e.clientX - offsetX}px`;
            icon.style.top = `${e.clientY - offsetY}px`;
            icon.style.position = 'absolute';
        });
        document.addEventListener('mouseup', () => { isDragging = false; });
    });

    // Right-click context menu
    document.getElementById('desktop').addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const menu = document.createElement('div');
        menu.style.cssText = 'position:absolute;left:'+e.clientX+'px;top:'+e.clientY+'px;background:var(--window-bg);backdrop-filter:blur(10px);border:1px solid var(--window-border);border-radius:8px;box-shadow:var(--shadow);z-index:1002;min-width:200px;padding:10px';
            menu.innerHTML = `
                <div style="padding:8px 12px;cursor:pointer;border-radius:4px;margin:5px 0" onclick="windowManager.createWindow('terminal',${e.clientX},${e.clientY})">🖥️ New Terminal</div>
                <div style="padding:8px 12px;cursor:pointer;border-radius:4px;margin:5px 0" onclick="windowManager.createWindow('notes',${e.clientX},${e.clientY})">📝 New Notes</div>
                <div style="padding:8px 12px;cursor:pointer;border-radius:4px;margin:5px 0" onclick="windowManager.createWindow('calculator',${e.clientX},${e.clientY})">🧮 Calculator</div>
                <div style="padding:8px 12px;cursor:pointer;border-radius:4px;margin:5px 0" onclick="windowManager.createWindow('browser',${e.clientX},${e.clientY})">🌐 Browser</div>
                <hr style="border:none;border-top:1px solid var(--window-border);margin:10px 0">
                <div style="padding:8px 12px;cursor:pointer;border-radius:4px;margin:5px 0" onclick="windowManager.createWindow('settings',${e.clientX},${e.clientY})">⚙️ Settings</div>
            `;
        menu.querySelectorAll('div').forEach(d => {
            if (d.style.padding) {
                d.addEventListener('mouseenter', () => d.style.background = 'color-mix(in srgb, var(--accent-color), transparent 80%)');
                d.addEventListener('mouseleave', () => d.style.background = '');
            }
        });
        document.body.appendChild(menu);
        setTimeout(() => document.addEventListener('click', () => menu.remove(), {once: true}), 100);
    });

    // Easter egg
    let konami = [];
    const konamiSeq = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
    document.addEventListener('keydown', (e) => {
        konami.push(e.key); konami = konami.slice(-10);
        if (konami.join(',') === konamiSeq.join(',')) {
            const egg = document.createElement('div');
            egg.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:9999;flex-direction:column;gap:20px';
            egg.innerHTML = '<h1 style=\"color:gold;font-family:var(--font-title);font-size:48px\">⭐ EASTER EGG! ⭐</h1><p style=\"color:white;font-size:24px\">You found the secret code!</p><button style=\"padding:15px 30px;background:var(--accent-color);color:white;border:none;border-radius:10px;font-family:var(--font-main);font-size:18px;cursor:pointer\" onclick=\"this.parentElement.remove()\">Yay!</button>';
            document.body.appendChild(egg);
            for (let i = 0; i < 100; i++) {
                setTimeout(() => {
                    const conf = document.createElement('div');
                    const colors = ['#ff0000','#00ff00','#0000ff','#ffff00','#ff00ff','#00ffff'];
                    conf.style.cssText = 'position:fixed;width:10px;height:10px;background:'+colors[Math.floor(Math.random()*colors.length)]+';left:'+Math.random()*100+'vw;top:-10px;border-radius:'+(Math.random()>0.5?'50%':'0')+';pointer-events:none;z-index:10000;animation:confettiFall '+ (Math.random()*3+2) +'s linear forwards';
                    document.body.appendChild(conf);
                    setTimeout(() => conf.remove(), 5000);
                }, i * 50);
            }
            const style = document.createElement('style');
            style.textContent = '@keyframes confettiFall { 0% { transform:translateY(0) rotate(0deg); opacity:1; } 100% { transform:translateY(100vh) rotate(720deg); opacity:0; } }';
            document.head.appendChild(style);
        }
    });

    console.log('%c🌟 StellarOS v1.0 %c✨ Built with love', 'color:#00d4ff;font-size:20px;font-weight:bold', 'color:#fff;font-size:14px');
});

window.windowManager = windowManager;