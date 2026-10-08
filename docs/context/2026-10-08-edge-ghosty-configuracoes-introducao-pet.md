# Contexto — Configurações, introdução e Pet

## Objetivo

Remover configurações e atalhos da navegação compacta da ilha, abrir Configurações em uma janela própria, melhorar a introdução da primeira execução, ampliar a personalização da barrinha e dar mais destaque visual ao Ghosty na tela Pet.

## Alterações realizadas

- A ilha mantém apenas Início e Pet. Configurações agora abre uma janela normal, centralizada, redimensionável e visível na barra de tarefas, com abas Geral e Atalhos.
- A tela Atalhos foi movida para Configurações. Um destaque explica que o chat rápido pode abrir destinos salvos por nome.
- A introdução inicial apresenta o Ghosty com animação de chegada e saudação, movimento de boas-vindas no Canvas, brilho e partículas. O assistente inicial permite escolher abertura por hover ou clique; a preferência também está em Geral.
- Comprimento e espessura da barrinha têm campos numéricos vinculados aos sliders. Um controle de posição percorre toda a lateral de 0 a 100%; a janela hospedeira também acompanha a posição, preservando os limites do monitor.
- A tela Pet aumentou para 320 px de altura nas bordas horizontais e 620 px na borda esquerda, com o personagem maior, órbita animada, ações e resumo do Bolso.
- A janela de Configurações recebeu as permissões de janela, eventos, atualizador e reinício que usa.

## Arquivos tocados

- `src/main.ts`
- `src/style.css`
- `src-tauri/src/lib.rs`
- `src-tauri/tauri.conf.json`
- `src-tauri/capabilities/default.json`
- `src-tauri/capabilities/updater-main.json`
- `src-tauri/gen/schemas/capabilities.json` (regenerado pelo Tauri)
- `AGENTS.md`

## Validações

- `npm run build` — TypeScript e Vite concluíram com sucesso.
- `cargo check --locked` — concluído com sucesso. O compilador manteve um aviso `unused_mut` preexistente em `src-tauri/src/codex_hooks.rs:436`.
- `git diff --check` — sem erros de whitespace.

## Problemas conhecidos

- A interface compilou, mas a nova tela ainda não foi aberta para inspeção visual manual no Windows.
- `cargo check` reporta o aviso de variável mutável não utilizada em `codex_hooks.rs`, fora do escopo desta tarefa.

## Próximos passos

- Abrir Configurações no Windows e conferir a rolagem de Geral, a aba Atalhos e a animação de boas-vindas em diferentes tamanhos de janela.
- Confirmar visualmente os extremos 0% e 100% nas orientações esquerda, superior e inferior, inclusive em monitores com escala diferente.
