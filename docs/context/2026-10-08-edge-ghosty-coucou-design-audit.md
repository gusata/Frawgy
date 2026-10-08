# Auditoria de design do Coucou — clone local em Documents

Data: 2026-10-08  
Identificador: edge-ghosty-coucou-design-audit

## Objetivo

Analisar detalhadamente a linguagem visual, medidas, cores, personagem, animações, estados e interações do Coucou, separando a especificação/protótipo da implementação atual para macOS e do port para Windows.

## Repositório e escopo

- Clone inspecionado: `C:\Users\gustavo.sanches\Documents\coucou`.
- `HEAD`: `0aae11b`, commit de 2026-10-02 (`Site: Codex and Cursor on the home page (#135)`); branch local `main` acompanha a referência local `origin/main` e o checkout estava limpo.
- Observação de versão: snapshots anteriores do Edge Ghosty descrevem uma cópia temporária do Coucou no commit `20e1f8b`, de 2026-10-06. Esta análise descreve o clone solicitado em Documents, que é anterior; não presumir que os dois checkouts tenham exatamente os mesmos comportamentos.
- Fontes lidas: `docs/SPEC.md`, README principal e README Windows, `LICENSE-ASSETS.md`, `design/prototype/notch-buddy.html`, capturas de referência e screenshots Windows, CSS e TypeScript de `windows/`, e as views, geometria, FSM e motor Canvas de `NotchBuddy/Sources/App/`.
- A análise foi estática. Capturas principais foram abertas visualmente; nenhum build ou teste foi executado.

## Síntese de design

Coucou é uma interface ambiente, presa ao centro da borda superior. A janela hospedeira é transparente e grande o suficiente para desenhar uma ilha compacta ou uma superfície horizontal. A ilha preta se mistura ao notch; dentro dela, cartões quase pretos mostram atividade e ações. Mochi converte estados abstratos do agente em cor, olhos, badges e movimento.

A identidade não vem só da paleta: vem da topologia horizontal do notch, dos pequenos agentes coloridos ao lado do personagem principal e de uma superfície que aparece por cima do desktop sem se comportar como uma janela comum. A geometria é diferente da ilha vertical do Edge Ghosty e não deve ser transplantada literalmente.

## Geometria

Todas as medidas abaixo são pontos lógicos no Mac e pixels lógicos no port Windows.

| Parte | Referência em `docs/SPEC.md`/protótipo | Código do clone local |
|---|---|---|
| Janela hospedeira | 720 × 320 | 720 × 320 em ambas as plataformas |
| Notch de referência | 184 × 32; o Mac mede o notch real quando possível | Mac usa safe area/áreas auxiliares, fallback 184 × 32; Windows simula 184 × 32 |
| Ilha expandida | largura 640; altura varia por tela | largura 640; a maioria das telas tem 160 de altura |
| Ilha compacta | notch + 104 = 288, se notch = 184 | Windows: 288 × 32; Mac: notch + 160 (344 × 32 com notch de 184) |
| Cantos inferiores | 14 no repouso, 30 expandida | 14 no repouso, 22 expandida |
| Orelhas superiores | recortes côncavos externos de 14 | a forma Swift tem suporte para isso, mas o código define `topRadius = 0`; CSS Windows não desenha pseudo-orelhas |
| Tela Mac sem notch | barra de repouso de 80 × até 24 | código usa 80 × até 24 e mostra Mochi |
| Windows recolhido | sem notch físico | janela reduzida para uma faixa transparente de 240 × 6; a ilha fica com altura 0 |

O conteúdo expandido fica dentro do shell preto. O cabeçalho tem 34 de altura; no código atual o corpo começa depois de 8 de margem superior e do cabeçalho. O layout Home usa cartão esquerdo fixo de 322, espaço de 10 e cartão direito flexível; com 640 de ilha e 10 de margem de cada lado, o cartão direito fica em torno de 288.

### Alturas de telas: especificação e código

`docs/SPEC.md` contém medidas do protótipo. `IslandTypes.swift` e `windows/src/core/layout.ts` mostram o layout efetivo deste clone; diferenças importantes:

| Tela | Especificação | Código atual Mac/Windows |
|---|---:|---:|
| overview | 196 | 160 |
| empty | 150 | 160 |
| approval | 206 | 160 |
| question | 196 | 160 |
| error | 190 | 160 |
| finished | 170 | 160 |
| confused | 160 | 160 |
| upload | 176 | 176 |
| uploading | 150 | 176 |
| choose | 170 | 176 |
| mail | 210 | 240 |
| prompt/chat | 156 | base de 240, cresce 40 por mensagem até 300 |
| searching | 156 | 160 |
| result | 262, adapta até 320 | 160 no layout base |
| note | 136 | 160 |
| settings | — | 160 |
| greeting | 150 | 150 |

O upload usa uma área própria de 640 × 176. A janela Windows expande de 240 × 6 para 720 × 320 e o frontend publica o retângulo real da ilha para manter o click-through sincronizado durante a animação.

## Linguagem visual

### Paleta

- Janela: transparente; shell da ilha: preto `#000`.
- Superfície principal: `#141518`; superfície plana secundária: `#0E0F11`; aba selecionada: `#1D1F23`.
- Texto principal: `#F5F6F8`; secundário: `#9398A1`/`#8E939C`; estados mais discretos: `#6B7079`, `#5F646D`, `#4B5563`.
- Borda de cartão quase invisível: branco a 3,5% (`rgba(255,255,255,.035)`).
- Erro: `#F4505E`, texto `#FF8D97`; sucesso: `#34D399`; aprovação: `#F5A524`; pergunta: `#22D3EE`; busca: `#6366F1`; tontura: `#F472B6`.
- Cards de estado recebem um brilho radial na base: vermelho .55, verde .50, rosa .55, âmbar .42, ciano .38, índigo .50; neutro branco .08.
- Integrações recebem uma cor estável por agente/serviço. A cor aparece no ponto de status, badge, Mochi pequeno e borda/fundo da pílula.

O visual usa contraste de luminância, não muitas bordas: áreas quase pretas, texto curto, pílulas e cartões arredondados. Gradientes ficam concentrados no personagem, no halo e no wash de estado. O chat usa mensagens do usuário em uma bolha branca translúcida à direita e texto do assistente mais discreto à esquerda; o campo inferior é uma pílula escura com botão circular claro.

### Tipografia e controles

- Mac: fontes do sistema; Windows: `system-ui`/Segoe UI. Código usa SF Mono ou Cascadia Mono/Consolas.
- O cabeçalho usa três botões de ícone — Home, chat e adicionar/soltar — à esquerda, configurações e som à direita. Cada aba mede 30 × 22 no port Windows, com raio 11; o cabeçalho inteiro tem 34.
- Cartões têm raio 20 e borda de um pixel a 3,5% de branco.
- Botões de ação são cápsulas: fonte 12,5, padding 7 × 13, secundário em branco a 9% (15% no hover), primário `#F5F6F8` com texto escuro; pressionar reduz para 94%. Atalhos como Y/N aparecem em pequenas cápsulas contornadas.
- Textos pequenos, em geral 10–15, permitem caber uma interface funcional na borda. Isso cria densidade, mas deixa status e controles menos confortáveis para leitura distante.

## Home e estados de interface

- **Overview:** cartão esquerdo mostra agente focado, ferramenta e ticker de ações; o botão de seta abre o destino associado. O cartão direito reúne até quatro outros agentes em grade de duas colunas. Clicar numa pílula troca o foco. O ticker atual no CSS Windows mede 44 de altura e usa texto ativo com shimmer de 2,2 s; a especificação do protótipo descrevia uma janela de 96 e quatro linhas, portanto também há drift nessa medida.
- **Empty:** Mochi à esquerda, uma frase curta e CTA “Ask Claude”.
- **Approval:** wash âmbar, nome/ferramenta, comando em bloco monoespaçado e ações Deny/Allow; o Mac oferece Always para fluxos compatíveis, e o Windows limita a Allow/Deny.
- **Question:** wash ciano, pergunta e opções; no Windows atual a resposta precisa ser dada no terminal. As opções ilustrativas do Mac no código não implementam a resposta real.
- **Error:** wash vermelho, detalhe em vermelho claro e botões de retry/abrir serviço.
- **Finished:** wash verde, resumo e ações para abrir terminal/confirmar; o estado de conclusão fica visível por cerca de 5,2 s antes de recolher.
- **Confused:** wash rosa e olhos espiralados após três cliques rápidos no personagem.
- **Upload:** borda pontilhada animada e tags PDF/Images/Code/Docs; enquanto o cursor carrega um arquivo, a borda e o glow ficam verdes.
- **Uploading:** Mochi acompanha a ponta da barra verde. O arquivo é engolido, há fase de mastigação/recolhimento, progresso com ritmo próprio, ticks sonoros e check final antes de mostrar a escolha seguinte.
- **Choose/Mail:** pergunta o que fazer com o arquivo; no Mac há formulário compacto de email. No Windows, email é placeholder.
- **Chat/search/result/note:** chip de contexto e modelo, histórico rolável, typing dots e shimmer na busca; resultados usam linhas clicáveis/copiar. Busca/resultados e anexar janela pertencem à experiência Mac; no Windows são placeholders.
- **Settings:** tela compacta na ilha para som/volume, tempo de auto-close e status de hooks/chave, com link para a janela completa. A janela de configurações usa o mesmo tema escuro em seções maiores; no Windows as seções têm fundo `#141518`, borda clara a 7%, raio 14 e padding de 16–18.

## Mochi: personagem e estados

O personagem é desenhado em Canvas, não uma imagem estática. A silhueta é uma superelipse arredondada, com corpo claro em gradiente, olhos escuros sem reflexo, blush sutil, halo e um badge pequeno no alto. O tamanho corporal é 60% do canvas; em miniaturas o corpo fica chapado na cor do agente. No código Swift/Windows do clone, o gradiente base é `#EDEDEF` → `#C4C5CA` e a tinta dos olhos é `#1A1412`. A seção do protótipo descreve outro gradiente (`#FFFAF5` → `#DDCCBF`), então a descrição textual também está defasada.

Os olhos mudam de forma e direção, enquanto a cor do corpo/halo acompanha o estado:

| Estado | Cor | Sinal visual |
|---|---|---|
| idle | cinza claro `#E6E9EE` | olhos cápsula, sem badge |
| working | azul `#3B9EFF` | três pontos animados |
| thinking | roxo `#8B5CF6` | pontos e olhar para cima/direita |
| searching | índigo `#6366F1` | pontos e olhar varrendo |
| approval | âmbar `#F5A524` | olhos maiores, `!`, pequenos saltos |
| question | ciano `#22D3EE` | `?` e inclinação |
| error | vermelho `#F4505E` | olhos achatados, ponto e tremida breve |
| finished | verde `#34D399` | olhos felizes, ponto, giro de 950 ms e brilhos |
| ratelimit | laranja `#FB923C` | olhos cansados, ponto e suor |
| sleeping | cinza azulado `#94A3B8` | olhos fechados, respiração e Z |
| dizzy | rosa `#F472B6` | espirais e giro duplo de 1,3 s |

Emotes adicionais: love, surprised, proud, wink, yawn, happy e annoyed. O cursor altera o olhar com suavização; a piscada é aleatória e pode ser dupla. As mãos surgem em gestos, não como parte constante da silhueta. O gesto de arquivo morph a silhueta para uma caixa com fenda superior. O protótipo experimenta também Galet e Lueur, mas o aplicativo usa Mochi.

## Movimento e comportamento

- Abertura: spring SwiftUI `response 0.5`, `damping 0.72`; fechamento: 340 ms, Bézier `(.45, 0, .2, 1)`, sem ultrapassar o alvo.
- As dimensões da ilha e a posição/tamanho do personagem animam juntas. Conteúdo sai em cerca de 160 ms e entra em 300–400 ms após atraso de 160 ms. No Windows isso aparece como fade e escala de 0,97 para 1.
- A apresentação inicial é uma saudação coreografada de cerca de 4,6 s, com crescimento, dip/pop, aceno, badge, partículas e recolhimento.
- Interações do personagem: hover pisca e aumenta os olhos; hover parado por 1,9 s dispara love; clique amassa/irrita; três cliques em 1,7 s causam tontura por cerca de 3,3 s.
- O protótipo documenta quatro modos (`hidden`, `peek`, `compact`, `expanded`), expansão automática após hover e recolhimento por inatividade. O código efetivo deste clone tem três modos da ilha (`hidden`, `compact`, `expanded`) e FSM `hidden/petit/home/coucou`: o hover revela a ilha compacta; clique ou atalho abre; não encontrei o temporizador de hover-expand descrito na spec.
- Comportamento efetivo: default de auto-close é 15 s e a interface Windows oferece 10/15/30 s. O timer começa quando o cursor sai da ilha; o estado compacto se oculta após 60 s fora. Aprovação pendente pode manter o painel aberto. Escape recolhe quando não está preso por aprovação.
- A spec diz que o sistema se oculta após 3 min sem movimento; `absenceInterval` existe em settings/state, mas não encontrei uso no FSM/controlador deste clone. O campo existe, mas a regra não parece implementada aqui.
- O indicador de contagem regressiva é uma linha de 2 px no centro inferior, com largura máxima de 160; aparece no final do auto-close.
- Click-through é um requisito central: Mac consulta o cursor a 60 Hz e aceita eventos somente perto da forma (margem de 6); Windows usa polling de cursor e margem de 14. Aprovações e campos de texto são exceções deliberadas.

## Diferenças por plataforma

- **macOS:** implementação SwiftUI/AppKit mais completa, detecção do notch real e fallback sem notch, mais telas e ações. Uma `NSPanel` transparente, sem sombra e acima da barra de menus.
- **Windows:** port Tauri/Rust/TypeScript no topo central, sem notch físico; o app usa uma faixa wake invisível e reabre a janela hospedeira sob demanda. A janela não pega foco, exceto durante o chat. Há screenshots de overview, approval, chat, drop, compact, greeting e settings.
- O Windows atual tem placeholders explícitos para email, busca/resultados e anexar janela. A captura `windows/screenshots/settings.png` mostra título nativo e versão 0.1.0, enquanto `tauri.conf.json` declara 0.1.1; tratar a captura como referência de estilo, não como estado exato do build atual.

## Aplicação ao Edge Ghosty

- Aproveitar princípios: hierarquia curta, estado comunicado por cor + movimento + texto, primário/secundário claros, superfícies escuras discretas e hit-testing transparente.
- Traduzir a composição ao espaço lateral do Edge Ghosty. A Home horizontal do Coucou e o notch central não substituem o layout vertical e largo do Ghosty.
- Preservar personagem e ativos próprios: `LICENSE-ASSETS.md` reserva a marca, Mochi, ícones, sons e mídia. Referenciar princípios de interação/layout não exige copiar arte, áudio ou identidade.
- O Coucou faz upload/cópia e mostra progresso real; o Bolso do Ghosty guarda referências sem mover os originais. Copiar a metáfora de barra/progresso sem operação correspondente criaria semântica enganosa.

## Arquivos tocados

- Criado somente este snapshot de contexto em `docs/context/`.
- Nenhum arquivo do aplicativo Coucou foi editado.

## Validação e limitações

- Conferidos o caminho local, estado limpo do checkout e commit `0aae11b`.
- Inspeção estática de documentos, estilos, geometria, FSM, views e motor Canvas; capturas principais vistas visualmente.
- Não foram executados builds nem testes. A análise descreve o clone local datado de 2026-10-02, não um checkout atualizado por rede.

## Problemas conhecidos e próximos passos

- Há divergência entre `docs/SPEC.md`, protótipo e código atual em medidas, modos, timers, orelhas e paleta de Mochi. Para qualquer implementação, escolher explicitamente a referência correta e validar com captura visual.
- Se a próxima tarefa for implementar uma inspiração no Edge Ghosty, usar uma decisão focada em princípios e geometria própria; não assumir que todos os comportamentos do protótipo estejam presentes no Coucou efetivo.
