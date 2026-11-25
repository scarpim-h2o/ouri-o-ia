/**
 * ============================================================================
 * MÓDULO DE MEMÓRIA EM GRAFO, EVOLUÇÃO CIENTÍFICA E POOL MULTI-API (memory.js)
 * ============================================================================
 */

const STORAGE_KEY = 'hedgehog_scientific_graph_v3';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export class MemoryManager {
    constructor() {
        this.state = this.load();
        window.addEventListener('beforeunload', () => this.save());
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') this.save();
        });
    }

    getDefaultState() {
        const nowStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const todayStr = new Date().toISOString().slice(0, 10);

        return {
            name: 'Aurélio',
            aiPaused: false,
            aiCycleIntervalMs: 180000, // 3 minutos para chamadas de IA (economiza 90% da cota!)
            rotationIndex: 0,
            usageDate: todayStr,
            totalTokensToday: 0,
            apiPool: {
                gemini: { label: 'Gemini', key: '', dailyLimit: 50, usedToday: 0 },
                groq: { label: 'Groq', key: '', dailyLimit: 120, usedToday: 0 },
                openrouter: { label: 'OpenRouter', key: '', dailyLimit: 80, usedToday: 0 },
                openai: { label: 'GPT', key: '', dailyLimit: 40, usedToday: 0 },
                claude: { label: 'Claude', key: '', dailyLimit: 40, usedToday: 0 }
            },
            birthTimestamp: Date.now() - ONE_DAY_MS,
            lastSeenTimestamp: Date.now(),
            hunger: 82,
            thirst: 85,
            energy: 88,

            // Evolução & Traços de Personalidade (estilo científico)
            evolution: {
                level: 1,
                xp: 15,
                rank: 'Curioso',
                abilities: 2,
                inventions: 0,
                traits: {
                    curiosity: 45,
                    autonomy: 40,
                    creativity: 35,
                    sociability: 30,
                    caution: 25,
                    independence: 38
                }
            },

            // Grafo de Ideias & Investigações (cada nó tem linha do tempo)
            ideaNodes: [
                {
                    id: 'node_arbusto',
                    parentTopic: 'Floresta',
                    topic: 'Botânica e Arbustos',
                    question: 'Como os arbustos produzem frutos vermelhos na floresta?',
                    status: 'ATIVO',
                    updatedAt: nowStr,
                    lastContribution: 'Observei o arbusto da clareira e iniciei pesquisa sobre plantas.',
                    timeline: [
                        {
                            type: 'RESEARCH',
                            title: 'Observação Inicial: Arbusto da Clareira',
                            text: 'Notei que este arbusto produz frutos vermelhos constantemente. Ponto de partida para estudar botânica e ecossistemas.',
                            timestamp: nowStr
                        }
                    ]
                },
                {
                    id: 'node_lago',
                    parentTopic: 'Floresta',
                    topic: 'Hidrologia e Lagos',
                    question: 'Como a água do lago mantém o equilíbrio térmico e biológico?',
                    status: 'ATIVO',
                    updatedAt: nowStr,
                    lastContribution: 'Analisei a transparência e temperatura da água do lago.',
                    timeline: [
                        {
                            type: 'RESEARCH',
                            title: 'Observação: Lagoa da Clareira',
                            text: 'A água limpa serve para hidratação e abre caminho para investigar natação e ciclos hídricos.',
                            timestamp: nowStr
                        }
                    ]
                },
                {
                    id: 'node_fogueira',
                    parentTopic: 'Floresta',
                    topic: 'Combustão e Calor',
                    question: 'Como a madeira libera energia luminosa e térmica na fogueira?',
                    status: 'ATIVO',
                    updatedAt: nowStr,
                    lastContribution: 'Observei a chama constante da fogueira e sua irradiação de calor.',
                    timeline: [
                        {
                            type: 'RESEARCH',
                            title: 'Observação: Fogueira Central',
                            text: 'A combustão da madeira gera calor constante que ilumina a clareira durante a noite.',
                            timestamp: nowStr
                        }
                    ]
                }
            ],

            // Fila de Perguntas Internas geradas pelas pesquisas
            pendingQuestions: [
                {
                    id: 'q_1',
                    seedTopic: 'Botânica',
                    question: 'Qual o papel da fotossíntese e da água no crescimento das árvores da floresta?',
                    status: 'AGUARDANDO'
                },
                {
                    id: 'q_2',
                    seedTopic: 'Hidrologia',
                    question: 'Como os lagos naturais mantêm o ecossistema aquático equilibrado?',
                    status: 'AGUARDANDO'
                },
                {
                    id: 'q_3',
                    seedTopic: 'Biologia',
                    question: 'Quais são os hábitos naturais e sentidos de um ouriço na natureza?',
                    status: 'AGUARDANDO'
                }
            ],

            // Desejos / Invenções que ele pede e você pode construir em 3D!
            wishes: [
                {
                    id: 'wish_pool',
                    icon: '🏊',
                    title: 'Piscina de Natação',
                    reason: 'Pesquisei sobre água e natação e quero praticar exercícios aquáticos!',
                    built: false
                },
                {
                    id: 'wish_telescope',
                    icon: '🔭',
                    title: 'Observatório Astronômico',
                    reason: 'Para estudar as estrelas e constelações durante a noite.',
                    built: false
                },
                {
                    id: 'wish_garden',
                    icon: '🌻',
                    title: 'Jardim Botânico Experimental',
                    reason: 'Quero testar o crescimento de flores e plantas diferentes.',
                    built: false
                }
            ],

            artGallery: [
                {
                    time: nowStr,
                    title: 'Estudo: Árvore da Clareira',
                    svg: `<svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg"><rect width="300" height="200" fill="#f8fafc"/><rect x="140" y="120" width="20" height="55" fill="#78350f"/><polygon points="100,125 150,55 200,125" fill="none" stroke="#166534" stroke-width="4"/><polygon points="112,95 150,35 188,95" fill="none" stroke="#15803d" stroke-width="4"/><circle cx="240" cy="40" r="16" fill="none" stroke="#eab308" stroke-width="3"/></svg>`
                }
            ],

            diaryEntries: [
                {
                    date: new Date().toLocaleDateString('pt-BR'),
                    time: nowStr,
                    title: 'Caderno de Campo #01',
                    text: 'Iniciei o mapeamento da clareira: temos um arbusto frutífero, um lago pequeno, uma fogueira e uma estação de computador para consultas.'
                }
            ],

            searchHistory: [],
            memories: [
                "Comecei a observar os elementos da floresta (arbusto, lago, fogueira) para pesquisar sobre eles."
            ],
            chatHistory: [
                {
                    role: 'model',
                    text: 'Olá! Já comecei a mapear os elementos aqui da floresta e abri minhas primeiras investigações no computador. Quer ver o que estou pesquisando?'
                }
            ]
        };
    }

    load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) {
                const init = this.getDefaultState();
                localStorage.setItem(STORAGE_KEY, JSON.stringify(init));
                return init;
            }
            const parsed = JSON.parse(raw);
            const def = this.getDefaultState();
            return {
                ...def,
                ...parsed,
                apiPool: { ...def.apiPool, ...(parsed.apiPool || {}) },
                evolution: {
                    ...def.evolution,
                    ...(parsed.evolution || {}),
                    traits: { ...def.evolution.traits, ...(parsed.evolution?.traits || {}) }
                }
            };
        } catch (err) {
            return this.getDefaultState();
        }
    }

    save() {
        try {
            this.state.lastSeenTimestamp = Date.now();
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
        } catch (err) {
            console.error('Erro ao salvar:', err);
        }
    }

    resetAll() {
        localStorage.removeItem(STORAGE_KEY);
        this.state = this.getDefaultState();
    }

    // ========================================================================
    // POOL MULTI-API COM RODÍZIO E MONITORAMENTO DE COTA
    // ========================================================================
    ensureDailyUsageReset() {
        const today = new Date().toISOString().slice(0, 10);
        if (this.state.usageDate !== today) {
            this.state.usageDate = today;
            this.state.totalTokensToday = 0;
            Object.keys(this.state.apiPool).forEach(k => {
                this.state.apiPool[k].usedToday = 0;
            });
            this.save();
        }
    }

    getNextAvailableProvider() {
        this.ensureDailyUsageReset();
        const keys = ['gemini', 'groq', 'openrouter', 'openai', 'claude'];
        const count = keys.length;

        for (let i = 0; i < count; i++) {
            const idx = (this.state.rotationIndex + i) % count;
            const provName = keys[idx];
            const entry = this.state.apiPool[provName];

            if (entry && entry.key && entry.key.trim().length > 5 && entry.usedToday < entry.dailyLimit) {
                this.state.rotationIndex = (idx + 1) % count;
                this.save();
                return { provider: provName, ...entry };
            }
        }
        return null;
    }

    recordProviderUsage(providerName, estimatedTokens = 280) {
        this.ensureDailyUsageReset();
        const entry = this.state.apiPool[providerName];
        if (entry) {
            entry.usedToday += 1;
        }
        this.state.totalTokensToday += estimatedTokens;
        this.save();

        const percent = entry ? Math.round((entry.usedToday / entry.dailyLimit) * 100) : 0;
        return {
            providerName,
            label: entry?.label || providerName,
            used: entry?.usedToday || 0,
            limit: entry?.dailyLimit || 50,
            percent,
            isNearLimit: percent >= 80
        };
    }

    getPoolStatus() {
        this.ensureDailyUsageReset();
        const keys = ['gemini', 'groq', 'openrouter', 'openai', 'claude'];
        let availableCount = 0;
        const providers = keys.map(k => {
            const p = this.state.apiPool[k];
            const hasKey = !!(p.key && p.key.trim().length > 5);
            const percent = Math.min(100, Math.round((p.usedToday / Math.max(1, p.dailyLimit)) * 100));
            if (hasKey && p.usedToday < p.dailyLimit) availableCount++;
            return {
                id: k,
                label: p.label,
                hasKey,
                used: p.usedToday,
                limit: p.dailyLimit,
                percent
            };
        });
        return {
            availableCount,
            totalTokens: this.state.totalTokensToday,
            providers
        };
    }

    // ========================================================================
    // GRAFO DE IDEIAS, PERGUNTAS & EVOLUÇÃO CIENTÍFICA
    // ========================================================================
    addXpAndTrait(xpGain, traitKey, traitDelta = 1.5) {
        const ev = this.state.evolution;
        ev.xp += xpGain;
        const newLevel = Math.floor(ev.xp / 100) + 1;
        if (newLevel > ev.level) {
            ev.level = newLevel;
            ev.abilities += 1;
        }
        const ranks = ['Curioso', 'Observador', 'Pesquisador', 'Analista', 'Cientista', 'Polímata'];
        ev.rank = ranks[Math.min(ranks.length - 1, Math.floor((ev.level - 1) / 2))];

        if (traitKey && ev.traits[traitKey] !== undefined) {
            ev.traits[traitKey] = Math.min(100, ev.traits[traitKey] + traitDelta);
        }
    }

    upsertIdeaNode({ topic, parentTopic, question, contributionText, timelineEntry }) {
        const nowStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        let node = this.state.ideaNodes.find(n => n.topic.toLowerCase() === topic.toLowerCase());

        if (!node) {
            node = {
                id: 'node_' + Date.now() + '_' + Math.floor(Math.random() * 100),
                parentTopic: parentTopic || 'Floresta',
                topic,
                question: question || `O que podemos descobrir sobre ${topic}?`,
                status: 'EM INVESTIGAÇÃO',
                updatedAt: nowStr,
                lastContribution: contributionText,
                timeline: []
            };
            this.state.ideaNodes.push(node);
            if (this.state.ideaNodes.length > 35) this.state.ideaNodes.shift();
        } else {
            node.updatedAt = nowStr;
            node.lastContribution = contributionText;
            node.status = 'EM INVESTIGAÇÃO';
        }

        if (timelineEntry) {
            node.timeline.push({ ...timelineEntry, timestamp: nowStr });
            if (node.timeline.length > 15) node.timeline.shift();
        }

        this.addXpAndTrait(18, 'curiosity', 1.8);
        this.save();
        return node;
    }

    enqueueQuestion(seedTopic, questionText) {
        const exists = this.state.pendingQuestions.some(q => q.question.toLowerCase() === questionText.toLowerCase());
        if (exists) return;

        this.state.pendingQuestions.push({
            id: 'q_' + Date.now() + '_' + Math.floor(Math.random() * 100),
            seedTopic,
            question: questionText,
            status: 'AGUARDANDO'
        });
        if (this.state.pendingQuestions.length > 25) this.state.pendingQuestions.shift();
        this.save();
    }

    buildWish(wishId) {
        const wish = this.state.wishes.find(w => w.id === wishId);
        if (!wish || wish.built) return null;
        wish.built = true;
        this.state.evolution.inventions += 1;
        this.addXpAndTrait(35, 'creativity', 4);
        this.addMemory(`Nova estrutura construída na floresta: ${wish.title}!`);
        this.save();
        return wish;
    }

    addArtwork(title, svgOrDataUrl, isDataUrl = false, linkedTopic = null) {
        const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        this.state.artGallery.push({
            time,
            title: title || 'Esboço Científico',
            svg: isDataUrl ? '' : svgOrDataUrl,
            imgUrl: isDataUrl ? svgOrDataUrl : ''
        });
        if (this.state.artGallery.length > 40) this.state.artGallery.shift();

        if (linkedTopic) {
            this.upsertIdeaNode({
                topic: linkedTopic,
                parentTopic: 'Observação',
                contributionText: `Desenho: ${title}`,
                timelineEntry: {
                    type: 'DRAWING',
                    title: `Esboço sobre ${linkedTopic}`,
                    text: `Representação visual da investigação sobre ${linkedTopic}.`,
                    svg: isDataUrl ? `<img src="${svgOrDataUrl}" style="width:100%;height:100%;object-fit:contain"/>` : svgOrDataUrl
                }
            });
        }
        this.addXpAndTrait(12, 'creativity', 1.5);
        this.save();
    }

    addDiaryEntry(title, text) {
        const now = new Date();
        this.state.diaryEntries.push({
            date: now.toLocaleDateString('pt-BR'),
            time: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            title,
            text
        });
        if (this.state.diaryEntries.length > 40) this.state.diaryEntries.shift();
        this.save();
    }

    addMemory(text) {
        const stamp = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        this.state.memories.push(`[${stamp}] ${text}`);
        if (this.state.memories.length > 30) this.state.memories.shift();
        this.save();
    }

    addChatMessage(role, text) {
        this.state.chatHistory.push({ role, text });
        if (this.state.chatHistory.length > 50) this.state.chatHistory.shift();
        this.save();
    }

    processOfflineTime() {
        const elapsedHours = Math.max(0, Date.now() - this.state.lastSeenTimestamp) / 3600000;
        if (elapsedHours > 0.05) {
            this.state.hunger = Math.max(15, this.state.hunger - elapsedHours * 4);
            this.state.thirst = Math.max(15, this.state.thirst - elapsedHours * 5);
            this.state.energy = Math.min(100, this.state.energy + elapsedHours * 5);
            this.save();
        }
    }

    tickMetabolism(isNight, currentAction = 'idle') {
        const isExercising = currentAction === 'exercising';
        this.state.hunger = Math.max(5, this.state.hunger - (isExercising ? 0.35 : 0.15));
        this.state.thirst = Math.max(5, this.state.thirst - (isExercising ? 0.5 : 0.2));
        this.state.energy = Math.max(5, this.state.energy - (isExercising ? 0.45 : (isNight ? 0.16 : 0.08)));
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