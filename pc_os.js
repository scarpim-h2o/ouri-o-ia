/**
 * ============================================================================
 * MÓDULO DO PC DO OURIÇO — OURIÇO OS v0.1 (pc_os.js)
 * Simula um ambiente Linux leve dentro do monitor da floresta.
 * Preparado para futuras atualizações (Navegador com Internet, Paint, etc.).
 * ============================================================================
 */

export class OuricoOS {
    constructor(memoryManager) {
        this.memory = memoryManager;
        this.isOpen = false;
        this.activeApp = 'desktop'; // 'desktop', 'terminal', 'notes', 'browser'

        // Logs iniciais do sistema Linux do PC dele
        this.terminalLogs = [
            "OuricoOS 0.1.0-forest tty1",
            "Kernel Linux 6.8.0-hedgehog-generic",
            "[OK] Montando sistema de arquivos local (/dev/localStorage)...",
            "[WARN] Interface eth0/wlan0: SEM SINAL (Acesso externo bloqueado pelo criador).",
            "Digite 'help' para ver os comandos disponíveis."
        ];

        this.injectModal();
    }

    injectModal() {
        const modalHTML = `
        <div id="modal-ourico-os" class="hidden fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
            <!-- Moldura Física do Monitor -->
            <div class="bg-slate-800 p-2.5 sm:p-4 rounded-3xl border-2 border-slate-600 shadow-2xl max-w-2xl w-full flex flex-col gap-2">
                
                <!-- Tela do Ouriço OS -->
                <div class="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 border border-slate-700 rounded-2xl overflow-hidden flex flex-col h-[420px] sm:h-[460px] relative select-none">
                    
                    <!-- Top Bar estilo Linux GNOME/XFCE -->
                    <div class="bg-slate-950/90 border-b border-slate-800 px-3 py-1.5 flex items-center justify-between text-[11px] text-slate-300">
                        <div class="flex items-center gap-2">
                            <span class="font-bold text-emerald-400 flex items-center gap-1">🦔 Ouriço OS</span>
                            <span class="text-slate-600">|</span>
                            <span id="os-active-window-title" class="text-slate-400">Área de Trabalho</span>
                        </div>
                        <div class="flex items-center gap-3">
                            <span id="os-net-status" class="text-amber-400 flex items-center gap-1" title="Sem acesso à internet ainda">
                                ⚠️ Offline
                            </span>
                            <span id="os-clock" class="font-mono text-slate-200">12:00</span>
                        </div>
                    </div>

                    <!-- Área de Trabalho (Ícones) -->
                    <div id="os-desktop-view" class="flex-1 p-4 grid grid-cols-3 sm:grid-cols-4 gap-3 content-start">
                        <button data-os-app="terminal" class="os-icon-btn flex flex-col items-center gap-1.5 p-3 rounded-2xl hover:bg-white/10 active:scale-95 transition">
                            <div class="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-600 flex items-center justify-center text-2xl shadow-lg">
                                ⬛
                            </div>
                            <span class="text-xs font-medium text-slate-200">Terminal</span>
                        </button>

                        <button data-os-app="browser" class="os-icon-btn flex flex-col items-center gap-1.5 p-3 rounded-2xl hover:bg-white/10 active:scale-95 transition">
                            <div class="w-12 h-12 rounded-2xl bg-sky-950 border border-sky-700 flex items-center justify-center text-2xl shadow-lg relative">
                                🌐
                                <span class="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full text-[9px] flex items-center justify-center font-bold">!</span>
                            </div>
                            <span class="text-xs font-medium text-slate-200">Navegador</span>
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
                            <input type="text" id="os-terminal-input" autocomplete="off" placeholder="Digite help, whoami, net, status..." class="flex-1 bg-transparent text-slate-100 focus:outline-none">
                        </form>
                    </div>

                    <!-- Janela: Navegador (Sem Internet por enquanto) -->
                    <div id="os-app-browser" class="hidden flex-1 flex flex-col bg-slate-900 text-xs">
                        <div class="bg-slate-800 p-2 flex items-center gap-2 border-b border-slate-700">
                            <span class="text-slate-400">🔒</span>
                            <div class="flex-1 bg-slate-950 text-slate-400 px-3 py-1 rounded-lg border border-slate-700 truncate">
                                https://rede-mundial.floresta/
                            </div>
                        </div>
                        <div class="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3">
                            <div class="text-4xl">📡❌</div>
                            <h3 class="text-base font-bold text-slate-200">Sem Acesso à Internet</h3>
                            <p class="text-slate-400 max-w-sm leading-relaxed">
                                O módulo de rede do <strong>Ouriço OS</strong> ainda não foi conectado pelo seu criador. Assim que ele liberar a atualização de internet, você poderá pesquisar aqui!
                            </p>
                        </div>
                    </div>

                    <!-- Janela: Notas.txt -->
                    <div id="os-app-notes" class="hidden flex-1 flex flex-col bg-slate-900 p-3 gap-2">
                        <p class="text-[11px] text-slate-400">Arquivo: <code class="text-amber-300">/home/ourico/pensamentos.txt</code> (Salvo automaticamente)</p>
                        <textarea id="os-notes-textarea" class="flex-1 w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-emerald-500 resize-none" placeholder="Escreva algo no bloco de notas do PC dele..."></textarea>
                    </div>

                    <!-- Dock Inferior do Ouriço OS -->
                    <div class="bg-slate-950/95 border-t border-slate-800 px-3 py-1.5 flex items-center justify-between">
                        <button id="os-btn-home" class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition">
                            ⊞ Área de Trabalho
                        </button>
                        <span class="text-[10px] text-slate-500">Ouriço OS • Linux 6.8</span>
                        <button id="os-btn-close" class="px-3 py-1 bg-red-950/80 hover:bg-red-900 border border-red-800/60 text-red-300 rounded-lg text-xs font-medium transition">
                            Sair do PC
                        </button>
                    </div>
                </div>

                <!-- LED e Marca do Monitor -->
                <div class="flex items-center justify-between px-3 text-[10px] text-slate-400">
                    <span>FOREST-TECH CRT/LCD</span>
                    <div class="flex items-center gap-1.5">
                        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>POWER ON</span>
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
                    this.logTerminal("[SYS] Módulo 'Ouriço Paint' ainda não instalado pelo criador.");
                    this.switchApp('terminal');
                    return;
                }
                this.switchApp(app);
            });
        });

        // Terminal interativo
        const termForm = document.getElementById('os-terminal-form');
        const termInput = document.getElementById('os-terminal-input');
        termForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const cmd = termInput.value.trim();
            if (!cmd) return;
            termInput.value = '';
            this.handleCommand(cmd);
        });

        // Bloco de notas sincronizado com a memória local
        const notesArea = document.getElementById('os-notes-textarea');
        notesArea.addEventListener('input', () => {
            this.memory.state.pcNotes = notesArea.value;
            this.memory.save();
        });
    }

    open(initialApp = 'desktop') {
        this.isOpen = true;
        const modal = document.getElementById('modal-ourico-os');
        modal.classList.remove('hidden');

        // Atualiza relógio e notas
        const now = new Date();
        document.getElementById('os-clock').textContent = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        document.getElementById('os-notes-textarea').value = this.memory.state.pcNotes ||
            `Diário do PC (${this.memory.state.name}):\n- Ainda sem internet.\n- Continuo investigando essa floresta.`;

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
            browser: 'Navegador Web (Offline)',
            notes: 'Notas.txt'
        };

        Object.values(views).forEach(id => document.getElementById(id).classList.add('hidden'));
        document.getElementById(views[appName]).classList.remove('hidden');
        document.getElementById('os-active-window-title').textContent = titles[appName];
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

    handleCommand(rawCmd) {
        this.logTerminal(`ourico@floresta:~$ ${rawCmd}`);
        const cmd = rawCmd.toLowerCase();

        if (cmd === 'help') {
            this.logTerminal("Comandos: help, whoami, uname, net, status, clear");
        } else if (cmd === 'whoami') {
            this.logTerminal(`${this.memory.state.name.toLowerCase()} (Lucidez: ${Math.round(this.memory.state.lucidity)}%)`);
        } else if (cmd === 'uname' || cmd === 'uname -a') {
            this.logTerminal("Linux ourico-pc 6.8.0-forest #1 SMP Ouriço OS x86_64 GNU/Linux");
        } else if (cmd === 'net' || cmd === 'ping') {
            this.logTerminal("ping: rede inacessível. Aguardando módulo de internet do criador.");
        } else if (cmd === 'status') {
            this.logTerminal(`Tempo vivo: ${this.memory.getFormattedAliveDuration()} | Saciedade: ${Math.round(this.memory.state.hunger)}% | Energia: ${Math.round(this.memory.state.energy)}%`);
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