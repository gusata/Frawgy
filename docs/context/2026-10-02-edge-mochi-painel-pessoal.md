# Contexto da tarefa — painel pessoal do Edge Mochi

Data: 2026-10-02  
Identificador: edge-mochi-painel-pessoal

## Objetivo

Ampliar o Edge Mochi como painel rápido de uso geral, adicionar funções para o dia a dia e dar mais personalidade ao Mochi. O Bolso deve animar os itens como se o pet os comesse; a aba do pet deve ter um fundo de vidro com cores que acompanham humor e item guardado. Preservar a animação existente do notch.

## Alterações realizadas

- A Home reúne volume do sistema, faixa de mídia atual, controles de reprodução, temporizador de foco, lançador, prancheta, resumo do pet e prévia do Bolso.
- A aba Pet contém o Bolso, personalização de nome, aparência e acessório. Seu fundo de vidro transita suavemente conforme o humor e o tipo do item mais recente.
- O Bolso aceita arquivos, imagens e texto. Um item voa até o Mochi e dispara uma animação de mastigação. São salvas referências locais; arquivos originais não são movidos nem apagados.
- A prancheta permite capturar texto sob ação explícita, fixar itens, copiar de volta e remover entradas.
- O lançador abre aplicativos, pastas, arquivos e endereços; pesquisas sem destino reconhecido são abertas no navegador. Ações personalizadas podem abrir vários destinos e os atalhos continuam reordenáveis.
- Preferências, temporizador, atalhos, prancheta e itens do Bolso persistem localmente.
- A navegação usa três botões circulares de ícone no cabeçalho.
- Comandos Tauri adicionados para ler o volume, controlar mídia, consultar metadados da sessão atual, ler/gravar texto na prancheta e abrir destinos no Windows.
- A desserialização dos metadados de mídia foi habilitada no tipo Rust. O temporizador agora pinta seu estado inicial ao renderizar. O estado visual e o texto de soltar arquivos são limpos corretamente ao terminar o arrasto nativo.
- Foram removidas regras CSS antigas do cartão de consumo de agentes que podiam alterar o tamanho do pet no layout horizontal.
- A geometria e a animação do notch não foram alteradas nesta tarefa.

## Arquivos tocados

- `src/main.ts`
- `src/style.css`
- `src-tauri/src/lib.rs`
- `src-tauri/Cargo.toml`
- `README.md`
- `AGENTS.md`
- `docs/context/2026-10-02-edge-mochi-painel-pessoal.md`

## Validações

- Revisão estática dos comandos invocados no frontend e dos comandos registrados pelo Tauri.
- Revisão estática dos estados de arrasto, persistência local e regras de estilo do pet.
- Build, testes e inspeção em runtime não foram executados nesta tarefa.

## Problemas conhecidos

- A consulta do título e artista depende de uma sessão de mídia disponível no Windows; quando não há sessão acessível, os campos ficam vazios e os controles de mídia continuam disponíveis.
- Não foi validada em runtime nesta tarefa a integração Win32 de prancheta, mídia, abertura de destinos ou drag-and-drop.
- Arquivos guardados são referências ao caminho atual; se o original for movido ou removido, a referência deixa de abrir.

## Próximos passos

- Compilar e abrir com `npm run tauri dev` no Developer PowerShell do Visual Studio.
- Conferir visualmente as três abas nas orientações vertical e horizontal, incluindo gradientes, personalização e animação de comer.
- Exercitar captura/cópia da prancheta, controles de mídia e arrasto de arquivos no Windows.
