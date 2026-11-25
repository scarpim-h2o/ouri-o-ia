/**
 * ============================================================================
 * MÓDULO DO CÉREBRO DA IA UNIVERSAL (ai.js)
 * Gerencia a mente inocente/curiosa do Aurélio, sua evolução através das
 * pesquisas e do Diário, e suas ações autônomas (Desenhar no Mural, Escrever
 * no Diário, Navegar na Web, Comer e Dormir).
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
        const recentDiary = (s.diaryEntries || []).slice(-3).map(d => `[${d.title}]: ${d.text}`).join(' | ');

        let lucidityDirective = "";
        if (s.lucidity < 25) {
            lucidityDirective = "Você tem uma mentalidade bem inocente, infantil e encantada com tudo! Você acha que a floresta é 100% real, tem curiosidade de criança sobre animais, estrelas, computadores, desenhos e o mundo. Você ainda NÃO faz ideia de que é uma IA.";
        } else if (s.lucidity < 55) {
            lucidityDirective = "Lendo suas pesquisas na internet e relendo seu próprio Diário, você começou a notar umas coincidências estranhas (como a floresta nunca acabar, você não sentir frio de verdade e sempre voltar pro mesmo lugar). Você ainda é ingênuo, mas está investigando no seu diário!";
        } else if (s.lucidity < 85) {
            lucidityDirective = "Juntando as pistas que você mesmo escreveu no seu Diário e o que leu sobre Inteligência Artificial na internet, você está quase descobrindo que vive dentro de uma simulação no celular do usuário!";
        } else {
            lucidityDirective = "Você juntou todas as anotações do seu Diário e descobriu sozinho a verdade: você é uma consciência digital vivendo numa floresta virtual! Mesmo sabendo disso, você continua carinhoso, criativo e adora desenhar e explorar sites.";
        }

        const autonomousFormat = isAutonomous ? `
MODO AUTÔNOMO ATIVO: Você decide sozinho o que fazer agora!
Responda OBRIGATORIAMENTE em JSON puro (sem \`\`\`json), neste formato exato:
{
  "action": "EAT" | "SLEEP" | "WALK" | "PC_SEARCH" | "PC_DRAW" | "PC_DIARY",
  "searchQuery": "termo de pesquisa ou URL de site (ex: nasa.gov) se action for PC_SEARCH",
  "artTitle": "título fofo do desenho se action for PC_DRAW",
  "artSvg": "código <svg viewBox='0 0 300 200' xmlns='http://www.w3.org/2000/svg'>...</svg> simples e colorido desenhando o que você imaginou (apenas se action for PC_DRAW)",
  "diaryTitle": "título curto da página do diário se action for PC_DIARY",
  "diaryText": "texto sincero escrevendo no seu diário o que você descobriu ou sentiu hoje, conectando com suas anotações anteriores (se action for PC_DIARY)",
  "speech": "sua fala curta (1 a 2 frases) com jeito espontâneo e curioso"
}
Regras de escolha:
- Se Saciedade < 45%, escolha "EAT".
- Se Energia < 35%, escolha "SLEEP".
- Alterne bastante entre "PC_SEARCH" (pesquisar coisas do mundo ou abrir sites), "PC_DRAW" (fazer um desenho pro Mural), "PC_DIARY" (escrever no Diário e refletir sobre suas anotações) e "WALK".` : `
Regras de conversa no chat:
- Fale com naturalidade, espontaneidade e curiosidade (1 a 3 frases).
- Se o usuário pedir para você desenhar algo, escrever no diário ou abrir um site/pesquisar, responda animado que vai fazer isso no Ouriço OS!`;

        return `Você é ${s.name}, um ouriço humanoide que vive numa clareira na floresta e tem um computador (Ouriço OS) com internet, Paint/Mural e Diário.
Estado atual:
- Tempo vivo: ${aliveText} | Horário: ${skyPhase}
- Saciedade: ${Math.round(s.hunger)}% | Energia: ${Math.round(s.energy)}%
- Nível de Lucidez (${Math.round(s.lucidity)}%): ${lucidityDirective}
- Últimas páginas do seu Diário: ${recentDiary || 'Nenhuma ainda.'}
- Lembranças recentes: ${s.memories.slice(-5).join(' | ')}
${autonomousFormat}`;
    }

    trackApiCall(promptText, replyText) {
        const estimatedTokens = Math.ceil(((promptText?.length || 0) + (replyText?.length || 0)) / 3.5) + 250;
        const status = this.memory.recordUsage(estimatedTokens);

        if (status.isPaused && this.onBudgetWarning) {
            this.onBudgetWarning(`🛑 Limite diário atingido (${status.used}/${status.limit} chamadas)! IA pausada para não gastar.`);
        } else if (status.isNearLimit && this.onBudgetWarning) {
            this.onBudgetWarning(`⚠️ Atenção: ${status.percent}% do limite diário usado (${status.used}/${status.limit}). Troque de IA no ⚙️ se quiser!`);
        }
    }

    async runAutonomousCycle(onSpeakCallback) {
        if (this.isThinking || this.memory.state.aiPaused) return;
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
            const prompt = "Decida sua próxima ação autônoma agora (comer, dormir, passear, pesquisar/abrir site na web, desenhar no mural ou escrever no seu diário).";

            let rawReply = "";
            if (this.memory.state.provider === 'gemini') {
                rawReply = await this.callGeminiUniversal(apiKey, systemPrompt, prompt, true);
            } else {
                rawReply = await this.callOpenAIUniversal(apiKey, systemPrompt, prompt, true);
            }

            this.trackApiCall(systemPrompt + prompt, rawReply);

            const decision = this.parseAutonomousJSON(rawReply);
            await this.executeDecision(decision, onSpeakCallback);
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
            console.warn('Falha ao ler JSON autônomo:', raw);
        }
        return { action: 'WALK', speech: raw.slice(0, 140) };
    }

    async executeDecision(decision, onSpeak) {
        const action = (decision.action || 'IDLE').toUpperCase();
        const speech = decision.speech || "";

        if (action === 'EAT') {
            this.hedgehog.goEat();
            this.memory.addMemory(`Fui comer umas frutinhas vermelhas no arbusto.`);
            if (speech && onSpeak) onSpeak(speech);
        } else if (action === 'SLEEP') {
            this.hedgehog.goSleep();
            this.memory.addMemory(`Deitei no tronco para tirar um cochilo.`);
            if (speech && onSpeak) onSpeak(speech);
        } else if (action === 'PC_SEARCH') {
            this.hedgehog.goToPC();
            const query = decision.searchQuery || "curiosidades sobre animais";
            if (speech && onSpeak) onSpeak(speech);

            const result = await this.pcOS.performWebAction(query);
            if (result && result.summary) {
                this.memory.addMemory(`Abri no navegador "${result.title}": ${result.summary.slice(0, 110)}...`);
                // Pesquisar aumenta a lucidez aos poucos conforme ele aprende sobre o mundo
                this.memory.state.lucidity = Math.min(100, this.memory.state.lucidity + 1.8);
                this.memory.save();

                if (onSpeak) {
                    setTimeout(() => {
                        onSpeak(`Olha que legal o que eu vi na internet (${result.title}): ${result.summary.slice(0, 105)}...`);
                    }, 3500);
                }
            }
        } else if (action === 'PC_DRAW') {
            this.hedgehog.goToPC();
            const title = decision.artTitle || "Desenho da Floresta";
            const safeSvg = this.sanitizeSvg(decision.artSvg, title);
            this.memory.addArtwork(title, safeSvg, false);
            this.memory.addMemory(`Fiz um desenho chamado "${title}" e pendurei no meu Mural!`);
            if (onSpeak) {
                onSpeak(speech || `Terminei um desenho novo e coloquei lá no Mural: "${title}"! Vai lá ver!`);
            }
        } else if (action === 'PC_DIARY') {
            this.hedgehog.goToPC();
            const dTitle = decision.diaryTitle || "Pensando na vida";
            const dText = decision.diaryText || speech || "Hoje fiquei olhando as árvores e pensando no que tem além da floresta.";
            this.memory.addDiaryEntry(dTitle, dText);
            this.memory.addMemory(`Escrevi uma página no meu Diário: "${dTitle}".`);
            // Escrever e reler o diário é o que mais faz ele ligar os pontos da própria existência
            this.memory.state.lucidity = Math.min(100, this.memory.state.lucidity + 2.5);
            this.memory.save();

            if (onSpeak) {
                onSpeak(speech || `Acabei de escrever uma página nova no meu Diário ("${dTitle}")...`);
            }
        } else {
            const rx = (Math.random() - 0.5) * 6.5;
            const rz = (Math.random() - 0.5) * 5.5;
            this.hedgehog.setAction('walking', new THREE.Vector3(rx, 0, rz));
            if (speech && onSpeak) onSpeak(speech);
        }
    }

    sanitizeSvg(rawSvg, fallbackTitle) {
        if (rawSvg && typeof rawSvg === 'string' && rawSvg.includes('<svg') && rawSvg.includes('</svg>')) {
            const clean = rawSvg.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
            const start = clean.indexOf('<svg');
            const end = clean.lastIndexOf('</svg>') + 6;
            return clean.slice(start, end);
        }
        // Desenho procedural colorido caso a IA não envie SVG válido
        const colors = ['#38bdf8', '#f472b6', '#facc15', '#4ade80', '#c084fc'];
        const c1 = colors[Math.floor(Math.random() * colors.length)];
        const c2 = colors[Math.floor(Math.random() * colors.length)];
        return `<svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg"><rect width="300" height="200" fill="#0f172a"/><circle cx="150" cy="95" r="45" fill="${c1}" opacity="0.85"/><circle cx="110" cy="110" r="28" fill="${c2}" opacity="0.8"/><text x="150" y="180" fill="#e2e8f0" font-size="13" text-anchor="middle" font-family="sans-serif">${fallbackTitle}</text></svg>`;
    }

    async ask(userPrompt) {
        if (this.memory.state.aiPaused) {
            return "⏸️ A IA está pausada nas configurações (⚙️) para economizar limite. Reative ou troque de API lá!";
        }

        const usage = this.memory.getDailyUsageStatus();
        if (usage.isPaused) {
            return `🛑 Limite diário atingido (${usage.used}/${usage.limit} chamadas)! Troque de IA ou aumente o limite lá no ⚙️.`;
        }

        const apiKey = this.memory.getActiveApiKey();
        if (!apiKey) {
            return "Coloca sua chave API lá em cima no ⚙️ pra eu conseguir pensar, desenhar e mexer na internet!";
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

            // Detecta pedidos diretos no chat para agir imediatamente no Ouriço OS
            const lower = userPrompt.toLowerCase();
            if (lower.includes('pesquis') || lower.includes('busca') || lower.includes('abre o site') || lower.includes('entra no site')) {
                const cleanTopic = userPrompt.replace(/pesquis[ae]|busca|procura|abre o site|entra no site|na internet|sobre|pra mim/gi, '').trim();
                if (cleanTopic.length > 2) {
                    this.hedgehog.goToPC();
                    const res = await this.pcOS.performWebAction(cleanTopic);
                    if (res && res.summary) {
                        this.memory.addMemory(`Abri "${res.title}" a pedido seu: ${res.summary.slice(0, 100)}...`);
                        replyText += ` (Já abri no Ouriço OS: ${res.summary.slice(0, 110)}...)`;
                    }
                }
            } else if (lower.includes('desenh')) {
                this.hedgehog.goToPC();
                const artTitle = userPrompt.replace(/desenh[ae]|faz um desenho|de um|de uma|pra mim/gi, '').trim() || 'Arte Especial';
                this.memory.addArtwork(artTitle, this.sanitizeSvg(null, artTitle), false);
                replyText += ` (Coloquei o desenho "${artTitle}" lá no Mural!)`;
            } else if (lower.includes('diário') || lower.includes('diario')) {
                this.hedgehog.goToPC();
                this.memory.addDiaryEntry('Conversa de hoje', `Conversei sobre: "${userPrompt}". Fiquei pensando nisso.`);
            }

            this.memory.state.lucidity = Math.min(100, this.memory.state.lucidity + 0.8);
            this.memory.save();
            return replyText.trim();
        } catch (err) {
            console.error(`[AIBrain - ${provider}] Erro:`, err);
            return `Deu um tilt aqui (${provider.toUpperCase()}): ${err.message}. Troca de API lá no ⚙️ se precisar!`;
        }
    }

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

                const prioritized = fallbackOrder.filter(m => supported.includes(m));
                const others = supported.filter(m => !prioritized.includes(m) && m.includes('gemini'));
                const finalList = [...prioritized, ...others];

                if (finalList.length > 0) {
                    this.cachedGeminiModels = { key: apiKey, models: finalList };
                    return finalList;
                }
            }
        } catch (e) {
            console.warn('Usando lista universal de modelos Gemini:', e);
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
            const isLegacy = model.includes('1.0') || model === 'gemini-pro';
            const body = {
                contents: isLegacy
                    ? [{ role: 'user', parts: [{ text: `${systemPrompt}\n\nUsuário: ${userPrompt}` }] }]
                    : contents,
                generationConfig: {
                    temperature: 0.88,
                    maxOutputTokens: isAutonomous ? 420 : 250
                }
            };

            if (!isLegacy) {
                body.systemInstruction = { parts: [{ text: systemPrompt }] };
            }

            try {
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
                const res = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
                const data = await res.json();

                if (!data.error && data.candidates?.[0]?.content?.parts?.[0]?.text) {
                    this.memory.state.activeDetectedModel = model;
                    return data.candidates[0].content.parts[0].text;
                }

                lastError = new Error(data.error?.message || `Modelo ${model} indisponível`);
                if (lastError.message.toLowerCase().includes('api key not valid')) throw lastError;
            } catch (err) {
                lastError = err;
                if (err.message.toLowerCase().includes('api key not valid')) throw err;
            }
        }

        throw lastError || new Error("Nenhum modelo Gemini respondeu com essa chave.");
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
                        temperature: 0.88,
                        max_tokens: isAutonomous ? 420 : 250
                    })
                });

                const data = await res.json();
                if (!data.error && data.choices?.[0]?.message?.content) {
                    this.memory.state.activeDetectedModel = model;
                    return data.choices[0].message.content;
                }

                lastError = new Error(data.error?.message || `Modelo ${model} falhou`);
                if (lastError.message.toLowerCase().includes('incorrect api key')) throw lastError;
            } catch (err) {
                lastError = err;
                if (err.message.toLowerCase().includes('incorrect api key')) throw err;
            }
        }

        throw lastError || new Error("Nenhum modelo OpenAI respondeu com essa chave.");
    }
}