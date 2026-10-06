# Edge Ghosty: correção do aviso cortado na borda inferior

## Objetivo

Corrigir a notificação de conclusão do Ghosty, que aparecia cortada na captura enviada pelo usuário.

## Alterações realizadas

- A notificação da borda inferior agora usa o centro horizontal da ilha como âncora.
- As etapas da animação e o posicionamento para `prefers-reduced-motion` mantêm o mesmo centro durante toda a entrada e saída.
- A causa era o aviso estar preso ao lado direito (`right: 0`) e deslocado mais 50% para a direita (`translateX(50%)`), ultrapassando o limite da janela.

## Arquivos tocados

- `src/style.css`
- `docs/context/2026-10-06-edge-ghosty-toast-corte-corrigido.md`

## Validações

- `npm run build` passou; TypeScript e Vite concluíram a compilação.
- `git diff --check` passou sem erros. Git reportou apenas avisos de conversão de finais de linha já presentes no workspace.

## Problemas conhecidos

- A correção foi validada por compilação, mas a animação de conclusão ainda precisa ser observada no runtime do Windows quando um evento `Stop` ocorrer.

## Próximos passos

- Conferir a próxima conclusão do Codex e confirmar que o aviso e o Ghosty aparecem inteiros e centralizados na borda inferior.
