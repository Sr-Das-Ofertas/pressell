# Use uma imagem base oficial do Node.js.
# Escolha uma versão LTS (Long Term Support) que seja compatível com suas dependências.
FROM node:18-alpine

# Defina o diretório de trabalho dentro do container
WORKDIR /usr/src/app/backend

# Copie os arquivos package.json e package-lock.json (ou bun.lockb se usar Bun para o backend)
# Isso aproveita o cache de camadas do Docker. Se esses arquivos não mudarem,
# as dependências não serão reinstaladas desnecessariamente.
COPY package.json ./
# Se você tiver um package-lock.json (comum com npm), descomente a linha abaixo:
# COPY package-lock.json ./
# Se você estiver usando bun para o backend e tiver um bun.lockb, use:
# COPY bun.lockb ./

# Instale as dependências do backend
# Como o package.json do backend não especifica 'bun', vamos usar npm que é padrão com node.
RUN npm install --production

# Copie o restante do código da aplicação do backend para o diretório de trabalho
COPY . .

# Exponha a porta em que seu backend está rodando (ex: 3002)
# Verifique seu arquivo backend/server.js para confirmar a porta
EXPOSE 3002

# Comando para iniciar seu servidor backend
CMD [ "node", "server.js" ] 