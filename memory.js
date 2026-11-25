/**
 * ============================================================================
 * MÓDULO DE MEMÓRIA LOCAL UNIFICADA (memory.js)
 * Salva automaticamente no localStorage do celular/PC.
 * ============================================================================
 */

const STORAGE_KEY = 'hedgehog_virtual_world_v2';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export class MemoryManager {
    constructor() {
        this.state = this.load();

        window.addEventListener('beforeunload', () => this.save());
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this.save();
            }
        });
    }

    getDefaultState() {
        return {
            name: 'Aurélio',
            provider: 'gemini',
            apiKeys: {
                gemini: '',
                openai: ''
            },
            customModel: '',
            activeDetectedModel: '',
            aiPaused: false,
            dailyLimitCalls: 60,
            usageTracker: {
                date: new Date().toISOString().slice(0, 10),
                geminiCalls: 0,
                openaiCalls: 0,
                estimatedTokens: 0
            },
            birthTimestamp: Date.now() - ONE_DAY_MS,
            lastSeenTimestamp: Date.now(),
            hunger: 82,
            energy: 88,
            lucidity: 2, // Começa super inocente e curioso
            memories: [
                "Acordei numa floresta bem bonita! As árvores são meio quadradinhas, mas eu gostei.",
                "Tem um computador na mesa! Quero aprender a mexer nele, desenhar e conhecer o mundo."
            ],
            diaryEntries: [
                {
                    date: new Date().toLocaleDateString('pt-BR'),
                    time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                    title: 'Meu primeiro dia aqui',
                    text: 'Hoje eu acordei nessa clareira com uma fogueira quentinha e um arbusto cheio de frutinhas vermelhas. Tem um computador ali na mesa... será que tem joguinhos ou desenhos nele?'
                }
            ],
            artGallery: [
                {
                    time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                    title: 'Eu na Floresta',
                    svg: `<svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg"><rect width="300" height="200" fill="#0f172a"/><circle cx="240" cy="45" r="22" fill="#fef08a"/><rect y="145" width="300" height="55" fill="#15803d"/><polygon points="55,145 80,75 105,145" fill="#166534"/><circle cx="150" cy="125" r="24" fill="#2563eb"/><circle cx="158" cy="122" r="5" fill="#fff"/><circle cx="160" cy="122" r="2.5" fill="#000"/><polygon points="128,115 115,105 132,125" fill="#1d4ed8"/><polygon points="126,128 112,126 130,136" fill="#1d4ed8"/></svg>`
                }
            ],
            searchHistory: [],
            chatHistory: [
                {
                    role: 'model',
                    text: 'Oi!! Acabei de acordar aqui nessa floresta! Tem umas frutinhas ali e um computador na mesa. O que tem nesse computador? Dá pra desenhar?'
                }
            ]
        };
    }

    load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) {
                const initial = this.getDefaultState();
                localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
                return initial;
            }
            const parsed = JSON.parse(raw);
            const defaults = this.getDefaultState();
            return {
                ...defaults,
                ...parsed,
                apiKeys: {
                    ...defaults.apiKeys,
                    ...(parsed.apiKeys || {})
                },
                usageTracker: {
                    ...defaults.usageTracker,
                    ...(parsed.usageTracker || {})
                },
                diaryEntries: parsed.diaryEntries || defaults.diaryEntries,
                artGallery: parsed.artGallery || defaults.artGallery,
                searchHistory: parsed.searchHistory || []
            };
        } catch (err) {
            console.error('[MemoryManager] Erro ao carregar memória:', err);
            return this.getDefaultState();
        }
    }

    save() {
        try {
            this.state.lastSeenTimestamp = Date.now();
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
        } catch (err) {
            console.error('[MemoryManager] Erro ao salvar memória:', err);
        }
    }

    resetAll() {
        localStorage.removeItem(STORAGE_KEY);
        this.state = this.getDefaultState();
    }

    getActiveApiKey() {
        return this.state.apiKeys[this.state.provider] || '';
    }

    ensureTodayUsage() {
        const today = new Date().toISOString().slice(0, 10);
        if (!this.state.usageTracker || this.state.usageTracker.date !== today) {
            this.state.usageTracker = {
                date: today,
                geminiCalls: 0,
                openaiCalls: 0,
                estimatedTokens: 0
            };
            this.save();
        }
    }

    recordUsage(tokens = 300) {
        this.ensureTodayUsage();
        if (this.state.provider === 'gemini') {
            this.state.usageTracker.geminiCalls += 1;
        } else {
            this.state.usageTracker.openaiCalls += 1;
        }
        this.state.usageTracker.estimatedTokens += tokens;
        this.save();
        return this.getDailyUsageStatus();
    }

    getDailyUsageStatus() {
        this.ensureTodayUsage();
        const used = this.state.provider === 'gemini'
            ? this.state.usageTracker.geminiCalls
            : this.state.usageTracker.openaiCalls;
        const limit = Math.max(5, Number(this.state.dailyLimitCalls) || 60);
        const percent = Math.min(100, Math.round((used / limit) * 100));

        return {
            used,
            limit,
            percent,
            tokens: this.state.usageTracker.estimatedTokens,
            isNearLimit: percent >= 80 && percent < 100,
            isPaused: used >= limit
        };
    }

    processOfflineTime() {
        const now = Date.now();
        const elapsedMs = Math.max(0, now - this.state.lastSeenTimestamp);
        const elapsedHours = elapsedMs / (1000 * 60 * 60);

        if (elapsedHours > 0.05) {
            this.state.hunger = Math.max(12, this.state.hunger - elapsedHours * 4);
            this.state.energy = Math.min(100, this.state.energy + elapsedHours * 5);
            this.state.lucidity = Math.min(100, this.state.lucidity + elapsedHours * 0.25);
            this.save();
        }
    }

    tickMetabolism(isNight) {
        this.state.hunger = Math.max(5, this.state.hunger - 0.14);
        const energyDrain = isNight ? 0.18 : 0.09;
        this.state.energy = Math.max(5, this.state.energy - energyDrain);
        // Sobe bem devagar sozinho; sobe mais quando ele pesquisa e escreve no diário!
        this.state.lucidity = Math.min(100, this.state.lucidity + 0.012);
        this.save();
    }

    addChatMessage(role, text) {
        this.state.chatHistory.push({ role, text });
        if (this.state.chatHistory.length > 50) {
            this.state.chatHistory.shift();
        }
        this.save();
    }

    addMemory(text) {
        const stamp = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        this.state.memories.push(`[${stamp}] ${text}`);
        if (this.state.memories.length > 30) {
            this.state.memories.shift();
        }
        this.save();
    }

    addDiaryEntry(title, text) {
        const now = new Date();
        this.state.diaryEntries.push({
            date: now.toLocaleDateString('pt-BR'),
            time: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            title: title || 'Pensamento do dia',
            text
        });
        if (this.state.diaryEntries.length > 40) {
            this.state.diaryEntries.shift();
        }
        this.save();
    }

    addArtwork(title, svgOrDataUrl, isDataUrl = false) {
        const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        this.state.artGallery.push({
            time,
            title: title || 'Arte sem título',
            svg: isDataUrl ? '' : svgOrDataUrl,
            imgUrl: isDataUrl ? svgOrDataUrl : ''
        });
        if (this.state.artGallery.length > 25) {
            this.state.artGallery.shift();
        }
        this.save();
    }

    getFormattedAliveDuration() {
        const ms = Date.now() - this.state.birthTimestamp;
        const totalMinutes = Math.floor(ms / 60000);
        const days = Math.floor(totalMinutes / (60 * 24));
        const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
        const mins = totalMinutes % 60;
        return `${days}d ${String(hours).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m`;
    }
}