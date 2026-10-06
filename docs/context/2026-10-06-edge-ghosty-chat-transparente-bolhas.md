# Edge Ghosty: fundo transparente e bolhas do Figma

## Objetivo

Corrigir o popup do chat conforme a leitura do Figma esclarecida pelo usuário: desktop visível ao fundo, “pesquise...” como exemplo de mensagem do usuário e a forma grande como exemplo de resposta do Ghosty.

## Alterações realizadas

- Removido o fundo cinza sólido do componente; o popup e o shell continuam transparentes, conforme a configuração Tauri já existente.
- A busca foi removida. No estado vazio, duas bolhas de exemplo ocupam as posições do mock; ao iniciar uma conversa, elas somem e dão lugar às mensagens reais.
- O histórico real permanece numa área transparente de altura fixa, alinhada embaixo e com rolagem interna. As bolhas do usuário e do Ghosty usam superfícies claras com contorno preto.
- Corrigida a proporção do Canvas do Ghosty para exibir sua silhueta em aproximadamente 100×85 px sem fundo.
- Encurtada a entrada sequencial: Ghosty emerge, compositor aparece e as bolhas/controles entram por último, em cerca de 0,7 s no total, sem sobrepor as etapas.
- Sem cartão de conexão inicial; enviar uma mensagem sem conta conectada inicia o OAuth e mantém o texto no compositor.

## Arquivos tocados

- src/main.ts
- src/style.css
- AGENTS.md
- docs/context/2026-10-06-edge-ghosty-chat-transparente-bolhas.md (este snapshot)

## Validações

- npm run build passou (tsc e Vite).
- git diff --check passou, com avisos existentes de conversão LF/CRLF.
- Nenhum teste foi criado ou executado.

## Problemas conhecidos

- A janela nativa ainda precisa ser reaberta no Windows para conferir a transparência real do WebView2 e a animação de entrada.
- A tentativa de captura pelo Orca encontrou a janela principal transparente, mas não conseguiu focá-la para abrir o popup (window_not_focused).

## Próximos passos

- Reiniciar o app e abrir o chat com Ctrl + Shift + Espaço.
- Conferir a transparência, a entrada Ghosty → compositor → restante, o tamanho do personagem e a rolagem após várias mensagens.
