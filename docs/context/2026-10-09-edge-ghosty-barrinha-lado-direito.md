# 2026-10-09 — Barrinha na borda direita

## Objetivo

Adicionar a borda direita como opção de posicionamento da barrinha do Edge Ghosty.

## Alterações realizadas

- Adicionada a opção “Direita · vertical” em Configurações; a escolha continua persistida na preferência de borda existente.
- A janela nativa e o retângulo recolhido/hitbox passam a ancorar a ilha no lado direito do monitor e acompanhar a posição escolhida ao longo da lateral.
- A geometria, o raio dos cantos, o tamanho recolhido, a expansão vertical e os layouts empilhados de Home, Pet e Atalhos reconhecem os dois lados verticais.
- Indicadores de atividade e avisos de conclusão/aprovação ficam voltados para dentro da tela na borda direita.

## Arquivos tocados

- `src/main.ts`
- `src/style.css`
- `src-tauri/src/lib.rs`
- `docs/context/2026-10-09-edge-ghosty-barrinha-lado-direito.md`

## Validações

- Revisão estática do diff e dos caminhos de geometria, hitbox e orientação vertical.
- Build e testes não foram executados nesta tarefa.

## Problemas conhecidos

- O posicionamento e as animações na borda direita ainda precisam de conferência visual no Windows, inclusive em monitores com escala diferente.

## Próximos passos

- Abrir Configurações, escolher “Direita · vertical” e conferir a barrinha recolhida, a expansão e o click-through em uso real.
