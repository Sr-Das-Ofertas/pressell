# Progress

## O que funciona

*N/A (o deploy está falhando no momento)*

## O que falta construir/resolver

* Confirmar que a instalação do `bun` no `Dockerfile.frontend` resolve o erro `bun: not found`.
* Garantir que o deploy do frontend e backend seja bem-sucedido.

## Status Atual

* **Pendente de Teste:** Foi aplicada uma correção para o erro `bun: not found` (instalando `bun` globalmente). Aguardando novo teste de deploy.

## Problemas Conhecidos

* ~~O arquivo `bun.lockb` não está sendo encontrado no contexto de build do `Dockerfile.frontend`.~~ (Resolvido pela alteração para `bun.lock`)
* ~~O comando `COPY package.json bun.lockb ./` no `Dockerfile.frontend` está causando o erro.~~ (Resolvido)
* O comando `bun install` falha porque `bun` não está instalado na imagem Docker base. (Potencialmente resolvido adicionando `RUN npm install -g bun`)

## Evolução das Decisões do Projeto

* **Decisão Inicial:** Usar `bun` para gerenciamento de dependências.
* **Problema Encontrado:** Dificuldade em fazer o `bun.lockb` acessível durante o build do Docker.
* **Correção Aplicada:** Alterado o `Dockerfile.frontend` para copiar `bun.lock` em vez de `bun.lockb`.
* **Problema Encontrado:** `bun` não encontrado na imagem Docker durante o build.
* **Correção Aplicada:** Adicionado `RUN npm install -g bun` ao `Dockerfile.frontend`. 