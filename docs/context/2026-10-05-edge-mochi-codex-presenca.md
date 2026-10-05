# Integração de presença do Codex

## Objetivo

Fazer o Mochi reagir às sessões locais do Codex usando hooks de ciclo de vida, instalados pelo próprio Edge Mochi após ação explícita do usuário.

## Alterações realizadas

- Adicionei uma seção “Mochi e Codex” às Configurações, com conexão e desconexão reversíveis e estado de configuração.
- Implementei comandos Tauri que mesclam/removem somente os handlers do Edge Mochi em `hooks.json`, preservando outros hooks do usuário.
- O hook local recebe o JSON de ciclo de vida do Codex, mas só grava o tipo do evento, o nome da ferramenta e o tipo do subagente numa fila temporária local. Prompt, resposta, argumentos e resultados de ferramentas não são persistidos nem encaminhados.
- Ao desconectar, o app remove os handlers próprios e escreve um marcador local para interromper imediatamente sessões do Codex que ainda tenham a configuração antiga carregada.
- O frontend lê a fila a cada 300 ms e traduz envio de prompt, ferramentas, aprovação, subagentes, interrupção e conclusão para estados existentes do Mochi.
- O helper usa hooks assíncronos, não imprime saída para o Codex e não bloqueia a operação observada.
- Atualizei `AGENTS.md` com a decisão de produto e a arquitetura da integração.

## Arquivos tocados

- `AGENTS.md`
- `src/main.ts`
- `src/style.css`
- `src-tauri/src/lib.rs`
- `src-tauri/src/codex_hooks.rs`
- `src-tauri/src/codex-hook.ps1`
- `docs/context/2026-10-05-edge-mochi-codex-presenca.md`

## Validações

- Revisei estaticamente o mapeamento dos eventos documentados do Codex, a mesclagem reversível de `hooks.json`, a fila local e os estados ligados ao `PetMotionEngine`.
- Não executei build nem testes nesta tarefa; ainda é preciso validar no Developer PowerShell do Visual Studio e no app Windows.

## Problemas conhecidos

- O Codex precisa ser reiniciado após conectar ou desconectar para carregar a configuração atualizada. Pode solicitar confiança no hook na próxima sessão.
- A integração cobre eventos de ciclo de vida, não o fluxo de tokens palavra por palavra.
- O helper foi preparado para sessões locais do Codex no Windows. Sessões executadas em ambiente remoto não têm acesso ao diretório local do Edge Mochi.
- Se o usuário já tiver hooks inline em `config.toml`, o Codex pode mesclar as duas fontes (`config.toml` e `hooks.json`) e emitir o aviso documentado. Os hooks existentes continuam preservados.

## Próximos passos

- Compilar no Developer PowerShell do Visual Studio e abrir `npm run tauri dev`.
- Conectar o Codex em Configurações, reiniciar o Codex e aceitar a confiança do hook se solicitado.
- Observar as reações durante envio de prompt, uso de ferramentas, pedido de aprovação, interrupção e fim de turno.
- Confirmar que desconectar interrompe as reações imediatamente e que hooks personalizados do usuário permanecem intactos.
