# Snapshot: orientação sobre latência e consumo do chat

## Objetivo

Responder como melhorar a velocidade do chat rápido mantendo baixo o consumo do plano.

## Constatações e recomendações

- O Ghosty usa GPT-6 Luna com esforço `low` como padrão/fallback e persiste a escolha do usuário; o seletor recebe os modelos e esforços oferecidos pelo `codex app-server`.
- A orientação oficial indica Luna para tarefas focadas e automações frequentes, e Luna com esforço baixo para alterações pequenas e bem delimitadas. Portanto, não há motivo para trocar o padrão como primeira tentativa.
- A demora de uma tarefa pode vir do raciocínio, dos ciclos de ferramenta e da execução (leitura, comandos ou build); geração de texto mais rápida não reduz necessariamente o tempo total.
- Recomendações práticas: formular um objetivo por pedido com escopo e critério de pronto, pedir resumo curto, usar Luna/low para tarefas rotineiras e reservar modelos mais fortes para tarefas ambíguas ou complexas. Reutilizar o chat aberto ajuda a evitar reiniciar o app-server; iniciar conversas separadas para tarefas não relacionadas evita carregar contexto antigo.
- GPT-6.1 Sol só deve ser comparado se aparecer no catálogo do app-server. A afirmação oficial de geração aproximadamente 50% mais rápida se aplica a ChatGPT e parceiros suportados, mas não promete reduzir ferramenta/execução e pode não se aplicar a esta integração customizada.
- Para uso com login ChatGPT/Codex, verificar Usage/limites do plano; o consumo varia por modelo, complexidade, contexto, raciocínio e ferramentas, e não deve ser tratado como uma conta direta de tokens de API sem confirmar a modalidade da conta.

## Arquivos tocados

- Este snapshot. Nenhum código foi alterado.

## Validações

- Consultadas as páginas oficiais de seleção de modelos, otimização de latência e uso/velocidade do Codex; sem build ou testes, pois não houve alteração de código.

## Próximos passos

- Se a lentidão continuar, medir em qual etapa ocorre: início da primeira resposta, geração de texto ou execução de ferramentas. Comparar modelos somente com a mesma tarefa curta e conferir o Usage do plano.
