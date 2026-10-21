# Gestão Financeira — Smart Campus

Módulo financeiro integrado no Smart Campus Core. A implementação usa a
autenticação, os utilizadores, o Prisma, a auditoria, os contratos e o cliente
HTTP já existentes no Core.

## Funcionalidades

- Registo e consulta de dívidas.
- Confirmação de pagamentos integrais.
- Estado financeiro do estudante.
- Histórico e notificações financeiras.
- Submissão e resolução de contestações.
- Relatório financeiro e política de bloqueio.
- Controlo de acesso para `STUDENT`, `FINANCE` e `ADMIN`.

## Organização

| Área | Localização |
|---|---|
| API financeira | `apps/api/src/modules/financial` |
| Interface web | `apps/web/src/pages/FinancialPage.tsx` |
| Tipos partilhados | `packages/shared-types` |
| Validação | `packages/validation` |
| Cliente HTTP | `packages/api-client` |
| Modelos e migrações | `prisma` |
| Contrato da API | `docs/openapi.yaml` |

Todas as rotas do módulo começam por `/api/v1/financial`. O endpoint público
`/health` fica fora de `/api/v1`.

## Executar localmente

Requisitos: Node.js 20 ou superior, npm e Docker.

```bash
cp .env.example .env
npm install
docker compose up -d db
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Endereços locais:

- Interface: `http://localhost:5173`
- API: `http://localhost:4100/api/v1`
- Swagger: `http://localhost:4100/api/docs`
- Saúde da API: `http://localhost:4100/health`

As variáveis privadas devem ser configuradas no ficheiro `.env`, que não deve
ser enviado para o repositório. Não coloque tokens, palavras-passe reais ou
credenciais de serviços externos na documentação.

## Verificação

```bash
npm run build
npm run test:financial:isolated
```

O teste financeiro cria uma base PostgreSQL descartável, aplica as migrações,
executa o build e verifica a API e a interface. A base temporária é removida no
fim.

## Estado

O módulo está marcado como `partial`: os principais fluxos financeiros já
funcionam. A interface para a tesouraria consultar e tratar uma lista de
contestações permanece como evolução posterior.
