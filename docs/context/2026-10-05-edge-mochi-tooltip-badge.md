# Explicação da badge de atividade do Mochi

## Objetivo

Ao manter o cursor por 1 segundo sobre a badge de atividade do Mochi, mostrar ao lado um balão curto que explica o estado atual.

## Alterações realizadas

- Adicionei uma área de tooltip ao personagem, sem alterar o desenho ou a animação da badge.
- O motor de movimento reconhece o cursor sobre a badge, aguarda 1 segundo e posiciona o balão ao lado com uma transição curta.
- O balão escolhe o lado com mais espaço dentro do painel e se reposiciona quando o painel muda de tamanho.
- A busca nos atalhos informa o termo digitado; o estado de foco informa que o temporizador está em andamento. Outros estados com badge têm mensagens descritivas.
- Sair da badge ou trocar de estado cancela/esconde o balão.

## Arquivos tocados

- `src/main.ts`
- `src/pet-motion.ts`
- `src/style.css`
- `docs/context/2026-10-05-edge-mochi-tooltip-badge.md`

## Validações

- Revisei estaticamente o cálculo da posição da badge no canvas, a hitbox de hover e os estados que geram mensagens.
- Não executei build ou testes; a inspeção visual no app ainda está pendente.

## Problemas conhecidos

- O posicionamento e o atraso de 1 segundo precisam ser confirmados no runtime, nos tamanhos compacto e grande do Mochi.
- Alguns estados de badge têm texto definido no motor, embora não sejam acionados pela interface atual.

## Próximos passos

- Reiniciar o app e testar o balão sobre as badges de busca, foco e conclusão.
- Conferir o lado escolhido e o recorte nas orientações vertical e horizontal.
