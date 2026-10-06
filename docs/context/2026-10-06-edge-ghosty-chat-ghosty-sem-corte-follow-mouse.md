# Snapshot: Ghosty do chat sem corte e seguindo o mouse

- **Objetivo:** fazer o Ghosty do popup do chat aparecer inteiro com o mesmo renderer usado no app e acompanhar o ponteiro com os olhos.
- **Alterações:** `bindQuickChatPopup` encaminha `pointermove` para `PetMotionEngine.lookAt`, normalizando as coordenadas pela caixa do personagem, e reseta o olhar quando o ponteiro sai do popup. O recorte interno `overflow: hidden` durante a entrada foi removido; a animação de entrada continua ativa.
- **Arquivos tocados:** `src/main.ts`, `src/style.css`, `AGENTS.md` e este snapshot.
- **Validações:** `npm run build` passou depois das alterações de código. `git diff --check` passou; houve apenas avisos de conversão LF/CRLF.
- **Problemas conhecidos:** o movimento dos olhos ainda precisa de confirmação visual no runtime após esta correção. Durante uma inspeção anterior por clique na janela, foi enviado acidentalmente `/` como mensagem; a resposta terminou antes de a tentativa de interrupção surtir efeito. Não foi feita nova inspeção interativa para evitar outro envio involuntário.
- **Próximos passos:** abrir o popup e mover o mouse ao redor do Ghosty para confirmar o olhar e a silhueta completa.
