# Contexto da tarefa — animação e hover no padrão Coucou

Data: 2026-10-02  
Identificador: edge-mochi-coucou-hover-sem-flicker

## Objetivo

Investigar a piscada forte ao abrir/recolher o menu, o salto visual da barrinha no hover e aproximar a transição do comportamento do Coucou.

## Alterações realizadas

- Mantida a animação geométrica `Spring`/`Tracked`, com mola ao abrir e curva cúbica de 340 ms ao fechar, portada de `windows/src/core/anim.ts` do Coucou.
- No app Tauri, o polling nativo do cursor passou a ser a única fonte das transições de hover. Os eventos DOM de entrada/saída ficam apenas no modo de pré-visualização web, evitando duas rotas concorrentes para abrir e fechar.
- Removidos os bloqueios temporizados de 450/340 ms. Se o cursor retornar enquanto o menu recolhe, a mola retoma do tamanho atual em vez de ignorar a entrada.
- A barrinha agora usa fade de opacidade; as orelhas permanecem na geometria e se fundem com o painel durante a expansão/retração, sem reaparecer de uma vez no fim.
- A janela nativa continua estável durante o hover e ganhou espaço transparente além do tamanho máximo animado para acomodar o overshoot da mola sem recortar o painel.
- Corrigida a memória operacional para documentar o polling nativo e os comandos realmente usados.
- Incluída a atribuição/licença MIT do código de animação portado em `THIRD-PARTY-NOTICES.md`.

## Arquivos tocados

- `src/anim.ts`
- `src/main.ts`
- `src/style.css`
- `src-tauri/src/lib.rs`
- `src-tauri/tauri.conf.json`
- `AGENTS.md`
- `THIRD-PARTY-NOTICES.md`
- `docs/context/2026-10-02-edge-mochi-coucou-hover-sem-flicker.md`

## Validações

- `npm run build` passou (TypeScript e Vite).
- `cargo check --manifest-path .\src-tauri\Cargo.toml` passou.
- `cargo fmt --manifest-path .\src-tauri\Cargo.toml -- --check` passou.
- Não foi feita validação visual interativa do aplicativo.

## Problemas conhecidos e próximos passos

- Confirmar no app Tauri em execução se a abertura/retração e as orelhas agora ficam contínuas em hover real, incluindo a orientação horizontal.
- Se ainda houver piscada, capturar vídeo e logs durante hover; as compilações confirmam integração, mas não reproduzem composição gráfica do WebView2.
