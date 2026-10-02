# Contexto da tarefa — orelhas do notch do protótipo Coucou

Data: 2026-10-02
Identificador: edge-mochi-coucou-prototype-ear-gradients

## Objetivo

Substituir as saliências arredondadas improvisadas do notch do Edge Mochi pela geometria de orelhas feita com `::before` e `::after` do protótipo Coucou indicado pelo usuário.

## Alterações realizadas

- Inspecionado o repositório Coucou e localizado o trecho `#island::before` / `#island::after` em `design/prototype/notch-buddy.html`.
- Substituídos os blocos pretos com `border-radius` por as duas orelhas `radial-gradient` do protótipo, transpostas para o eixo vertical do Edge Mochi na borda esquerda.
- Mantidas as dimensões recolhidas da haste e o desaparecimento das orelhas quando expandido.
- Adicionado `THIRD-PARTY-NOTICES.md` com atribuição e licença MIT do CSS de referência.

## Arquivos tocados

- `src/style.css`
- `THIRD-PARTY-NOTICES.md`
- `docs/context/2026-10-02-edge-mochi-coucou-prototype-ear-gradients.md`

## Validações

- `npm run build` passou (`tsc` e Vite).
- A forma final ainda não foi capturada em execução no Windows; esta tarefa não foi validada por screenshot do app.

## Problemas conhecidos e próximos passos

- Comparar o resultado em execução com o protótipo Coucou e com a captura do usuário para confirmar visualmente a junção da orelha com a haste.
- Se o runtime mostrar diferença, ajustar somente o posicionamento/escala do trecho radial preservando a curva de referência.
- A compilação Rust/Tauri não foi executada nesta tarefa.
