# Contribuindo

O RiceBowl está em fase alpha. Antes de implementar uma mudança ampla, abra uma issue ou discussão para alinhar o escopo.

## Ambiente local

1. Copie `.env.example` para `.env`.
2. Execute `docker compose up --build`.
3. Abra `http://localhost:5173`.

## Validação

Frontend:

```bash
cd frontend
npm ci
npm run lint
npm run build
```

Backend:

```bash
cd backend
./mvnw verify
```

Use branches `feat/<issue>-descricao` ou `fix/<issue>-descricao`. Mantenha cada pull request focado em uma única mudança observável.

Nunca envie arquivos reais da sua pasta pessoal, chaves, tokens, cookies ou outros segredos como fixtures de teste.
