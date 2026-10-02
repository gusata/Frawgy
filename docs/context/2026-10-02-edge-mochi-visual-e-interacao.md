# Contexto da tarefa — Edge Mochi visual e interação

Data: 2026-10-02

## Pedido

Atualizar o Edge Mochi para ter orelhas convexas pretas mais marcadas, visual monocromático, pet com percentual de uso em vez de tokens, atalhos arrastáveis e nenhuma área invisível bloqueando cliques quando o menu estiver recolhido.

## Alterações

- Reescrito `src/main.ts` para remover os cards de tokens.
- Adicionado pet monocromático com o rosto `•ᴗ•` e percentual de uso.
- Mantido o controle de volume via comando Tauri.
- Implementada reordenação drag-and-drop dos atalhos.
- Adicionado o comando `set_window_expanded` ao backend.
- Reescrito `src/style.css` com paleta em tons de preto/cinza, pet, orelhas convexas e estados de hover/drag.
- Janela nativa passa a ter 18px recolhida e 360px expandida.

## Validação

- `npm run build` passou.
- A validação final do Rust deve ser feita no Developer PowerShell com `npm run tauri dev`.

## Próximos passos possíveis

- Testar visualmente o tamanho/posição das orelhas em diferentes escalas DPI.
- Persistir a ordem dos atalhos em arquivo/configuração.
- Implementar o botão `+` para cadastrar atalhos reais.
- Conectar o percentual do pet a uma fonte real de uso dos agentes.
