# Edge Ghosty — painel largo e integrações

## Objetivo

Implementar as melhorias escolhidas pelo usuário, exceto suporte a agentes além do Codex, ampliar o menu lateralmente e aproximar a composição visual do Coucou sem alterar a identidade do Ghosty.

## Alterações realizadas

- Ampliei a janela hospedeira para até 900×720 logical px na borda esquerda e 1100×420 nas bordas horizontais. O corpo expandido usa até 860×650 e 1060×380.
- Reorganizei a Home em duas colunas: controles de mídia, volume e atalhos ao lado de cards de GitHub, atividade do Codex e utilitários. Acrescentei um painel lateral à aba Pet.
- Adicionei integração GitHub para PRs abertos do usuário, pedidos de revisão e status de CI. O token é validado e guardado no Gerenciador de Credenciais do Windows; a interface não o persiste no `localStorage`.
- Adicionei ao Bolso uma ação explícita para preparar no chat uma pergunta sobre o item escolhido. Texto fica pré-preenchido; arquivos incluem o caminho e continuam sujeitos ao fluxo existente de autorização. O rascunho é apagado ao enviar, fechar ou iniciar outra conversa.
- Adicionei o ícone/menu da bandeja com abrir, configurações, pausar atualizações e sair. Pausar suspende atualização automática do GitHub e coleta de métricas; aprovações do Codex continuam operando.
- Adicionei métricas locais do Codex para sessões, tarefas concluídas/interrompidas, etapas, aprovações e tempo ativo estimado. São guardadas contagens e durações por até 90 dias, sem prompts, respostas, comandos ou nomes de ferramentas.
- Adicionei efeitos tonais opcionais via Web Audio, desligados por padrão e com volume configurável.
- Ampliei as aparências do Ghosty para seis paletas e seis opções de acessório contando “sem acessório”.
- Atualizei `AGENTS.md` com as dimensões, integrações e decisões de privacidade.
- As alterações já pendentes de onboarding, inicialização com o Windows e resumo de Foco foram preservadas.

## Arquivos tocados

- Frontend: `src/main.ts`, `src/style.css`, `src/pet-motion.ts`, novo `src/sounds.ts`.
- Rust/Tauri: `src-tauri/src/lib.rs`, novos `src-tauri/src/github.rs` e `src-tauri/src/tray.rs`, `src-tauri/src/codex_hooks.rs`, `src-tauri/src/codex-hook.ps1`, `src-tauri/Cargo.toml`, `src-tauri/Cargo.lock`, `src-tauri/tauri.conf.json`.
- Memória: `AGENTS.md` e este snapshot.

## Validações

- `npm run build` passou.
- `cargo check` passou.
- `git diff --check` passou; restaram apenas avisos do Git sobre normalização LF/CRLF.
- Nenhum teste automatizado foi executado.

## Problemas conhecidos

- A integração GitHub exige conectar um token fine-grained com acesso de leitura aos repositórios desejados. Permissões de Checks e Commit statuses permitem consultar CI; sem elas, os PRs ainda podem aparecer sem status.
- A bandeja, as dimensões nas três bordas, o token GitHub, os estados de pausa, os sons e as novas aparências precisam de inspeção manual no runtime do Windows.
- O tempo ativo do Codex é estimado entre os eventos locais `UserPromptSubmit` e `Stop`/`Interrupt`; ele não mede uso do app-server nem conteúdo da conversa.

## Próximos passos

- Abrir o app no Windows e conferir o novo painel nas bordas esquerda, superior e inferior, incluindo a janela de 420 px de altura.
- Conectar um token fine-grained de teste e verificar PRs próprios, revisões pedidas, CI, atualização periódica e pausa pela bandeja.
- Confirmar a interação “Perguntar ao Ghosty” para texto e arquivo, incluindo o pedido de permissão para ler arquivo.
- Conferir o menu da bandeja, a persistência do token no Gerenciador de Credenciais e sons desligados por padrão.
