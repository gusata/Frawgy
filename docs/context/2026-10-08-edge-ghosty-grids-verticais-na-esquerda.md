# Contexto: menus verticais na borda esquerda

Data: 2026-10-08  
Identificador: edge-ghosty-grids-verticais-na-esquerda

## Objetivo

Quando a ilha estiver na borda esquerda, adaptar todos os menus da interface para uma composição vertical, com cartões empilhados e grades em uma coluna. Preservar a composição horizontal nas bordas superior e inferior, além do modelo do Ghosty e da barrinha recolhida.

## Alterações realizadas

- `expandedIslandSize()` agora usa largura de até 420 logical px na esquerda; Home usa altura de até 480 px e Pet, Atalhos, Configurações e onboarding até 620 px, limitados ao espaço do host.
- Na Home, o cartão principal fica acima da grade de quatro pílulas, que ocupa uma coluna e preenche o espaço disponível.
- Pet passa a empilhar palco e painel lateral na esquerda.
- Atalhos, onboarding e grades internas de configurações usam uma coluna na esquerda. Conteúdos extensos continuam roláveis.
- As bordas superior e inferior mantêm as dimensões e grades horizontais existentes. A janela hospedeira, hitbox, barrinha recolhida, orelhas e renderização Canvas do Ghosty permanecem iguais.
- Atualizada a memória operacional para registrar a nova regra de orientação.

## Arquivos tocados

- `src/main.ts`
- `src/style.css`
- `AGENTS.md`
- Este snapshot novo em `docs/context/`

## Validações

- `npm run build` passou (TypeScript e Vite).
- `git diff --check` não encontrou erros de whitespace.
- Inspeção no runtime Windows a 900×720 com a borda esquerda: Home e suas quatro pílulas aparecem em coluna; Pet empilha personagem e painel de ações; Atalhos usa listas de uma coluna com rolagem; Configurações permanece em uma coluna com rolagem.
- Nenhum teste foi adicionado ou executado.

## Problemas conhecidos

- Monitores mais baixos ainda podem reduzir as alturas disponíveis; o conteúdo extenso depende de rolagem interna.

## Próximos passos

- Conferir monitores mais baixos caso o usuário relate recortes ou dificuldade de rolagem.
