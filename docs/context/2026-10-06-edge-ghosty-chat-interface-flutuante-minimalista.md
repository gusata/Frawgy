# Edge Ghosty: chat rápido flutuante e minimalista

## Objetivo

Ajustar o chat rápido para seguir o esboço do usuário: uma janela transparente sem cartão ou cabeçalho grandes, com Ghosty à esquerda, prompt em uma pílula compacta e respostas em bolhas abaixo.

## Alterações realizadas

- O popup de chat não renderiza o cabeçalho padrão nem o cartão de fundo. A janela continua Tauri e transparente; só os componentes da conversa ficam visíveis.
- A linha superior mantém o estado da conta, o atalho atual, Nova conversa e Fechar em controles compactos. A área livre da linha permite arrastar a janela.
- Modelo e esforço permanecem disponíveis em seletores compactos.
- O Ghosty aparece com uma saudação animada; ao iniciar a conversa, o personagem fica compacto e continua reagindo ao pensamento, à resposta e a erros.
- O campo passou para uma pílula de prompt e aparece logo após a saudação; o histórico ocupa a área abaixo.
- Respostas mostram um pequeno avatar com a silhueta e os olhos do Ghosty, à esquerda da bolha; mensagens do usuário permanecem à direita.
- Login e privacidade foram reduzidos para não desenhar outro cartão grande.

## Arquivos tocados

- `src/main.ts`
- `src/style.css`
- `AGENTS.md`
- `docs/context/2026-10-06-edge-ghosty-chat-interface-flutuante-minimalista.md` (este snapshot)

## Validações

- `npm run build` passou (`tsc` e `vite build`).
- `git diff --check` não encontrou erros de whitespace.
- A tentativa de `npm run tauri dev` encerrou antes da visualização porque o servidor Vite já estava usando a porta 1420.
- As janelas do Ghosty existentes não aceitaram foco pelo Orca, então não foi possível conferir pixels e transparência no popup nativo nesta sessão.

## Problemas conhecidos

- A mudança não redimensiona a janela Tauri 400×500; a área sem componentes fica transparente. O encaixe e o click-through dessa área ainda precisam de inspeção no Windows.

## Próximos passos

- Liberar ou reutilizar o servidor Vite existente, abrir o chat rápido no Ghosty e conferir a entrada, a transparência, o campo de prompt, respostas em streaming e o atalho de fechar.
