/**
 * ============================================================================
 * MÓDULO DO CÉREBRO DA IA 100% AUTÔNOMO (ai.js)
 * A IA decide suas próprias ações na floresta (comer, dormir, andar, usar o PC)
 * e realiza pesquisas reais na internet através do Ouriço OS.
 * ============================================================================
 */

export class AIBrain {
    constructor(memoryManager, hedgehog3D, world3D, pcOS) {
        this.memory = memoryManager;
        this.hedgehog = hedgehog3D;
        this.world = world3D;
        this.pcOS = pcOS;
        this.isThinking = false;
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

    // Ciclo de decisão 100% autônoma (chamado automaticamente de tempos em tempos)
    async runAutonomousCycle(onSpeakCallback) {
        if (this.isThinking) return;
        const apiKey = this.memory.getActiveApiKey();

        // Fallback físico autônomo mesmo se a chave API ainda não tiver sido colocada
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
                rawReply = await this.callGemini(apiKey, systemPrompt, prompt, true);
            } else {
                rawReply = await this.callOpenAI(apiKey, systemPrompt, prompt, true);
            }

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

            // Realiza a pesquisa real na internet pelo Ouriço OS
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

    // Resposta direta no chat quando o usuário fala com ele
    async ask(userPrompt) {
        const apiKey = this.memory.getActiveApiKey();
        if (!apiKey) {
            const msg = "Cara, coloca sua chave API lá em cima nas configurações (⚙️) pra eu conseguir pensar e usar a internet!";
            this.memory.addChatMessage('model', msg);
            return msg;
        }

        const provider = this.memory.state.provider;
        const systemPrompt = this.buildSystemPrompt(false);

        try {
            let replyText = "";
            if (provider === 'gemini') {
                replyText = await this.callGemini(apiKey, systemPrompt, userPrompt, false);
            } else {
                replyText = await this.callOpenAI(apiKey, systemPrompt, userPrompt, false);
            }

            // Se o usuário pediu para pesquisar algo no chat, ele também vai ao PC e busca!
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
            return `Deu um tilt aqui (${provider.toUpperCase()}): ${err.message}. Se bateu o limite diário, troca de IA lá no ⚙️ que eu continuo daqui!`;
        }
    }

    async callGemini(apiKey, systemPrompt, userPrompt, isAutonomous) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;

        const contents = isAutonomous
            ? [{ role: 'user', parts: [{ text: userPrompt }] }]
            : [
                ...this.memory.state.chatHistory.slice(-10).map(msg => ({
                    role: msg.role === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.text }]
                })),
                { role: 'user', parts: [{ text: userPrompt }] }
            ];

        const body = {
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents,
            generationConfig: {
                temperature: 0.85,
                maxOutputTokens: 240
            }
        };

        // No chat normal, ativa Google Search Grounding nativo do Gemini para respostas atualizadas
        if (!isAutonomous) {
            body.tools = [{ googleSearch: {} }];
        }

        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error.message);
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "...";
    }

    async callOpenAI(apiKey, systemPrompt, userPrompt, isAutonomous) {
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

        const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages,
                temperature: 0.85,
                max_tokens: 240
            })
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error.message);
        return data.choices?.[0]?.message?.content || "...";
    }
}