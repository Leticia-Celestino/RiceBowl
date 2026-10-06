# { R } RiceBowl 🍚

![Status](https://img.shields.io/badge/Status-Em_Desenvolvimento-warning?style=for-the-badge&color=D79921)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-F2F4F9?style=for-the-badge&logo=spring-boot)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

A rede social definitiva para a comunidade de customização Linux (Ricing). Um espaço minimalista e de alta performance para compartilhar setups, debater configurações de Window Managers e hospedar dotfiles.

Desenvolvido com uma estética **Glassmorphism** e fortemente inspirado na paleta de cores **Gruvbox**.

---

## ✨ O Estado Atual do Projeto

O RiceBowl encontra-se em um estágio funcional e maduro (Fase 5 de desenvolvimento), contando com uma arquitetura robusta de Back-end (API REST) e um Front-end dinâmico. As seguintes funcionalidades já estão em produção:

### 🎨 Interface e Experiência (Front-end)
- **Vitrine Pública (Feed):** Layout no estilo *Masonry* (Pinterest-like), renderizando os setups sem cortes nas imagens.
- **Motor de Busca Responsivo:** Barra de pesquisa em tempo real com *debounce* (300ms) para otimização de chamadas à API, além de filtros combinados por Distro (Arch, Ubuntu, etc.) e Window Manager/DE (Hyprland, i3wm, GNOME).
- **Perfis de Usuário (`/profile/:nickname`):** Páginas dinâmicas atuando como portfólio pessoal, exibindo bio, contagem total de Setups e soma de **Karma** recebido.
- **Painel de Controle do Dono:** Identificação inteligente de sessão. O usuário logado visualiza opções administrativas (Editar/Deletar) apenas nos posts de sua autoria.
- **Sistema de Comentários em Tempo Real:** Atualizações otimistas da UI ao enviar comentários em um setup usando *Derived State* para performance.
- **Design System Consistente:** Componentização completa usando Tailwind CSS (tags, botões, inputs e modais translúcidos).

### ⚙️ Engenharia e Dados (Back-end)
- **Segurança JWT:** Sistema de autenticação via token JWT, com rotas públicas abertas para visitantes (`GET /rices`, `GET /users`) e bloqueio em rotas de mutação (`POST`, `DELETE`).
- **Paginação e Ordenação:** Consultas JPQL otimizadas para retornar *Pages* de DTOs, poupando banda e memória.
- **Versionamento de Banco de Dados:** Flyway configurado e gerenciando a evolução do *schema* relacional de forma segura e incremental (ex: adição dinâmica de colunas `avatar_url` e `bio`).
- **Tratamento de Exceções Global:** API blindada contra requisições malformadas e buscas por entidades inexistentes.

---

## 🛠️ Tecnologias Utilizadas

**Front-end (React + Vite):**
* TypeScript
* Tailwind CSS (Customizado com paleta Gruvbox)
* React Router DOM (Roteamento aninhado e layouts)
* Lucide React (Ícones minimalistas)

**Back-end (Java 21 + Spring Boot 3):**
* Spring Web & RESTful APIs
* Spring Security (Filtro JWT Stateless)
* Spring Data JPA & Hibernate
* Flyway (Migrations de Banco de Dados)
* Lombok (Redução de Boilerplate)

**Infraestrutura:**
* PostgreSQL 16 (Banco de Dados Relacional)
* Docker & Docker Compose (Containerização do BD e MinIO)

---

## 🚀 Próximos Passos (Roadmap)

Embora a espinha dorsal esteja pronta, as próximas atualizações trarão o polimento final à plataforma:

- [ ] **Fluxo de Deleção/Edição:** Ativar os botões do painel do usuário para realizar soft/hard deletes e atualizações de metadados dos Rices.
- [ ] **Edição de Perfil:** Permitir que o usuário edite sua Biografia e faça upload de um Avatar customizado (integração via MinIO).
- [ ] **Carrossel de Galeria:** Expandir a entidade de imagens para suportar múltiplos *screenshots* por postagem no modal de visualização.
- [ ] **Upload de Dotfiles (UI):** Desenvolver a tela final de criação (`/upload`), suportando envio simultâneo de imagens e arquivos compactados (`.tar.gz`/`.zip`).

---
