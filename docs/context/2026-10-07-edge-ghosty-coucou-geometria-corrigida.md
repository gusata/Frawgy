# Correção da geometria e do layout inspirado no Coucou

Data: 2026-10-07  
Identificador: edge-ghosty-coucou-geometria-corrigida

## Objetivo

Corrigir a Home que ocupava só parte do menu largo, garantir que a ilha expanda de forma consistente em todas as abas e manter a tela do Ghosty visível dentro do painel. Revisar as referências do repositório Coucou para aplicar seu arranjo visual sem substituir a identidade do Ghosty.

## Referência analisada

- Clone atualizado em `C:\Users\gustavo.sanches\AppData\Local\Temp\edge-ghosty-coucou-review-20261007`, commit `20e1f8b9def2b0d29f7c074eace1f7af9ce124bb` (2026-10-06), com 382 caminhos rastreados.
- Inventário do repositório, documentação principal e Windows, telas de referência do build Windows, arquitetura da ilha, views, CSS, animação e fluxos de integração. O código macOS/iPhone e o relay foram separados para não atribuir recursos exclusivos dessas plataformas ao Windows.
- Referências visuais mais relevantes: cabeçalho compacto, cartões escuros largos, conteúdo alinhado às bordas úteis e estados vazios sem colunas reservadas. O Ghosty permanece com seu desenho, acessórios e animações próprios.

## Diagnóstico

- `animateIsland` escrevia dimensões inline antigas de 760×280 na horizontal e 360×650 na esquerda. Esses valores venciam os novos limites declarados no CSS.
- Na borda superior/inferior, uma regra antiga da Home reservava três colunas apesar da marcação ter só dois cartões; o último terço ficava vazio.
- O palco do pet ainda herdava uma altura mínima e a grade não limitava a linha à área disponível.

## Alterações realizadas

- `src/main.ts`: alvos da animação alinhados às superfícies expandidas, até 1060×380 na horizontal e 860×650 na esquerda, calculados também pelo espaço da janela.
- `src/style.css`: duas colunas explícitas para a Home horizontal, conteúdo ocupando a largura disponível, breakpoint estreito preservado e linha limitada para a tela do pet; palco sem altura mínima antiga.
- `AGENTS.md`: decisão estrutural registrada como item 59 e validação adicionada.

## Validações

- `npm run build` passou (TypeScript e Vite).
- `git diff --check` passou; o Git mostrou somente avisos de normalização LF/CRLF já presentes na configuração do workspace.
- Inspeção visual do runtime Windows pelo Orca: Home expandida em janela 1100×420 preenche o painel de 1060 px sem o espaço reservado indevido; Pet mostra o Ghosty, o bolso e as ações no mesmo quadro.
- Nenhum teste automatizado foi criado ou executado. Nenhum código Rust mudou nesta tarefa, então `cargo check` não foi necessário.

## Problemas conhecidos e próximos passos

- Conferir manualmente a expansão pela borda esquerda, onde a janela usa 900×720 logical px.
- A inspeção do runtime não substitui a validação em todas as configurações de escala e resolução do Windows.
