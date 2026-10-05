# Ingestão do Bolso sem interromper o Mochi

## Objetivo

Corrigir o corte da animação após guardar um arquivo ou texto no Bolso do Mochi.

## Alterações realizadas

- A atualização atrasada do Bolso deixou de redesenhar a aba inteira. Agora ela atualiza status, lista de itens e atmosfera no DOM atual, preservando o canvas e o motor de movimento do Mochi.
- A lista do Bolso é atualizada também no início da ingestão, sem substituir o personagem.
- Os botões de abrir e remover itens são religados quando a lista é atualizada. Remover um item também passou a atualizar somente o Bolso.
- A mensagem de confirmação do drop altera diretamente o palco existente, sem depender de uma nova renderização.
- Os caminhos de item duplicado, Bolso cheio e falha ao salvar também atualizam o Bolso sem recriar o pet.

## Arquivos tocados

- `src/main.ts`
- `docs/context/2026-10-05-edge-mochi-ingestao-sem-corte.md` (este snapshot)

## Validação

- Revisão estática do fluxo de ingestão, atualização da lista e registro dos eventos dos botões.
- Build, testes e inspeção visual no Windows não foram executados nesta tarefa.

## Problemas conhecidos

- Trocar de aba ou abrir/fechar manualmente o painel do pet ainda redesenha o conteúdo. Uma navegação feita durante a ingestão pode interromper a animação.
- A correção precisa ser confirmada com um drop real no WebView2.

## Próximos passos

- Arrastar um arquivo para o Mochi e confirmar que a ingestão termina sem corte enquanto a lista do Bolso atualiza.
- Se ainda houver um retorno brusco, observar o instante exato para separar o fim da sequência de ingestão de uma navegação manual.
