# Contexto: botões da Home preenchendo a grade

Data: 2026-10-08  
Identificador: edge-ghosty-botoes-preenchem-grid

## Objetivo

Fazer os quatro botões de navegação da Home ocuparem toda a grade 2 × 2 do cartão direito, reduzindo o espaço vertical vazio visto pelo usuário.

## Alterações realizadas

- `.coucou-pill-card` agora divide a altura útil igualmente entre duas linhas e a largura entre duas colunas, com padding de 8 px e gap de 7 px.
- Cada `.coucou-pill` preenche a célula, ganhou raio de 16 px e mantém o ícone colorido à esquerda com o rótulo centralizado.
- O hover escala 1,02 para preservar o espaçamento e evitar que os botões encostem uns nos outros. A regra responsiva mantém a grade preenchida com margens menores.

## Arquivos tocados

- `src/style.css`
- Este snapshot novo em `docs/context/`

## Validações

- `npm run build` passou.
- `git diff --check` não encontrou erros de whitespace.
- Captura do app Edge Ghosty no Windows conferida: os quatro botões ocupam as células e permanecem alinhados sem sobreposição.

## Problemas conhecidos

- Em janelas extremamente estreitas, os rótulos longos podem ser truncados para respeitar a largura mínima de cada célula.

## Próximos passos

- Nenhum necessário para esta alteração; acompanhar truncamento apenas se a janela hospedeira mudar para uma largura menor.
