# Active Context

## Foco Atual

* Verificar se a alteração da porta do host para `3001` no `docker-compose.yml` resolve o erro de alocação de porta.

## Mudanças Recentes

* Alterado o mapeamento de porta no `docker-compose.yml` para o serviço `frontend` de `"3000:3000"` para `"3001:3000"`.
* Builds do frontend e backend bem-sucedidos.

## Próximos Passos

1.  Tentar o deploy novamente (`docker compose up --build -d` - o `--build` pode não ser estritamente necessário, mas não prejudica).
2.  Acessar o frontend em `http://SEU_IP_DA_VPS:3001`.
3.  Se o erro persistir ou um novo surgir, analisar o log.
4.  Se o deploy for bem-sucedido, documentar o sucesso.

## Decisões e Considerações Ativas

* O arquivo `bun.lockb` é essencial para a instalação de dependências com `bun install`.
* O erro ocorre na etapa `COPY package.json bun.lockb ./` do `Dockerfile.frontend`.

## Padrões e Preferências Importantes

*N/A (será preenchido conforme o projeto avança)*

## Aprendizados e Insights do Projeto

* O contexto de build do Docker é crucial. Arquivos não presentes no contexto não podem ser copiados para a imagem.
* É importante verificar os nomes exatos dos arquivos, incluindo extensões e formatos (ex: `bun.lock` vs `bun.lockb`).
* A imagem base do Docker (`node:18-alpine`) pode não incluir todas as ferramentas necessárias (como `bun`), que precisam ser instaladas explicitamente.
* Erros de "port is already allocated" indicam que a porta do host especificada no `docker-compose.yml` já está em uso. Pode ser resolvido liberando a porta ou alterando o mapeamento no `docker-compose.yml`. 