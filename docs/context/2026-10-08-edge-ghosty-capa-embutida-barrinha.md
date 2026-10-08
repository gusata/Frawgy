# Snapshot: capa embutida na barrinha de mídia

## Objetivo

Reduzir a miniatura de mídia exibida com a ilha recolhida e incorporá-la à própria barrinha.

## Alterações realizadas

- A cápsula externa de 42×42 px foi substituída por uma capa de 16 px embutida no corpo da ilha.
- Durante a reprodução com capa disponível, a ilha recolhida anima para uma cápsula de pelo menos 96×20 px; na borda esquerda, a composição fica vertical.
- Uma linha de progresso acompanha a posição atual da faixa.
- A mini cápsula aparece somente durante a reprodução com arte disponível. Aprovações pendentes e avisos de tarefa concluída mantêm prioridade e recolhem a barrinha para o tamanho configurado.
- A geometria animada continua publicada ao hitbox nativo, inclusive ao ativar, pausar ou trocar de faixa.

## Arquivos tocados

- `src/main.ts`
- `src/style.css`
- `docs/context/2026-10-08-edge-ghosty-capa-embutida-barrinha.md`

## Validações

- Revisada a estrutura para confirmar que capa e progresso agora são filhos do corpo recortado da ilha.
- `git diff --check -- src/main.ts src/style.css docs/context/2026-10-08-edge-ghosty-capa-embutida-barrinha.md` passou.
- Build, testes e inspeção visual no runtime não foram executados.

## Problemas conhecidos

- A composição ainda precisa de inspeção visual no Windows, principalmente na borda esquerda e durante a transição entre reprodução e pausa.

## Próximos passos

- Conferir a mini cápsula recolhida nas três bordas e ajustar o tamanho da capa ou o comprimento conforme o resultado visual.
