# Snapshot: indicador conjunto de Codex e música

## Objetivo

Manter visível a atividade do Codex quando a música tocando transforma a barrinha recolhida em mini player.

## Alterações realizadas

- Quando uma tarefa do Codex está ativa e a sessão de mídia está tocando, a ilha exibe uma bolha compacta ao lado da barrinha, com uma bolinha azul pulsante.
- A bolha acompanha a posição e a geometria animada da ilha nas bordas superior, inferior e esquerda.
- O indicador não recebe eventos de mouse e fica oculto com a ilha expandida, durante uma aprovação ou no aviso de conclusão.
- Os três pontos antigos continuam disponíveis nos demais estados recolhidos.

## Arquivos tocados

- `src/main.ts`
- `src/style.css`
- `docs/context/2026-10-08-edge-ghosty-bolha-codex-musica.md`

## Validações

- `git diff --check -- src/main.ts src/style.css` passou; o snapshot foi conferido quanto a espaços finais.
- Build, testes e inspeção visual no runtime não foram executados.

## Problemas conhecidos

- O posicionamento e a animação ainda precisam ser conferidos visualmente no Windows com música tocando durante uma tarefa do Codex.

## Próximos passos

- Conferir a bolha recolhida nas bordas horizontal e esquerda e confirmar que ela aparece e some ao iniciar e terminar a música ou a tarefa.
