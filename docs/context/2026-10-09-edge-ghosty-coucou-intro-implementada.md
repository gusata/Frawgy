# Contexto da tarefa: introdução do Coucou no primeiro uso

## Objetivo

Adaptar a animação inicial do Coucou ao Edge Ghosty, posicionar a primeira abertura no topo central da tela e mostrar a configuração inicial existente quando a animação terminar.

## Alterações realizadas

- A borda padrão passou da esquerda para o topo. Enquanto a configuração inicial ainda não foi concluída, a ilha usa o topo central, inclusive se houver uma preferência antiga de borda gravada.
- O primeiro uso agora começa recolhido, expande para uma cena de 640 × 150 logical px e toca uma animação de aproximadamente 4,6 segundos.
- A sequência adaptada inclui entrada com riscos verticais, anel de 90 pontos, pouso com squash e quique, deslocamento lateral, aceno, badge, retorno ao centro, halo dourado que muda para azul e tinta azul no corpo.
- O Ghosty continua usando o próprio seixo, paleta, olhos e desenho das mãos. A pose e os efeitos foram adaptados ao renderer Canvas existente.
- No final, a cena é removida e a ilha redimensiona para exibir a tela de configuração inicial já existente. Preferência por movimento reduzido pula a saudação.
- Foi adicionado um aviso de atribuição para o código adaptado sob a licença MIT do Coucou.

## Arquivos tocados

- `AGENTS.md` (memória geral atualizada)
- `src-tauri/src/lib.rs` (posição inicial do host no topo)
- `src/main.ts`
- `src/pet-motion.ts`
- `src/launch-greeting.ts` (novo)
- `src/style.css`
- `THIRD_PARTY_NOTICES.md` (novo)
- `docs/context/2026-10-09-edge-ghosty-coucou-intro-implementada.md` (este snapshot)

## Validação

- Revisão estática do fluxo de primeira execução, da geometria da borda superior e da sincronização entre pose, partículas e troca para a configuração.
- Nenhum teste ou build foi executado.

## Problemas conhecidos

- A animação não foi conferida visualmente em runtime; tempos e partículas foram adaptados do renderer de referência e ainda precisam de comparação na janela Tauri.
- A configuração será mostrada no primeiro uso enquanto `edge-ghosty.onboarding-complete` não estiver marcada como concluída. Usuários com onboarding já concluído não verão a saudação de novo automaticamente.

## Próximos passos

- Conferir manualmente numa instalação com onboarding pendente: entrada no topo, partículas e gesto, transição para a configuração e leitura em telas com diferentes densidades de escala.
- Se a comparação visual apontar diferenças, ajustar a geometria específica do Canvas sem trocar a silhueta do Ghosty.
