# Snapshot: ajuste da capa e do progresso do mini player

## Objetivo

Evitar o recorte da capa na cápsula recolhida e manter o progresso da faixa avançando enquanto o menu está fechado.

## Alterações realizadas

- Reduzida a moldura da capa para 18 px e recuada dentro da cápsula para não encostar nos cantos arredondados.
- A linha de progresso ganhou trilho mais discreto, preenchimento suave e extremidades arredondadas.
- O progresso é recalculado a cada 250 ms usando a posição local interpolada entre consultas aos metadados do Windows.
- A sincronização com os metadados continua corrigindo a posição ao trocar de faixa ou quando o backend retorna novos dados.

## Arquivos tocados

- `src/style.css`
- `src/main.ts`
- `docs/context/2026-10-08-edge-ghosty-mini-player-capa-progresso.md`

## Validações

- Revisados os offsets da capa para as bordas horizontais e esquerda.
- `git diff --check -- src/main.ts src/style.css docs/context/2026-10-08-edge-ghosty-mini-player-capa-progresso.md` passou.
- Build, testes e inspeção visual no runtime não foram executados.

## Problemas conhecidos

- O resultado visual no Windows ainda precisa ser conferido.
- Se a sessão de mídia não informar duração, a linha permanece sem preenchimento.

## Próximos passos

- Conferir a capa e o avanço da linha com uma faixa tocando, pausada e após trocar de faixa.
