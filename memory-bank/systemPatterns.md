# System Patterns

## Arquitetura do Sistema

* Aplicação composta por um frontend e um backend, containerizados com Docker.
* Orquestração de containers provavelmente via `docker-compose` (baseado no log de erro).

## Decisões Técnicas Chave

* Utilização de `bun` como gerenciador de pacotes e runtime JavaScript.
* `serve` para servir o frontend estático.

## Padrões de Design em Uso

*N/A (será preenchido conforme o projeto avança)*

## Relacionamento entre Componentes

* O `Dockerfile.frontend` é responsável por construir a imagem Docker do frontend.
* O `Dockerfile` (presumivelmente para o backend) constrói a imagem do backend.

## Caminhos Críticos de Implementação

* O processo de build do Docker para o frontend está falhando devido à ausência do `bun.lockb`. 