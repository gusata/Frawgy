# Contexto da tarefa: cartão de mídia e miniatura

Data: 2026-10-08  
Identificador: edge-ghosty-midia-cartao-preenchido-capa-retry

## Objetivo

Corrigir o player da vista Mídia para usar toda a largura interna do cartão e fazer a arte da sessão de mídia aparecer como blur no fundo.

## Alterações realizadas

- O conteúdo do cartão Mídia passa a esticar na área útil; título, linha de progresso e controles podem usar a largura disponível em vez de ficarem no tamanho mínimo.
- O fundo desfocado da arte fica mais visível, preservando o personagem e os controles sobre a imagem e sem reintroduzir uma miniatura quadrada.
- A consulta de arte continua tentando obter a miniatura enquanto o backend retornar vazio. Após recebê-la, o ID da faixa evita recodificações repetidas.
- Corrigida a conversão do stream WinRT no backend: `Thumbnail.OpenReadAsync()` retorna objeto COM, que não vincula diretamente à sobrecarga PowerShell de `AsStream`; a chamada usa reflexão para selecionar/invocar a sobrecarga correta. Quando `ContentType` está vazio, o backend identifica formatos comuns pela assinatura dos bytes.
- A memória geral do projeto foi atualizada.

## Arquivos tocados

- `src/main.ts`
- `src/style.css`
- `src-tauri/src/lib.rs`
- `AGENTS.md`
- `docs/context/2026-10-08-edge-ghosty-midia-cartao-preenchido-capa-retry.md`

## Validações

- Revisão estática dos estilos de alinhamento e da condição de cache da miniatura.
- Uma consulta local somente leitura confirmou que a sessão de mídia fornece miniatura e que a chamada refletida de `AsStream` lê 25.151 bytes; a chamada direta anterior falhava porque o PowerShell tratava o stream como `System.__ComObject`.
- Build e inspeção no runtime WebView2 não foram executados.
- A documentação oficial do Windows descreve `Thumbnail` como uma referência à imagem associada à sessão e `OpenReadAsync` como a leitura desse stream.

## Problemas conhecidos

- O runtime ainda precisa ser atualizado/reaberto para confirmar a arte desfocada visualmente.
- Algumas fontes de mídia podem não fornecer miniatura; nesse caso o fundo permanece escuro.

## Próximos passos

- Conferir no Windows se progresso e controles ocupam a largura útil do cartão.
- Conferir a miniatura com Spotify, navegador ou outro player que exponha metadados de sessão.
