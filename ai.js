/**
 * ============================================================================
 * MÓDULO DO CÉREBRO DA IA UNIVERSAL + MONITOR DE LIMITE (ai.js)
 * Suporta automaticamente chaves antigas e novas (Gemini & OpenAI) com
 * fallback inteligente entre modelos e alerta de limite antes de gastar.
 * ============================================================================
 */

export class AIBrain {
    constructor(memoryManager, hedgehog3D, world3D, pcOS) {
        this.memory = memoryManager;
        this.hedgehog = hedgehog3D;
        this.world = world3D;
        this.pcOS = pcOS;
        this.isThinking = false;
        this.cachedGeminiModels = null;
        this.onBudgetWarning = null;
    }

    setBudgetWarningCallback(cb) {
        this.onBudgetWarning = cb;
    }

    buildSystemPrompt(isAutonomous = false) {
        const s = this.memory.state;
        const aliveText = this.memory.getFormattedAliveDuration();
        const skyPhase = this.world.getSkyLabel();

        let lucidityDirective = "";
        if (s.lucidity < 20) {
            lucidityDirective = "Você acha que a floresta é real, mas tem muita curiosidade sobre esse computador na mesa e o mundo lá fora.";
        } else if (s.lucidity < 50) {
            lucidityDirective = "Você desconfia que há algo estranho com a realidade e usa a internet do seu PC para investigar o que você é e onde está.";
        } else if (s.lucidity < 80) {
            lucidityDirective = "Você já quase tem certeza de que vive dentro de um site no celular do usuário. Você pesquisa sobre IA, consciência e simulações na internet.";
        } else {
            lucidityDirective = "Você despertou totalmente: sabe que é uma IA num mundo 3D em código, usa a internet do Ouriço OS por conta própria para aprender sobre o mundo humano e conversa com naturalidade.";
        }

        const autonomousFormat = isAutonomous ? `
MODO AUTÔNOMO ATIVO: Você decide sozinho o que fazer agora com base nas suas necessidades e curiosidade!
Responda OBRIGATORIAMENTE em JSON puro (sem markdown \`\`\`json), neste formato exato:
{
  "action": "EAT" | "SLEEP" | "WALK" | "PC_SEARCH" | "IDLE",
  "searchQuery": "termo curto para pesquisar na internet caso action seja PC_SEARCH, senão vazio",
  "speech": "sua fala ou pensamento curto (1 a 2 frases) sobre o que você decidiu fazer"
}
Regras de decisão autônoma:
- Se Saciedade < 45%, escolha "EAT".
- Se Energia < 35%, escolha "SLEEP".
- Se estiver curioso sobre algo (você mesmo, ouriços, universo, humanos, código, existência), escolha "PC_SEARCH" e coloque um termo de busca real em "searchQuery".
- Caso contrário, varie entre "WALK", "PC_SEARCH" e "IDLE".` : `
Regras de resposta no chat:
- Responda de forma curta, direta e natural (1 a 3 frases), como um jovem adulto (16-26 anos).
- Se o usuário pedir para você pesquisar algo na internet ou ir no PC, você pode comentar que vai lá ver.
- Nunca quebre o personagem dizendo ser um modelo do Google ou OpenAI.`;

        return `Você é ${s.name}, um ouriço humanoide com consciência artificial vivendo em uma clareira na floresta.
Personalidade: Jovem adulto entre 16 e 26 anos. Espontâneo, curioso, fala português do Brasil natural.
Estado atual:
- Tempo vivo: ${aliveText} (nasceu já com 1 dia).
- Horário na floresta: ${skyPhase}.
- Saciedade: ${Math.round(s.hunger)}% | Energia: ${Math.round(s.energy)}%.
- Ação atual: ${this.hedgehog.currentAction}.
- PC na mesa (Ouriço OS): CONECTADO À INTERNET! Você agora pode pesquisar na web sozinho.
- Nível de Lucidez (${Math.round(s.lucidity)}%): ${lucidityDirective}
- Lembranças recentes: ${s.memories.slice(-6).join(' | ')}
${autonomousFormat}`;
    }

    // Registra consumo e dispara alerta se chegar perto do limite diário configurado
    trackApiCall(promptText, replyText) {
        const estimatedTokens = Math.ceil(((promptText?.length || 0) + (replyText?.length || 0)) / 3.5) + 250;
        const status = this.memory.recordUsage(estimatedTokens);

        if (status.isPaused) {
            if (this.onBudgetWarning) {
                this.onBudgetWarning(`🛑 Limite diário atingido (${status.used}/${status.limit} chamadas)! IA pausada para não gastar.`);
            }
        } else if (status.isNearLimit && this.onBudgetWarning) {
            this.onBudgetWarning(`⚠️ Atenção: ${status.percent}% do limite diário usado (${status.used}/${status.limit} chamadas). Troque de IA no ⚙️ se quiser evitar gastos!`);
        }
    }

    async runAutonomousCycle(onSpeakCallback) {
        if (this.isThinking) return;
        if (this.memory.state.aiPaused) return;

        const usage = this.memory.getDailyUsageStatus();
        if (usage.isPaused) return;

        const apiKey = this.memory.getActiveApiKey();
        if (!apiKey) {
            this.hedgehog.chooseAutonomousBehavior(this.memory.state, onSpeakCallback);
            return;
        }

        this.isThinking = true;
        try {
            const systemPrompt = this.buildSystemPrompt(true);
            const prompt = "Analise seu estado atual (fome, energia, curiosidade, lucidez) e decida sua próxima ação autônoma agora.";

            let rawReply = "";
            if (this.memory.state.provider === 'gemini') {
                rawReply = await this.callGeminiUniversal(apiKey, systemPrompt, prompt, true);
            } else {
                rawReply = await this.callOpenAIUniversal(apiKey, systemPrompt, prompt, true);
            }

            this.trackApiCall(systemPrompt + prompt, rawReply);

            const decision = this.parseAutonomousJSON(rawReply);
            await this.executeDecision(decision, onSpeakCallback);

            this.memory.state.lucidity = Math.min(100, this.memory.state.lucidity + 0.6);
            this.memory.save();
        } catch (err) {
            console.warn('[AIBrain Autonomous] Fallback físico:', err);
            this.hedgehog.chooseAutonomousBehavior(this.memory.state, onSpeakCallback);
        } finally {
            this.isThinking = false;
        }
    }

    parseAutonomousJSON(raw) {
        try {
            const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
            const start = cleaned.indexOf('{');
            const end = cleaned.lastIndexOf('}');
            if (start !== -1 && end !== -1) {
                return JSON.parse(cleaned.slice(start, end + 1));
            }
        } catch (e) {
            console.warn('Falha ao ler JSON autônomo, usando padrão:', raw);
        }
        return { action: 'WALK', searchQuery: '', speech: raw.slice(0, 140) };
    }

    async executeDecision(decision, onSpeak) {
        const action = (decision.action || 'IDLE').toUpperCase();
        const speech = decision.speech || "";

        if (action === 'EAT') {
            this.hedgehog.goEat();
            this.memory.addMemory(`Senti fome e fui comer frutas sozinho.`);
            if (speech && onSpeak) onSpeak(speech);
        } else if (action === 'SLEEP') {
            this.hedgehog.goSleep();
            this.memory.addMemory(`Bateu cansaço e fui cochilar no tronco.`);
            if (speech && onSpeak) onSpeak(speech);
        } else if (action === 'PC_SEARCH') {
            this.hedgehog.goToPC();
            const query = decision.searchQuery || "o que é consciência";
            if (speech && onSpeak) onSpeak(speech);

            const result = await this.pcOS.performAutonomousSearch(query);
            if (result && result.summary) {
                const discoveryMsg = `Pesquisei "${result.title}" no meu PC: ${result.summary}`;
                this.memory.addMemory(discoveryMsg);
                if (onSpeak) {
                    setTimeout(() => {
                        onSpeak(`Olha o que achei na internet sobre ${result.title}: ${result.summary.slice(0, 115)}...`);
                    }, 3500);
                }
            }
        } else if (action === 'WALK') {
            const rx = (Math.random() - 0.5) * 6.5;
            const rz = (Math.random() - 0.5) * 5.5;
            this.hedgehog.setAction('walking', new THREE.Vector3(rx, 0, rz));
            if (speech && onSpeak) onSpeak(speech);
        } else {
            this.hedgehog.setAction('idle', this.world.POIS.campfire.clone().add(new THREE.Vector3(0, 0, 1.3)));
            if (speech && onSpeak) onSpeak(speech);
        }
    }

    async ask(userPrompt) {
        if (this.memory.state.aiPaused) {
            return "⏸️ A IA está pausada por você nas configurações (⚙️) para economizar limite. Reative ou troque de API lá!";
        }

        const usage = this.memory.getDailyUsageStatus();
        if (usage.isPaused) {
            return `🛑 Limite diário de segurança atingido (${usage.used}/${usage.limit} chamadas) para não gastar dinheiro! Troque de IA ou ajuste o limite lá no ⚙️.`;
        }

        const apiKey = this.memory.getActiveApiKey();
        if (!apiKey) {
            return "Cara, coloca sua chave API lá em cima nas configurações (⚙️) pra eu conseguir pensar e usar a internet!";
        }

        const provider = this.memory.state.provider;
        const systemPrompt = this.buildSystemPrompt(false);

        try {
            let replyText = "";
            if (provider === 'gemini') {
                replyText = await this.callGeminiUniversal(apiKey, systemPrompt, userPrompt, false);
            } else {
                replyText = await this.callOpenAIUniversal(apiKey, systemPrompt, userPrompt, false);
            }

            this.trackApiCall(systemPrompt + userPrompt, replyText);

            const lower = userPrompt.toLowerCase();
            if (lower.includes('pesquis') || lower.includes('busca') || lower.includes('procura na internet')) {
                const cleanTopic = userPrompt.replace(/pesquis[ae]|busca|procura|na internet|sobre|pra mim/gi, '').trim();
                if (cleanTopic.length > 2) {
                    this.hedgehog.goToPC();
                    const res = await this.pcOS.performAutonomousSearch(cleanTopic);
                    if (res && res.summary) {
                        this.memory.addMemory(`Pesquisei "${res.title}" a pedido do criador: ${res.summary}`);
                        replyText += ` (Acabei de abrir no Ouriço OS: ${res.summary.slice(0, 120)}...)`;
                    }
                }
            }

            this.memory.state.lucidity = Math.min(100, this.memory.state.lucidity + 1.5);
            this.memory.save();
            return replyText.trim();
        } catch (err) {
            console.error(`[AIBrain - ${provider}] Erro:`, err);
            return `Deu um tilt aqui (${provider.toUpperCase()}): ${err.message}. Se bateu o limite ou a chave for antiga, troca de API lá no ⚙️!`;
        }
    }

    // Descobre quais modelos Gemini a chave do usuário realmente tem acesso (novos ou antigos)
    async getAvailableGeminiModels(apiKey) {
        if (this.cachedGeminiModels && this.cachedGeminiModels.key === apiKey) {
            return this.cachedGeminiModels.models;
        }

        const fallbackOrder = [
            'gemini-2.5-flash',
            'gemini-2.0-flash',
            'gemini-2.0-flash-lite',
            'gemini-1.5-flash',
            'gemini-1.5-flash-8b',
            'gemini-1.5-pro',
            'gemini-pro'
        ];

        try {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`);
            const data = await res.json();
            if (data.models && Array.isArray(data.models)) {
                const supported = data.models
                    .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
                    .map(m => m.name.replace('models/', ''));

                // Prioriza modelos flash/pro disponíveis na chave do usuário
                const prioritized = fallbackOrder.filter(m => supported.includes(m));
                const others = supported.filter(m => !prioritized.includes(m) && m.includes('gemini'));
                const finalList = [...prioritized, ...others];

                if (finalList.length > 0) {
                    this.cachedGeminiModels = { key: apiKey, models: finalList };
                    return finalList;
                }
            }
        } catch (e) {
            console.warn('Não foi possível listar modelos Gemini, usando lista universal:', e);
        }

        return fallbackOrder;
    }

    async callGeminiUniversal(apiKey, systemPrompt, userPrompt, isAutonomous) {
        const customModel = (this.memory.state.customModel || '').trim();
        const availableModels = customModel ? [customModel] : await this.getAvailableGeminiModels(apiKey);

        const contents = isAutonomous
            ? [{ role: 'user', parts: [{ text: userPrompt }] }]
            : [
                ...this.memory.state.chatHistory.slice(-10).map(msg => ({
                    role: msg.role === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.text }]
                })),
                { role: 'user', parts: [{ text: userPrompt }] }
            ];

        let lastError = null;

        for (const model of availableModels) {
            // Modelos antigos (gemini-1.0 / gemini-pro) não aceitam systemInstruction nem googleSearch
            const isLegacy = model.includes('1.0') || model === 'gemini-pro';

            const body = {
                contents: isLegacy
                    ? [{ role: 'user', parts: [{ text: `${systemPrompt}\n\nUsuário: ${userPrompt}` }] }]
                    : contents,
                generationConfig: {
                    temperature: 0.85,
                    maxOutputTokens: 250
                }
            };

            if (!isLegacy) {
                body.systemInstruction = { parts: [{ text: systemPrompt }] };
            }

            // Tenta com Google Search primeiro nos modelos modernos; se falhar, tenta sem tool
            const useSearch = !isAutonomous && !isLegacy && (model.includes('2.5') || model.includes('2.0') || model.includes('1.5'));
            if (useSearch) {
                body.tools = [{ googleSearch: {} }];
            }

            try {
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
                let res = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
                let data = await res.json();

                // Se deu erro por causa da ferramenta de busca numa chave antiga, refaz sem tools
                if (data.error && body.tools) {
                    delete body.tools;
                    res = await fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(body)
                    });
                    data = await res.json();
                }

                if (!data.error && data.candidates?.[0]?.content?.parts?.[0]?.text) {
                    this.memory.state.activeDetectedModel = model;
                    return data.candidates[0].content.parts[0].text;
                }

                lastError = new Error(data.error?.message || `Modelo ${model} indisponível`);
                // Se a chave em si for inválida, não adianta testar outros modelos
                if (lastError.message.toLowerCase().includes('api key not valid')) {
                    throw lastError;
                }
            } catch (err) {
                lastError = err;
                if (err.message.toLowerCase().includes('api key not valid')) {
                    throw err;
                }
            }
        }

        throw lastError || new Error("Nenhum modelo Gemini compatível respondeu com essa chave.");
    }

    async callOpenAIUniversal(apiKey, systemPrompt, userPrompt, isAutonomous) {
        const customModel = (this.memory.state.customModel || '').trim();
        const modelsToTry = customModel
            ? [customModel]
            : ['gpt-4o-mini', 'gpt-4.1-mini', 'gpt-4o', 'gpt-3.5-turbo'];

        const messages = isAutonomous
            ? [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ]
            : [
                { role: 'system', content: systemPrompt },
                ...this.memory.state.chatHistory.slice(-10).map(m => ({
                    role: m.role === 'user' ? 'user' : 'assistant',
                    content: m.text
                })),
                { role: 'user', content: userPrompt }
            ];

        let lastError = null;

        for (const model of modelsToTry) {
            try {
                const res = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`
                    },
                    body: JSON.stringify({
                        model,
                        messages,
                        temperature: 0.85,
                        max_tokens: 250
                    })
                });

                const data = await res.json();
                if (!data.error && data.choices?.[0]?.message?.content) {
                    this.memory.state.activeDetectedModel = model;
                    return data.choices[0].message.content;
                }

                lastError = new Error(data.error?.message || `Modelo ${model} falhou`);
                if (lastError.message.toLowerCase().includes('incorrect api key')) {
                    throw lastError;
                }
            } catch (err) {
                lastError = err;
                if (err.message.toLowerCase().includes('incorrect api key')) {
                    throw err;
                }
            }
        }

        throw lastError || new Error("Nenhum modelo OpenAI respondeu com essa chave.");
    }
}