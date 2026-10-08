# Contexto da tarefa: volume vertical e controles neutros

Data: 2026-10-08  
Identificador: edge-ghosty-midia-volume-vertical-controles-neutros

## Objetivo

Reposicionar a barra principal de volume na vertical entre o cartão de Mídia e as pílulas, remover o azul dos sliders e usar o espaço do player para controles de faixa mais confortáveis.

## Alterações realizadas

- O volume principal agora fica numa coluna vertical entre o cartão da Mídia e a navegação; seu evento continua enviando alterações para o comando de volume do sistema.
- Na borda esquerda, o controle também fica entre os cartões empilhados e mantém o slider orientado na vertical.
- Removido o slider principal do rodapé do player.
- Centralizados os controles anterior, reproduzir/pausar e próxima; aumentados para 36 px e 42 px.
- Barras de volume e progresso usam tom neutro em vez de azul.
- A largura horizontal da ilha Mídia aumentou para até 1000 logical px, preservando a largura da coluna das pílulas; o mixer segue com expansão própria.
- Atualizada a memória geral do projeto.

## Arquivos tocados

- `src/main.ts`
- `src/style.css`
- `AGENTS.md`
- `docs/context/2026-10-08-edge-ghosty-midia-volume-vertical-controles-neutros.md`

## Validações

- Build, verificações automatizadas e inspeção visual no runtime não foram executados.
- Foi feita revisão estática do markup do controle, da vinculação de eventos e dos grids horizontal e esquerdo.

## Problemas conhecidos

- A direção visual do slider vertical e o espaço entre os cartões precisam ser conferidos no WebView2.
- Em monitores estreitos, os limites da janela podem comprimir as colunas.

## Próximos passos

- Conferir ajuste de volume pela barra vertical nas bordas superior, inferior e esquerda.
- Conferir alinhamento e tamanho dos controles com uma faixa tocando e com o mixer aberto.
- Verificar que os sliders aparecem em cinza claro e não em azul no WebView2.
