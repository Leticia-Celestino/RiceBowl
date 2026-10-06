# Issues propostas

Os itens abaixo são pequenos o suficiente para uma pull request. A ordem indicada respeita dependências e reduz retrabalho.

## P0 — segurança e confiabilidade

### 1. Rejeitar conteúdo incompatível com a extensão

**Escopo:** validar a assinatura binária de PNG, JPEG, WEBP, GIF, ZIP, GZIP e XZ, sem confiar apenas em `Content-Type` ou nome.

**Aceite:** arquivo renomeado é rejeitado com HTTP 400; formatos válidos continuam aceitos; testes cobrem cada assinatura.

### 2. Impedir path traversal e archive bombs

**Escopo:** inspecionar entradas do arquivo compactado, bloquear caminhos absolutos/`..`, links e limites abusivos de quantidade e tamanho descompactado.

**Aceite:** pacotes maliciosos são rejeitados antes da publicação; limites são configuráveis; existem testes com fixtures hostis.

### 3. Detectar segredos no pacote de dotfiles

**Escopo:** executar scanner em quarentena antes de disponibilizar o download e retornar achados sem expor o segredo.

**Aceite:** tokens/chaves de teste bloqueiam a publicação; falso positivo pode ser removido pelo autor; status aparece na API.

### 4. Tornar publicação e uploads um único fluxo recuperável

**Escopo:** criar estado `DRAFT`/`PROCESSING`/`PUBLISHED` e expirar rascunhos incompletos, substituindo a compensação feita somente pelo frontend.

**Aceite:** falha ou abandono não deixa publicação visível nem arquivos órfãos; limpeza automática possui teste.

### 5. Cobrir autorização e ownership

**Escopo:** testes de integração para criar, alterar arquivos, votar, comentar e excluir como autor, outro usuário e anônimo.

**Aceite:** matriz esperada de 200/201/204/401/403/404 passa na CI.

## P1 — núcleo social

### 6. Criar página permanente de rice

**Escopo:** adicionar `/rices/:id`, carregamento direto, metadados de compartilhamento e estado 404.

**Aceite:** recarregar ou compartilhar a URL abre a publicação correta; modal e página reutilizam o mesmo componente de detalhe.

### 7. Editar e excluir publicação

**Escopo:** permitir ao autor alterar texto, distro, WM/DE, tags, capa e pacote, com confirmação de exclusão.

**Aceite:** controles só aparecem ao autor; substituição remove o arquivo antigo; erros preservam os dados do formulário.

### 8. Editar perfil

**Escopo:** bio, avatar e links permitidos, com limites e sanitização.

**Aceite:** perfil público reflete a edição; usuário não pode editar outro perfil; avatar possui fallback.

### 9. Adicionar ordenação recente, top e hot

**Escopo:** parâmetros de ordenação paginados na API e seletor persistente no feed.

**Aceite:** ordenações têm critério documentado, desempate estável e testes de paginação sem duplicatas.

### 10. Implementar forks/remixes

**Escopo:** criar publicação derivada por `parent_rice_id` e mostrar crédito ao original.

**Aceite:** ciclos são impossíveis; origem aparece no card e detalhe; exclusão do original não apaga derivados.

### 11. Adicionar notificações essenciais

**Escopo:** notificar comentário, voto agregado e fork, com leitura individual e total não lido.

**Aceite:** eventos não duplicam; o próprio autor não se auto-notifica; paginação existe.

## P2 — descoberta e integrações

### 12. Buscar por tags e aplicativos

**Escopo:** filtros combináveis, chips clicáveis e índices adequados no PostgreSQL.

**Aceite:** URL representa os filtros; limpar filtro restaura feed; plano da consulta não faz varredura evitável.

### 13. Integrar Reddit somente por link/importação

**Escopo:** vincular uma publicação existente do Reddit, armazenar URL, subreddit e autor declarado, sem copiar conteúdo automaticamente.

**Aceite:** URL é validada; vínculo aparece com atribuição; integração continua opcional e desacoplada do domínio principal.

### 14. Importar dotfiles de repositório Git

**Escopo:** aceitar URL e revisão explícita, baixar em worker isolado e passar pelo mesmo pipeline de segurança do upload.

**Aceite:** revisão fica registrada; repositório privado não é suportado inicialmente; timeout e tamanho são limitados.

## P3 — experiência e operação

### 15. Auditoria responsiva por breakpoint

**Escopo:** corrigir navegação, feed, cards, modal, upload e perfil em 360, 768, 1024 e 1440 px.

**Aceite:** sem overflow horizontal; alvos interativos têm pelo menos 44 px; fluxo principal funciona apenas por teclado.

### 16. Criar tokens e direção de rebranding

**Escopo:** inventário visual, moodboard, tipografia, escala, cores semânticas e componentes-base antes de redesenhar páginas.

**Aceite:** tokens substituem valores soltos; contraste AA; uma página piloto valida a direção antes da migração completa.

### 17. Adicionar E2E do caminho crítico

**Escopo:** automatizar cadastro → login → publicação → upload → voto → comentário → exclusão.

**Aceite:** teste roda contra Compose na CI, usa dados descartáveis e captura artefatos ao falhar.

### 18. Definir backup, restauração e observabilidade

**Escopo:** logs estruturados, health/readiness, métricas mínimas, backup de PostgreSQL e uploads e ensaio de restauração.

**Aceite:** runbook documentado; restauração é testada; nenhuma credencial aparece em logs.
