# Edge Ghosty: seleção de modelo no chat rápido

## Objetivo

Permitir escolher o modelo e o esforço padrão do chat rápido, usando GPT-6 Luna com esforço baixo por padrão para pesquisas rápidas.

## Alterações realizadas

- O backend consulta `model/list` no Codex app-server e devolve ao frontend os nomes, identificadores e esforços aceitos pelo catálogo instalado.
- O popup do chat ganhou seletores de modelo e esforço. As opções de esforço mudam conforme o modelo escolhido.
- O padrão é `gpt-6-luna` com `low`; modelo e esforço são persistidos nas preferências locais e migrados junto às chaves antigas do Edge Mochi.
- `thread/start` e `turn/start` recebem o modelo escolhido; `turn/start` também recebe o esforço.
- Mantida uma opção de fallback GPT-6 Luna se o catálogo local não carregar.
- Atualizados `README.md` e `AGENTS.md`.

## Arquivos tocados

- `src/main.ts`
- `src/style.css`
- `src-tauri/src/codex_chat.rs`
- `src-tauri/src/lib.rs`
- `README.md`
- `AGENTS.md`
- `docs/context/2026-10-06-edge-ghosty-chat-modelo-padrao-luna.md` (este snapshot)

## Validações

- `npm run build` passou.
- `cargo check --manifest-path .\src-tauri\Cargo.toml` passou.
- O Codex CLI 0.160.1 retornou `gpt-6-luna` no `model/list` e incluiu `low` entre os esforços aceitos.
- A consulta ao catálogo não executou inferência; não houve chamada de resposta do modelo nem teste automatizado.

## Problemas conhecidos

- O catálogo do app-server pode estar empacotado ou em cache e não confirma, sozinho, acesso do plano ChatGPT ao modelo; o uso real confirma isso na primeira resposta.
- O seletor e uma resposta real com GPT-6 Luna/baixo ainda precisam de inspeção manual no Windows.

## Próximos passos

- Reiniciar o Ghosty, abrir o chat e confirmar que GPT-6 Luna e Baixo aparecem selecionados.
- Enviar uma pergunta e conferir que a resposta chega usando o modelo e esforço escolhidos.
