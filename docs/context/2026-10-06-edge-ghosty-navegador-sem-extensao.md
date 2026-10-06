# Opções de controle de sites sem extensão

## Objetivo

Responder como o Ghosty pode executar ações dentro de sites sem exigir que o usuário instale ou crie uma extensão de navegador.

## Conclusão da pesquisa

- Recomendação: abrir uma janela visível de Edge/Chromium controlada pelo Ghosty, usando um perfil próprio e persistente. O usuário faz login uma vez nesse perfil; não precisa de extensão e o Ghosty não acessa as abas do perfil pessoal.
- No Chrome 136 ou posterior, a depuração remota não funciona no diretório de dados padrão; requer um `--user-data-dir` não padrão. Isso combina com o perfil isolado recomendado para o Ghosty.
- Alternativa mais integrada: uma janela Tauri/WebView2 com URL externa. Tauri suporta webviews remotas; WebView2 permite navegar, executar JavaScript e persistir dados/cookies no diretório do app.
- Limitação: o Google não permite fluxos OAuth em user-agents incorporados controlados pelo app. Um login do YouTube/Google dentro de WebView pode falhar. Para compatibilidade ampla de login, preferir a janela completa do Edge/Chromium.
- Automação por acessibilidade do Windows também dispensa extensão, mas é mais frágil que controlar DOM/acessibilidade do navegador e deve ser fallback.

## Estado da implementação

Este snapshot registra pesquisa e recomendação; não altera a implementação. Nenhuma arquitetura foi escolhida pelo usuário ainda.

## Arquivos tocados

- `docs/context/2026-10-06-edge-ghosty-navegador-sem-extensao.md` (este snapshot)

## Validações

- Pesquisa em documentação oficial de Chrome, Tauri, Microsoft WebView2 e Google Identity.
- `git diff --check` não foi repetido nesta tarefa; sem alterações de código.

## Referências consultadas

- Chrome remote debugging: https://developer.chrome.com/blog/remote-debugging-port
- Tauri WebviewWindow: https://tauri.app/reference/javascript/api/namespacewebviewwindow/
- WebView2: https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/webview2
- Política Google OAuth: https://developers.google.com/identity/protocols/oauth2/policies

## Próximo passo

Se o usuário pedir implementação, criar uma janela de navegador controlada pelo Ghosty com perfil separado e persistente, expor ferramentas semânticas de navegação/localização/clique/digitação/rolagem e pedir confirmação para ações que publiquem, apaguem ou alterem dados.
