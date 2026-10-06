# Snapshot: aprovar pedidos do chat durante uma sessão

## Objetivo

Permitir que a pessoa ative a aprovação automática dos pedidos de permissão do chat atual para conversar com o Codex com menos interrupções, mantendo o modo desligado por padrão.

## Alterações

- Adicionado um controle de escudo para ligar/desligar a aprovação automática e um botão nos pedidos pendentes para ativar o modo enquanto aprova aquele pedido.
- Com o modo ativo, os pedidos seguintes de comando, alteração de arquivo e permissões de filesystem/rede são respondidos no escopo de sessão pelo protocolo do app-server. Concessões de permissões mantêm somente o subconjunto solicitado.
- O modo reinicia ao fechar o popup, iniciar outra conversa ou encerrar a sessão do app-server. Desligar o controle interrompe aprovações automáticas futuras; permissões de sessão já concedidas continuam ativas até a conversa ser reiniciada.
- Ajustado o espaço dos controles inferiores para acomodar o novo botão e corrigidos textos de erro com caracteres corrompidos encontrados no fluxo de aprovação.

## Arquivos tocados

- `src/main.ts`
- `src/style.css`
- `src-tauri/src/codex_chat.rs`
- `AGENTS.md`
- Este snapshot.

## Validações

- `npm run build` passou.
- `cargo check --manifest-path .\src-tauri\Cargo.toml` passou.
- `git diff --check` passou; Git avisou apenas que poderá converter LF para CRLF nos arquivos modificados.
- O popup não foi inspecionado interativamente no runtime do Windows nesta tarefa.

## Problemas conhecidos e limites

- O modo pode aprovar qualquer novo pedido de permissão que o app-server encaminhe durante a conversa atual, incluindo comandos e alterações. Ele só é ativado por ação explícita da pessoa e não se estende a outras conversas.
- Desligar o modo não revoga aprovações de sessão que o Codex já aceitou; fechar o popup ou iniciar uma conversa nova encerra esse escopo.
- O perfil inicial continua `:read-only`; hooks continuam desativados. A execução fora desse perfil depende dos pedidos e concessões do app-server.

## Próximos passos

- Abrir o chat no Windows e conferir o controle desligado/ligado, uma aprovação de comando e uma solicitação de permissões durante uma conversa real.
