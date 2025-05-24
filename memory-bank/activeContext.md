# Active Context

## Foco Atual

* Verificar se usar `bunx serve` no `CMD` do `Dockerfile.frontend` resolve o erro `Cannot find module '/usr/src/app/frontend/serve'`.

## Mudanças Recentes

* Alterado o `CMD` no `Dockerfile.frontend` de `["serve", ...]` para `["bunx", "serve", ...]`.
* Alterado o mapeamento de porta no `docker-compose.yml` para `frontend` para `"3001:3000"`.
* Builds do frontend e backend bem-sucedidos.

## Próximos Passos

1.  Tentar o deploy novamente (`docker compose up --build -d`).
2.  Verificar os logs do container `frontend-1`.
3.  Se bem-sucedido, acessar o frontend em `http://SEU_IP_DA_VPS:3001`.
4.  Se o erro persistir ou um novo surgir, analisar o log.
5.  Se o deploy for bem-sucedido, documentar o sucesso.

## Decisões e Considerações Ativas

* O erro `Cannot find module` geralmente indica que o Node.js não consegue localizar o script ou módulo especificado para execução.
* Usar `bunx` (semelhante ao `npx`) pode ajudar a resolver problemas de path para executáveis de pacotes instalados.
* O arquivo `bun.lockb` (mencionado anteriormente, mas agora `bun.lock`) é essencial para a instalação de dependências com `bun install`.
* O erro original `COPY package.json bun.lockb ./` foi devido a um nome de arquivo incorreto.

## Padrões e Preferências Importantes

*N/A (será preenchido conforme o projeto avança)*

## Aprendizados e Insights do Projeto

* O contexto de build do Docker é crucial. Arquivos não presentes no contexto não podem ser copiados para a imagem.
* É importante verificar os nomes exatos dos arquivos, incluindo extensões e formatos (ex: `bun.lock` vs `bun.lockb`).
* A imagem base do Docker (`node:18-alpine`) pode não incluir todas as ferramentas necessárias (como `bun`), que precisam ser instaladas explicitamente.
* Erros de "port is already allocated" indicam que a porta do host especificada no `docker-compose.yml` já está em uso. Pode ser resolvido liberando a porta ou alterando o mapeamento no `docker-compose.yml`.
* Erros `Cannot find module` ao executar comandos no `CMD` podem ocorrer se o executável não estiver no `PATH` ou não for chamado corretamente; `npx` ou `bunx` podem ser soluções. 