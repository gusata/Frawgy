# Ajuste visual do balão de aprovação

- **Objetivo:** deixar os pedidos de aprovação do Ghosty mais claros e coesos nos modos recolhido e expandido.
- **Alterações:** cartão externo mais compacto, cantos uniformes, hierarquia de texto mais legível, resumo da ação em bloco destacado, botões com pesos visuais claros e foco de teclado visível. O painel expandido usa o mesmo cabeçalho e tratamento visual, com Ghosty um pouco menor e fundo menos pesado.
- **Arquivos tocados:** `src/style.css`, `src/main.ts` e este snapshot.
- **Validações:** inspeção do screenshot atual do app e revisão estática do CSS/markup; nenhuma build ou teste foi executado.
- **Problemas conhecidos:** o pedido real não estava visível durante a inspeção, então a nova apresentação ainda precisa ser conferida ao vivo com uma aprovação pendente.
- **Próximos passos:** observar um pedido real recolhido e expandido, verificando também as bordas esquerda, superior e inferior.
