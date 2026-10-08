# Contexto da tarefa: correção final da miniatura de mídia

Data: 2026-10-08  
Identificador: edge-ghosty-midia-capa-stream-close-fix-runtime

## Objetivo

Resolver a ausência da capa no blur do player de mídia depois da conversão do stream WinRT.

## Alterações realizadas

- Removido `Dispose()` do objeto COM `IRandomAccessStreamWithContentType`. O stream gerenciado e o `MemoryStream` continuam sendo liberados normalmente; o processo PowerShell descarta o wrapper COM ao terminar.
- A correção anterior de reflexão para chamar `AsStream` e a detecção do formato por assinatura continuam ativas.
- O player mantém a largura integral e o frontend tenta buscar a miniatura enquanto a sessão não a fornece.
- Atualizada a memória geral sem reescrever o snapshot anterior.

## Arquivos tocados nesta correção

- `src-tauri/src/lib.rs`
- `AGENTS.md`
- `docs/context/2026-10-08-edge-ghosty-midia-capa-stream-close-fix-runtime.md`

## Validações

- Executei o script PowerShell extraído do comando Tauri: JSON parseado corretamente, com Data URL PNG de 36.442 caracteres.
- A inspeção do player atualizado no WebView2 mostrou a capa desfocada no fundo.
- A tentativa `npm run tauri dev` encontrou a porta Vite 1420 já ocupada; o servidor existente foi reutilizado e o app compilado/aberto pelo processo Cargo.

## Problemas conhecidos

- Fontes de mídia que não publicam miniatura no Windows continuam sem imagem de fundo.

## Próximos passos

- Nenhum para a faixa conferida; testar outra fonte de mídia apenas se o usuário reportar ausência de capa nela.
