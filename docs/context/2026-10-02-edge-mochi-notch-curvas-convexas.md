# Contexto da tarefa — curvas convexas do notch

Data: 2026-10-02
Identificador: edge-mochi-notch-curvas-convexas

## Objetivo

Corrigir o notch recolhido para que as duas extremidades arredondadas pareçam sair da borda, conforme a referência visual do Coucou e o requisito registrado no `AGENTS.md`.

## Alterações realizadas

- A haste central recolhida agora mede 8 px de largura; as duas abas arredondadas medem 18 px e se projetam visualmente para dentro da tela.
- As abas ficam alinhadas e se sobrepõem à haste para formar uma silhueta contínua, com curvas convexas nos dois extremos.
- A largura da janela nativa recolhida continua em 18 px. Assim, a curva cabe na área nativa existente e a correção não cria uma faixa invisível adicional.
- Ao expandir, a silhueta continua sendo um painel preto preso à borda, com cantos externos arredondados.
- Removidas as regras antigas das orelhas radiais, que não criavam relevo visível porque a haste ocupava a largura inteira disponível.

## Arquivos tocados

- `src/main.ts`
- `src/style.css`
- `docs/context/2026-10-02-edge-mochi-notch-curvas-convexas.md`

## Validações

- Revisão estática das dimensões e do posicionamento CSS em relação à janela nativa recolhida de 18 px.
- Build e conferência visual não foram executados nesta tarefa.

## Problemas conhecidos e próximos passos

- Conferir visualmente no Windows se a projeção de 10 px entre a haste e as abas corresponde à referência desejada e ajustar a escala, caso necessário.
- Confirmar em diferentes escalas de DPI que as curvas não ficam serrilhadas ou cortadas na borda da janela.
