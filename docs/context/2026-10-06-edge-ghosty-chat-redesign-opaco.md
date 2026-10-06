# Edge Ghosty: redesign do chat com bolhas opacas

## Objetivo

Refazer o chat rápido mantendo a ideia original: atalho, Ghosty visível, resposta em bolha ao lado do personagem e prompt logo abaixo, no estilo compacto do popup de aprovação. O usuário pediu superfícies de conversa opacas.

## Alterações realizadas

- Reorganizado o topo para mostrar somente Ghosty, atalho e ações compactas; o estado normal da conta deixou de ocupar espaço. Erros ainda aparecem no status.
- Modelo e esforço agora têm cápsulas distintas, preenchimento sólido e texto compacto.
- O mesmo renderer Canvas do Ghosty fica ao lado do histórico; as bolhas de resposta têm caudas, contrastes distintos para Ghosty e usuário e preenchimentos totalmente opacos.
- O campo de prompt passou a uma pílula sólida e recebeu placeholder mais direto. A mensagem auxiliar abaixo do prompt foi removida.
- A tela de login foi condensada em uma linha. A janela nativa agora tem no máximo 360×250 logical px, mantendo o fundo externo transparente e sem cartão.

## Arquivos tocados

- `src/main.ts`
- `src/style.css`
- `src-tauri/src/lib.rs`
- `AGENTS.md`
- `docs/context/2026-10-06-edge-ghosty-chat-redesign-opaco.md`

## Validações

- `npm run build` passou (`tsc` e `vite build`).
- `cargo check --manifest-path .\src-tauri\Cargo.toml` passou.
- `git diff --check` passou, sem erros de whitespace.

## Problemas conhecidos

- A aparência do popup real não foi inspecionada ainda nesta tarefa. A versão anterior não foi possível de focar pelo Orca e a porta Vite 1420 estava ocupada.

## Próximos passos

- Reiniciar o app e revisar posição do Ghosty, largura das bolhas, preenchimentos opacos e tamanho nativo no estado vazio, autenticado e durante streaming.
