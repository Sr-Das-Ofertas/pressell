import dotenv from 'dotenv'; // Importar dotenv
dotenv.config(); // Carregar variáveis do .env para process.env
console.log("Valor de CLIENT_ID lido do .env:", process.env.CLIENT_ID); // DEBUG
console.log("Valor de API_KEY lido do .env:", process.env.API_KEY);     // DEBUG

import fetch from 'node-fetch'; // Alterado para import ES Module
import express from 'express'; // express também pode ser importado assim se "type": "module"
import cors from 'cors';     // cors também pode ser importado assim

const app = express();
const PORT = process.env.PORT || 3002; // Porta alterada para 3002
const FF_NEW_BASE_URL_FROM_ENV = process.env.FF_NEW_BASE_URL; // Nova variável

// Credenciais e URL da API ff.deaddos.online
const API_KEY_API = process.env.API_KEY; // Já lê do .env
const FF_API_BASE_URL = "https://free-fire-data-main.vercel.app/api/data"; // Nova URL da API

// Webhook do Discord para notificações
const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1378036772239315100/59C3Sc3KL-WQOmNDBGvM6blr0VGUv8Gh_dH34n1IiHaRYH_E7duGlBx9nAPQC9SbrLqq";

let lastPlayerData = null; // Variável para armazenar temporariamente os dados do jogador

// Função para enviar notificação ao Discord
async function sendDiscordNotification(playerUid, error, details) {
    try {
        const embed = {
            embeds: [{
                title: "⚠️ Falha na API Free Fire",
                description: `Falha ao buscar dados após 3 tentativas`,
                color: 15158332, // Vermelho
                fields: [
                    {
                        name: "🆔 Player UID",
                        value: `\`${playerUid}\``,
                        inline: true
                    },
                    {
                        name: "🌍 Região",
                        value: "BR",
                        inline: true
                    },
                    {
                        name: "⏰ Timestamp",
                        value: new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
                        inline: true
                    },
                    {
                        name: "❌ Erro",
                        value: `\`\`\`${error}\`\`\``,
                        inline: false
                    }
                ],
                footer: {
                    text: "Pressell Backend Monitor"
                },
                timestamp: new Date()
            }]
        };

        // Se houver detalhes adicionais, adiciona como campo
        if (details && Object.keys(details).length > 0) {
            embed.embeds[0].fields.push({
                name: "📋 Detalhes",
                value: `\`\`\`json\n${JSON.stringify(details, null, 2).substring(0, 1000)}\`\`\``,
                inline: false
            });
        }

        const response = await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(embed)
        });

        if (!response.ok) {
            console.error('Erro ao enviar notificação ao Discord:', response.status, response.statusText);
        } else {
            console.log('Notificação enviada ao Discord com sucesso');
        }
    } catch (error) {
        console.error('Erro ao enviar notificação ao Discord:', error);
    }
}

app.use(cors()); // Habilita CORS para que o frontend possa chamar este backend
app.use(express.json()); // Middleware para parsear JSON no corpo de requisições (não usado neste GET, mas bom ter)

// Endpoint que o frontend chamará
app.get('/api/checkplayer', async (req, res) => {
    const { PlayerUid } = req.query; // Pega PlayerUid da query string, remove region
    const fixedRegion = 'br'; // Região fixa para a API

    if (!PlayerUid) { // Verifica apenas PlayerUid
        return res.status(400).json({ error: "PlayerUid é obrigatório." });
    }
    if (!API_KEY_API) {
        console.error("Backend: API_KEY não configurada no .env");
        return res.status(500).json({ error: "Configuração do servidor incompleta." });
    }

    // Monta os parâmetros para a nova API (ff.deaddos.online)
    const paramsToNewAPI = new URLSearchParams({
        uid: PlayerUid,
        key: API_KEY_API
    });

    let dataFromNewAPI = null;
    let apiResponse = null;
    let lastError = null;
    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            console.log(`Backend: Tentativa ${attempt} para PlayerUid: ${PlayerUid}. Região fixa: ${fixedRegion}. Usando API: ${FF_API_BASE_URL}`);
            apiResponse = await fetch(`${FF_API_BASE_URL}/${fixedRegion}?${paramsToNewAPI.toString()}`);
            dataFromNewAPI = await apiResponse.json();

            if (apiResponse.ok && !dataFromNewAPI.error) {
                break; // Sucesso, sai do loop
            } else {
                lastError = dataFromNewAPI.error || dataFromNewAPI.message || `Erro desconhecido na tentativa ${attempt}`;
                console.error(`Backend: Erro da API ff.deaddos.online (tentativa ${attempt}):`, dataFromNewAPI);
            }
        } catch (error) {
            lastError = error.message || error;
            console.error(`Backend: Erro ao fazer proxy para a API ff.deaddos.online (tentativa ${attempt}):`, error);
        }
    }

    if (!apiResponse || !apiResponse.ok || (dataFromNewAPI && dataFromNewAPI.error)) {
        lastPlayerData = null; // Limpa em caso de erro
        const errorMessage = lastError || "Erro ao buscar dados do jogador na API externa.";
        
        // Envia notificação ao Discord
        await sendDiscordNotification(PlayerUid, errorMessage, dataFromNewAPI);
        
        return res.status(apiResponse && apiResponse.status ? apiResponse.status : 500).json({ error: errorMessage, details: dataFromNewAPI });
    }
    
    console.log("Backend: Resposta da API ff.deaddos.online recebida.");

    // Transforma a resposta da nova API para a estrutura esperada pelo frontend
    // Frontend espera: data.result.AccountInfo e data.result.socialinfo/captainBasicInfo
    const transformedData = {
        result: {
            AccountInfo: {
                AccountName: dataFromNewAPI.basicInfo?.nickname || 'N/A',
                AccountLevel: dataFromNewAPI.basicInfo?.level || 'N/A',
                AccountRegion: dataFromNewAPI.basicInfo?.region || 'N/A',
                AccountLastLogin: dataFromNewAPI.basicInfo?.lastLoginAt // O frontend faz o new Date(... * 1000)
            },
            socialinfo: { // Usado pelo frontend para playerAccountIdEl
                AccountID: dataFromNewAPI.basicInfo?.accountId || dataFromNewAPI.socialInfo?.accountId || PlayerUid
            },
            captainBasicInfo: { // Também usado como fallback para playerAccountIdEl
                accountId: dataFromNewAPI.basicInfo?.accountId || dataFromNewAPI.socialInfo?.accountId || PlayerUid
            }
            // Adicionar outros campos de creditScoreInfo se necessário pelo frontend no futuro
        }
    };
    
    // Armazena os dados relevantes do jogador se a verificação for bem-sucedida
    if (dataFromNewAPI.basicInfo) {
        lastPlayerData = {
            playerUid: PlayerUid, // O UID original usado na busca
            region: fixedRegion,     // A região fixa usada na busca
            accountName: dataFromNewAPI.basicInfo.nickname,
            accountId: dataFromNewAPI.basicInfo.accountId || dataFromNewAPI.socialInfo?.accountId || PlayerUid,
        };
    } else {
        lastPlayerData = null;
    }
    res.json(transformedData); // Envia a resposta transformada para o frontend
});

// Novo endpoint para o backend realizar o redirecionamento
app.get('/api/perform-redirect', (req, res) => {
    if (!FF_NEW_BASE_URL_FROM_ENV) {
        console.error('Backend: FF_NEW_BASE_URL não configurada no .env');
        return res.status(500).send('Erro: Configuração do servidor incompleta para redirecionamento.');
    }
    if (lastPlayerData && lastPlayerData.playerUid) {
        const queryParams = new URLSearchParams({
            playerUid: lastPlayerData.playerUid,
            region: lastPlayerData.region, // Continua usando a região armazenada (fixa)
            accountName: lastPlayerData.accountName || '',
            accountId: lastPlayerData.accountId || ''
            // Adicione mais parâmetros conforme necessário
        });
        const redirectUrl = `${FF_NEW_BASE_URL_FROM_ENV}/?${queryParams.toString()}`;
        console.log(`Backend: Redirecionando para ${redirectUrl}`);
        lastPlayerData = null; // Limpa os dados após o uso para evitar reutilização indevida
        res.redirect(302, redirectUrl);
    } else {
        console.warn('Backend: Nenhum dado de jogador válido para redirecionar. Redirecionando para a base URL do ff-new.');
        // Fallback: redireciona para a base URL do ff-new sem parâmetros se não houver dados do jogador
        // Ou você pode redirecionar para uma página de erro ou a página inicial do pressell
        lastPlayerData = null; // Limpa os dados
        res.redirect(302, FF_NEW_BASE_URL_FROM_ENV);
    }
});

app.listen(PORT, () => {
    console.log(`Servidor backend rodando em http://localhost:${PORT}`);
    if (FF_NEW_BASE_URL_FROM_ENV) {
        console.log(`URL base do ff-new configurada para: ${FF_NEW_BASE_URL_FROM_ENV}`);
    } else {
        console.warn('AVISO: A variável FF_NEW_BASE_URL não está definida no arquivo .env.');
    }
    console.log("Certifique-se de que pressell/index.html está configurado para chamar este servidor.");
    console.log("Use CTRL+C para parar o servidor.");
});

// Tratamento para erros não capturados que podem fechar o servidor
process.on('uncaughtException', (error) => {
  console.error('Erro não capturado:', error);
  // Considere encerrar o processo graciosamente aqui em produção, se necessário
  // process.exit(1); 
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Rejeição de Promise não tratada:', reason);
  // Considere encerrar o processo graciosamente aqui em produção, se necessário
  // process.exit(1);
}); 