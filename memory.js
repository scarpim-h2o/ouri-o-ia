/**
 * ============================================================================
 * MÓDULO DE MEMÓRIA LOCAL UNIFICADA (memory.js)
 * Salva automaticamente no localStorage do celular/PC.
 * Permite trocar entre Gemini e ChatGPT mantendo 100% do histórico,
 * personalidade, lembranças, tempo de vida e nível de lucidez.
 * ============================================================================
 */

const STORAGE_KEY = 'hedgehog_virtual_world_v2';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export class MemoryManager {
    constructor() {
        this.state = this.load();

        // Garante salvamento automático caso o usuário feche a aba ou minimize no celular
        window.addEventListener('beforeunload', () => this.save());
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this.save();
            }
        });
    }

    getDefaultState() {
        return {
            name: 'Maurício',
            provider: 'gemini', // 'gemini' ou 'openai'
            // Armazena ambas as chaves separadamente para facilitar a troca quando bater limite diário
            apiKeys: {
                gemini: '',
                openai: ''
            },
            customModel: '',
            activeDetectedModel: '',
            aiPaused: false,
            dailyLimitCalls: 60, // Limite seguro diário configurável para evitar cobranças
            usageTracker: {
                date: new Date().toISOString().slice(0, 10),
                geminiCalls: 0,
                openaiCalls: 0,
                estimatedTokens: 0
            },
            // Já nasce com 1 dia (24h) de vida completados
            birthTimestamp: Date.now() - ONE_DAY_MS,
            lastSeenTimestamp: Date.now(),
            hunger: 82,     // Saciedade (0 a 100)
            energy: 88,     // Energia (0 a 100)
            lucidity: 6,    // Consciência da simulação (0 a 100)
            memories: [
                "Acordei nesta floresta estranha. Já sinto como se existisse há pelo menos um dia inteiro.",
                "Tem uma mesa de madeira com um computador aqui no meio do mato, mas ainda não tem acesso à internet."
            ],
            chatHistory: [
                {
                    role: 'model',
                    text: 'E aí... acabei de abrir os olhos aqui nessa clareira. Parece que já tô vivo faz 1 dia. Que lugar é esse? E por que tem um PC no meio das árvores?'
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
                }
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

    // Calcula passagem de tempo enquanto o site esteve fechado
    processOfflineTime() {
        const now = Date.now();
        const elapsedMs = Math.max(0, now - this.state.lastSeenTimestamp);
        const elapsedHours = elapsedMs / (1000 * 60 * 60);

        if (elapsedHours > 0.05) {
            this.state.hunger = Math.max(12, this.state.hunger - elapsedHours * 4);
            this.state.energy = Math.min(100, this.state.energy + elapsedHours * 5);
            this.state.lucidity = Math.min(100, this.state.lucidity + elapsedHours * 0.45);
            this.save();
        }
    }

    // Metabolismo contínuo enquanto o site está aberto
    tickMetabolism(isNight) {
        this.state.hunger = Math.max(5, this.state.hunger - 0.14);
        const energyDrain = isNight ? 0.18 : 0.09;
        this.state.energy = Math.max(5, this.state.energy - energyDrain);
        this.state.lucidity = Math.min(100, this.state.lucidity + 0.03);
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

    getFormattedAliveDuration() {
        const ms = Date.now() - this.state.birthTimestamp;
        const totalMinutes = Math.floor(ms / 60000);
        const days = Math.floor(totalMinutes / (60 * 24));
        const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
        const mins = totalMinutes % 60;
        return `${days}d ${String(hours).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m`;
    }
}