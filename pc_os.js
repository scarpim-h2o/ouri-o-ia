/**
 * ============================================================================
 * MÓDULO DO PC DO OURIÇO — OURIÇO OS v0.4 (pc_os.js)
 * ============================================================================
 */

export class OuricoOS {
    constructor(memoryManager) {
        this.memory = memoryManager;
        this.isOpen = false;
        this.activeApp = 'desktop';
        this.brushColor = '#1e293b';
        this.isDrawing = false;

        this.terminalLogs = [
            "OuricoOS 0.4.0-science tty1",
            "[OK] Enciclopédia Wikipédia & Leitor Web conectados.",
            "[OK] Sincronização com Quadro de Mural 3D ativa.",
            "Digite 'help' para comandos."
        ];

        this.injectModal();
    }

    injectModal() {
        const modalHTML = `
        <div id="modal-ourico-os" class="hidden fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
            <div class="bg-slate-800 p-2.5 sm:p-4 rounded-3xl border-2 border-slate-600 shadow-2xl max-w-2xl w-full flex flex-col gap-2">
                <div class="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 border border-slate-700 rounded-2xl overflow-hidden flex flex-col h-[460px] sm:h-[500px] relative select-none">
                    
                    <div class="bg-slate-950/90 border-b border-slate-800 px-3 py-1.5 flex items-center justify-between text-[11px] text-slate-300">
                        <div class="flex items-center gap-2">
                            <span class="font-bold text-emerald-400">🦔 Ouriço OS</span>
                            <span class="text-slate-600">|</span>
                            <span id="os-active-window-title" class="text-slate-300 font-medium">Área de Trabalho</span>
                        </div>
                        <div class="flex items-center gap-3">
                            <span class="text-emerald-400 font-medium">🌐 Online</span>
                            <span id="os-clock" class="font-mono text-slate-200">12:00</span>
                        </div>
                    </div>

                    <div id="os-desktop-view" class="flex-1 p-4 grid grid-cols-3 sm:grid-cols-5 gap-3 content-start">
                        <button data-os-app="browser" class="os-icon-btn flex flex-col items-center gap-1.5 p-2.5 rounded-2xl hover:bg-white/10 active:scale-95 transition">
                            <div class="w-12 h-12 rounded-2xl bg-sky-950 border border-sky-500 flex items-center justify-center text-2xl shadow-lg">🌐</div>
                            <span class="text-xs font-medium text-slate-200">Internet</span>
                        </button>

                        <button data-os-app="paint" class="os-icon-btn flex flex-col items-center gap-1.5 p-2.5 rounded-2xl hover:bg-white/10 active:scale-95 transition">
                            <div class="w-12 h-12 rounded-2xl bg-purple-950 border border-purple-500 flex items-center justify-center text-2xl shadow-lg">🎨</div>
                            <span class="text-xs font-medium text-slate-200">Esboçar</span>
                        </button>

                        <button data-os-app="mural" class="os-icon-btn flex flex-col items-center gap-1.5 p-2.5 rounded-2xl hover:bg-white/10 active:scale-95 transition">
                            <div class="w-12 h-12 rounded-2xl bg-pink-950 border border-pink-500 flex items-center justify-center text-2xl shadow-lg">🖼️</div>
                            <span class="text-xs font-medium text-slate-200">Mural</span>
                        </button>

                        <button data-os-app="diary" class="os-icon-btn flex flex-col items-center gap-1.5 p-2.5 rounded-2xl hover:bg-white/10 active:scale-95 transition">
                            <div class="w-12 h-12 rounded-2xl bg-amber-950 border border-amber-500 flex items-center justify-center text-2xl shadow-lg">📔</div>
                            <span class="text-xs font-medium text-slate-200">Caderno</span>
                        </button>

                        <button data-os-app="terminal" class="os-icon-btn flex flex-col items-center gap-1.5 p-2.5 rounded-2xl hover:bg-white/10 active:scale-95 transition">
                            <div class="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-600 flex items-center justify-center text-2xl shadow-lg">⬛</div>
                            <span class="text-xs font-medium text-slate-200">Terminal</span>
                        </button>
                    </div>

                    <!-- Navegador -->
                    <div id="os-app-browser" class="hidden flex-1 flex flex-col bg-slate-900 text-xs overflow-hidden">
                        <form id="os-browser-form" class="bg-slate-800 p-2 flex items-center gap-2 border-b border-slate-700">
                            <span class="text-emerald-400">🔒</span>
                            <input type="text" id="os-browser-input" placeholder="Pesquise um tema ou digite um site..." class="flex-1 bg-slate-950 text-slate-100 px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-sky-500">
                            <button type="submit" class="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg">Ir</button>
                        </form>
                        <div id="os-search-history-list" class="flex-1 overflow-y-auto p-3.5 space-y-2.5 custom-scrollbar"></div>
                    </div>

                    <!-- Paint em folha clara (igual aos esboços do Mural 3D) -->
                    <div id="os-app-paint" class="hidden flex-1 flex flex-col bg-slate-900 p-2.5 gap-2 overflow-hidden">
                        <div class="flex items-center justify-between flex-wrap gap-1.5 bg-slate-800 p-2 rounded-xl border border-slate-700">
                            <div class="flex items-center gap-1.5">
                                <button type="button" data-color="#1e293b" class="paint-color w-5 h-5 rounded-full bg-slate-800 border-2 border-white"></button>
                                <button type="button" data-color="#2563eb" class="paint-color w-5 h-5 rounded-full bg-blue-600 border border-slate-500"></button>
                                <button type="button" data-color="#16a34a" class="paint-color w-5 h-5 rounded-full bg-green-600 border border-slate-500"></button>
                                <button type="button" data-color="#dc2626" class="paint-color w-5 h-5 rounded-full bg-red-600 border border-slate-500"></button>
                                <button type="button" data-color="#d97706" class="paint-color w-5 h-5 rounded-full bg-amber-600 border border-slate-500"></button>
                            </div>
                            <div class="flex items-center gap-1.5">
                                <button id="paint-clear-btn" type="button" class="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-[11px]">Limpar</button>
                                <button id="paint-save-mural-btn" type="button" class="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg text-[11px]">Pendurar no Mural</button>
                            </div>
                        </div>
                        <div class="flex-1 bg-slate-50 border border-slate-400 rounded-xl overflow-hidden flex items-center justify-center relative">
                            <canvas id="ourico-paint-canvas" width="480" height="270" class="w-full h-full touch-none cursor-crosshair"></canvas>
                        </div>
                    </div>

                    <!-- Mural -->
                    <div id="os-app-mural" class="hidden flex-1 flex flex-col bg-slate-900 p-3.5 overflow-y-auto custom-scrollbar space-y-3">
                        <div class="flex items-center justify-between">
                            <h3 class="text-xs font-bold uppercase tracking-wider text-pink-300">🖼️ Mural de Esboços Científicos</h3>
                            <button id="mural-open-paint" type="button" class="px-2.5 py-1 bg-purple-600/80 hover:bg-purple-600 text-white rounded-lg text-[11px] font-medium">+ Novo Esboço</button>
                        </div>
                        <div id="os-mural-grid" class="grid grid-cols-1 sm:grid-cols-2 gap-3"></div>
                    </div>

                    <!-- Caderno -->
                    <div id="os-app-diary" class="hidden flex-1 flex flex-col bg-slate-900 p-3.5 overflow-y-auto custom-scrollbar space-y-3">
                        <div id="os-diary-list" class="space-y-2.5"></div>
                    </div>

                    <!-- Terminal -->
                    <div id="os-app-terminal" class="hidden flex-1 flex flex-col bg-black/90 font-mono text-xs p-3 overflow-hidden">
                        <div id="os-terminal-output" class="flex-1 overflow-y-auto space-y-1 text-emerald-400 custom-scrollbar pb-2"></div>
                        <form id="os-terminal-form" class="flex items-center gap-1.5 border-t border-slate-800 pt-2">
                            <span class="text-emerald-500 font-bold">ourico@lab:~$</span>
                            <input type="text" id="os-terminal-input" autocomplete="off" class="flex-1 bg-transparent text-slate-100 focus:outline-none">
                        </form>
                    </div>

                    <div class="bg-slate-950/95 border-t border-slate-800 px-3 py-1.5 flex items-center justify-between">
                        <button id="os-btn-home" class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium">⊞ Área de Trabalho</button>
                        <span class="text-[10px] text-slate-500">Ouriço OS v0.4</span>
                        <button id="os-btn-close" class="px-3 py-1 bg-red-950/80 hover:bg-red-900 border border-red-800/60 text-red-300 rounded-lg text-xs font-medium">Fechar</button>
                    </div>
                </div>
            </div>
        </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.bindEvents();
        this.initPaintCanvas();
    }

    bindEvents() {
        document.getElementById('os-btn-close').addEventListener('click', () => this.close());
        document.getElementById('os-btn-home').addEventListener('click', () => this.switchApp('desktop'));
        document.querySelectorAll('.os-icon-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchApp(btn.getAttribute('data-os-app')));
        });
        document.getElementById('mural-open-paint').addEventListener('click', () => this.switchApp('paint'));

        document.getElementById('os-browser-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const q = document.getElementById('os-browser-input').value.trim();
            if (!q) return;
            await this.performWebAction(q);
            this.renderBrowserHistory();
        });

        document.getElementById('os-terminal-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const input = document.getElementById('os-terminal-input');
            const cmd = input.value.trim();
            if (!cmd) return;
            input.value = '';
            await this.handleCommand(cmd);
        });
    }

    initPaintCanvas() {
        const canvas = document.getElementById('ourico-paint-canvas');
        const ctx = canvas.getContext('2d');
        const resetBg = () => {
            ctx.fillStyle = '#f8fafc';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        };
        resetBg();

        const getPos = (e) => {
            const rect = canvas.getBoundingClientRect();
            const touch = e.touches && e.touches.length > 0 ? e.touches[0] : e;
            return {
                x: ((touch.clientX - rect.left) / (rect.width || 1)) * canvas.width,
                y: ((touch.clientY - rect.top) / (rect.height || 1)) * canvas.height
            };
        };

        const start = (e) => {
            e.preventDefault();
            this.isDrawing = true;
            const p = getPos(e);
            ctx.strokeStyle = this.brushColor;
            ctx.fillStyle = this.brushColor;
            ctx.lineWidth = 5;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
        };
        const move = (e) => {
            if (!this.isDrawing) return;
            e.preventDefault();
            const p = getPos(e);
            ctx.strokeStyle = this.brushColor;
            ctx.lineWidth = 5;
            ctx.lineCap = 'round';
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
        };
        const end = () => { this.isDrawing = false; };

        canvas.addEventListener('mousedown', start);
        canvas.addEventListener('mousemove', move);
        window.addEventListener('mouseup', end);
        canvas.addEventListener('touchstart', start, { passive: false });
        canvas.addEventListener('touchmove', move, { passive: false });
        window.addEventListener('touchend', end);

        document.querySelectorAll('.paint-color').forEach(btn => {
            btn.addEventListener('click', () => {
                this.brushColor = btn.getAttribute('data-color');
            });
        });

        document.getElementById('paint-clear-btn').addEventListener('click', resetBg);
        document.getElementById('paint-save-mural-btn').addEventListener('click', () => {
            this.memory.addArtwork('Esboço Manual', canvas.toDataURL('image/png'), true);
            this.switchApp('mural');
        });
    }

    async performWebAction(queryOrUrl) {
        const clean = queryOrUrl.trim();
        const looksLikeUrl = /^https?:\/\//i.test(clean) || (/^[a-z0-9-]+(\.[a-z0-9-]+)+/i.test(clean) && !clean.includes(' '));
        if (looksLikeUrl) return await this.openWebsiteReader(clean);
        return await this.performAutonomousSearch(clean);
    }

    async openWebsiteReader(rawUrl) {
        const fullUrl = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
        const timeStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        try {
            const res = await fetch(`https://r.jina.ai/${fullUrl}`);
            const text = await res.text();
            const entry = {
                time: timeStr,
                query: fullUrl,
                title: `Site: ${fullUrl.replace(/^https?:\/\//, '')}`,
                summary: text.replace(/[#*`>\[\]]/g, '').replace(/\s+/g, ' ').trim().slice(0, 340)
            };
            this.memory.state.searchHistory.push(entry);
            this.memory.save();
            return entry;
        } catch (err) {
            return await this.performAutonomousSearch(rawUrl.replace(/^https?:\/\//, ''));
        }
    }

    async performAutonomousSearch(query) {
        const timeStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        try {
            const searchUrl = `https://pt.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*&srlimit=1`;
            const searchRes = await fetch(searchUrl);
            const searchData = await searchRes.json();
            const firstHit = searchData?.query?.search?.[0];
            if (!firstHit) return null;

            const title = firstHit.title;
            const sumRes = await fetch(`https://pt.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
            const sumData = await sumRes.json();
            const summary = sumData.extract || firstHit.snippet.replace(/<[^>]*>?/gm, '');

            const entry = { time: timeStr, query, title, summary };
            this.memory.state.searchHistory.push(entry);
            if (this.memory.state.searchHistory.length > 25) this.memory.state.searchHistory.shift();
            this.memory.save();
            return entry;
        } catch (err) {
            return null;
        }
    }

    renderBrowserHistory() {
        const list = document.getElementById('os-search-history-list');
        if (!list) return;
        const items = [...(this.memory.state.searchHistory || [])].reverse();
        list.innerHTML = items.map(item => `
            <div class="bg-slate-950/90 border border-slate-800 p-3 rounded-xl space-y-1">
                <div class="flex items-center justify-between gap-2">
                    <span class="font-bold text-sky-400 truncate">${this.escapeHtml(item.title)}</span>
                    <span class="text-[10px] text-slate-500">${item.time}</span>
                </div>
                <p class="text-slate-300 leading-relaxed">${this.escapeHtml(item.summary)}</p>
            </div>
        `).join('') || `<p class="text-slate-500 italic">Nenhuma pesquisa registrada ainda.</p>`;
    }

    renderMural() {
        const grid = document.getElementById('os-mural-grid');
        if (!grid) return;
        const arts = [...(this.memory.state.artGallery || [])].reverse();
        grid.innerHTML = arts.map(art => `
            <div class="bg-slate-950 border border-slate-700/80 rounded-2xl overflow-hidden shadow-lg flex flex-col">
                <div class="aspect-[3/2] bg-slate-50 flex items-center justify-center overflow-hidden">
                    ${art.imgUrl ? `<img src="${art.imgUrl}" class="w-full h-full object-contain">` : art.svg}
                </div>
                <div class="p-2.5 flex items-center justify-between text-[11px] bg-slate-900/90">
                    <span class="font-semibold text-pink-300 truncate">${this.escapeHtml(art.title)}</span>
                    <span class="text-slate-500">${art.time}</span>
                </div>
            </div>
        `).join('');
    }

    renderDiary() {
        const list = document.getElementById('os-diary-list');
        if (!list) return;
        const entries = [...(this.memory.state.diaryEntries || [])].reverse();
        list.innerHTML = entries.map(e => `
            <div class="bg-slate-950/90 border border-amber-800/40 p-3 rounded-2xl space-y-1.5">
                <div class="flex items-center justify-between text-[11px]">
                    <span class="font-bold text-amber-300">✍️ ${this.escapeHtml(e.title)}</span>
                    <span class="text-slate-500">${e.date} • ${e.time}</span>
                </div>
                <p class="text-xs text-slate-200 leading-relaxed">${this.escapeHtml(e.text)}</p>
            </div>
        `).join('');
    }

    open(initialApp = 'desktop') {
        this.isOpen = true;
        document.getElementById('modal-ourico-os').classList.remove('hidden');
        document.getElementById('os-clock').textContent = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        this.switchApp(initialApp);
        this.renderTerminal();
    }

    close() {
        this.isOpen = false;
        document.getElementById('modal-ourico-os').classList.add('hidden');
    }

    switchApp(appName) {
        this.activeApp = appName;
        const views = { desktop: 'os-desktop-view', browser: 'os-app-browser', paint: 'os-app-paint', mural: 'os-app-mural', diary: 'os-app-diary', terminal: 'os-app-terminal' };
        Object.values(views).forEach(id => document.getElementById(id).classList.add('hidden'));
        document.getElementById(views[appName]).classList.remove('hidden');
        if (appName === 'browser') this.renderBrowserHistory();
        if (appName === 'mural') this.renderMural();
        if (appName === 'diary') this.renderDiary();
    }

    logTerminal(line) {
        this.terminalLogs.push(line);
        if (this.terminalLogs.length > 40) this.terminalLogs.shift();
        this.renderTerminal();
    }

    renderTerminal() {
        const out = document.getElementById('os-terminal-output');
        if (!out) return;
        out.innerHTML = this.terminalLogs.map(l => `<div>${this.escapeHtml(l)}</div>`).join('');
        out.scrollTop = out.scrollHeight;
    }

    async handleCommand(rawCmd) {
        this.logTerminal(`ourico@lab:~$ ${rawCmd}`);
        const cmd = rawCmd.toLowerCase();
        if (cmd === 'help') this.logTerminal("Comandos: help, search <termo>, mural, paint, clear");
        else if (cmd.startsWith('search ')) {
            const res = await this.performWebAction(rawCmd.slice(7));
            if (res) this.logTerminal(`-> ${res.summary.slice(0, 140)}...`);
        } else if (cmd === 'clear') {
            this.terminalLogs = [];
            this.renderTerminal();
        } else {
            this.logTerminal(`bash: ${rawCmd}: comando não encontrado`);
        }
    }

    escapeHtml(str) {
        return String(str).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
    }
}