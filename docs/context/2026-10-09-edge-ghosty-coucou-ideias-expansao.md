# Análise do Coucou e ideias para o Edge Ghosty

## Objetivo

Analisar o Coucou atual e sugerir novas funções para o Edge Ghosty, levando em conta o estado e os limites de privacidade descritos no `AGENTS.md`.

## Pesquisa e alterações realizadas

- Consultados o README, o changelog e o site oficial do Coucou em 2026-10-09.
- O Coucou destaca atividade de agentes em tempo real, aprovações e perguntas no notch, diffs, atalhos, mascote destacável para o desktop, resumo semanal compartilhável, sons personalizáveis e demonstração com dados de exemplo.
- O lançamento Windows/Linux 0.3.0 também lista abertura por hover, sons próprios, atalhos de teclado e envio do mascote para o desktop.
- Foram propostas ideias adaptadas ao Ghosty: retrospectiva semanal baseada somente nas métricas agregadas locais; indicador de uso/limites do Codex; cartão de atividade transitória e resumida do Codex; atalhos globais para navegação e aprovações; notificações nativas acionáveis com vínculo à solicitação pendente exata; modo opcional de Ghosty flutuante no desktop; modo de demonstração que não altere hooks nem credenciais; modelos locais opcionais para o chat; sons customizados por evento.
- As ideias preservam o limite de integração com agentes apenas do Codex. A retrospectiva deve usar somente contagens e durações locais existentes, sem armazenar nomes de sessão, prompts, respostas, comandos ou resultados. Atividade detalhada deve permanecer transitória.

## Arquivos tocados

- `docs/context/2026-10-09-edge-ghosty-coucou-ideias-expansao.md` — novo snapshot desta tarefa.

## Validações

- Revisada a lista de arquivos em `docs/context/` para escolher um identificador novo.
- Nenhum teste foi executado; esta tarefa foi de pesquisa e ideação, sem alteração de código.

## Problemas conhecidos

- Indicadores de limites do Codex dependem de confirmar uma fonte local estável e suportada para esses dados.
- Notificações interativas do Windows e um mascote flutuante exigem avaliar o comportamento de foco, o hitbox e a correspondência segura das aprovações antes de implementação.
- Um modo de demonstração deve isolar dados fictícios e restaurar o estado anterior sem alterar arquivos de configuração ou credenciais.

## Próximos passos

- Priorizar a retrospectiva semanal, atalhos globais de navegação e uma demonstração segura como opções de menor dependência externa.
- Validar os requisitos técnicos de notificações acionáveis e modo desktop antes de detalhar essas propostas.

## Fontes consultadas

- https://github.com/Louis-CFM/coucou
- https://github.com/Louis-CFM/coucou/blob/main/CHANGELOG.md
- https://louis-cfm.github.io/coucou/
