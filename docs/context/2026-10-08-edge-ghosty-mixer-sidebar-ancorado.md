# Contexto: mixer lateral ancorado

Data: 2026-10-08  
Identificador: edge-ghosty-mixer-sidebar-ancorado

## Objetivo

Corrigir a abertura de Volume dos apps: manter o player no lugar, não aumentar a altura da ilha e exibir os volumes dos aplicativos na vertical.

## Alterações realizadas

- Removida a geometria especial de largura e altura da ilha para o mixer.
- O painel fica na área lateral já reservada e cresce da esquerda para a direita com transição própria; abrir ou fechar não chama a animação de geometria da ilha.
- O cartão de mídia e o slider principal mantêm a mesma posição e dimensões.
- Os sliders por aplicativo passaram para a orientação vertical, com cartões compactos lado a lado e rolagem horizontal para muitas sessões.
- Na borda esquerda, o mixer ocupa o cartão de navegação existente sem mudar as três linhas do layout.
- Os cartões de navegação ficam inativos e acessíveis como ocultos enquanto o mixer está aberto; o botão de fechar mantém o painel utilizável por teclado.

## Arquivos tocados

- `AGENTS.md`
- `src/main.ts`
- `src/style.css`
- Este snapshot em `docs/context/`

## Validações

- Revisão estática da geometria, dos estados aria/inert e do fluxo de atualização dos sliders.
- Build, testes e inspeção visual em runtime não foram executados nesta tarefa.

## Problemas conhecidos

- A apresentação em telas estreitas e a disposição dos nomes de muitos aplicativos ainda dependem de conferência visual.
- Os aplicativos disponíveis continuam limitados às sessões de áudio expostas pelo Windows.

## Próximos passos

- Abrir e fechar o mixer nas bordas horizontal e esquerda, conferindo que o cartão principal não se move e a altura não muda.
- Conferir a orientação, rolagem e ajuste dos sliders verticais com várias sessões de áudio abertas.
