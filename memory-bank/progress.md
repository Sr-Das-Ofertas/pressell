# Progress

## O que funciona

* O build Docker para o frontend e backend está funcionando corretamente.
* `bun` é instalado e consegue executar `bun install` no `Dockerfile.frontend`.

## O que falta construir/resolver

* Confirmar que usar `bunx serve` no `CMD` do `Dockerfile.frontend` resolve o erro `Cannot find module '/usr/src/app/frontend/serve'`.
* Garantir que os containers do frontend e backend iniciem com sucesso e a aplicação esteja acessível.

## Status Atual

* **Pendente de Teste:** O `CMD` do `Dockerfile.frontend` foi alterado para `bunx serve`. Aguardando novo teste de deploy.

## Problemas Conhecidos

* ~~O arquivo `bun.lockb` não está sendo encontrado no contexto de build do `Dockerfile.frontend`.~~ (Resolvido)
* ~~O comando `COPY package.json bun.lockb ./` no `Dockerfile.frontend` está causando o erro.~~ (Resolvido)
* ~~O comando `bun install` falha porque `bun` não está instalado na imagem Docker base.~~ (Resolvido)
* ~~A porta `3000` do host está ocupada, impedindo o container do frontend de iniciar.~~ (Resolvido alterando a porta do host para `3001`)
* O container do frontend falha ao iniciar com `Error: Cannot find module '/usr/src/app/frontend/serve'`. (Potencialmente resolvido usando `bunx serve` no `CMD`)

## Evolução das Decisões do Projeto

* **Decisão Inicial:** Usar `bun` para gerenciamento de dependências.
* **Problema Encontrado:** Dificuldade em fazer o `bun.lockb` acessível durante o build do Docker.
* **Correção Aplicada:** Alterado o `Dockerfile.frontend` para copiar `bun.lock`.
* **Problema Encontrado:** `bun` não encontrado na imagem Docker.
* **Correção Aplicada:** Adicionado `RUN npm install -g bun` ao `Dockerfile.frontend`.
* **Sucesso no Build:** Os builds do frontend e backend agora são concluídos.
* **Novo Problema:** Conflito de alocação da porta `3000` do host.
* **Correção Aplicada:** Alterado o mapeamento de porta do host no `docker-compose.yml` para `"3001:3000"`.
* **Novo Problema:** Container do frontend não encontra o módulo `serve` no `CMD`.
* **Correção Aplicada:** Alterado `CMD` do `Dockerfile.frontend` para usar `bunx serve`. 