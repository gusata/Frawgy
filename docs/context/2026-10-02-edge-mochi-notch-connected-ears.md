# Contexto da tarefa — contorno conectado do notch

Data: 2026-10-02
Identificador: edge-mochi-notch-connected-ears

## Objetivo

Avaliar a captura enviada pelo usuário e evitar que as orelhas do notch pareçam duas bolhas separadas da haste.

## Alterações realizadas

- Mantidas as orelhas em pseudo-elementos `.edge-island::before` e `::after`.
- Aumentada a altura de cada aba de 30 para 48 px e o raio de 15 para 24 px, aumentando a sobreposição com a haste.
- Aumentada a haste recolhida de 8 para 10 px para deixar a junção mais contínua.
- Mantida a largura da janela nativa recolhida em 18 px.

## Arquivos tocados

- `src/main.ts`
- `src/style.css`
- `docs/context/2026-10-02-edge-mochi-notch-connected-ears.md`

## Validações

- Avaliada visualmente a captura enviada: as duas abas pareciam bolhas isoladas.
- Não foi feita uma nova captura do app após as alterações.

## Problemas conhecidos e próximos passos

- Confirmar visualmente no Windows que as abas alongadas se unem à haste com a curva esperada; se necessário, ajustar a sobreposição após ver a nova captura.
