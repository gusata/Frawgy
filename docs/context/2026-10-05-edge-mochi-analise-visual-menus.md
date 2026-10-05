# Análise visual dos menus do Edge Mochi e do Coucou

## Objetivo

Comparar a linguagem e a hierarquia dos menus do Edge Mochi com a interface pública do Coucou e identificar princípios que possam melhorar os menus sem descaracterizar o produto.

## Resultado da análise

- O Coucou é uma superfície contextual e compacta para sessões de agentes, aprovações, chat e integrações. No Windows, as configurações ficam acessíveis pelo tray; a ilha é o ponto de interação frequente.
- O Edge Mochi é um painel lateral de utilidades gerais. A Home empilha volume, mídia, foco, lançador, Bolso, prancheta e resumo do pet; Pet e Atalhos abrem fluxos dedicados.
- A maior diferença visual é a densidade e a quantidade de níveis: cabeçalho com marca e cinco ações, contêiner da aba e vários cartões internos, cada um com fundo, borda e raio próprios.
- Home, Pet, Atalhos e Configurações usam linguagens de superfície distintas: cartões escuros repetidos, vidro com gradientes, grade de atalhos e cartões de configuração. Essa troca pode fazer o conjunto parecer menos coeso.
- Os rótulos de 8–9 px e os vários cinzas baixos enfraquecem a hierarquia e a leitura, especialmente nos textos auxiliares.

## Direção sugerida

- Preservar o Edge Mochi como painel lateral de utilidades; não copiar o conteúdo de agente nem a posição horizontal central do Coucou.
- Reduzir cartões independentes e contornos aninhados. Agrupar controles relacionados e reservar maior destaque visual para uma ou duas ações por tela.
- Tornar a Home um centro de ações imediatas: mídia/volume em um grupo compacto, foco com maior destaque e lançador curto. Deixar gerenciamento detalhado de itens e ações nos fluxos dedicados.
- Usar uma família consistente de superfícies e espaçamentos entre Home, Pet, Atalhos e Configurações; manter o vidro do Pet como variação discreta dessa família.
- Dar mais contraste e tamanho aos rótulos funcionais e padronizar os ícones do cabeçalho.
- Manter a revelação progressiva: mostrar o essencial no primeiro nível e deixar conteúdo secundário aparecer ao entrar na seção correspondente.

## Arquivos inspecionados

- `AGENTS.md`
- `docs/context/2026-10-05-edge-mochi-ingestao-sem-corte.md`
- `src/main.ts`
- `src/style.css`
- README e documentação Windows do repositório público Coucou.

## Validação e limites

- Análise estática da estrutura HTML e dos estilos atuais, comparada com a descrição e demonstração públicas do Coucou.
- Nenhum código de produto foi alterado; não houve build ou inspeção em runtime.
- Sem captura atual do Edge Mochi, a avaliação de densidade e hierarquia é baseada nas dimensões e estilos definidos no código.

## Próximos passos

- Escolher quais controles devem permanecer imediatamente visíveis na Home.
- Aplicar uma repaginação visual e comparar uma captura da interface antes e depois.
