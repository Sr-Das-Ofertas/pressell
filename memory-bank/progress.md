# Progress

## O que funciona

*N/A (o deploy está falhando no momento)*

## O que falta construir/resolver

* Confirmar que a correção do `bun.lock` no `Dockerfile.frontend` resolve o problema de deploy.
* Garantir que o deploy do frontend e backend seja bem-sucedido.

## Status Atual

* **Pendente de Teste:** Foi aplicada uma correção para o erro de `bun.lockb` not found. Aguardando novo teste de deploy.

## Problemas Conhecidos

* ~~O arquivo `bun.lockb` não está sendo encontrado no contexto de build do `Dockerfile.frontend`.~~ (Potencialmente resolvido pela alteração para `bun.lock`)
* ~~O comando `COPY package.json bun.lockb ./` no `Dockerfile.frontend` está causando o erro.~~ (Potencialmente resolvido)

## Evolução das Decisões do Projeto

* **Decisão Inicial:** Usar `bun` para gerenciamento de dependências.
* **Problema Encontrado:** Dificuldade em fazer o `bun.lockb` acessível durante o build do Docker.
* **Correção Aplicada:** Alterado o `Dockerfile.frontend` para copiar `bun.lock` em vez de `bun.lockb`, pois `bun.lock` é o arquivo presente no projeto. 