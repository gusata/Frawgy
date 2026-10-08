# Coucou: referência minuciosa para os menus do Edge Ghosty

Data: 2026-10-08. Referência: clone local `C:\Users\gustavo.sanches\Documents\coucou`, commit `0aae11b` de 2026-10-02.

## Método e referência escolhida

Foram comparados o CSS e os componentes reais do port Windows (`windows/src/style.css`, `windows/src/views/views.ts`, `windows/src/views/integrations.ts`, `windows/src/settings/settings.css`), a implementação macOS (`IslandViewContent.swift`, `IslandTypes.swift`, `SettingsView.swift`) e as capturas em `windows/screenshots/`. As medidas abaixo descrevem **o port Windows desse checkout**, especialmente `overview.png`, `approval.png`, `drop.png`, `chat.png` e `settings.png`. O protótipo e `docs/SPEC.md` do Coucou divergem em vários tamanhos e tempos; não foram tratados como se fossem a tela executada.

O código do Coucou usa licença MIT, mas `LICENSE-ASSETS.md` reserva nome, Mochi, ícones, sons e imagens. A adaptação do Edge Ghosty usa composição, proporções, cor e comportamento de controle; conserva nome, desenho Canvas e sons próprios.

## Estrutura visível no screenshot de overview

| Região | Medida e aparência no Coucou Windows | Leitura prática |
|---|---|---|
| Ilha expandida | 640 × 160 px lógicos; shell preto puro `#000` | O shell desaparece visualmente na borda superior preta. |
| Conteúdo | padding 8 px em cima, 10 px nas laterais e embaixo | Não existe margem larga em torno dos cartões. |
| Cabeçalho | 34 px de altura | Só ícones; não existe logotipo textual, subtítulo nem rodapé na ilha. |
| Três abas à esquerda | cada área 30 × 22 px, raio 11, gap 5, padding inicial 14 | Home, conversa e soltar arquivos. A seleção usa `#1D1F23`. |
| Ações à direita | gap 14 px, padding final 16 | Configurações e som aparecem sem discos sólidos atrás. |
| Corpo | dois cartões lado a lado, gap 10 px | O esquerdo fixa 322 px; o direito preenche cerca de 288 px. |
| Cartões | `#141518`, raio 20, borda branca com 3,5% de opacidade | A divisão vem mais do contraste de superfície que de bordas. |
| Cartão esquerdo | Mochi à esquerda; identificação/status/ações à direita | Uma fonte principal de atenção por vez. O ticker vivo usa 44 px de altura. |
| Cartão direito | quatro pílulas em 2 colunas, linhas de 28 px, gap 4 | São destinos alternativos; clicar troca o foco do cartão esquerdo. |
| Pílula | `#0E0F11`, borda branca a 14%, raio 999, título 10 px semibold | Ícone/cor pequena à esquerda, rótulo centrado; hover escala para 1,04. |

O ponto que as versões anteriores do Ghosty perderam era a **hierarquia**. Uma Home com integrações, métricas, mídia, atalhos e utilitários todos visíveis, mesmo usando as cores corretas, fica muito mais parecida com um dashboard do que com o overview do Coucou. Uma barra de quatro abas ocupando toda a largura também não reproduz a grade de pílulas da captura real.

## Tokens de cor e tipografia

| Papel | Valor visto no código Windows |
|---|---|
| Shell | `#000000` |
| Fundo de configurações | `#0B0C0E` |
| Cartão principal | `#141518` |
| Pílula/área plana | `#0E0F11` |
| Aba selecionada | `#1D1F23` |
| Texto principal | `#F5F6F8` |
| Texto secundário | `#9398A1`, `#8E939C` |
| Texto terciário | `#6B7079`, `#5F646D`, `#4B5563` |
| Erro | `#F4505E`; texto `#FF8D97` |
| Sucesso | `#22C55E` e `#34D399` |
| Aprovação | `#F5A524` |
| Pergunta | `#22D3EE` |
| Busca | `#6366F1` |

A fonte Windows é `system-ui`, seguida por `Segoe UI Variable Text` e `Segoe UI`; trechos de comando usam Cascadia Mono/Consolas. O nome no cartão tem 12 px e peso 600, rótulos secundários 11 px, título de estado 15 px e descrição 13 px. Botões completos usam 12,5 px, padding 7 × 13, raio de cápsula e pressionamento em escala 0,94. O primário é quase branco com texto escuro; o secundário é branco a 9% e passa a 15% no hover. Botões de texto dentro de integrações são ainda menores: 11 px.

## Telas e estados

- **Overview** concentra o estado atual no cartão esquerdo e até quatro integrações nas pílulas à direita. Uma integração desconectada conserva sua pílula, mostra status curto e oferece a ação de configurar. Uma conexão ativa usa ponto de estado e, quando faz sentido, linhas compactas com dados recentes. O ticker usa brilho em varredura de 2,2 s para atividade.
- **Empty** troca o corpo por um único cartão de estado, com Mochi, frase curta e ação principal. Não mantém um painel de métricas vazio ao lado.
- **Approval** mostra wash radial âmbar vindo de baixo, personagem à esquerda, identificação no topo, resumo/linha de comando em uma cápsula `rgba(255,255,255,.07)` com raio 10 e ações em uma única linha. A captura Windows mostra Deny, Allow e Always; a semântica de aprovação do Ghosty continua a que o backend realmente suporta.
- **Error/finished/question/searching** mudam a cor do wash, o texto e a expressão sem reconstruir a navegação. A superfície base continua `#141518`; a cor de estado é um acento localizado.
- **Drop** ocupa uma superfície única com borda tracejada e personagem à esquerda. As tags de tipos são cápsulas pequenas. A borda reage ao arrasto e o estado posterior de upload pertence ao fluxo de upload real do Coucou.
- **Chat** na captura Windows é uma tela interna da ilha: cartão escuro quase vazio, Mochi à esquerda e compositor largo próximo da base, com botão claro circular de envio. O chat do Ghosty tem uma janela própria e uma direção de Figma solicitada anteriormente; sua arquitetura/fluxo não foi transplantada para dentro da ilha nesta tarefa.
- **Configurações** têm janela maior com fundo `#0B0C0E`; seções independentes `#141518`, borda branca a 7%, raio 14 e padding 16–18. Título 17 px, título de seção 13 px, ajuda 12 px; ações em cápsulas claras/escuras. A captura é de uma versão diferente da configuração declarada no checkout, então a comparação é visual, não uma promessa de equivalência funcional.

## Comportamento e movimento do menu

- Abas do cabeçalho são discretas em repouso; hover adiciona branco a 7% e seleção usa `#1D1F23`.
- Telas distintas do Coucou saem em aproximadamente 160 ms com leve redução; a próxima entra em 300 ms após 160 ms, indo de escala 0,97 a 1. Pílulas animam escala, borda e fundo em 180–200 ms.
- Cards de estado usam wash radial de 280 × 280 px com centro abaixo do cartão, em `50% 130%`; o resto do cartão permanece escuro.
- Conteúdo mantém frases curtas e apenas o controle necessário para o estado atual. Ações que exigem mais leitura abrem um detalhe ou a janela de configurações.
- A geometria, polling de cursor e click-through da ilha são próprios de cada aplicativo. O Coucou fica centralizado no topo; o Ghosty usa uma barrinha lateral ou bordas escolhidas pelo usuário. Essas mecânicas não foram alteradas.

## Tradução aplicada ao Edge Ghosty

| Coucou | Edge Ghosty nesta revisão |
|---|---|
| Três ícones no cabeçalho | Home, Pet e Atalhos continuam como as três ações já existentes, mas com tamanho, seleção e espaçamento de Coucou. |
| Card principal e quatro pílulas | Home agora exibe um card principal com o Ghosty e outro card com quatro pílulas. As cinco opções totais são Agora, Codex, GitHub, Vercel e Mídia; a opção focada sai da grade, que continua com quatro destinos. |
| Integração focada | GitHub e Vercel mostram status, conexão, atualização e dados reais no card esquerdo, sem subaba de serviço dentro de um dashboard. |
| Estado/atividade | Agora mostra estado e ações curtas; Codex mostra duas etapas recentes e acesso ao resumo detalhado no popup. |
| Drop e utilitários | Pet conserva o Ghosty e recebe linguagem de card escuro; ao arrastar, o palco usa borda tracejada. Foco, Bolso e Prancheta continuam em suas janelas auxiliares e também são acessíveis por ações compactas. |
| Janela de configurações | A tela do Ghosty continua dentro da ilha por decisão arquitetural existente, mas cada grupo passa a ter cartão próprio com os tokens do Coucou. |

## Limites honestos da semelhança

O resultado é uma tradução próxima da **composição dos menus** e dos tokens do port Windows, não um espelho pixel a pixel: a ilha do Ghosty permanece muito maior e pode estar à esquerda ou em outra borda; seu personagem, o produto e as integrações são diferentes. O fluxo do Bolso não executa upload do arquivo original, então não deve mostrar barra de progresso de upload. O chat mantém a janela separada. Não foram copiadas imagens, animações do personagem, sons ou marca do Coucou.
