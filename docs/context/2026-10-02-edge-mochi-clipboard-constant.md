# Contexto da tarefa — constante do formato de texto da prancheta

Data: 2026-10-02  
Identificador: edge-mochi-clipboard-constant

## Objetivo

Corrigir o erro E0432 reportado ao compilar: `CF_UNICODETEXT` não é exportado por `Win32::System::DataExchange` na versão 0.62 do crate `windows`.

## Alterações realizadas

- Importada a constante `CF_UNICODETEXT` de `Win32::System::Ole`, onde ela está definida no crate `windows` 0.62.2.
- Convertido `CF_UNICODETEXT.0` para `u32` ao chamar `GetClipboardData` e `SetClipboardData`, que recebem esse tipo para o formato.
- Habilitada a feature `Win32_System_Ole` no Cargo.
- Atualizada a memória operacional do projeto.

## Arquivos tocados

- `src-tauri/src/lib.rs`
- `src-tauri/Cargo.toml`
- `AGENTS.md`
- `docs/context/2026-10-02-edge-mochi-clipboard-constant.md`

## Validações

- Conferida a localização da constante e as assinaturas das funções na fonte gerada local do crate `windows` 0.62.2.
- A compilação não foi repetida nesta tarefa.

## Problemas conhecidos

- A correção ainda precisa ser confirmada no próximo `npm run tauri dev` no Developer PowerShell.

## Próximos passos

- Reexecutar `npm run tauri dev` e corrigir qualquer próximo erro de compilação reportado.
