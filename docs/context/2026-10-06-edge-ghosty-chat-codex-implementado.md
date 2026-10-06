# Edge Ghosty: chat rápido com Codex

## Objetivo

Implementar um chat de IA rápido aberto por atalho global, sem pedir chave de API, com pesquisa web e comandos locais limitados ao que o Ghosty já oferece.

## Alterações realizadas

- Adicionado um modo de chat à janela Tauri `utility-popup`, com histórico em memória na interface, respostas em streaming, cancelamento, nova conversa, links clicáveis e estado de login.
- Adicionado o atalho global padrão `Ctrl + Shift + Espaço`, com opções `Ctrl + Alt + Espaço` e `Ctrl + Shift + G` em Ajustes. O backend registra o atalho pelo Win32 `RegisterHotKey`.
- Adicionado o serviço Rust `codex app-server` oculto por stdio. Ele inicia sob demanda, detecta o Codex CLI instalado via executável ou pacote npm, e usa um `CODEX_HOME` separado dentro dos dados locais do Edge Ghosty.
- O app-server usa login OAuth da conta ChatGPT, pesquisa web ao vivo, esforço `low`, sandbox somente leitura e `approvalPolicy: never`. Os recursos `shell_tool` e `hooks` são desativados; as sessões comuns do Codex e seus hooks ficam isolados.
- A interface resolve localmente pedidos explícitos para abrir atalhos cadastrados, URLs HTTP(S) e iniciar Foco. O modelo não controla o ShellExecute nem executa comandos locais.
- As conversas são removidas ao fechar o popup ou começar outra; conversas órfãs são limpas quando o app-server inicia após uma interrupção inesperada.
- Atualizados `README.md` e `AGENTS.md` para documentar o uso, a autenticação, a separação dos hooks e as limitações conhecidas.

## Arquivos tocados

- `src/main.ts`
- `src/style.css`
- `src-tauri/src/lib.rs`
- `src-tauri/src/codex_chat.rs` (novo)
- `src-tauri/src/quick_chat_hotkey.rs` (novo)
- `README.md`
- `AGENTS.md`
- `docs/context/2026-10-06-edge-ghosty-chat-codex-implementado.md` (este snapshot)

## Validações

- `npm run build` passou (`tsc` e Vite).
- `cargo check --manifest-path .\src-tauri\Cargo.toml` passou.
- `git diff --check` não apontou problemas de whitespace; mostrou avisos de conversão LF para CRLF em arquivos já existentes.
- Nenhum teste foi criado ou executado.

## Problemas conhecidos

- O runtime visual no Windows, o conflito potencial do atalho, o login OAuth, a pesquisa em streaming e as ações locais ainda precisam de inspeção manual no app.
- O recurso depende do Codex CLI instalado e de login ChatGPT; a primeira autenticação do perfil isolado do Ghosty é separada do perfil de configuração local.
- O app-server do Codex é experimental. A documentação oficial permite autenticação via app-server para apps locais ou open-source, mas não para serviços comerciais ou hospedados; revisar a integração antes de distribuir comercialmente.
- As mensagens vão à conta ChatGPT conectada para processamento online. O transcript local é apagado ao fechar; credenciais de login permanecem no `CODEX_HOME` do app para não exigir novo login a cada abertura.

## Próximos passos

- Abrir `npm run tauri dev` no Windows e conferir o fluxo de primeiro login, atalho padrão e mudança de atalho.
- Fazer uma pesquisa web, testar link de fonte, abrir um atalho salvo, iniciar Foco sem login e confirmar que fechar o popup interrompe/apaga a conversa local.
- Conferir o estado do Codex CLI e os erros de sandbox no runtime Windows; ajustar a interface se o app-server estiver indisponível ou a conta não tiver acesso.
