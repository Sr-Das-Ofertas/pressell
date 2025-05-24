# Active Context

## Foco Atual

* Verificar se a instalação global do `bun` no `Dockerfile.frontend` resolve o erro `bun: not found`.

## Mudanças Recentes

* Adicionado `RUN npm install -g bun` ao `Dockerfile.frontend` antes do passo `RUN bun install --production --no-save`.
* Correção anterior: Alterado `COPY package.json bun.lockb ./` para `COPY package.json bun.lock ./`.

## Próximos Passos

1.  Tentar o deploy novamente.
2.  Se o erro persistir, analisar o novo log de erro.
3.  Se o deploy for bem-sucedido, documentar o sucesso.

## Decisões e Considerações Ativas

* O arquivo `bun.lockb` é essencial para a instalação de dependências com `bun install`.
* O erro ocorre na etapa `COPY package.json bun.lockb ./` do `Dockerfile.frontend`.

## Padrões e Preferências Importantes

*N/A (será preenchido conforme o projeto avança)*

## Aprendizados e Insights do Projeto

* O contexto de build do Docker é crucial. Arquivos não presentes no contexto não podem ser copiados para a imagem.
* É importante verificar os nomes exatos dos arquivos, incluindo extensões e formatos (ex: `bun.lock` vs `bun.lockb`).
* A imagem base do Docker (`node:18-alpine`) pode não incluir todas as ferramentas necessárias (como `bun`), que precisam ser instaladas explicitamente. 