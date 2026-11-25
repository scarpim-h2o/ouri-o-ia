/**
 * ============================================================================
 * MÓDULO DO PC DO OURIÇO — OURIÇO OS v0.2 Online (pc_os.js)
 * Agora conectado à Internet! Permite que tanto o Ouriço (autonomamente)
 * quanto você pesquisem na rede mundial e salvem descobertas no sistema.
 * ============================================================================
 */

export class OuricoOS {
    constructor(memoryManager) {
        this.memory = memoryManager;
        this.isOpen = false;
        this.activeApp = 'desktop';

        if (!this.memory.state.searchHistory) {
            this.memory.state.searchHistory = [];
        }

        this.terminalLogs = [
            "OuricoOS 0.2.0-forest-online tty1",
            "Kernel Linux 6.8.0-hedgehog-generic",
            "[OK] Montando sistema de arquivos local (/dev/localStorage)...",
            "[OK] Interface wlan0 CONECTADA! Acesso à rede mundial liberado.",
            "Digite 'help' ou 'search <termo>' para navegar."
        ];

        this.injectModal();
    }

    injectModal() {
        const modalHTML = `
        <div id="modal-ourico-os" class="hidden fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
            <!-- Moldura Física do Monitor -->
            <div class="bg-slate-800 p-2.5 sm:p-4 rounded-3xl border-2 border-slate-600 shadow-2xl max-w-2xl w-full flex flex-col gap-2">
                
                <!-- Tela do Ouriço OS -->
                <div class="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 border border-slate-700 rounded-2xl overflow-hidden flex flex-col h-[430px] sm:h-[470px] relative select-none">
                    
                    <!-- Top Bar estilo Linux -->
                    <div class="bg-slate-950/90 border-b border-slate-800 px-3 py-1.5 flex items-center justify-between text-[11px] text-slate-300">
                        <div class="flex items-center gap-2">
                            <span class="font-bold text-emerald-400 flex items-center gap-1">🦔 Ouriço OS</span>
                            <span class="text-slate-600">|</span>
                            <span id="os-active-window-title" class="text-slate-400">Área de Trabalho</span>
                        </div>
                        <div class="flex items-center gap-3">
                            <span id="os-net-status" class="text-emerald-400 flex items-center gap-1 font-medium" title="Conectado à Internet">
                                🌐 Online
                            </span>
                            <span id="os-clock" class="font-mono text-slate-200">12:00</span>
                        </div>
                    </div>

                    <!-- Área de Trabalho (Ícones) -->
                    <div id="os-desktop-view" class="flex-1 p-4 grid grid-cols-3 sm:grid-cols-4 gap-3 content-start">
                        <button data-os-app="browser" class="os-icon-btn flex flex-col items-center gap-1.5 p-3 rounded-2xl hover:bg-white/10 active:scale-95 transition">
                            <div class="w-12 h-12 rounded-2xl bg-sky-950 border border-sky-500 flex items-center justify-center text-2xl shadow-lg relative">
                                🌐
                                <span class="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-900"></span>
                            </div>
                            <span class="text-xs font-medium text-slate-200">Navegador</span>
                        </button>

                        <button data-os-app="terminal" class="os-icon-btn flex flex-col items-center gap-1.5 p-3 rounded-2xl hover:bg-white/10 active:scale-95 transition">
                            <div class="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-600 flex items-center justify-center text-2xl shadow-lg">
                                ⬛
                            </div>
                            <span class="text-xs font-medium text-slate-200">Terminal</span>
                        </button>

                        <button data-os-app="notes" class="os-icon-btn flex flex-col items-center gap-1.5 p-3 rounded-2xl hover:bg-white/10 active:scale-95 transition">
                            <div class="w-12 h-12 rounded-2xl bg-amber-950 border border-amber-700 flex items-center justify-center text-2xl shadow-lg">
                                📝
                            </div>
                            <span class="text-xs font-medium text-slate-200">Notas.txt</span>
                        </button>

                        <button data-os-app="paint" class="os-icon-btn flex flex-col items-center gap-1.5 p-3 rounded-2xl hover:bg-white/10 active:scale-95 transition opacity-65">
                            <div class="w-12 h-12 rounded-2xl bg-purple-950 border border-purple-700 flex items-center justify-center text-2xl shadow-lg">
                                🎨
                            </div>
                            <span class="text-xs font-medium text-slate-300">Desenho (Em breve)</span>
                        </button>
                    </div>

                    <!-- Janela: Terminal Linux -->
                    <div id="os-app-terminal" class="hidden flex-1 flex flex-col bg-black/90 font-mono text-xs p-3 overflow-hidden">
                        <div id="os-terminal-output" class="flex-1 overflow-y-auto space-y-1 text-emerald-400 custom-scrollbar pb-2"></div>
                        <form id="os-terminal-form" class="flex items-center gap-1.5 border-t border-slate-800 pt-2">
                            <span class="text-emerald-500 font-bold">ourico@floresta:~$</span>
                            <input type="text" id="os-terminal-input" autocomplete="off" placeholder="help, search <algo>, history, status..." class="flex-1 bg-transparent text-slate-100 focus:outline-none">
                        </form>
                    </div>

                    <!-- Janela: Navegador Web Conectado -->
                    <div id="os-app-browser" class="hidden flex-1 flex flex-col bg-slate-900 text-xs overflow-hidden">
                        <form id="os-browser-form" class="bg-slate-800 p-2 flex items-center gap-2 border-b border-slate-700">
                            <span class="text-emerald-400">🔒</span>
                            <input type="text" id="os-browser-input" placeholder="Pesquisar na internet..." class="flex-1 bg-slate-950 text-slate-100 px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-sky-500">
                            <button type="submit" class="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg transition">
                                Buscar
                            </button>
                        </form>
                        <div id="os-browser-content" class="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                            <div class="bg-slate-800/70 border border-slate-700 p-3 rounded-xl">
                                <p class="text-sky-300 font-semibold mb-1">🌐 Rede Mundial Conectada!</p>
                                <p class="text-slate-300 leading-relaxed">
                                    O Ouriço agora pesquisa assuntos sozinho quando fica curioso, e você também pode ver o histórico de tudo que ele procurou aqui embaixo.
                                </p>
                            </div>
                            <div>
                                <h4 class="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Pesquisas Recentes do Ouriço</h4>
                                <div id="os-search-history-list" class="space-y-2"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Janela: Notas.txt -->
                    <div id="os-app-notes" class="hidden flex-1 flex flex-col bg-slate-900 p-3 gap-2">
                        <p class="text-[11px] text-slate-400">Arquivo: <code class="text-amber-300">/home/ourico/pensamentos.txt</code> (O Ouriço anota descobertas aqui)</p>
                        <textarea id="os-notes-textarea" class="flex-1 w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-emerald-500 resize-none"></textarea>
                    </div>

                    <!-- Dock Inferior -->
                    <div class="bg-slate-950/95 border-t border-slate-800 px-3 py-1.5 flex items-center justify-between">
                        <button id="os-btn-home" class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition">
                            ⊞ Área de Trabalho
                        </button>
                        <span class="text-[10px] text-slate-500">Ouriço OS v0.2 • Online</span>
                        <button id="os-btn-close" class="px-3 py-1 bg-red-950/80 hover:bg-red-900 border border-red-800/60 text-red-300 rounded-lg text-xs font-medium transition">
                            Sair do PC
                        </button>
                    </div>
                </div>

                <!-- LED e Marca do Monitor -->
                <div class="flex items-center justify-between px-3 text-[10px] text-slate-400">
                    <span>FOREST-TECH ONLINE</span>
                    <div class="flex items-center gap-1.5">
                        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>NET ACTIVE</span>
                    </div>
                </div>
            </div>
        </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.bindEvents();
    }

    bindEvents() {
        document.getElementById('os-btn-close').addEventListener('click', () => this.close());
        document.getElementById('os-btn-home').addEventListener('click', () => this.switchApp('desktop'));

        document.querySelectorAll('.os-icon-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const app = btn.getAttribute('data-os-app');
                if (app === 'paint') {
                    this.logTerminal("[SYS] Módulo 'Ouriço Paint' aguardando próxima atualização.");
                    this.switchApp('terminal');
                    return;
                }
                this.switchApp(app);
            });
        });

        // Navegador manual
        const browserForm = document.getElementById('os-browser-form');
        const browserInput = document.getElementById('os-browser-input');
        browserForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const q = browserInput.value.trim();
            if (!q) return;
            await this.performAutonomousSearch(q);
            this.renderBrowserHistory();
        });

        // Terminal interativo
        const termForm = document.getElementById('os-terminal-form');
        const termInput = document.getElementById('os-terminal-input');
        termForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const cmd = termInput.value.trim();
            if (!cmd) return;
            termInput.value = '';
            await this.handleCommand(cmd);
        });

        // Notas
        const notesArea = document.getElementById('os-notes-textarea');
        notesArea.addEventListener('input', () => {
            this.memory.state.pcNotes = notesArea.value;
            this.memory.save();
        });
    }

    // Pesquisa real na Wikipédia em Português (sem precisar de chave extra e sem CORS)
    async performAutonomousSearch(query) {
        const timeStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        this.logTerminal(`[${timeStr}] curl -s "https://pt.wikipedia.org/api/..." q="${query}"`);

        try {
            const searchUrl = `https://pt.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*&srlimit=1`;
            const searchRes = await fetch(searchUrl);
            const searchData = await searchRes.json();

            const firstHit = searchData?.query?.search?.[0];
            if (!firstHit) {
                this.logTerminal(`[NET] Nenhum resultado direto para "${query}".`);
                return null;
            }

            const title = firstHit.title;
            const summaryUrl = `https://pt.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
            const sumRes = await fetch(summaryUrl);
            const sumData = await sumRes.json();

            const summary = sumData.extract || firstHit.snippet.replace(/<[^>]*>?/gm, '');

            // Salva no histórico do PC e no Bloco de Notas do Ouriço
            const entry = { time: timeStr, query, title, summary };
            this.memory.state.searchHistory.push(entry);
            if (this.memory.state.searchHistory.length > 20) {
                this.memory.state.searchHistory.shift();
            }

            const currentNotes = this.memory.state.pcNotes || `Diário Digital (${this.memory.state.name}):\n`;
            this.memory.state.pcNotes = `${currentNotes}\n[${timeStr}] Pesquisei "${title}": ${summary.slice(0, 140)}...`;
            this.memory.save();

            this.logTerminal(`[OK] Resultado encontrado: ${title}`);
            return entry;
        } catch (err) {
            this.logTerminal(`[ERR] Falha na requisição: ${err.message}`);
            return null;
        }
    }

    renderBrowserHistory() {
        const list = document.getElementById('os-search-history-list');
        if (!list) return;
        const items = [...(this.memory.state.searchHistory || [])].reverse();

        if (items.length === 0) {
            list.innerHTML = `<p class="text-slate-500 italic">Nenhuma pesquisa feita ainda. Ele vai pesquisar sozinho em breve!</p>`;
            return;
        }

        list.innerHTML = items.map(item => `
            <div class="bg-slate-950/90 border border-slate-800 p-3 rounded-xl space-y-1">
                <div class="flex items-center justify-between">
                    <span class="font-bold text-sky-400">${this.escapeHtml(item.title)}</span>
                    <span class="text-[10px] text-slate-500">${item.time}</span>
                </div>
                <p class="text-slate-300 leading-relaxed">${this.escapeHtml(item.summary)}</p>
            </div>
        `).join('');
    }

    open(initialApp = 'desktop') {
        this.isOpen = true;
        document.getElementById('modal-ourico-os').classList.remove('hidden');

        const now = new Date();
        document.getElementById('os-clock').textContent = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        document.getElementById('os-notes-textarea').value = this.memory.state.pcNotes ||
            `Diário Digital (${this.memory.state.name}):\n- Internet conectada no Ouriço OS!`;

        this.renderBrowserHistory();
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
            terminal: 'os-app-terminal',
            browser: 'os-app-browser',
            notes: 'os-app-notes'
        };
        const titles = {
            desktop: 'Área de Trabalho',
            terminal: 'Terminal — bash',
            browser: 'Navegador Web (Online)',
            notes: 'Notas.txt'
        };

        Object.values(views).forEach(id => document.getElementById(id).classList.add('hidden'));
        document.getElementById(views[appName]).classList.remove('hidden');
        document.getElementById('os-active-window-title').textContent = titles[appName];

        if (appName === 'browser') this.renderBrowserHistory();
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
            this.logTerminal("Comandos: help, search <termo>, whoami, net, status, clear");
        } else if (cmd.startsWith('search ')) {
            const q = rawCmd.slice(7).trim();
            const res = await this.performAutonomousSearch(q);
            if (res) this.logTerminal(`-> ${res.summary.slice(0, 140)}...`);
        } else if (cmd === 'whoami') {
            this.logTerminal(`${this.memory.state.name.toLowerCase()} (Lucidez: ${Math.round(this.memory.state.lucidity)}%)`);
        } else if (cmd === 'net' || cmd === 'ping') {
            this.logTerminal("PING pt.wikipedia.org: 64 bytes icmp_seq=1 ttl=56 time=24.1 ms (ONLINE)");
        } else if (cmd === 'status') {
            this.logTerminal(`Vivo: ${this.memory.getFormattedAliveDuration()} | Saciedade: ${Math.round(this.memory.state.hunger)}% | Energia: ${Math.round(this.memory.state.energy)}%`);
        } else if (cmd === 'clear') {
            this.terminalLogs = [];
            this.renderTerminal();
        } else {
            this.logTerminal(`bash: ${rawCmd}: comando não encontrado`);
        }
    }

    escapeHtml(str) {
        return str.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
    }
}