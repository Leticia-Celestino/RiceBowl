# RiceBowl

RiceBowl é uma plataforma em estágio **alpha** para descobrir e compartilhar customizações de desktops Linux junto aos respectivos dotfiles.

O MVP atual oferece cadastro e login, feed pesquisável, filtros por distro e WM/DE, perfis públicos, publicação com capa e arquivo de configuração, votos, comentários e download dos dotfiles.

> O pipeline de análise de arquivos ainda está no roadmap. Não use a versão atual para hospedar uploads não confiáveis em produção.

## Stack

- React 19, TypeScript, Vite e Tailwind CSS 4
- Java 21 e Spring Boot 4
- PostgreSQL 16 e Flyway
- storage local desacoplado por interface
- Docker Compose

## Executar com Docker

Requisitos: Docker com Compose v2.

```bash
cp .env.example .env
docker compose up --build
```

Serviços:

- Web: <http://localhost:5173>
- API direta para desenvolvimento: <http://localhost:8080>
- Swagger UI: <http://localhost:8080/swagger-ui.html>

A web funciona como origem única: chamadas `/api/*` e arquivos `/uploads/*` são encaminhados pelo Nginx para a API. O Compose cria automaticamente volumes persistentes para o banco e para os uploads.

## Desenvolvimento sem containers da aplicação

Suba apenas as dependências:

```bash
docker compose up postgres
```

Backend:

```bash
cd backend
./mvnw spring-boot:run
```

Frontend:

```bash
cd frontend
npm ci
npm run dev
```

## Verificação

```bash
cd frontend && npm run lint && npm run build
cd ../backend && ./mvnw verify
```

Os testes do backend usam H2 em memória e não exigem um PostgreSQL local. Testes de integração PostgreSQL com Testcontainers estão planejados.

## Estado atual

Funcional:

- autenticação JWT e cadastro;
- sessão web em cookie HttpOnly com proteção CSRF;
- feed público com busca, filtros e paginação incremental;
- perfis e rices por autor;
- upload validado de imagem e arquivo ZIP/TAR;
- inspeção de assinatura, traversal, links, expansão excessiva e segredos de alta confiança em arquivos compactados;
- votos com rollback visual em falha;
- comentários públicos e autenticados para escrita;
- exclusão do rice pelo autor;
- ambiente completo por Docker Compose;
- estados de publicação `DRAFT`/`PUBLISHED` e limpeza de rascunhos abandonados;
- CI para frontend, backend e configuração Compose.

Planejado:

- edição de perfil e publicação;
- página permanente e galeria completa;
- forks/remixes e lineage;
- análise de segredos, manifesto e quarentena de uploads;
- integração com Reddit e repositórios Git;
- responsividade e rebranding.

Veja [docs/ISSUES.md](docs/ISSUES.md) para tickets priorizados e [docs/BACKLOG.md](docs/BACKLOG.md) para a visão resumida.

## Contribuição e segurança

- [Guia de contribuição](CONTRIBUTING.md)
- [Política de segurança](SECURITY.md)

Antes de publicar dotfiles, revise o pacote e remova tokens, chaves, cookies, histórico e dados pessoais.
