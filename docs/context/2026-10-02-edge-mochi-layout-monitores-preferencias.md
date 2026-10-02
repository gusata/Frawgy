# Contexto da tarefa — layout, monitores e preferências

Data: 2026-10-02  
Identificador: edge-mochi-layout-monitores-preferencias

## Objetivo

Adicionar as preferências pedidas para o notch: comprimento e espessura ajustáveis, posição à esquerda/em cima/em baixo, alinhamento ao longo da borda, seleção de monitores, opção para todos os monitores, tempo para recolher, pontos indicadores e restauração dos padrões. O painel expandido deve ser vertical nas laterais e horizontal em cima/baixo. A abertura por hover deve ocorrer apenas na barrinha recolhida.

## Alterações realizadas

- Reescrita da tela de configurações com seletores para borda e monitores, sliders para comprimento, espessura, posição e atraso, alternância dos três pontos e botão de restaurar padrões.
- Mantido o armazenamento das dimensões no `localStorage`; a chave antiga da altura da barra continua sendo usada como comprimento para preservar o valor anterior.
- Adaptado o notch CSS às orientações esquerda, superior e inferior. O comprimento da barrinha move junto as orelhas radiais; a espessura é independente.
- Criado layout em colunas para os controles do painel horizontal em cima/baixo.
- O hover agora é escutado no corpo visível do notch, em vez da janela inteira. A janela nativa recolhida acompanha a área visual configurada.
- Implementadas janelas Tauri secundárias, ocultas quando não selecionadas, para exibir o menu em vários monitores. A janela principal usa o monitor primário como padrão; as preferências sincronizam as demais janelas.
- A configuração de posição ao longo da borda usa o mesmo controle percentual: vertical na esquerda e horizontal em cima/baixo.

## Arquivos tocados

- `src/main.ts`
- `src/style.css`
- `src-tauri/src/lib.rs`
- `docs/context/2026-10-02-edge-mochi-layout-monitores-preferencias.md`

## Validações

- `npm run build` passou (TypeScript e Vite).
- `cargo check --manifest-path .\src-tauri\Cargo.toml` passou no Developer PowerShell do Visual Studio 2022.
- `git diff --check` passou.
- Não foi feita validação visual em uma configuração física com múltiplos monitores.

## Problemas conhecidos e próximos passos

- Conferir no Windows o aspecto real do notch nas três bordas, em escalas de DPI diferentes e com mais de um monitor.
- Os IDs dos monitores incluem nome e posição; reorganizar monitores pode invalidar uma seleção salva e fazer o app voltar ao primário.
- A criação dinâmica das janelas adicionais usa o `WebviewWindowBuilder` do Tauri em comando assíncrono, conforme a orientação da API para criação durante comandos no Windows.
