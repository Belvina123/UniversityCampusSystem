# Colaboração no GitHub — Smart Campus Core

> Repositório oficial: **https://github.com/acorreialabs/UniversityCampusSystem**  
> Clone SSH: `git@github.com:acorreialabs/UniversityCampusSystem.git`

> **Grupos de estudantes:** comecem pelo **[Guia de contribuição para grupos](./guia-contribuicao-grupos.md)** (fork, clone, setup local, PR passo a passo).  
> Este documento complementa com regras técnicas e governança.

---

## 1. Modelo de repositório

```text
acorreialabs/UniversityCampusSystem   ← upstream (oficial, Core estável)
        ↑
        │ Pull Request
        │
<conta-estudante>/UniversityCampusSystem   ← fork (desenvolvimento do grupo)
        │
        └── feature/grupo-<area>-<modulo>   ← branch de trabalho
```

| Conceito | Função |
| --- | --- |
| **upstream** | Repositório oficial UJAC / coordenação |
| **fork** | Cópia do projecto na conta GitHub de cada grupo |
| **branch `main`** | Core estável — **protegida**, só entra via PR revisto |
| **branch `feature/...`** | Desenvolvimento de um módulo ou correcção |

---

## 2. Estrutura de branches (oficial)

### 2.1 Branch principal

| Branch | Quem usa | Regra |
| --- | --- | --- |
| `main` | Todos (leitura) | **Nunca** commit directo; só merge via PR aprovado |

### 2.2 Branches de trabalho (grupos)

Formato obrigatório:

```text
feature/grupo-<area>-<modulo>-<objectivo-curto>
```

| Área (`<area>`) | Exemplos de módulo |
| --- | --- |
| `academico` | courses, subjects, enrolments, assessments |
| `gestao` | laboratories, equipment, buildings |
| `iot` | sensors, readings, mqtt-bridge |
| `manutencao` | maintenance |
| `relatorios` | reports |
| `core` | melhorias ao Core (só com acordo da coordenação) |

**Exemplos válidos:**

```text
feature/grupo-academico-courses-crud
feature/grupo-iot-readings-mqtt
feature/grupo-gestao-laboratories-ui
fix/grupo-academico-enrolments-validacao
docs/grupo-iot-api-readings
```

**Exemplos inválidos:**

```text
main-backup
joao-trabalho
feature/novo-modulo        ← falta área e grupo
```

### 2.3 Branches de release (coordenação)

Reservadas à coordenação / docente:

```text
release/<versao>          ex.: release/1.1.0
hotfix/<descricao>        ex.: hotfix/auth-token-expiry
```

---

## 3. Fluxo recomendado para grupos (fork)

### Passo 1 — Fork no GitHub

1. Abrir https://github.com/acorreialabs/UniversityCampusSystem  
2. Clicar **Fork** → criar fork na conta do grupo ou líder  
3. Opcional: adicionar colegas como colaboradores **no fork**

### Passo 2 — Clonar o fork

```bash
git clone git@github.com:<SUA-CONTA>/UniversityCampusSystem.git
cd UniversityCampusSystem
```

### Passo 3 — Configurar upstream

```bash
git remote add upstream git@github.com:acorreialabs/UniversityCampusSystem.git
git remote -v
# origin    → seu fork
# upstream  → repositório oficial
```

### Passo 4 — Sincronizar antes de começar

```bash
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

### Passo 5 — Criar branch do módulo

Consultar [modulos-por-grupo.md](./modulos-por-grupo.md) para saber qual módulo é do grupo.

```bash
git checkout -b feature/grupo-academico-courses-crud
```

### Passo 6 — Desenvolver

Seguir:

- [integration-guide.md](./integration-guide.md)  
- [manual-apis-core.md](./manual-apis-core.md)  
- [CONTRIBUTING.md](../CONTRIBUTING.md)

Antes de cada commit:

```bash
npm test
npm run build
```

### Passo 7 — Push para o fork

```bash
git push -u origin feature/grupo-academico-courses-crud
```

### Passo 8 — Pull Request para upstream

1. No GitHub, abrir PR: **fork → `acorreialabs/UniversityCampusSystem` `main`**  
2. Preencher o template de PR  
3. Marcar módulo e grupo no título, ex.:  
   `[Grupo Académico] feat: CRUD de cursos`  
4. Aguardar revisão da coordenação e CI verde  

### Passo 9 — Manter branch actualizada

```bash
git fetch upstream
git checkout feature/grupo-academico-courses-crud
git merge upstream/main
# resolver conflitos se existirem
git push origin feature/grupo-academico-courses-crud
```

---

## 4. Fluxo alternativo (colaborador directo no repo oficial)

Se a coordenação adicionar o grupo como **collaborator** no repositório oficial:

```bash
git clone git@github.com:acorreialabs/UniversityCampusSystem.git
cd UniversityCampusSystem
git checkout -b feature/grupo-iot-sensors-api
# ... desenvolver ...
git push -u origin feature/grupo-iot-sensors-api
# abrir PR para main no mesmo repositório
```

**Mesmas regras:** nunca push directo para `main`.

---

## 5. O que cada grupo pode / não pode alterar

### Pode alterar (no seu módulo)

| Área | Localização típica |
| --- | --- |
| API do módulo | `apps/api/src/modules/<modulo>/` |
| Páginas UI | `apps/web/src/pages/` |
| Componentes | `apps/web/src/components/` |
| DTOs | `packages/shared-types` (entrada do seu módulo) |
| Validação | `packages/validation` (schemas do módulo) |
| Cliente API | `packages/api-client` (métodos do módulo) |
| Schema BD | `prisma/schema.prisma` + migração |
| Docs | `docs/openapi.yaml`, manual do módulo |

### Não alterar sem acordo da coordenação

| Área | Motivo |
| --- | --- |
| Auth, JWT, middleware global | Core partilhado |
| Estrutura de monorepo / workspaces | Estabilidade |
| Roles base e seed de utilizadores demo | Demonstração comum |
| `apps/api/src/app.ts` (excepto registar router) | Composição central |
| Remover ou renomear endpoints Core existentes | Quebra consumidores |
| Credenciais ou `.env` | Segurança |

### Registar novo router (permitido)

Em `apps/api/src/app.ts`:

```ts
import { coursesRouter } from './modules/courses/http/coursesRouter.js';
v1.use(coursesRouter);
```

---

## 6. Convenções de commits e PRs

### Commits

```text
feat(academic): adicionar CRUD de cursos
fix(iot): corrigir leitura MQTT duplicada
docs(parking): actualizar manual LPR
test(incidents): teste de transição de estado
```

### Título de PR

```text
[Grupo Académico] feat: CRUD de cursos e listagem UI
[Grupo IoT] feat: ingestão de leituras MQTT
[Core] fix: validação refresh token
```

### Checklist obrigatório (PR)

Ver `.github/pull_request_template.md`. Resumo:

- [ ] `npm test` passa  
- [ ] `npm run build` passa  
- [ ] OpenAPI actualizado (se API nova)  
- [ ] `campusModules` com estado correcto  
- [ ] Sem `.env` nem segredos  
- [ ] Migração Prisma incluída (se BD)  
- [ ] RBAC no backend  

---

## 7. Resolução de conflitos

Conflitos frequentes:

| Ficheiro | Estratégia |
| --- | --- |
| `packages/shared-types/src/index.ts` | Manter entradas de todos os módulos; não apagar DTOs alheios |
| `apps/web/src/App.tsx` | Acrescentar rotas; não remover rotas Core |
| `prisma/schema.prisma` | Combinar modelos; uma migração coerente |
| `docs/openapi.yaml` | Fundir paths de todos os módulos |

```bash
git fetch upstream
git merge upstream/main
# editar ficheiros em conflito
npm run db:generate
npm test
git add .
git commit -m "merge: sincronizar com upstream/main"
```

---

## 8. Protecção de branches (configuração upstream)

A coordenação deve activar no GitHub (**Settings → Branches**):

| Regra | Valor recomendado |
| --- | --- |
| Branch protegida | `main` |
| Require pull request | Sim |
| Require status checks | CI (`build-test`) |
| Require branches up to date | Sim |
| Restrict pushes | Só maintainers na `main` |
| Allow fork syncing | Sim |

---

## 9. CI automático

Cada PR dispara `.github/workflows/ci.yml`:

1. PostgreSQL de teste  
2. `npm install` → migrate → seed  
3. Build pacotes partilhados  
4. `npm test`  

**PR só deve ser merged com CI verde.**

---

## 10. Atribuição de módulos por grupo

Mapa oficial: [modulos-por-grupo.md](./modulos-por-grupo.md).

Antes de abrir PR, confirmar que o módulo está atribuído ao grupo ou abrir issue **Module proposal**.

---

## 11. Comandos de referência rápida

```bash
# Estado
git status
git branch -a

# Sincronizar fork
git fetch upstream && git merge upstream/main

# Nova feature
git checkout -b feature/grupo-<area>-<modulo>-<obj>

# Qualidade antes de PR
npm test && npm run build

# Push
git push -u origin HEAD
```

---

## 12. Contactos e governança

| Papel | Responsabilidade |
| --- | --- |
| **Coordenação / docente** | Aprovar PRs, proteger `main`, atribuir módulos |
| **Líder de grupo** | Fork, branch, PR, resolver conflitos |
| **Grupo** | Implementar módulo dentro do escopo |

Issues:

- Bug Core → template **Bug report**  
- Novo módulo / dúvida de escopo → template **Module proposal**  

---

*Documento de referência para PTP III — Smart Campus UJAC.*
