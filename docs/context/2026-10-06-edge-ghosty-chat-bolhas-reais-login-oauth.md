# Edge Ghosty: bolhas reais e correção do login OAuth

## Objetivo

Corrigir a interpretação do mock do chat: as bolhas do Figma são referências visuais para mensagens reais, não conteúdo de exemplo. Corrigir também o fluxo de login do ChatGPT, que podia encerrar o popup ao abrir o navegador ou deixar a interface travada após erro.

## Alterações realizadas

- Removidas as bolhas fictícias do estado vazio. Sem conversa, a área de mensagens permanece vazia; as mensagens efetivamente enviadas pelo usuário e respondidas pelo Ghosty usam as duas formas de bolha do Figma.
- A ação de enviar inicia o OAuth mesmo sem texto; Enter com texto inicia o login e preserva o rascunho.
- Durante OAuth, a conversa mostra um aviso para concluir no navegador. A janela continua aberta ao perder foco e o estado pendente só termina quando `account/read` confirma a conta ou o app-server informa falha; se o retorno diz sucesso mas a conta não é confirmada em 10 segundos, o chat mostra erro e permite tentar novamente.
- Falhas de login habilitam uma ação que tenta novamente o OAuth. Erros ao iniciar/reconectar o app-server mantêm sua ação de recuperação própria.
- Atualizada a memória operacional para esclarecer que “pesquise...” é uma mensagem de usuário de exemplo, não um campo de busca.

## Arquivos tocados

- `src/main.ts`
- `AGENTS.md`
- `docs/context/2026-10-06-edge-ghosty-chat-bolhas-reais-login-oauth.md` (este snapshot)

## Validações

- `npm run build` passou (`tsc` e Vite).
- `git diff --check` passou; Git indicou apenas conversão LF/CRLF.
- Um probe isolado, sem dados de conta, iniciou o app-server instalado (`codex-cli 0.160.1`) e confirmou que `account/login/start` retorna `authUrl`.
- Nenhum teste foi criado ou executado.

## Problemas conhecidos

- O login real depende de concluir o OAuth no navegador e não foi efetuado durante esta tarefa.
- A janela nativa não foi inspecionada visualmente em runtime nesta sessão.
- O código Rust não mudou nesta correção; `cargo check` não foi repetido.

## Próximos passos

- Reiniciar o app, abrir o chat, pressionar o botão de envio para abrir o login e concluir o OAuth no navegador.
- Retornar ao popup e confirmar que a conversa segue aberta, o botão destrava e um rascunho anterior continua no campo.
- Enviar mensagens dos dois lados e conferir as bolhas reais, a rolagem limitada e o estado vazio sem exemplos.
