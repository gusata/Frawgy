# Edge Ghosty: detecção da conta ChatGPT autenticada

## Objetivo

Investigar a mensagem do chat “O login terminou, mas o Codex não confirmou sua conta” e corrigir a causa.

## Causa encontrada

`refresh_catalog` marcava a sessão como autenticada somente quando `account/read` retornava `account` e `requiresOpenaiAuth` não era `true`. No protocolo, `requiresOpenaiAuth` indica que o provedor ativo exige autenticação OpenAI; ele também pode ser `true` com uma conta ChatGPT autenticada. Assim, o OAuth salvava a conta, mas o Ghosty a tratava como desconectada. O arquivo isolado `auth.json` existe e foi atualizado durante o login; só foram consultados metadados, nunca o conteúdo.

## Alterações realizadas

- O estado autenticado agora depende da presença de uma conta não nula em `account/read`.
- Mantido o limite de confirmação de 10 segundos para mostrar erro recuperável se a conta realmente não aparecer depois do callback.
- Atualizada a memória operacional com a semântica correta da flag.

## Arquivos tocados

- `src-tauri/src/codex_chat.rs`
- `AGENTS.md`
- `docs/context/2026-10-06-edge-ghosty-chat-login-requires-openai-auth.md` (este snapshot)

## Validações

- `cargo check --manifest-path .\src-tauri\Cargo.toml` passou.
- `git diff --check` passou.
- A documentação e os testes oficiais do protocolo Codex mostram uma conta ChatGPT presente junto de `requires_openai_auth: true`.
- Inspeção do popup em execução após a recompilação: o botão mudou para “Enviar mensagem” e a árvore acessível mostrou o estado autenticado e mensagens reais da conversa.
- Nenhum teste foi criado ou executado.

## Problemas conhecidos

- Não enviei uma nova mensagem durante a inspeção; confirmei o estado autenticado pelo botão e pela interface carregada.

## Próximos passos

- Enviar uma nova mensagem no chat para confirmar uma resposta usando a conta já reconhecida.
