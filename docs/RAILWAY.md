# Deploy no Railway

O deploy inicial usa três serviços no mesmo projeto Railway:

- `Postgres`: plugin PostgreSQL gerenciado pelo Railway.
- `api`: serviço criado a partir de `backend/Dockerfile`, com o volume persistente em `/data/uploads`.
- `web`: serviço criado a partir de `frontend/Dockerfile`, único serviço exposto publicamente.

## 1. Criar o projeto e os serviços

1. Entre em [railway.app](https://railway.app), crie um projeto vazio e adicione **PostgreSQL**.
2. Adicione um serviço a partir do repositório GitHub `Leticia-Celestino/RiceBowl`.
3. No serviço da API, configure **Root Directory** como `/` e o Dockerfile como `backend/Dockerfile`.
4. No serviço web, adicione o mesmo repositório e configure o Dockerfile como `frontend/Dockerfile`.
5. No serviço `api`, crie um volume Railway montado em `/data/uploads`.
6. Gere um domínio público apenas para `web`. A API deve permanecer privada na rede Railway.

## 2. Variáveis da API

Configure estas variáveis no serviço `api` (os nomes à direita são referências do serviço PostgreSQL):

```text
SPRING_PROFILES_ACTIVE=prod
DATABASE_URL=jdbc:postgresql://${{Postgres.PGHOST}}:${{Postgres.PGPORT}}/${{Postgres.PGDATABASE}}
DATABASE_USER=${{Postgres.PGUSER}}
DATABASE_PASSWORD=${{Postgres.PGPASSWORD}}
JWT_SECRET=<segredo aleatório com pelo menos 32 caracteres>
AUTH_COOKIE_SECURE=true
AUTH_COOKIE_SAME_SITE=Lax
STORAGE_LOCAL_PATH=/data/uploads
CORS_ALLOWED_ORIGINS=https://<dominio-do-web>
```

O `DATABASE_URL` é deliberadamente montado no formato `jdbc:postgresql://`, pois esse é o formato esperado pelo driver JDBC do Spring. Não use diretamente a variável `DATABASE_URL` nativa do Postgres se ela vier como `postgresql://`.

No serviço `api`, configure o healthcheck para:

```text
/actuator/health/readiness
```

## 3. Variáveis do web

No serviço `web`, configure:

```text
API_UPSTREAM=http://api.railway.internal:8080
```

Se o Railway mostrar outro hostname privado para o serviço `api`, use exatamente esse hostname. O Nginx encaminha `/api/*` e `/uploads/*` para a API, então o navegador usa uma única origem e não precisa conhecer o endereço interno.

O Nginx escuta automaticamente a porta `PORT` fornecida pelo Railway. Localmente, o Compose fixa `PORT=80`.

## 4. Ordem de validação

Depois do primeiro deploy:

1. Abra o domínio do `web` e confirme que a aplicação carrega.
2. Verifique `https://<dominio-do-web>/api/actuator/health/readiness`.
3. Registre uma conta, faça login, crie um rice e teste upload, publicação, voto, comentário e exclusão.
4. Reinicie o serviço `api` e confirme que os uploads continuam disponíveis; esse teste valida o volume persistente.
5. Só depois associe um domínio próprio.

## CLI (opcional)

O CLI não é necessário para o primeiro deploy pelo painel. Se preferir terminal, instale/execute `@railway/cli` e faça login pelo navegador; não coloque tokens Railway no repositório nem nesta conversa.
