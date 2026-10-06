# Edge Ghosty: viabilidade do chat rápido com Codex

## Objetivo

Avaliar a ideia de abrir um chat rápido de IA por atalho global, sem pedir uma chave de API ao usuário, usando uma sessão local do Codex.

## Alterações realizadas

- Nenhuma alteração de código. A proposta recomendada é manter a interface de chat numa janela Tauri e conectar o backend Rust a um processo `codex app-server` oculto pela entrada/saída padrão (JSONL).
- O usuário faria login no Codex com a conta ChatGPT; isso dispensa inserir uma chave de API no Ghosty, mas usa os limites de acesso Codex da conta e o processamento do modelo continua online.
- O Ghosty deve executar ações locais por comandos explícitos e limitados no backend, como abrir destinos já validados e iniciar Foco; não delegar ações locais arbitrárias ao terminal do agente.
- Para um protótipo pessoal/local, avaliar o uso da autenticação local do app-server. Se o app for distribuído, seguir o fluxo oficial Sign in with ChatGPT; a documentação diz que autenticação app-server não é permitida em serviços comerciais ou hospedados.

## Arquivos tocados

- `docs/context/2026-10-06-edge-ghosty-chat-codex-viabilidade.md`

## Validações

- Consultada a documentação oficial OpenAI Docs sobre Codex CLI, execução não interativa, app-server e autenticação.
- Nenhuma compilação ou teste foi executado; não houve mudança de implementação.

## Problemas conhecidos

- O Codex é voltado a tarefas de programação e pode ter mais permissões e complexidade que um chat rápido precisa.
- A integração deve controlar permissões, selecionar ações suportadas e tratar limites/indisponibilidade da conta.
- Os hooks de presença do Codex já instalados pelo Ghosty podem reagir às sessões iniciadas pelo chat rápido; avaliar filtro ou tratamento dedicado na implementação.

## Próximos passos

- Se a ideia for aprovada para implementação, começar pelo atalho global, popup de chat e conexão persistente com `codex app-server` via stdio.
- Definir as primeiras ações permitidas: pesquisa web, abrir app/site/arquivo, iniciar Foco e executar atalhos salvos.
- Decidir o caminho de autenticação conforme o Ghosty permanecer pessoal/local ou passar a ser distribuído.
