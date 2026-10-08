# 2026-10-08 — Abertura acompanha a geometria da ilha

## Objetivo

Investigar e corrigir a animação de abertura da ilha após o reposicionamento configurável ao longo das bordas.

## Alterações realizadas

- A causa era o CSS mudar `top`/`left` para a âncora do tamanho expandido assim que `.is-expanded` era aplicado. A largura, altura e raio continuavam animados pelo JavaScript, mas a posição saltava diretamente para o destino.
- `setBodyPosition` agora calcula `left`/`top` a partir do tamanho atual da ilha e da porcentagem configurada. `setBodyGeometry` atualiza posição e tamanho juntos em cada quadro da animação, preservando o ponto escolhido na borda.
- A renderização inicial posiciona o corpo com suas dimensões atuais. A sincronização de preferências entre janelas também reposiciona a ilha antes de animar um novo alvo.
- Removidas as fórmulas CSS que posicionavam a ilha usando o tamanho expandido final.

## Arquivos tocados

- `src/main.ts`
- `src/style.css`
- `AGENTS.md`
- `docs/context/2026-10-08-edge-ghosty-abertura-geometria-animada.md`

## Validações

- `npm run build` — passou (`tsc` e Vite production build).
- `git diff --check` — passou; restaram apenas avisos de conversão LF/CRLF do Git em arquivos modificados.

## Problemas conhecidos

- A animação foi validada por compilação, mas não foi inspecionada visualmente em runtime neste snapshot.

## Próximos passos

- Conferir abertura e recolhimento nas bordas esquerda, superior e inferior com posições 0%, 50% e 100% no runtime do Windows.
