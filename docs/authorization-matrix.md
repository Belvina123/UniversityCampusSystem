# Matriz de autorização

| Operação | STUDENT | TEACHER | TECHNICIAN | COORDINATOR | ADMIN |
| --- | --- | --- | --- | --- | --- |
| Consultar informação pública | Sim | Sim | Sim | Sim | Sim |
| Consultar perfil próprio | Sim | Sim | Sim | Sim | Sim |
| Criar ocorrência | Sim | Sim | Sim | Sim | Sim |
| Tratar ocorrência | Não | Não | Sim | Sim | Sim |
| Gerir salas | Não | Não | Parcial | Sim | Sim |
| Gerir utilizadores | Não | Não | Não | Parcial (listar) | Sim |
| Consultar auditoria | Não | Não | Não | Sim | Sim |

A autorização é aplicada no backend (`authenticate` + `authorize`).

## Extensão financeira

FINANCE é um perfil acrescentado pelo módulo financeiro. Não recebe permissões ADMIN/COORDINATOR nos outros módulos.

| Operação financeira | STUDENT | FINANCE | ADMIN | Outros perfis |
|---|---|---|---|---|
| Consultar dívida, estado, histórico e avisos | Apenas próprios | Sim | Sim | Não |
| Criar dívida e confirmar pagamento | Não | Sim | Sim | Não |
| Contestar dívida | Apenas própria | Não | Não | Não |
| Resolver contestação, consultar relatório, entrega e reenvio | Não | Sim | Sim | Não |
| Consultar/alterar política | Não | Não | Sim | Não |
