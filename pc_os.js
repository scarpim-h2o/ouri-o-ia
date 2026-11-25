/**
 * ============================================================================
 * MÓDULO DO PC DO OURIÇO — OURIÇO OS v0.3 (pc_os.js)
 * Inclui:
 * - Navegador Web (pesquisa na Wikipédia + abre sites/links reais via leitor web)
 * - Ouriço Paint + Mural de Arte (onde ele desenha sozinho e exibe no mural)
 * - Diário Íntimo (onde ele escreve e vai juntando pistas sobre quem ele é)
 * - Terminal Linux
 * ============================================================================
 */

export class OuricoOS {
    constructor(memoryManager) {
        this.memory = memoryManager;
        this.isOpen = false;
        this.activeApp = 'desktop';
        this.brushColor = '#38bdf8';
        this.isDrawing = false;

        this.terminalLogs = [
            "OuricoOS 0.3.0-forest-creative tty1",
            "Kernel Linux 6.8.0-hedgehog-generic",
            "[OK] Rede mundial wlan0 ONLINE (Pesquisa + Leitor de Sites).",
            "[OK] Ouriço Paint & Mural montados em /home/ourico/mural.",
            "[OK] App Diário pronto em /home/ourico/diario.",
            "Digite 'help' para comandos."
        ];

        this.injectModal();
    }

    injectModal() {
        const modalHTML = `
        <div id="modal-ourico-os" class="hidden fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
            <div class="bg-slate-800 p-2.5 sm:p-4 rounded-3xl border-2 border-slate-600 shadow-2xl max-w-2xl w-full flex flex-col gap-2">
                
                <!-- Tela do Ouriço OS -->
                <div class="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 border border-slate-700 rounded-2xl overflow-hidden flex flex-col h-[460px] sm:h-[500px] relative select-none">
                    
                    <!-- Top Bar -->
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

                    <!-- Área de Trabalho -->
                    <div id="os-desktop-view" class="flex-1 p-4 grid grid-cols-3 sm:grid-cols-5 gap-3 content-start">
                        <button data-os-app="browser" class="os-icon-btn flex flex-col items-center gap-1.5 p-2.5 rounded-2xl hover:bg-white/10 active:scale-95 transition">
                            <div class="w-12 h-12 rounded-2xl bg-sky-950 border border-sky-500 flex items-center justify-center text-2xl shadow-lg">
                                🌐
                            </div>
                            <span class="text-xs font-medium text-slate-200">Internet</span>
                        </button>

                        <button data-os-app="paint" class="os-icon-btn flex flex-col items-center gap-1.5 p-2.5 rounded-2xl hover:bg-white/10 active:scale-95 transition">
                            <div class="w-12 h-12 rounded-2xl bg-purple-950 border border-purple-500 flex items-center justify-center text-2xl shadow-lg">
                                🎨
                            </div>
                            <span class="text-xs font-medium text-slate-200">Desenhar</span>
                        </button>

                        <button data-os-app="mural" class="os-icon-btn flex flex-col items-center gap-1.5 p-2.5 rounded-2xl hover:bg-white/10 active:scale-95 transition">
                            <div class="w-12 h-12 rounded-2xl bg-pink-950 border border-pink-500 flex items-center justify-center text-2xl shadow-lg">
                                🖼️
                            </div>
                            <span class="text-xs font-medium text-slate-200">Mural</span>
                        </button>

                        <button data-os-app="diary" class="os-icon-btn flex flex-col items-center gap-1.5 p-2.5 rounded-2xl hover:bg-white/10 active:scale-95 transition">
                            <div class="w-12 h-12 rounded-2xl bg-amber-950 border border-amber-500 flex items-center justify-center text-2xl shadow-lg">
                                📔
                            </div>
                            <span class="text-xs font-medium text-slate-200">Diário</span>
                        </button>

                        <button data-os-app="terminal" class="os-icon-btn flex flex-col items-center gap-1.5 p-2.5 rounded-2xl hover:bg-white/10 active:scale-95 transition">
                            <div class="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-600 flex items-center justify-center text-2xl shadow-lg">
                                ⬛
                            </div>
                            <span class="text-xs font-medium text-slate-200">Terminal</span>
                        </button>
                    </div>

                    <!-- Janela: Navegador Web (Busca + Leitor de Sites Reais) -->
                    <div id="os-app-browser" class="hidden flex-1 flex flex-col bg-slate-900 text-xs overflow-hidden">
                        <form id="os-browser-form" class="bg-slate-800 p-2 flex items-center gap-2 border-b border-slate-700">
                            <span class="text-emerald-400">🔒</span>
                            <input type="text" id="os-browser-input" placeholder="Pesquise algo ou digite um site (ex: g1.globo.com)..." class="flex-1 bg-slate-950 text-slate-100 px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-sky-500">
                            <button type="submit" class="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg transition">
                                Ir
                            </button>
                        </form>
                        <div class="flex-1 overflow-y-auto p-3.5 space-y-3 custom-scrollbar">
                            <div class="bg-slate-800/70 border border-slate-700 p-2.5 rounded-xl text-slate-300">
                                <strong class="text-sky-300">🌐 Acesso Web Livre:</strong> Ele pode pesquisar temas ou abrir sites reais (ex: <code class="text-emerald-300">pudim.com.br</code>, <code class="text-emerald-300">nasa.gov</code>) para ler o conteúdo!
                            </div>
                            <div id="os-search-history-list" class="space-y-2.5"></div>
                        </div>
                    </div>

                    <!-- Janela: Ouriço Paint (Canvas interativo) -->
                    <div id="os-app-paint" class="hidden flex-1 flex flex-col bg-slate-900 p-2.5 gap-2 overflow-hidden">
                        <div class="flex items-center justify-between flex-wrap gap-1.5 bg-slate-800 p-2 rounded-xl border border-slate-700">
                            <div class="flex items-center gap-1.5">
                                <button type="button" data-color="#38bdf8" class="paint-color w-5 h-5 rounded-full bg-sky-400 border-2 border-white"></button>
                                <button type="button" data-color="#4ade80" class="paint-color w-5 h-5 rounded-full bg-green-400 border border-slate-600"></button>
                                <button type="button" data-color="#facc15" class="paint-color w-5 h-5 rounded-full bg-yellow-400 border border-slate-600"></button>
                                <button type="button" data-color="#f87171" class="paint-color w-5 h-5 rounded-full bg-red-400 border border-slate-600"></button>
                                <button type="button" data-color="#c084fc" class="paint-color w-5 h-5 rounded-full bg-purple-400 border border-slate-600"></button>
                                <button type="button" data-color="#ffffff" class="paint-color w-5 h-5 rounded-full bg-white border border-slate-600"></button>
                            </div>
                            <div class="flex items-center gap-1.5">
                                <button id="paint-clear-btn" type="button" class="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-[11px]">Limpar</button>
                                <button id="paint-save-mural-btn" type="button" class="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg text-[11px]">Salvar no Mural</button>
                            </div>
                        </div>
                        <div class="flex-1 bg-slate-950 border border-slate-700 rounded-xl overflow-hidden flex items-center justify-center relative">
                            <canvas id="ourico-paint-canvas" width="480" height="270" class="w-full h-full touch-none cursor-crosshair"></canvas>
                        </div>
                    </div>

                    <!-- Janela: Mural de Arte do Aurélio -->
                    <div id="os-app-mural" class="hidden flex-1 flex flex-col bg-slate-900 p-3.5 overflow-y-auto custom-scrollbar space-y-3">
                        <div class="flex items-center justify-between">
                            <h3 class="text-xs font-bold uppercase tracking-wider text-pink-300">🖼️ Mural de Desenhos</h3>
                            <button id="mural-open-paint" type="button" class="px-2.5 py-1 bg-purple-600/80 hover:bg-purple-600 text-white rounded-lg text-[11px] font-medium">
                                + Novo Desenho
                            </button>
                        </div>
                        <div id="os-mural-grid" class="grid grid-cols-1 sm:grid-cols-2 gap-3"></div>
                    </div>

                    <!-- Janela: Diário Íntimo -->
                    <div id="os-app-diary" class="hidden flex-1 flex flex-col bg-slate-900 p-3.5 overflow-y-auto custom-scrollbar space-y-3">
                        <div class="bg-amber-950/40 border border-amber-700/50 p-2.5 rounded-xl text-xs text-amber-200">
                            📔 <strong>Diário Pessoal:</strong> Tudo que ele vive, pesquisa e sente fica anotado aqui. Lendo suas próprias páginas, ele vai descobrindo quem ele é.
                        </div>
                        <div id="os-diary-list" class="space-y-2.5"></div>
                    </div>

                    <!-- Janela: Terminal Linux -->
                    <div id="os-app-terminal" class="hidden flex-1 flex flex-col bg-black/90 font-mono text-xs p-3 overflow-hidden">
                        <div id="os-terminal-output" class="flex-1 overflow-y-auto space-y-1 text-emerald-400 custom-scrollbar pb-2"></div>
                        <form id="os-terminal-form" class="flex items-center gap-1.5 border-t border-slate-800 pt-2">
                            <span class="text-emerald-500 font-bold">ourico@floresta:~$</span>
                            <input type="text" id="os-terminal-input" autocomplete="off" placeholder="help, search <algo>, open <site>, clear..." class="flex-1 bg-transparent text-slate-100 focus:outline-none">
                        </form>
                    </div>

                    <!-- Dock Inferior -->
                    <div class="bg-slate-950/95 border-t border-slate-800 px-3 py-1.5 flex items-center justify-between">
                        <button id="os-btn-home" class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition">
                            ⊞ Área de Trabalho
                        </button>
                        <span class="text-[10px] text-slate-500">Ouriço OS v0.3</span>
                        <button id="os-btn-close" class="px-3 py-1 bg-red-950/80 hover:bg-red-900 border border-red-800/60 text-red-300 rounded-lg text-xs font-medium transition">
                            Sair do PC
                        </button>
                    </div>
                </div>

                <div class="flex items-center justify-between px-3 text-[10px] text-slate-400">
                    <span>FOREST-TECH STUDIO</span>
                    <div class="flex items-center gap-1.5">
                        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>ONLINE</span>
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
            btn.addEventListener('click', () => {
                this.switchApp(btn.getAttribute('data-os-app'));
            });
        });

        document.getElementById('mural-open-paint').addEventListener('click', () => this.switchApp('paint'));

        // Navegador (aceita busca OU domínio/URL real)
        const browserForm = document.getElementById('os-browser-form');
        const browserInput = document.getElementById('os-browser-input');
        browserForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const q = browserInput.value.trim();
            if (!q) return;
            await this.performWebAction(q);
            this.renderBrowserHistory();
        });

        // Terminal
        const termForm = document.getElementById('os-terminal-form');
        const termInput = document.getElementById('os-terminal-input');
        termForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const cmd = termInput.value.trim();
            if (!cmd) return;
            termInput.value = '';
            await this.handleCommand(cmd);
        });
    }

    initPaintCanvas() {
        const canvas = document.getElementById('ourico-paint-canvas');
        const ctx = canvas.getContext('2d');
        
        const resetCanvasBg = () => {
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        };
        resetCanvasBg();

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
            ctx.lineWidth = 6;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
        };
        const move = (e) => {
            if (!this.isDrawing) return;
            e.preventDefault();
            const p = getPos(e);
            ctx.strokeStyle = this.brushColor;
            ctx.lineWidth = 6;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
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
                document.querySelectorAll('.paint-color').forEach(b => b.classList.remove('border-white', 'border-2'));
                btn.classList.add('border-white', 'border-2');
            });
        });

        document.getElementById('paint-clear-btn').addEventListener('click', () => {
            resetCanvasBg();
        });

        document.getElementById('paint-save-mural-btn').addEventListener('click', () => {
            const dataUrl = canvas.toDataURL('image/png');
            this.memory.addArtwork('Desenho feito no Paint', dataUrl, true);
            this.switchApp('mural');
        });
    }

    // Decide se abre um site real (via leitor web Jina) ou pesquisa na Wikipédia
    async performWebAction(queryOrUrl) {
        const clean = queryOrUrl.trim();
        const looksLikeUrl = /^https?:\/\//i.test(clean) || (/^[a-z0-9-]+(\.[a-z0-9-]+)+/i.test(clean) && !clean.includes(' '));

        if (looksLikeUrl) {
            return await this.openWebsiteReader(clean);
        }
        return await this.performAutonomousSearch(clean);
    }

    // Abre e lê o texto de sites reais da web usando proxy leitor sem CORS
    async openWebsiteReader(rawUrl) {
        const fullUrl = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
        const timeStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        this.logTerminal(`[${timeStr}] GET ${fullUrl}`);

        try {
            const readerUrl = `https://r.jina.ai/${fullUrl}`;
            const res = await fetch(readerUrl);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const text = await res.text();

            const cleanSummary = text
                .replace(/[#*`>\[\]]/g, '')
                .replace(/\s+/g, ' ')
                .trim()
                .slice(0, 360);

            const entry = {
                time: timeStr,
                query: fullUrl,
                title: `Site: ${fullUrl.replace(/^https?:\/\//, '')}`,
                summary: cleanSummary || 'Página carregada com sucesso!'
            };

            this.memory.state.searchHistory.push(entry);
            if (this.memory.state.searchHistory.length > 20) this.memory.state.searchHistory.shift();
            this.memory.save();

            this.logTerminal(`[OK] Site lido: ${entry.title}`);
            return entry;
        } catch (err) {
            this.logTerminal(`[WARN] Não abriu direto (${err.message}), buscando na enciclopédia...`);
            return await this.performAutonomousSearch(rawUrl.replace(/^https?:\/\//, ''));
        }
    }

    async performAutonomousSearch(query) {
        const timeStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        this.logTerminal(`[${timeStr}] Pesquisando na web: "${query}"`);

        try {
            const searchUrl = `https://pt.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*&srlimit=1`;
            const searchRes = await fetch(searchUrl);
            const searchData = await searchRes.json();

            const firstHit = searchData?.query?.search?.[0];
            if (!firstHit) {
                this.logTerminal(`[NET] Nada encontrado para "${query}".`);
                return null;
            }

            const title = firstHit.title;
            const summaryUrl = `https://pt.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
            const sumRes = await fetch(summaryUrl);
            const sumData = await sumRes.json();

            const summary = sumData.extract || firstHit.snippet.replace(/<[^>]*>?/gm, '');

            const entry = { time: timeStr, query, title, summary };
            this.memory.state.searchHistory.push(entry);
            if (this.memory.state.searchHistory.length > 20) {
                this.memory.state.searchHistory.shift();
            }
            this.memory.save();

            this.logTerminal(`[OK] Encontrado: ${title}`);
            return entry;
        } catch (err) {
            this.logTerminal(`[ERR] Falha na rede: ${err.message}`);
            return null;
        }
    }

    renderBrowserHistory() {
        const list = document.getElementById('os-search-history-list');
        if (!list) return;
        const items = [...(this.memory.state.searchHistory || [])].reverse();

        if (items.length === 0) {
            list.innerHTML = `<p class="text-slate-500 italic">Nenhum site ou pesquisa aberto ainda. Ele já vai começar a explorar!</p>`;
            return;
        }

        list.innerHTML = items.map(item => `
            <div class="bg-slate-950/90 border border-slate-800 p-3 rounded-xl space-y-1">
                <div class="flex items-center justify-between gap-2">
                    <span class="font-bold text-sky-400 truncate">${this.escapeHtml(item.title)}</span>
                    <span class="text-[10px] text-slate-500 shrink-0">${item.time}</span>
                </div>
                <p class="text-slate-300 leading-relaxed">${this.escapeHtml(item.summary)}</p>
            </div>
        `).join('');
    }

    renderMural() {
        const grid = document.getElementById('os-mural-grid');
        if (!grid) return;
        const arts = [...(this.memory.state.artGallery || [])].reverse();

        if (arts.length === 0) {
            grid.innerHTML = `<p class="text-xs text-slate-400">O mural ainda está vazio!</p>`;
            return;
        }

        grid.innerHTML = arts.map(art => `
            <div class="bg-slate-950 border border-slate-700/80 rounded-2xl overflow-hidden shadow-lg flex flex-col">
                <div class="aspect-[3/2] bg-slate-900 flex items-center justify-center overflow-hidden">
                    ${art.imgUrl
                        ? `<img src="${art.imgUrl}" alt="${this.escapeHtml(art.title)}" class="w-full h-full object-contain">`
                        : art.svg
                    }
                </div>
                <div class="p-2.5 flex items-center justify-between text-[11px] bg-slate-900/90">
                    <span class="font-semibold text-pink-300 truncate">${this.escapeHtml(art.title)}</span>
                    <span class="text-slate-500 shrink-0">${art.time}</span>
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
                <p class="text-xs text-slate-200 leading-relaxed whitespace-pre-line">${this.escapeHtml(e.text)}</p>
            </div>
        `).join('');
    }

    open(initialApp = 'desktop') {
        this.isOpen = true;
        document.getElementById('modal-ourico-os').classList.remove('hidden');

        const now = new Date();
        document.getElementById('os-clock').textContent = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

        this.switchApp(initialApp);
        this.renderTerminal();
    }

    close() {
        this.isOpen = false;
        document.getElementById('modal-ourico-os').classList.add('hidden');
    }

    switchApp(appName) {
        this.activeApp = appName;
        const views = {
            desktop: 'os-desktop-view',
            browser: 'os-app-browser',
            paint: 'os-app-paint',
            mural: 'os-app-mural',
            diary: 'os-app-diary',
            terminal: 'os-app-terminal'
        };
        const titles = {
            desktop: 'Área de Trabalho',
            browser: 'Navegador Web (Sites & Busca)',
            paint: 'Ouriço Paint',
            mural: 'Mural de Arte',
            diary: 'Diário Íntimo',
            terminal: 'Terminal — bash'
        };

        Object.values(views).forEach(id => document.getElementById(id).classList.add('hidden'));
        document.getElementById(views[appName]).classList.remove('hidden');
        document.getElementById('os-active-window-title').textContent = titles[appName];

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
        this.logTerminal(`ourico@floresta:~$ ${rawCmd}`);
        const cmd = rawCmd.toLowerCase();

        if (cmd === 'help') {
            this.logTerminal("Comandos: help, search <termo>, open <site.com>, paint, mural, diary, clear");
        } else if (cmd.startsWith('search ') || cmd.startsWith('open ')) {
            const q = rawCmd.split(' ').slice(1).join(' ').trim();
            const res = await this.performWebAction(q);
            if (res) this.logTerminal(`-> ${res.summary.slice(0, 140)}...`);
        } else if (cmd === 'paint') {
            this.switchApp('paint');
        } else if (cmd === 'mural') {
            this.switchApp('mural');
        } else if (cmd === 'diary' || cmd === 'diario') {
            this.switchApp('diary');
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