# Backlog de estabilização

Cada item abaixo deve virar uma issue independente.

Os tickets já refinados, com prioridade, escopo e critérios de aceite, estão em [ISSUES.md](ISSUES.md).

## Produto funcional

- [ ] Implementar edição de perfil com avatar e bio.
- [ ] Implementar edição e exclusão de rice na interface.
- [ ] Criar página permanente `/rices/:id` para compartilhamento.
- [ ] Implementar paginação ou infinite scroll no feed.
- [ ] Implementar ordenação por recente, top e hot.
- [ ] Implementar galeria de múltiplas imagens no upload e detalhe.
- [ ] Implementar lineage e criação de fork usando `parent_rice_id`.
- [ ] Implementar busca por tags e aplicativos usados.

## Segurança de dotfiles

- [ ] Armazenar uploads novos em quarentena.
- [ ] Detectar arquivos compactados inválidos e zip bombs.
- [ ] Detectar possíveis segredos antes da publicação.
- [ ] Gerar SHA-256 e manifesto do pacote.
- [ ] Servir downloads por URL assinada.
- [ ] Criar worker assíncrono somente quando o pipeline de análise existir.

## Qualidade

- [ ] Adicionar testes de controller para autenticação e autorização.
- [ ] Adicionar testes de serviço para votos, comentários e ownership.
- [ ] Adicionar testes de integração PostgreSQL com Testcontainers.
- [ ] Adicionar testes E2E do fluxo cadastro → publicação → comentário.
- [ ] Adicionar observabilidade e logs estruturados.
- [ ] Adicionar política de backup e restauração.
