# Snapshot — 2026-10-02: arrasto e Bolso do Mochi

## Objetivo

Corrigir o recebimento de arquivos no Bolso e fazer o menu expandir ao arrastar um arquivo até a janela do Mochi.

## Alterações realizadas

- A janela principal declara `dragDropEnabled: true` para deixar explícito o handler nativo de drop do Tauri.
- Durante um arrasto com o botão esquerdo pressionado, o polling nativo aceita o cursor em toda a área da janela transparente. Mantém essa área interativa por 400 ms após soltar para cobrir a entrega do evento ao WebView2.
- No uso normal, o hitbox continua limitado ao notch e à margem habitual.
- A inscrição do evento nativo é aguardada no início e os erros deixam de ser descartados silenciosamente.
- O caminho recebido entra no `localStorage` imediatamente, antes da animação de 650 ms. Se o armazenamento falhar, o item é removido do estado e o Bolso mostra uma mensagem de erro.
- O app mostra um aviso se o drop chegar sem caminhos de arquivo.
- A tela minimalista do pet mostra por 1,8 s se o arquivo foi guardado, já estava no Bolso, ou se o Bolso está cheio.

## Arquivos tocados

- `src/main.ts`
- `src/style.css`
- `src-tauri/src/lib.rs`
- `src-tauri/tauri.conf.json`
- `AGENTS.md`
- `docs/context/2026-10-02-edge-mochi-arrasto-e-bolso.md`

## Validações

- Revisão estática dos caminhos de registro do evento, persistência e hitbox.
- Não foi executado build ou teste automatizado nesta tarefa.

## Problemas conhecidos

- O Bolso guarda o caminho do arquivo para reabri-lo; não copia nem move o conteúdo original.
- A integração precisa ser confirmada manualmente no app Windows com um arquivo arrastado do Explorer.

## Próximos passos

- Abrir o Mochi e arrastar um arquivo do Explorer sobre a barrinha/janela; confirmar que ela expande.
- Abrir o Bolso e confirmar que o arquivo aparece, fechar/reabrir o app e confirmar que a referência permanece.
- Se ainda não chegar evento, compartilhar o erro do terminal/console que agora não será ocultado pelo código.
