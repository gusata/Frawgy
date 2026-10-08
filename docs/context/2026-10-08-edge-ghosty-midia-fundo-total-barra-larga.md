# Contexto da tarefa: fundo da Mídia e largura da ilha

Data: 2026-10-08  
Identificador: edge-ghosty-midia-fundo-total-barra-larga

## Objetivo

Fazer o fundo visual da faixa cobrir todo o cartão principal da Mídia e aumentar a largura horizontal da barra para dar mais espaço ao player.

## Alterações realizadas

- Movida a arte da faixa para o cartão principal inteiro; o blur passa por trás dos controles e do Ghosty.
- Mantido o Ghosty acima da camada de fundo.
- Removidos o fundo escuro isolado e a borda do agrupamento inferior dos controles, deixando a capa desfocada visível também nessa área.
- A largura das vistas horizontais da ilha aumentou de até 800 para 960 logical px; o conteúdo Home pode ocupar até 920 px. As alturas por aba não mudaram. O limite do mixer permanece até 1060 px.
- Pet, Atalhos e Configurações também podem ocupar mais largura horizontal. A largura real continua limitada à janela hospedeira e à tela; a composição vertical da esquerda permanece inalterada.
- Atualizada a memória geral do projeto.

## Arquivos tocados

- `src/main.ts`
- `src/style.css`
- `AGENTS.md`
- `docs/context/2026-10-08-edge-ghosty-midia-fundo-total-barra-larga.md`

## Validações

- Não foram executados build, verificações automatizadas ou inspeção visual no runtime nesta tarefa.
- Foi feita revisão estática das regras de largura, do fundo do cartão e do markup da Mídia.

## Problemas conhecidos

- O blur e a largura ampliada precisam de conferência visual no WebView2 em monitores de diferentes resoluções e escalas.
- O conteúdo pode atingir a largura máxima apenas quando o host e a tela permitem.

## Próximos passos

- Conferir o fundo da arte ocupando o cartão inteiro, incluindo atrás do Ghosty e dos controles.
- Confirmar a nova largura na Home, Pet e Atalhos nas bordas superior e inferior.
- Verificar que o mixer continua expandindo e que a composição da borda esquerda não mudou.
