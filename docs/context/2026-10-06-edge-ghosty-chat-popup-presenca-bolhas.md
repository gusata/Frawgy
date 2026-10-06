# Edge Ghosty: Ghosty presente e mensagens em bolhas no chat rápido

## Objetivo

Redesenhar o popup do chat rápido para mostrar o Ghosty entrando com animação e acompanhando a conversa, com mensagens em bolhas alinhadas por remetente e uma aparência próxima ao popup de aprovação.

## Alterações realizadas

- O Ghosty Canvas fica montado fora do transcript, ao lado de um cartão compacto de saudação, para continuar animando durante a atualização das respostas em streaming.
- Ao abrir o chat, o Ghosty faz sua saudação longa. Durante o uso, acompanha pensamento, conclusão, solicitações sem login e erros com estados já existentes do motor do pet.
- As mensagens do usuário ficam alinhadas à direita e as respostas do Ghosty à esquerda. As superfícies usam gradientes escuros, bordas azuladas e cantos assimétricos inspirados no cartão do popup de aprovação.
- O cartão do Ghosty se compacta quando a conversa começa e troca o texto para indicar que está pensando ou acompanhando.
- Mantidos o seletor de modelo, o seletor de esforço, o status da conta, o login, as sugestões e o compositor.

## Arquivos tocados

- `src/main.ts`
- `src/style.css`
- `AGENTS.md`
- `docs/context/2026-10-06-edge-ghosty-chat-popup-presenca-bolhas.md` (este snapshot)

## Validações

- `npm run build` passou (`tsc` e `vite build`).
- `git diff --check` não encontrou erros de whitespace.
- Não houve alteração Rust; `cargo check` não foi necessário para esta mudança.

## Problemas conhecidos

- A aparência e o encaixe ainda não foram inspecionados no popup nativo do Windows. A validação de build não confirma o espaçamento visual em 400×500 nem os movimentos do Canvas no WebView2.

## Próximos passos

- Abrir o chat no Ghosty e revisar a entrada do personagem, o layout sem mensagens, bolhas durante streaming, respostas longas, erro e o estado compacto após a primeira pergunta.
