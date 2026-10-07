# Assistente inicial e resumo de Foco

## Objetivo

Implementar as sugestões 9 e 10: uma configuração inicial guiada e um resumo semanal das sessões de Foco.

## Alterações realizadas

- A primeira abertura da janela principal apresenta um guia curto sobre Home, Foco e Atalhos.
- O guia permite escolher a inicialização com o Windows e até três atalhos para destacar na Home. Ele pode ser reaberto nas Configurações.
- A inicialização é configurada por usuário na chave `HKCU\Software\Microsoft\Windows\CurrentVersion\Run`; o estado da opção é consultável pela interface.
- O Foco registra localmente períodos pausados e concluídos. O novo resumo mostra o tempo total e os ciclos concluídos nos últimos sete dias, com gráfico diário e ação para apagar o histórico.
- O temporizador é finalizado e persistido somente pela janela principal para evitar registros duplicados quando há vários monitores.

## Arquivos tocados

- `src/main.ts`
- `src/style.css`
- `src-tauri/src/lib.rs`
- Este snapshot de contexto.

## Validações

- `npm run build` passou.
- `cargo check --manifest-path src-tauri/Cargo.toml` passou.
- `git diff --check` passou; o Git exibiu apenas avisos sobre conversão LF/CRLF.
- A interface não foi exercitada manualmente no Windows e a chave de inicialização não foi alterada durante a validação.

## Problemas conhecidos

- O resumo começa a contar a partir da instalação desta mudança; sessões anteriores não têm registros para reconstruir.
- A configuração de inicialização foi compilada, mas ainda precisa de uma confirmação interativa de ativação e desativação no Windows.

## Próximos passos

- Conferir visualmente o guia em uma instalação nova e reabri-lo pelas Configurações.
- Validar a inicialização automática ativando e desativando a opção pela interface.
- Conferir o gráfico após uma sessão concluída e uma sessão pausada; testar também a limpeza do histórico.
