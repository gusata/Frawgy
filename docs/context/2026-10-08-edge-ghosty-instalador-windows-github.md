# Instalador Windows e release do GitHub — 2026-10-08

## Objetivo

Preparar o Edge Ghosty para distribuição no Windows por um instalador `.exe`, com desinstalação, instalação dos runtimes necessários, guia na primeira abertura e publicação de releases pelo GitHub Actions.

## Alterações realizadas

- Ativei o bundle Tauri NSIS para Windows x64 e configurei instalação por usuário, idiomas Português do Brasil/Inglês, atalhos do Menu Iniciar e ícones do instalador/desinstalador.
- O instalador inclui o runtime do Visual C++ e o bootstrapper WebView2. Se o runtime WebView2 não estiver presente, o bootstrapper o instala com conexão à internet.
- Gerei um ícone de marca para o Ghosty a partir de `src-tauri/icons/edge-ghosty.svg` e substituí o ICO placeholder.
- Adicionei `npm run build:windows` para compilar o setup local.
- Adicionei `.github/workflows/release-windows.yml`: uma tag `v*` gera um rascunho de Release com o instalador anexado.
- Expandi o texto do assistente de primeira execução para explicar como abrir a barrinha e navegar pela ilha; mantive a seleção de inicialização e atalhos.
- Documentei instalação, desinstalação, compilação, release e a dependência opcional do Codex CLI para o chat.
- Acrescentei `DOM.Iterable` ao TypeScript após a primeira compilação apontar uma iteração de `NodeList` não tipada.

## Arquivos tocados

- `src-tauri/tauri.conf.json`
- `src-tauri/icons/edge-ghosty.svg`
- `src-tauri/icons/icon.ico`
- `src-tauri/build.rs`
- `src/main.ts`
- `tsconfig.json`
- `package.json`
- `.github/workflows/release-windows.yml`
- `README.md`
- `AGENTS.md`
- Este snapshot em `docs/context/`

## Validações

- `npm run build:windows` concluiu com sucesso, compilando o frontend e o binário Rust release e gerando `src-tauri/target/release/bundle/nsis/Edge Ghosty_0.1.0_x64-setup.exe` (5,12 MiB).
- A primeira tentativa parou no TypeScript por falta de `DOM.Iterable`; após a correção, a compilação completa e o empacotamento NSIS passaram.
- O build emite um aviso já existente de variável `mut` não usada em `src-tauri/src/codex_hooks.rs:436` e um aviso de que o identificador Tauri estável termina em `.app`. O identificador foi preservado para manter os dados locais existentes.
- O instalador não foi executado durante esta tarefa. O bundle permanece em `src-tauri/target/`, ignorado pelo Git.

## Problemas conhecidos

- A primeira instalação do WebView2 precisa baixar o runtime da Microsoft se ele não estiver no Windows.
- O chat rápido requer o Codex CLI instalado separadamente; os demais recursos do Ghosty não dependem dele.
- O instalador ainda não tem assinatura de código e pode exibir o aviso do SmartScreen.

## Próximos passos

- Depois de revisar e enviar as alterações ao GitHub, criar uma tag que corresponda à versão do app, atualmente `v0.1.0`. A workflow gera um rascunho para revisão e publicação manual.
- Considerar assinatura de código antes de uma distribuição ampla.
