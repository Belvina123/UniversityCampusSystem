# Guia de contribuição para grupos — Smart Campus Core

> **Para quem:** Grupos de estudantes da PTP III (UJAC)  
> **Repositório oficial (upstream):** https://github.com/acorreialabs/UniversityCampusSystem  
> **Versão:** 1.0 — Agosto 2026

Este documento explica **passo a passo**, desde zero, como:

1. Obter o projecto na vossa máquina  
2. Criar um **fork** no GitHub  
3. Configurar o ambiente local  
4. Desenvolver o **vosso módulo** numa branch  
5. Enviar um **Pull Request** para o repositório oficial  

Leiam também: [modulos-por-grupo.md](./modulos-por-grupo.md) (qual módulo é do vosso grupo).

---

## Índice

1. [Antes de começar](#1-antes-de-começar)
2. [Visão geral (como funciona)](#2-visão-geral-como-funciona)
3. [Passo 1 — Conta GitHub e acesso](#3-passo-1--conta-github-e-acesso)
4. [Passo 2 — Criar o fork](#4-passo-2--criar-o-fork)
5. [Passo 3 — Clonar para a vossa máquina](#5-passo-3--clonar-para-a-vossa-máquina)
6. [Passo 4 — Ligar ao repositório oficial (upstream)](#6-passo-4--ligar-ao-repositório-oficial-upstream)
7. [Passo 5 — Instalar e correr o projecto](#7-passo-5--instalar-e-correr-o-projecto)
8. [Passo 6 — Confirmar que tudo funciona](#8-passo-6--confirmar-que-tudo-funciona)
9. [Passo 7 — Saber qual módulo desenvolver](#9-passo-7--saber-qual-módulo-desenvolver)
10. [Passo 8 — Criar a branch de trabalho](#10-passo-8--criar-a-branch-de-trabalho)
11. [Passo 9 — Desenvolver o módulo](#11-passo-9--desenvolver-o-módulo)
12. [Passo 10 — Commits](#12-passo-10--commits)
13. [Passo 11 — Enviar para o GitHub (push)](#13-passo-11--enviar-para-o-github-push)
14. [Passo 12 — Abrir Pull Request](#14-passo-12--abrir-pull-request)
15. [Passo 13 — Após revisão e merge](#15-passo-13--após-revisão-e-merge)
16. [Manter o fork actualizado](#16-manter-o-fork-actualizado)
17. [Trabalho em equipa no mesmo grupo](#17-trabalho-em-equipa-no-mesmo-grupo)
18. [Erros comuns e soluções](#18-erros-comuns-e-soluções)
19. [Checklist antes de abrir PR](#19-checklist-antes-de-abrir-pr)
20. [Referências](#20-referências)

---

## 1. Antes de começar

### Software necessário na máquina

| Software | Versão mínima | Verificar |
| --- | --- | --- |
| **Git** | 2.x | `git --version` |
| **Node.js** | 20+ (22 recomendado) | `node --version` |
| **npm** | 10+ | `npm --version` |
| **Docker Desktop** | recente | `docker --version` |
| Conta **GitHub** | — | https://github.com/join |

### Conhecimentos úteis (não obrigatório no dia 1)

- Terminal (bash, zsh ou PowerShell)
- JavaScript / TypeScript básico
- Noções de REST API

### Regra de ouro

> **Nunca trabalhem directamente na branch `main`.**  
> Toda a contribuição do grupo entra numa branch `feature/grupo-...` e depois num **Pull Request**.

---

## 2. Visão geral (como funciona)

```text
┌─────────────────────────────────────────────────────────────┐
│  GitHub — repositório OFICIAL (upstream)                    │
│  acorreialabs/UniversityCampusSystem                        │
│  branch: main  ← Core estável, protegida                    │
└───────────────────────────▲─────────────────────────────────┘
                            │
                     Pull Request (PR)
                            │
┌───────────────────────────┴─────────────────────────────────┐
│  GitHub — vosso FORK                                        │
│  <vossa-conta>/UniversityCampusSystem                       │
│  branch: feature/grupo-academico-courses-crud                 │
└───────────────────────────▲─────────────────────────────────┘
                            │
                       git push
                            │
┌───────────────────────────┴─────────────────────────────────┐
│  Vossa MÁQUINA (clone local do fork)                        │
│  pasta: UniversityCampusSystem/                             │
└─────────────────────────────────────────────────────────────┘
```

| Termo | Significado simples |
| --- | --- |
| **upstream** | Repo oficial do docente / coordenação |
| **fork** | Cópia do repo na **vossa** conta GitHub |
| **clone** | Cópia do fork **no disco** da vossa máquina |
| **branch** | Linha de trabalho separada (ex.: o vosso módulo) |
| **PR (Pull Request)** | Pedido para integrar o vosso código no oficial |

---

## 3. Passo 1 — Conta GitHub e acesso

### 3.1 Criar conta

1. Ir a https://github.com/join  
2. Escolher username (ex.: `maria-silva-ujac`)  
3. Confirmar email  

### 3.2 Acesso ao repositório

| Situação do repo | O que fazer |
| --- | --- |
| **Público** (actual) | Qualquer pessoa pode ver e fazer fork |
| **Privado** | O docente deve convidar-vos em **Settings → Collaborators**; só depois conseguem clonar/fork |

Se o repositório for privado e não tiverem acesso, peçam ao docente o convite **antes** de clonar.

---

## 4. Passo 2 — Criar o fork

O **fork** é feito **no site do GitHub**, não no terminal.

1. Abrir: https://github.com/acorreialabs/UniversityCampusSystem  
2. Clicar no botão **Fork** (canto superior direito)  
3. Escolher **a vossa conta** como destino  
4. Manter o nome `UniversityCampusSystem`  
5. Confirmar **Create fork**  

Após alguns segundos terão:

```text
https://github.com/<VOSA-CONTA>/UniversityCampusSystem
```

**Um fork por grupo** (recomendado): o líder do grupo cria o fork e adiciona colegas como colaboradores no fork (**Settings → Collaborators** no fork).

---

## 5. Passo 3 — Clonar para a vossa máquina

Escolham uma pasta de trabalho (ex.: `Documentos/PTP3/`).

### Opção A — HTTPS (mais simples para iniciantes)

```bash
cd ~/Documentos/PTP3
git clone https://github.com/<VOSA-CONTA>/UniversityCampusSystem.git
cd UniversityCampusSystem
```

O GitHub pede autenticação. Usem **Personal Access Token** (não a password da conta):

1. GitHub → **Settings → Developer settings → Personal access tokens**  
2. Criar token com permissão `repo`  
3. Usar o token como password quando o Git pedir  

### Opção B — SSH (recomendado a longo prazo)

```bash
# Gerar chave (se ainda não tiverem)
ssh-keygen -t ed25519 -C "vosso-email@ujac.ac.mz"

# Adicionar chave pública em GitHub → Settings → SSH and GPG keys
cat ~/.ssh/id_ed25519.pub

# Clonar
git clone git@github.com:<VOSA-CONTA>/UniversityCampusSystem.git
cd UniversityCampusSystem
```

### Verificar

```bash
git remote -v
```

Deve aparecer `origin` apontando para **o vosso fork**, não para o repo do docente:

```text
origin  git@github.com:<VOSA-CONTA>/UniversityCampusSystem.git (fetch)
origin  git@github.com:<VOSA-CONTA>/UniversityCampusSystem.git (push)
```

---

## 6. Passo 4 — Ligar ao repositório oficial (upstream)

Isto permite **actualizar** o vosso fork quando o Core oficial muda.

```bash
git remote add upstream git@github.com:acorreialabs/UniversityCampusSystem.git
```

(Se preferirem HTTPS:)

```bash
git remote add upstream https://github.com/acorreialabs/UniversityCampusSystem.git
```

Confirmar:

```bash
git remote -v
```

Resultado esperado:

```text
origin    → vosso fork
upstream  → repo oficial (acorreialabs)
```

Sincronizar pela primeira vez:

```bash
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

---

## 7. Passo 5 — Instalar e correr o projecto

Na pasta do clone (`UniversityCampusSystem/`):

### 7.1 Variáveis de ambiente

```bash
cp .env.example .env
```

O ficheiro `.env` **não** deve ser enviado para o GitHub (já está no `.gitignore`).

### 7.2 Dependências

```bash
npm install
```

### 7.3 Base de dados (PostgreSQL via Docker)

```bash
docker compose up -d db
```

Aguardar o contentor ficar healthy (10–30 segundos).

### 7.4 Prisma (schema + dados demo)

```bash
npm run db:generate
npm run db:migrate:dev
npm run db:seed
```

> Se for a **primeira vez** no projecto e pedir nome de migração, usem o que já existe no repo ou `--name init` conforme o README.

### 7.5 Compilar pacotes partilhados

```bash
npm run build -w @smart-campus/shared-types
npm run build -w @smart-campus/validation
npm run build -w @smart-campus/api-client
```

### 7.6 Arrancar API + frontend

```bash
npm run dev
```

Ou em dois terminais:

```bash
npm run dev:api    # porta 4100
npm run dev:web    # porta 5173
```

---

## 8. Passo 6 — Confirmar que tudo funciona

| Teste | URL / comando | Resultado esperado |
| --- | --- | --- |
| Health API | http://localhost:4100/health | `"status": "ok"` |
| Swagger | http://localhost:4100/api/docs | Página OpenAPI |
| Frontend | http://localhost:5173 | Ecrã de login |
| Login demo | `admin@smartcampus.demo` / `Admin123!` | Entrada em `/ops` |

Credenciais completas: [README.md](../README.md).

Testes automáticos:

```bash
npm test
```

Se algo falhar, ver [secção 18 — Erros comuns](#18-erros-comuns-e-soluções).

---

## 9. Passo 7 — Saber qual módulo desenvolver

1. Abrir [modulos-por-grupo.md](./modulos-por-grupo.md)  
2. Encontrar a **vossa área** (Académico, IoT, Infra, etc.)  
3. Ver o módulo com estado `development` ou `partial` atribuído ao grupo  
4. Anotar a **branch sugerida** (ex.: `feature/grupo-academico-courses-crud`)  

Se o módulo não estiver atribuído, abram uma **Issue → Module proposal** no GitHub antes de começar.

**Não desenvolvam módulos de outro grupo** sem combinar com a coordenação.

---

## 10. Passo 8 — Criar a branch de trabalho

Sempre partir de `main` actualizada:

```bash
git checkout main
git fetch upstream
git merge upstream/main
```

Criar a branch (substituir pelo nome do vosso módulo):

```bash
git checkout -b feature/grupo-academico-courses-crud
```

### Convenção de nomes (obrigatória)

```text
feature/grupo-<area>-<modulo>-<objectivo-curto>
```

| Parte | Exemplos |
| --- | --- |
| `area` | `academico`, `iot`, `infra`, `manutencao`, `relatorios` |
| `modulo` | `courses`, `sensors`, `laboratories`, `reports` |
| `objectivo` | `crud`, `ui`, `mqtt`, `validacao` |

Exemplos válidos:

```text
feature/grupo-iot-readings-mqtt
feature/grupo-infra-laboratories-crud
fix/grupo-academico-enrolments-validacao
```

---

## 11. Passo 9 — Desenvolver o módulo

Seguir o guia técnico: [integration-guide.md](./integration-guide.md).

### Resumo do que normalmente se altera

| O quê | Onde |
| --- | --- |
| Modelos BD | `prisma/schema.prisma` + migração |
| API backend | `apps/api/src/modules/<modulo>/` |
| Validação | `packages/validation/src/index.ts` |
| Tipos / menu | `packages/shared-types/src/index.ts` |
| Cliente HTTP | `packages/api-client/src/index.ts` |
| Página UI | `apps/web/src/pages/` + rota em `App.tsx` |
| Documentação API | `docs/openapi.yaml` |

### O que **não** devem alterar sem autorização

- Autenticação JWT (`modules/auth/`)
- Middleware global
- Remover endpoints Core existentes
- Credenciais ou ficheiros `.env`

### Durante o desenvolvimento

```bash
# Depois de alterar schema.prisma
npx prisma migrate dev --name descricao_curta
npm run db:generate

# Testar frequentemente
npm test
npm run build
```

Documentação de APIs: [manual-apis-core.md](./manual-apis-core.md).

---

## 12. Passo 10 — Commits

Verificar o que mudou:

```bash
git status
git diff
```

Adicionar ficheiros ( **nunca** `git add .env` ):

```bash
git add apps/ packages/ prisma/ docs/
# ou ficheiros específicos
git add apps/api/src/modules/courses/
```

Commit com mensagem clara:

```bash
git commit -m "feat(academic): adicionar listagem e criação de cursos"
```

### Formato sugerido

```text
feat(<modulo>): descrição curta
fix(<modulo>): correcção
docs(<modulo>): documentação
test(<modulo>): testes
```

Exemplos:

```text
feat(iot): endpoint GET /sensors/:id/readings com paginação
fix(academic): validar código de curso duplicado
docs(courses): actualizar openapi.yaml
```

---

## 13. Passo 11 — Enviar para o GitHub (push)

Primeira vez nesta branch:

```bash
git push -u origin feature/grupo-academico-courses-crud
```

Próximos commits na mesma branch:

```bash
git push
```

O código fica no **vosso fork**, na branch de feature — **ainda não** entrou no repo oficial.

---

## 14. Passo 12 — Abrir Pull Request

1. Ir ao **vosso fork** no GitHub  
2. Aparece banner **Compare & pull request** — clicar  
   - Ou: repo oficial → **Pull requests** → **New pull request**  
   - **base:** `acorreialabs/UniversityCampusSystem` → `main`  
   - **compare:** `<vossa-conta>/UniversityCampusSystem` → `feature/grupo-...`  

3. **Título** (exemplo):

```text
[Grupo Académico] feat: CRUD de cursos e página de listagem
```

4. Preencher o template do PR (grupo, módulo, testes, screenshots)  

5. Verificar que o **CI** (check `build-test`) fica verde  

6. Clicar **Create pull request**  

7. Aguardar **revisão do docente** (mínimo 1 aprovação)  

### O que acontece no PR

| Estado CI | Significado |
| --- | --- |
| ✅ Verde | Testes passaram — bom sinal |
| ❌ Vermelho | Corrigir erros, fazer push na mesma branch |

---

## 15. Passo 13 — Após revisão e merge

Se o docente pedir alterações:

```bash
# Na mesma branch local
# ... fazer correcções ...
git add .
git commit -m "fix(academic): aplicar feedback do PR"
git push
```

O PR actualiza-se automaticamente.

Quando o PR for **merged**:

```bash
git checkout main
git fetch upstream
git merge upstream/main
git push origin main
```

Opcional — apagar branch local:

```bash
git branch -d feature/grupo-academico-courses-crud
```

---

## 16. Manter o fork actualizado

Façam isto **semanalmente** ou antes de iniciar trabalho novo:

```bash
git checkout main
git fetch upstream
git merge upstream/main
git push origin main
```

Se já têm uma branch de feature activa:

```bash
git checkout feature/grupo-academico-courses-crud
git merge upstream/main
# resolver conflitos se aparecerem
git push
```

### Conflitos frequentes

| Ficheiro | Dica |
| --- | --- |
| `packages/shared-types/src/index.ts` | Manter entradas de **todos** os módulos |
| `apps/web/src/App.tsx` | **Adicionar** rotas, não remover as Core |
| `prisma/schema.prisma` | Combinar modelos; correr `db:generate` |

---

## 17. Trabalho em equipa no mesmo grupo

### Modelo recomendado

| Papel | Tarefa |
| --- | --- |
| **Líder** | Fork, upstream, branch, abrir PR |
| **Colegas** | Clone do fork ou colaboradores no fork |

### Colegas no mesmo fork

1. Líder: fork → **Settings → Collaborators** → adicionar colegas  
2. Colegas clonam **o mesmo fork**:

```bash
git clone git@github.com:<CONTA-DO-LIDER>/UniversityCampusSystem.git
```

3. Todos trabalham na **mesma branch** de feature (comunicar antes de `push`)  
   - Ou cada um numa sub-branch: `feature/grupo-academico-courses-crud-joao` → merge interno antes do PR  

### Antes de cada push em equipa

```bash
git pull origin feature/grupo-academico-courses-crud
# resolver conflitos localmente
git push
```

---

## 18. Erros comuns e soluções

| Problema | Solução |
| --- | --- |
| `Permission denied (publickey)` | Configurar SSH key no GitHub |
| `npm install` falha | Node 20+; apagar `node_modules` e repetir |
| API não arranca | Verificar `.env`; JWT secrets com ≥ 32 caracteres |
| `Can't reach database` | `docker compose up -d db`; verificar Docker a correr |
| Import `@smart-campus/*` falha | Build dos pacotes (secção 7.5) |
| `git push` rejeitado na `main` | Normal — usar branch `feature/...` |
| PR com conflitos | `git merge upstream/main` na branch e resolver |
| CI vermelho no PR | Correr `npm test && npm run build` localmente |
| Commitou `.env` por engano | **Não fazer push**; `git reset`; pedir ajuda se já pushou |

---

## 19. Checklist antes de abrir PR

- [ ] Branch com nome `feature/grupo-<area>-<modulo>-...`
- [ ] `npm test` passa localmente
- [ ] `npm run build` passa localmente
- [ ] Sem ficheiro `.env` no commit
- [ ] OpenAPI actualizado (se criaram endpoints)
- [ ] `campusModules` com estado correcto (`partial` / `available`)
- [ ] RBAC no backend (quem pode fazer o quê)
- [ ] Branch sincronizada com `upstream/main`
- [ ] Título do PR indica **grupo** e **módulo**
- [ ] Screenshots ou curls no PR (se UI/API nova)

---

## 20. Referências

| Documento | Conteúdo |
| --- | --- |
| [modulos-por-grupo.md](./modulos-por-grupo.md) | Módulos por grupo |
| [integration-guide.md](./integration-guide.md) | Integração técnica |
| [manual-apis-core.md](./manual-apis-core.md) | APIs e testes |
| [colaboracao-github.md](./colaboracao-github.md) | Regras GitHub (detalhe) |
| [CONTRIBUTING.md](../CONTRIBUTING.md) | Convenções do repo |
| [README.md](../README.md) | Instalação e credenciais demo |

---

## Resumo em 12 comandos (cola rápida)

```bash
# 1. Fork no GitHub (browser) → depois:
git clone git@github.com:<VOSA-CONTA>/UniversityCampusSystem.git
cd UniversityCampusSystem
git remote add upstream git@github.com:acorreialabs/UniversityCampusSystem.git

# 2. Setup local
cp .env.example .env && npm install
docker compose up -d db
npm run db:generate && npm run db:migrate:dev && npm run db:seed
npm run build -w @smart-campus/shared-types
npm run build -w @smart-campus/validation
npm run build -w @smart-campus/api-client

# 3. Branch de trabalho
git fetch upstream && git checkout main && git merge upstream/main
git checkout -b feature/grupo-<area>-<modulo>-<obj>

# 4. Desenvolver → testar → commit → push → PR no GitHub
npm test && npm run build
git add . && git commit -m "feat(<modulo>): descrição"
git push -u origin HEAD
```

---

**Dúvidas?** Abram uma **Issue** no repositório (template *Module proposal* ou *Bug report*) ou falem com o docente / coordenação.

*Smart Campus Core — UJAC / PTP III*
