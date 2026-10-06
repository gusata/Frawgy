# Edge Ghosty: chat rápido mais compacto

## Objetivo

Aplicar o último feedback visual do chat: manter somente o Ghosty animado e suas bolhas junto ao prompt, com os seletores em pílulas e uma janela nativa mais baixa, sem cartão nem mensagem de privacidade visível.

## Alterações realizadas

- Reduzida a altura máxima da janela do chat de 320 para 260 logical px; a largura permanece até 360 logical px. Outros popups mantêm seu dimensionamento atual.
- O estado vazio continua agrupando o Ghosty Canvas único, a saudação em bolha e o prompt; com mensagens, a conversa preenche e rola no espaço disponível.
- Mantidos os seletores de modelo/esforço em pílulas, o compositor arredondado e o fundo transparente sem cabeçalho/cartão.
- Atualizada a memória operacional para registrar a dimensão e a decisão visual vigente.

## Arquivos tocados

- `src-tauri/src/lib.rs`
- `AGENTS.md`
- `docs/context/2026-10-06-edge-ghosty-chat-compactacao-final.md`

## Validações

- `npm run build` passou (`tsc` e `vite build`).
- `cargo check --manifest-path .\src-tauri\Cargo.toml` passou.
- `git diff --check` passou, sem erros de whitespace.

## Problemas conhecidos

- O popup nativo ainda precisa ser reiniciado e inspecionado visualmente no Windows para confirmar tamanho, transparência, pílulas e interação. A tentativa anterior de abrir outra instância foi impedida pela porta Vite 1420 ocupada e pela janela existente não aceitar foco pelo Orca.

## Próximos passos

- Reiniciar o app e confirmar que o popup abre na altura compacta, que o Ghosty Canvas é o único personagem visível e que as mensagens em bolha ficam legíveis durante streaming.
