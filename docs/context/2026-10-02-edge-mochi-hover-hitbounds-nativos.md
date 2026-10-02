# Contexto da tarefa — garantir hitbox nativa da barrinha

Data: 2026-10-02  
Identificador: edge-mochi-hover-hitbounds-nativos

## Objetivo

Corrigir o caso em que o cursor passava sobre a barrinha, mas a janela seguia click-through e não aceitava hover ou clique.

## Alterações realizadas

- O backend Rust agora inicializa a área de hit testing recolhida ao posicionar cada janela, calculando a barrinha pela borda, comprimento, espessura e escala do monitor.
- Ao ocultar uma janela de monitor, o backend remove a área correspondente do polling.
- O frontend tenta novamente publicar a geometria animada caso uma chamada `set_island_rect` falhe, em vez de memorizar uma publicação sem confirmação.
- A implementação da animação não foi alterada.

## Arquivos tocados

- `src/main.ts`
- `src-tauri/src/lib.rs`
- `docs/context/2026-10-02-edge-mochi-hover-hitbounds-nativos.md`

## Validações

- Reprodução no Windows confirmou que a janela permanecia com `WS_EX_TRANSPARENT` quando o cursor era movido sobre a área aparente da barra.
- `npm run build` passou.
- `cargo check --manifest-path .\\src-tauri\\Cargo.toml` passou.
- `cargo fmt --manifest-path .\\src-tauri\\Cargo.toml -- --check` passou.
- `cargo build --manifest-path .\\src-tauri\\Cargo.toml` passou no Developer PowerShell do Visual Studio.
- Com o app reconstruído, o cursor sobre a barrinha removeu `WS_EX_TRANSPARENT` e abriu o painel.
- O clique em “fechar” foi recebido e recolheu o painel.

## Problemas conhecidos e próximos passos

- O app foi reiniciado pelo `npm run tauri dev` e ficou aberto após a validação.
