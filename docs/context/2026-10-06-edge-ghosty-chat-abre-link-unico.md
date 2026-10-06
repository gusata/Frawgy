# Abertura automática de link único no chat

## Objetivo

Abrir automaticamente um endereço quando o Ghosty concluir uma resposta que contém exatamente um link, sem abrir várias abas para respostas com múltiplos destinos.

## Alterações realizadas

- Adicionada extração e validação de uma URL HTTP(S) única na resposta final do assistente.
- A abertura ocorre após `turn/completed`, somente se o turno concluiu normalmente e não foi cancelado.
- Respostas com zero ou vários links continuam mostrando os links clicáveis, sem abertura automática.
- A abertura usa o comando Tauri existente `open_targets`.
- Registrado o comportamento no histórico operacional do projeto.

## Arquivos tocados

- `src/main.ts`
- `AGENTS.md`
- `docs/context/2026-10-06-edge-ghosty-chat-abre-link-unico.md`

## Validações

- `npm run build` — passou.
- `git diff --check` — passou; Git avisou apenas sobre normalização LF/CRLF em arquivos modificados.

## Problemas conhecidos

- A abertura automática foi validada por compilação, mas não foi exercitada no runtime do Windows nesta tarefa.
- O comportamento exige um URL HTTP(S) explícito no texto final; links sem URL visível não são extraídos.

## Próximos passos

- No popup real, pedir uma resposta que contenha somente um link e confirmar que ele abre uma vez.
- Confirmar que respostas com dois links não abrem abas automaticamente.
