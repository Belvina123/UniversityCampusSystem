# Manual da API Financeira

Este manual descreve somente as rotas do módulo de gestão financeira. A API permite emitir e consultar dívidas, confirmar pagamentos, acompanhar o estado financeiro de estudantes, tratar contestações e administrar a política financeira.

As rotas estão implementadas em `apps/api/src/modules/financial/http/financialRouter.ts`. A especificação completa para Swagger encontra-se em [openapi.yaml](./openapi.yaml).

## 1. Antes de testar

Na raiz de `UniversityCampusSystem`, preparar uma base de dados própria do Core:

```bash
npm install
docker compose up -d db
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Endereços locais:

| Serviço | Endereço |
| --- | --- |
| Aplicação web | `http://localhost:5173` |
| API | `http://localhost:4100/api/v1` |
| Swagger | `http://localhost:4100/api/docs` |
| Verificação da API | `http://localhost:4100/health` |

Contas de demonstração relevantes:

| Perfil | Email | Palavra-passe |
| --- | --- | --- |
| ADMIN | `admin@smartcampus.demo` | `Admin123!` |
| FINANCE | `financas@smartcampus.demo` | `Finance123!` |
| STUDENT | `estudante@smartcampus.demo` | `Estudante123!` |

As contas de demonstração só existem depois de executar o seed.

## 2. Convenções da API

Todas as rotas deste manual começam por:

```text
/api/v1/financial
```

As rotas protegidas exigem um access token no cabeçalho:

```http
Authorization: Bearer <accessToken>
```

Um pedido que termina com sucesso devolve `data` e `meta`:

```json
{
  "data": {},
  "meta": {
    "correlationId": "..."
  }
}
```

Erros devolvem um código, uma mensagem, detalhes de validação quando existirem e o identificador de correlação:

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Dados inválidos",
  "details": [],
  "correlationId": "..."
}
```

## 3. Permissões

O controlo é feito no backend. Esconder uma opção na página não substitui a autorização da rota.

| Operação | STUDENT | FINANCE | ADMIN | Outros perfis |
| --- | --- | --- | --- | --- |
| Consultar dívidas, estado, histórico e avisos | Apenas os próprios | Sim | Sim | Não |
| Pesquisar estudantes existentes no Core | Não | Sim | Sim | Não |
| Consultar contestações e decisões | Apenas próprias | Sim | Sim | Não |
| Criar dívida e confirmar pagamento | Não | Sim | Sim | Não |
| Criar contestação | Apenas sobre dívida própria | Não | Não | Não |
| Resolver contestação, consultar relatório e consultar/repetir entrega de aviso | Não | Sim | Sim | Não |
| Consultar ou alterar política financeira | Não | Não | Sim | Não |

Sem token, a API devolve `401 UNAUTHORIZED`. Com um token válido mas sem a permissão necessária, devolve `403 FORBIDDEN`.

## 4. Rotas disponíveis

| Método | Rota | Perfis autorizados | Finalidade |
| --- | --- | --- | --- |
| GET | `/students` | FINANCE, ADMIN | Pesquisar identidades de estudantes |
| GET | `/analysis-requests` | STUDENT, FINANCE, ADMIN | Listar contestações autorizadas |
| GET | `/analysis-requests/:id` | STUDENT, FINANCE, ADMIN | Consultar contestação autorizada |
| GET | `/debts` | STUDENT, FINANCE, ADMIN | Listar dívidas |
| POST | `/debts` | FINANCE, ADMIN | Criar dívida |
| GET | `/debts/:id` | STUDENT, FINANCE, ADMIN | Consultar uma dívida |
| POST | `/payments` | FINANCE, ADMIN | Confirmar pagamento total |
| GET | `/students/:studentId/status` | STUDENT, FINANCE, ADMIN | Consultar estado financeiro |
| GET | `/students/:studentId/history` | STUDENT, FINANCE, ADMIN | Consultar histórico financeiro |
| GET | `/students/:studentId/notifications` | STUDENT, FINANCE, ADMIN | Consultar avisos financeiros |
| POST | `/analysis-requests` | STUDENT | Criar contestação |
| PATCH | `/analysis-requests/:id` | FINANCE, ADMIN | Resolver contestação |
| GET | `/reports` | FINANCE, ADMIN | Consultar resumo financeiro |
| GET | `/policies/:policyId` | ADMIN | Consultar política |
| PATCH | `/policies/:policyId` | ADMIN | Alterar política |
| GET | `/notifications/:notificationId/delivery` | FINANCE, ADMIN | Consultar estado de envio de aviso |
| POST | `/notifications/:notificationId/retry` | FINANCE, ADMIN | Pedir novo envio de aviso |

Para STUDENT, as rotas que recebem `studentId` confirmam que o ID corresponde ao utilizador autenticado. Por isso, um estudante não consegue consultar o histórico, o estado ou os avisos de outra pessoa.

## 5. Dívidas

### Listar dívidas

```http
GET /api/v1/financial/debts?offset=0&limit=20
```

`offset` começa em `0`; `limit` pode ir de `1` a `100`. FINANCE e ADMIN podem acrescentar `studentId` para consultar as dívidas de um estudante específico. Para STUDENT, o filtro é sempre o próprio utilizador.

### Criar dívida

```http
POST /api/v1/financial/debts
```

```json
{
  "studentId": "<id-do-utilizador-estudante>",
  "title": "Propina de Outubro",
  "description": "Mensalidade do período lectivo",
  "amount": 3500,
  "origin": "TUITION",
  "dueDate": "2026-10-31T23:59:59.000Z"
}
```

O `studentId` é o `id` de `User`, não a matrícula nem o ID de `StudentProfile`. O título tem entre 3 e 120 caracteres; o valor tem de ser positivo, até 1 000 000 e ter no máximo duas casas decimais. A data usa ISO 8601.

Uma criação válida devolve `201`. A operação cria a dívida, actualiza o estado financeiro do estudante, regista um aviso e escreve uma auditoria na mesma transacção.

### Consultar uma dívida

```http
GET /api/v1/financial/debts/:id
```

FINANCE e ADMIN podem consultar qualquer dívida. STUDENT só consulta dívidas cujo `studentId` seja o seu próprio ID. Uma dívida inexistente devolve `404 DEBT_NOT_FOUND`.

## 6. Pagamentos

```http
POST /api/v1/financial/payments
```

```json
{
  "debtId": "<id-da-divida>",
  "amountPaid": 3500,
  "paymentMethod": "BANK_TRANSFER",
  "referenceCode": "TRF-2026-0001"
}
```

Métodos aceites: `BANK_TRANSFER`, `CASH_DEPOSIT`, `MOBILE_MONEY` e `POS`.

O valor informado deve ser igual ao valor total da dívida. Se for diferente, a API devolve `400 PAYMENT_AMOUNT_MISMATCH`. Uma dívida regularizada não pode ser paga novamente e devolve `409 DEBT_ALREADY_REGULARIZED`.

O pagamento, a mudança da dívida para `REGULARIZADA`, a actualização do estado financeiro e a auditoria são gravados numa única transacção. Assim, uma falha não deixa um pagamento criado sem a actualização correspondente.

## 7. Estado, histórico e avisos

### Estado financeiro

```http
GET /api/v1/financial/students/:studentId/status
```

A resposta informa se o estudante está `ACTIVE` ou `BLOCKED`, além da quantidade e do valor de dívidas vencidas. O cálculo considera a política activa de tolerância e bloqueio.

### Histórico financeiro

```http
GET /api/v1/financial/students/:studentId/history?offset=0&limit=20
```

Devolve as listas paginadas de dívidas e pagamentos, o estado financeiro e os totais de dívida, pagamento e valor pendente. Os totais representam todo o histórico, mesmo quando as listas são paginadas.

### Avisos financeiros

```http
GET /api/v1/financial/students/:studentId/notifications?offset=0&limit=20
```

Lista os avisos do estudante, do mais recente para o mais antigo. Se o limite não for informado, a rota usa no máximo 30 avisos.

## 8. Contestações

### Consultar a fila e o detalhe

```http
GET /api/v1/financial/analysis-requests?status=PENDENTE_ANALISE&offset=0&limit=20
GET /api/v1/financial/analysis-requests/:id
```

FINANCE e ADMIN consultam todos os pedidos; STUDENT consulta apenas os próprios. A lista aceita também `studentId` e `debtId`. Um estudante que filtra outro `studentId` recebe 403. Os resultados incluem a identidade mínima do estudante e `{ id, code, title, amount }` da dívida, além da justificação, estado e decisão. `meta.total` conta os resultados filtrados e autorizados; `meta.offset`, `meta.limit` e `meta.hasMore` controlam a paginação. O limite padrão é 20 e o máximo é 100.

### Criar uma contestação

```http
POST /api/v1/financial/analysis-requests
```

```json
{
  "debtId": "<id-da-divida>",
  "reason": "Solicito a revisão desta cobrança porque o pagamento já foi efectuado."
}
```

Somente STUDENT pode criar uma contestação, e apenas para uma dívida própria. A justificação precisa de pelo menos 10 caracteres. Não é possível contestar uma dívida regularizada ou cancelada, nem abrir uma segunda contestação enquanto existir outra pendente para a mesma dívida.

### Resolver uma contestação

```http
PATCH /api/v1/financial/analysis-requests/:id
```

```json
{
  "decision": "PROCEDENTE",
  "resolutionNotes": "Comprovativo de pagamento validado pela tesouraria."
}
```

`decision` aceita `PROCEDENTE` ou `IMPROCEDENTE`; a nota de resolução tem pelo menos 5 caracteres. A decisão só pode ser tomada por FINANCE ou ADMIN. Quando a decisão é `PROCEDENTE`, a dívida é regularizada. Uma segunda decisão para o mesmo pedido devolve `409 ANALYSIS_REQUEST_ALREADY_RESOLVED`.

## 9. Relatório e política financeira

### Relatório

```http
GET /api/v1/financial/reports
```

Disponível para FINANCE e ADMIN. O relatório devolve contagens de dívidas por estado, total de pagamentos, número de estudantes bloqueados e a data de geração.

### Política

```http
GET /api/v1/financial/policies/DEFAULT_POLICY
PATCH /api/v1/financial/policies/DEFAULT_POLICY
```

Somente ADMIN consulta ou altera a política. O body de actualização é:

```json
{
  "gracePeriodDays": 5,
  "autoBlockEnabled": true,
  "maxDebtAmount": 0
}
```

`gracePeriodDays` aceita de 0 a 60. `maxDebtAmount` aceita de 0 a 1 000 000 e, quando tem casas decimais, usa no máximo duas. A rota de actualização trabalha apenas com `DEFAULT_POLICY`; outro identificador devolve `404 POLICY_NOT_FOUND`.

## 10. Entrega de avisos

```http
GET  /api/v1/financial/notifications/:notificationId/delivery
POST /api/v1/financial/notifications/:notificationId/retry
```

Estas rotas são para FINANCE e ADMIN. A primeira mostra o estado de entrega, número de tentativas, datas relevantes e o último erro registado. A segunda pede uma nova tentativa para um aviso pendente ou falhado.

O módulo só tenta comunicar com um serviço externo quando `NOTIFICATIONS_API_URL` e `NOTIFICATIONS_API_TOKEN` estão configurados. Sem essa configuração, `POST /retry` devolve `503 NOTIFICATIONS_NOT_CONFIGURED`. A criação de dívidas, pagamentos e decisões continua válida: a entrega externa não desfaz a operação financeira já concluída.

## 11. Validar no Swagger

1. Abrir `http://localhost:4100/api/docs`.
2. Em `POST /auth/login`, iniciar sessão como ADMIN e copiar `data.tokens.accessToken`.
3. Clicar em **Authorize** e informar o token.
4. Em `GET /users`, localizar e copiar o `id` de `estudante@smartcampus.demo`.
5. Em `POST /financial/debts`, criar uma dívida com esse ID. O resultado esperado é `201`.
6. Iniciar sessão como STUDENT, autorizar com o novo token e executar `GET /financial/debts`. A dívida criada deve aparecer.
7. Mantendo o token STUDENT, tentar `POST /financial/debts`. O resultado esperado é `403 FORBIDDEN`.
8. Remover o token em **Authorize** e repetir `GET /financial/debts`. O resultado esperado é `401 UNAUTHORIZED`.

Para validar entradas inválidas, enviar uma criação de dívida sem `title` ou com `amount` negativo. O resultado esperado é `400 VALIDATION_ERROR` e `details` descreve o campo que falhou.

## 12. Testes automatizados

O teste de integração financeiro está em:

```text
apps/api/src/modules/financial/http/financial.integration.test.ts
```

Para executar a validação numa base PostgreSQL descartável:

```bash
npm run test:financial:isolated
```

O comando aplica as migrações, executa o seed, compila os workspaces e corre os testes API e web. Os resultados são guardados em [integration-evidence](./integration-evidence/README.md). Não executar testes de escrita na base normal apenas para gerar evidência.

## 13. Limites actuais

A página `/financial` disponibiliza as operações existentes por perfil: dívidas, pagamento integral, histórico, submissão/decisão de contestações, avisos e reenvio, resumo de contagens e políticas. A criação de utilizadores pertence ao Core. Também há gestão salarial por FINANCE e relatórios mensais para FINANCE/ADMIN (secção 15). Não existem processos de prestações, financiamento, reembolso ou cancelamento administrativo de dívida neste incremento.

A entrega de avisos para um sistema externo depende de URL e token fornecidos pelo serviço de notificações. Sem essas credenciais, os avisos permanecem no estado local e não há confirmação de entrega externa.

## 14. Pesquisa de estudantes e interface por perfil

```http
GET /api/v1/financial/students?q=Ana&offset=0&limit=20
```

Somente FINANCE e ADMIN. `q` é opcional; quando fornecido, tem 2–100 caracteres após remover espaços exteriores e pesquisa parcialmente nome ou matrícula, sem distinguir maiúsculas. A resposta contém `userId`, `fullName`, `studentNumber` (ou null) e `isActive`. A pesquisa inclui contas inactivas e estudantes sem matrícula; não cria utilizadores. A paginação tem total filtrado, offset, limit e hasMore, com limite padrão 20 e máximo 100.

Na página Gestão financeira, FINANCE/ADMIN seleccionam o estudante pesquisado para registar dívidas/pagamentos e consultar o histórico. O estudante consulta o seu próprio histórico, contestações e avisos. A engrenagem de políticas aparece apenas para ADMIN. A criação de utilizadores mantém-se exclusivamente no Core. Ver [funcionalidades por perfil](decisions/frontend-financeiro-por-perfil.md).

## 15. Salários dos docentes e relatórios mensais

FINANCE gere os salários; ADMIN apenas consulta e imprime. A identidade académica e a criação de utilizadores permanecem nos respectivos módulos do Core.

| Método | Rota financeira | Perfis | Finalidade |
|---|---|---|---|
| GET | `/teachers?q=nome-ou-codigo&offset=0&limit=20` | FINANCE, ADMIN | Pesquisar perfis docentes existentes |
| GET | `/salaries?month=2026-10&offset=0&limit=20` | FINANCE, ADMIN | Consultar salários do período |
| POST | `/salaries` | FINANCE | Criar salário mensal |
| PATCH | `/salaries/:id` | FINANCE | Editar montante/notas enquanto pendente |
| POST | `/salaries/:id/payment` | FINANCE | Registar pagamento integral efectuado |
| GET | `/reports/payments?month=2026-10` | FINANCE, ADMIN | Relatório de recebimentos do mês |
| GET | `/reports/salaries?month=2026-10` | FINANCE, ADMIN | Relatório de salários pagos no mês |

Exemplo de criação:

```json
{"teacherId":"<TeacherProfile.id>","month":"2026-10","amount":15000,"notes":"Salário mensal"}
```

Exemplo de edição (usar a versão `updatedAt` devolvida na consulta):

```json
{"amount":17500,"notes":"Valor revisto","expectedUpdatedAt":"2026-10-24T08:00:00.000Z"}
```

Exemplo de confirmação salarial:

```json
{"amountPaid":17500,"paymentMethod":"BANK_TRANSFER","referenceCode":"SAL-2026-10-001","expectedUpdatedAt":"2026-10-24T08:00:00.000Z"}
```

O registo não transfere fundos. Salários pagos são imutáveis. Duplicação, referência repetida, versão desactualizada ou pagamento repetido devolvem 409; ADMIN recebe 403 em todas as escritas. O relatório filtra o mês da data do pagamento (hora de Moçambique) e pode ser impresso na página Relatórios mensais. Inclui todos os movimentos devolvidos; acima de 10 000 movimentos devolve 422, sem truncar. Ver [regras completas](decisions/salarios-relatorios-mensais.md).
