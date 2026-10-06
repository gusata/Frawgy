# Edge Ghosty: resposta com o mesmo Ghosty e janela compacta

## Objetivo

Corrigir o chat conforme o feedback visual: remover o aviso de privacidade, transformar modelo/esforço em bolhas, usar o mesmo Ghosty animado durante a resposta e reduzir a janela.

## Alterações realizadas

- O aviso de privacidade foi removido da interface.
- Modelo e esforço agora aparecem em controles arredondados com fundo e borda, integrados ao popup minimalista.
- O avatar cinza desenhado por CSS foi removido. Um único Canvas do Ghosty permanece fora do transcript que é recriado a cada delta, à esquerda das bolhas, e reage enquanto a resposta chega.
- O compositor virou um único campo em formato de pílula, com o botão de envio dentro da mesma linha.
- `show_utility_popup` recebe o modo do popup e abre o chat em 360×320 logical px; Foco, Bolso e outros utilitários mantêm suas dimensões anteriores.
- A superfície do chat continua transparente, sem cartão de fundo e sem cabeçalho.

## Arquivos tocados

- `src/main.ts`
- `src/style.css`
- `src-tauri/src/lib.rs`
- `AGENTS.md`
- `docs/context/2026-10-06-edge-ghosty-chat-resposta-com-ghosty-unico.md` (este snapshot)

## Validações

- `npm run build` passou (`tsc` e `vite build`).
- `cargo check --manifest-path .\src-tauri\Cargo.toml` passou.
- `git diff --check` não encontrou erros de whitespace.

## Problemas conhecidos

- A versão nativa não foi inspecionada visualmente nesta sessão. Na tentativa anterior, a porta Vite 1420 já estava ocupada e a janela de ilha aberta não aceitou foco pelo Orca.
- O popup continua usando WebView/Tauri transparente; o click-through em partes totalmente transparentes precisa de validação manual no Windows.

## Próximos passos

- Reiniciar o app para carregar o novo tamanho do popup e conferir o layout 360×320, as pílulas, a bolha de resposta, o Ghosty Canvas único e o comportamento ao fechar.
