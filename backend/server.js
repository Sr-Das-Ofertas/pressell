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

// Credenciais da API HL Gaming lidas do .env
const USER_UID_API = process.env.CLIENT_ID;
const API_KEY_API = process.env.API_KEY;
const HL_GAMING_BASE_URL = "https://hl-gaming-official-main-api-beige.vercel.app/api";

let lastPlayerData = null; // Variável para armazenar temporariamente os dados do jogador

app.use(cors()); // Habilita CORS para que o frontend possa chamar este backend
app.use(express.json()); // Middleware para parsear JSON no corpo de requisições (não usado neste GET, mas bom ter)

// Endpoint que o frontend chamará
app.get('/api/checkplayer', async (req, res) => {
    const { PlayerUid, region } = req.query; // Pega PlayerUid e region da query string

    if (!PlayerUid || !region) {
        return res.status(400).json({ error: "PlayerUid e region são obrigatórios." });
    }

    // Monta os parâmetros para a API HL Gaming
    const paramsToHLGaming = new URLSearchParams({
        sectionName: "AllData", // Usando AllData como antes
        PlayerUid: PlayerUid,
        region: region,
        useruid: USER_UID_API, // Sua credencial segura
        api: API_KEY_API       // Sua credencial segura
    });

    try {
        console.log(`Backend: Recebida requisição para PlayerUid: ${PlayerUid}, Region: ${region}`);
        const apiResponse = await fetch(`${HL_GAMING_BASE_URL}?${paramsToHLGaming.toString()}`);
        const dataFromHLGaming = await apiResponse.json();

        if (!apiResponse.ok) {
            console.error("Backend: Erro da API HL Gaming:", dataFromHLGaming);
            lastPlayerData = null; // Limpa em caso de erro
            return res.status(apiResponse.status).json(dataFromHLGaming);
        }
        
        console.log("Backend: Resposta da API HL Gaming enviada para o frontend.");
        // Armazena os dados relevantes do jogador se a verificação for bem-sucedida
        if (dataFromHLGaming.result && dataFromHLGaming.result.AccountInfo) {
            lastPlayerData = {
                playerUid: PlayerUid, // O UID original usado na busca
                region: region,     // A região original usada na busca
                accountName: dataFromHLGaming.result.AccountInfo.AccountName,
                accountId: dataFromHLGaming.result.socialinfo?.AccountID || dataFromHLGaming.result.captainBasicInfo?.accountId || PlayerUid,
                // Adicione quaisquer outros dados que você queira passar
            };
        } else {
            lastPlayerData = null;
        }
        res.json(dataFromHLGaming); // Envia a resposta da API HL Gaming para o frontend

    } catch (error) {
        console.error("Backend: Erro ao fazer proxy para a API HL Gaming:", error);
        lastPlayerData = null; // Limpa em caso de erro
        res.status(500).json({ error: "Erro interno no servidor ao contatar a API de jogos." });
    }
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
            region: lastPlayerData.region,
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