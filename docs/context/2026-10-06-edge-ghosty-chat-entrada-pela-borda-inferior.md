# Edge Ghosty: chat rápido surgindo pela borda inferior

## Objetivo

Fazer o chat rápido se comportar como uma extensão do menu do Ghosty: abrir pelo atalho perto da borda inferior e subir para a tela com a animação de ressalto usada nos avisos de aprovação.

## Alterações realizadas

- O backend posiciona a janela do chat centralizada horizontalmente e 72 logical px acima da borda inferior do monitor chamador.
- O atalho global só dispara a abertura a partir da janela principal, evitando chamadas simultâneas das janelas auxiliares de monitores.
- A abertura do chat ignora posições antigas salvas por outros popups; arrastar o chat não altera a posição salva de Foco, Bolso ou outros utilitários.
- O conteúdo do chat é alinhado ao rodapé da janela transparente. Uma animação de baixo para cima com pequeno ressalto usa timing próximo ao popup de aprovação.
- Reduzido movimento da animação quando `prefers-reduced-motion` está ativo.

## Arquivos tocados

- `src-tauri/src/lib.rs`
- `src/main.ts`
- `src/style.css`
- `AGENTS.md`
- `docs/context/2026-10-06-edge-ghosty-chat-entrada-pela-borda-inferior.md`

## Validações

- `npm run build` passou (`tsc` e `vite build`).
- `cargo check --manifest-path .\src-tauri\Cargo.toml` passou.
- `git diff --check` passou, sem erros de whitespace.

## Problemas conhecidos

- Não foi possível validar o movimento no popup ao vivo nesta etapa; a inspeção de runtime ainda depende de reiniciar o app no Windows.

## Próximos passos

- Reiniciar o app, acionar o atalho e verificar que o chat sobe do rodapé do monitor correto sem reaproveitar a posição de outro popup.
