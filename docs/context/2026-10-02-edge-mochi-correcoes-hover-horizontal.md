# Contexto da tarefa — hover e painel horizontal

Data: 2026-10-02  
Identificador: edge-mochi-correcoes-hover-horizontal

## Objetivo

Corrigir as piscadas durante a animação, inverter corretamente as curvas do notch nas bordas superior/inferior, remover os controles de posição ao longo da borda e de visibilidade dos três pontos, e melhorar a hierarquia visual do painel horizontal com mais destaque para o pet.

## Alterações realizadas

- Adicionada uma tolerância curta a eventos de saída do ponteiro durante o redimensionamento/reposicionamento nativo; o menu confirma `:hover` antes de recolher para evitar ciclos de abre/fecha gerados pela janela se movendo.
- A janela recolhida mantém uma área nativa de 18 px na direção perpendicular à borda, mesmo quando a barrinha visual é mais fina, para que as curvas de 14 px não sejam cortadas.
- Reorientados os gradientes das orelhas no topo e embaixo e centralizados os três pontos dentro da barrinha horizontal.
- Reduzida a altura do painel horizontal de 360 px para 280 px para remover a grande área vazia.
- Aumentados o pet, seu cartão e a porcentagem no layout horizontal; a barra de uso agora ocupa a largura do cartão.
- Removidos da interface e do armazenamento ativo os ajustes de posição na borda e de esconder os três pontos. Os três pontos ficam sempre visíveis quando recolhido.
- A posição ao longo da borda agora permanece centralizada.

## Arquivos tocados

- `src/main.ts`
- `src/style.css`
- `src-tauri/src/lib.rs`
- `docs/context/2026-10-02-edge-mochi-correcoes-hover-horizontal.md`

## Validações

- `npm run build` passou (TypeScript e Vite).
- `cargo check --manifest-path .\src-tauri\Cargo.toml` passou no Developer PowerShell do Visual Studio 2022.
- `git diff --check` passou.
- Não foi feita uma validação visual interativa após as mudanças.

## Problemas conhecidos e próximos passos

- Conferir no app em execução se as curvas do topo e de baixo têm a orientação desejada e se a abertura não pisca no uso real.
- Conferir visualmente o layout horizontal nas duas bordas e no monitor com diferentes escalas de DPI.
