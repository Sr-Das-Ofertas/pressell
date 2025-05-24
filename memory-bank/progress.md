# Progress

## O que funciona

* O build Docker para o frontend e backend está funcionando corretamente.
* `bun` é instalado e consegue executar `bun install` no `Dockerfile.frontend`.

## O que falta construir/resolver

* Confirmar que a alteração da porta do host para `3001` no `docker-compose.yml` permite que o container do frontend inicie.
* Garantir que os containers do frontend e backend iniciem com sucesso e a aplicação esteja acessível.

## Status Atual

* **Pendente de Teste:** O mapeamento de porta do host para o frontend foi alterado para `3001:3000`. Aguardando novo teste de deploy.

## Problemas Conhecidos

* ~~O arquivo `bun.lockb` não está sendo encontrado no contexto de build do `Dockerfile.frontend`.~~ (Resolvido)
* ~~O comando `COPY package.json bun.lockb ./` no `Dockerfile.frontend` está causando o erro.~~ (Resolvido)
* ~~O comando `bun install` falha porque `bun` não está instalado na imagem Docker base.~~ (Resolvido)
* ~~A porta `3000` do host está ocupada, impedindo o container do frontend de iniciar.~~ (Potencialmente resolvido alterando a porta do host para `3001`)

## Evolução das Decisões do Projeto

* **Decisão Inicial:** Usar `bun` para gerenciamento de dependências.
* **Problema Encontrado:** Dificuldade em fazer o `bun.lockb` acessível durante o build do Docker.
* **Correção Aplicada:** Alterado o `Dockerfile.frontend` para copiar `bun.lock`.
* **Problema Encontrado:** `bun` não encontrado na imagem Docker.
* **Correção Aplicada:** Adicionado `RUN npm install -g bun` ao `Dockerfile.frontend`.
* **Sucesso no Build:** Os builds do frontend e backend agora são concluídos.
* **Novo Problema:** Conflito de alocação da porta `3000` do host.
* **Correção Aplicada:** Alterado o mapeamento de porta do host no `docker-compose.yml` para o serviço `frontend` de `"3000:3000"` para `"3001:3000"`. 