# Contexto da tarefa: controles do player de mídia

Data: 2026-10-08  
Identificador: edge-ghosty-midia-player-controles-espacados

## Objetivo

Remover o quadrado da capa e melhorar a leitura e o espaçamento dos controles do player, que estavam compactos demais.

## Alterações realizadas

- Removido o elemento de capa quadrada e a rotina de atualização dessa miniatura.
- Mantida a arte da faixa como fundo ampliado, desfocado e escurecido do cartão.
- Aumentados título, artista, slider de progresso, controles anterior/reproduzir/próxima e slider de volume.
- Agrupados os controles de transporte e volume numa superfície arredondada com hover discreto.
- Preservados Ghosty, o espaço reservado ao personagem e a grade das pílulas.
- Atualizada a memória geral do projeto.

## Arquivos tocados

- `src/main.ts`
- `src/style.css`
- `AGENTS.md`
- `docs/context/2026-10-08-edge-ghosty-midia-player-controles-espacados.md`

## Validações

- Build, verificações automatizadas e inspeção visual no runtime não foram executados nesta tarefa.
- Foi feita uma revisão estática dos trechos de renderização e estilos alterados.

## Problemas conhecidos

- A distribuição visual e o espaço dos controles ainda precisam ser conferidos no WebView2 com uma faixa tocando.
- O ajuste pode precisar de refinamento para títulos longos, orientação esquerda e telas estreitas.

## Próximos passos

- Conferir a vista Mídia com e sem capa e com títulos/artistas longos.
- Confirmar que o Ghosty e as pílulas mantêm suas dimensões e que os controles não são cortados.
- Fazer build e inspeção visual do mixer lateral nas orientações disponíveis.
