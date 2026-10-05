# Contexto da tarefa — auditoria completa dos comportamentos do Coucou

Data: 2026-10-05  
Identificador: edge-mochi-auditoria-completa-coucou

## Objetivo

Inventariar os comportamentos do Mochi e da ilha do Coucou que afetam seu movimento, animação, estados e interação, usando a implementação Windows como referência principal por ser a plataforma do Edge Mochi. Comparar com o estado atual do Edge Mochi e separar o que já existe, o que está parcialmente adaptado, o que pode ser conectado a funções do produto e o que depende de Claude ou de fluxos que o Edge Mochi não possui.

## Escopo e fontes

Leitura estática dos arquivos atuais do repositório Coucou:

- `windows/src/mochi/engine.ts`: personagem, estados, emotes, gestos, renderização e atualização por frame.
- `windows/src/mochi/greeting.ts`: sequência especial de saudação.
- `windows/src/upload/sequence.ts`: coreografia de arquivo, incluindo o movimento durante o arrasto, a ingestão e a barra de progresso.
- `windows/src/core/anim.ts`: easing, curva de fechamento e mola da ilha.
- `windows/src/core/layout.ts`: modos, vistas e posição do Mochi na ilha.
- `windows/README.md` e `README.md`: comportamentos descritos ao usuário e diferenças de plataforma.

O inventário se concentra nos comportamentos visuais e interativos do Mochi e nas transições da ilha que o afetam. Não tenta reproduzir toda a superfície de integrações Claude, chat, permissões e serviços externos do Coucou.

## Catálogo do Coucou

### Personagem, geometria e composição

- Mochi é desenhado em Canvas 2D, sem sprites. O corpo é um contorno suave construído com 72 pontos, com interpolação entre uma forma squircle e uma caixa arredondada.
- O corpo recebe gradiente, sombra interna, brilho de superfície e uma cor translúcida que muda conforme o estado. Os olhos são formas preenchidas com tinta escura, sem reflexo branco.
- As formas de olho incluem pill, wide, dot, line, flat, happy, closed, spiral, heart, star, tired, wink e cup. O estado de arquivo usa `cup` durante a captura e uma expressão contente depois da ingestão.
- A posição, escala e tamanho dos olhos são projetados sobre uma superfície curva conforme yaw e pitch, para dar a sensação de que acompanham o rosto em volume. O movimento de olhar converge gradualmente para o alvo.
- As mãos são desenhadas atrás do corpo. Elas ficam totalmente ausentes em repouso; aparecem apenas quando o canal de mãos está animado, não aparecem em miniaturas e são suprimidas quando o personagem está pequeno demais. No aceno, uma mão sobe e oscila enquanto a outra permanece mais baixa.
- A ordem de desenho é mãos, corpo, blush, olhos, abertura de caixa, badge e partículas. Os badges e as partículas ficam fora do recorte do corpo.

### Movimento automático e olhar

- O olhar acompanha o cursor quando fornecido pela ilha. O motor combina posição do cursor com alvos próprios de estado e interpola a resposta em cada frame.
- A piscada tem fechamento rápido e abertura mais longa; a primeira ocorre após aproximadamente 1,5–3,5 s e as seguintes em intervalos aleatórios de 2,2–5,4 s. Há chance de uma segunda piscada 230 ms depois. Dormindo ou tonto, o ciclo automático é suprimido.
- Aprovação usa pequenos saltos contínuos; busca faz os olhos varrerem horizontalmente; pensar fixa um olhar deslocado; sono fecha os olhos, respira e solta partículas “Z”; tontura oscila o olhar.
- O corpo principal do Coucou não respira continuamente no estado idle. A respiração contínua está ligada ao estado de sono; miniaturas de integrações têm sua própria respiração e olhares aleatórios.
- O loop de desenho pode parar quando o motor não está ocupado. Tweens ativos, partículas, estados cíclicos, movimento da mola e transição de cor mantêm o loop ativo.

### Hover, clique, aceno e emotes

- Passar o cursor pelo island faz Mochi espiar; clicar na ilha expande. O hover sobre Mochi aumenta os olhos e pisca. Permanecer sobre ele por cerca de dois segundos dispara corações.
- Um clique em Mochi interrompe um aceno em curso, amassa e estica o corpo, mostra olhos irritados e reproduz som. Três cliques em até 1,7 s mudam para tontura; o estado gira duas voltas em cerca de 1,3 s.
- A saudação curta do personagem dura cerca de 1,55 s: olhar feliz, leve elevação/squash, braço surge por volta de 250 ms, acena, pisca perto de 550 e 1500 ms e recolhe a mão. A saudação pode ser interrompida e recolhe a mão com uma transição curta.
- Emotes temporários: love (olhos-coração, blush e quatro corações); surprised (olhos redondos e salto); proud (olhos-estrela, partículas, inclinação e blush); wink (olho piscando e inclinação); yawn (estica, fecha os olhos e solta Z); happy (arcos de sorriso/blush); annoyed (olhos em linha e som).
- As partículas disponíveis são coração, estrela, brilho, suor e Z; sobem, derivam, giram ou oscilam e desaparecem com a idade.
- Há uma saudação longa separada da saudação curta: uma coreografia de aproximadamente 4,6 s para apresentação/entrada, coordenando crescimento da ilha e personagem, squint, dip/pop, wave, piscadas, olhar, badge, halo, partículas decorativas, cartão e recolhimento. Não é a mesma animação de hover ou de abrir a ilha.

### Estados de atividade

O motor define estes estados. Cada estado troca cor/tint, olhos e eventualmente badge, além de disparar movimentos específicos:

- `idle`: cor base, olhos pill, sem badge.
- `working`: tonalidade azul e badge com pontos.
- `thinking`: roxo, pontos e olhar deslocado.
- `searching`: índigo, pontos e olhos varrendo a tela.
- `approval`: âmbar, olhos maiores, badge de exclamação e quique.
- `question`: ciano, badge de interrogação e inclinação.
- `error`: vermelho, badge de ponto e tremida lateral curta.
- `finished`: verde, olhos felizes, badge, giro de uma volta e cinco brilhos após 500 ms.
- `ratelimit`: laranja, olhos cansados, badge e partículas de suor.
- `sleeping`: cinza, olhos fechados, respiração e partículas Z.
- `dizzy`: rosa, olhos em espiral e giro de duas voltas.

Os badges entram e saem com redução de escala, troca de conteúdo após 100 ms e retorno com easing elástico. As cores do corpo também convergem suavemente, em vez de trocar de uma vez.

### Recepção de arquivo no Coucou

O comportamento completo do Coucou é mais amplo que abrir e fechar uma boca:

1. Quando o arquivo entra na zona, o personagem começa a virar uma caixa, abre a fenda superior e acompanha o cursor com mola. A inclinação responde à velocidade horizontal. Se o cursor desacelera e chega perto, Mochi “trava” no arquivo, dá um pequeno pulo e muda os olhos para a forma `cup`. A ilha fica aberta enquanto o arquivo é segurado.
2. Ao soltar, a timeline canônica começa: a fenda abre até o máximo; o arquivo fica visível e é puxado para dentro durante cerca de 300 ms; a abertura fecha; o corpo espreme/estica e mastiga com pulsos rápidos.
3. Em seguida, Mochi encolhe até virar um ponto, a ilha revela uma barra e o ponto percorre a barra da esquerda para a direita acompanhando progresso. O progresso dura por padrão 2,4 s, acelera até 60%, atravessa um meio mais lento e dá o último impulso; o personagem estica conforme a velocidade do progresso.
4. No fim há flash/check/banho verde; Mochi salta e volta a crescer junto à opção de fazer perguntas sobre o arquivo.

O motor retorna uma pose completa por frame: posição, diâmetro, morph, squash, inclinação, boca, olhos, olhar, visibilidade do arquivo, progresso, check, cor e opacidade dos elementos da ilha. A simulação da mola usa subpassos de até 1/240 s para evitar mudança visual em frames perdidos. O estado de arrasto não fecha a ilha quando o cursor sai da zona.

### Movimento da ilha e outros comportamentos de interface

- A ilha separa `hidden`, `compact` e `expanded` dos estados do personagem e das vistas do conteúdo. O layout escolhe posição e tamanho do Mochi para cada vista.
- O island aparece ao chegar no topo central do monitor no Windows; clique abre, Escape fecha. A bandeja fornece abrir, configurações, pausar e sair.
- O módulo geral de animação combina springs para crescimento/abertura com uma curva Bézier de 340 ms para fechar/recolher. Isso é independente do Canvas e do motor de personagem.
- As vistas incluem overview, approval, question, error, finished, confused, upload/uploading, choose, mail, prompt, searching, result, note, settings e greeting. A maior parte pertence ao fluxo de Claude e não é animação intrínseca do pet.
- A versão Windows compartilha o desenho, tempos e sons da versão macOS. O README menciona 28 efeitos curtos. Anexar Mochi arrastando-o para outra janela é específico do macOS e explicitamente ausente no Windows.

## Comparação com Edge Mochi

### Já existe ou já foi adaptado

- Canvas 2D próprio, silhueta suave morphável, olhos escuros e canais independentes de animação.
- Mãos escondidas em repouso e mostradas somente durante o gesto.
- Olhar que segue o cursor com suavização, olhares microaleatórios, piscadas e animação de hover; ficar sobre o pet dispara love.
- Saudação curta ao abrir o island pela primeira vez, com wave, inclinação e squash.
- Clique irritado, squash e tontura após três cliques; os limiares atuais são próximos dos do Coucou.
- Estados `working` e `finished` ligados ao temporizador de foco. Os demais estados e emotes existem em `PetMotionEngine`, mas nem todos têm gatilho ligado à interface atual.
- Recepção de arquivo e texto com estado persistente durante o arrasto: body morph, slot no topo, mãos ativas, olhos maiores; cancelar retrai a pose; soltar mantém o ciclo de gulp, três mordidas e recolhimento.
- Um morsel visual percorre o trajeto da origem até o pet. O item vai ao Bolso sem mover nem apagar o original.
- A física de animação de abrir/fechar a ilha já tem a implementação de `Spring`, `Tracked` e da curva de fechamento do Coucou em `src/anim.ts`.

### Diferenças que importam

- O Edge Mochi respira continuamente em idle; o Mochi principal do Coucou reserva respiração contínua para sono. O Edge mantém o personagem vivo visualmente, mas custa um loop constante de RAF enquanto a tela dele está montada. O Coucou usa um sinal `busy` para parar quando está quieto.
- O Edge não usa o aceno longo de 4,6 s; sua chamada `greet()` é a saudação curta. Adaptar a coreografia longa é opcional e mais apropriado para primeira abertura/apresentação do que para cada hover.
- O arquivo do Edge atualmente mantém os olhos pretos em pill `wide` e usa uma fenda horizontal de caixa; o Coucou muda para olhos `cup` quando o arquivo trava e para uma expressão contente após engolir. O formato do olho pode ser adotado sem brilho ou cor clara.
- O Edge não faz o personagem seguir a posição do arquivo, encolher até um ponto e percorrer barra de progresso. Como o arquivo é guardado localmente no Bolso, sem upload ou processamento remoto correspondente, copiar essa parte criaria uma promessa falsa de progresso. O gesto de seguir/travar pode ser considerado depois, mas é opcional para um arquivo que só será armazenado.
- O Edge anima um morsel do arquivo ao Mochi; o Coucou clipa o arquivo na boca e o suga. São metáforas visuais diferentes para semânticas diferentes.
- Os canais `thinking`, `searching`, `approval`, `question`, `error`, `ratelimit` e `sleeping` do motor Edge não estão ligados a eventos da interface. Integrações de Claude/serviços e painéis de aprovação do Coucou não são funções do Edge atual.
- O Edge não importa o módulo de som do Coucou; os eventos visuais de greet, slap/annoyed e status são essencialmente silenciosos. Sons poderiam ser escolha própria de produto, mas não foram implementados nesta tarefa.
- Edge explicita `prefers-reduced-motion`; essa salvaguarda deve ser preservada se qualquer sequência visual for ampliada.

## O que se aplica ao Edge Mochi

1. Manter os princípios que já funcionam: Canvas, movimento por canais independentes, mãos ocultas em repouso, olhar suavizado, blink aleatório, reação curta ao hover/click e transições sem corte.
2. Para a recepção, completar a linguagem visual em fases: durante o arrasto, manter a caixa/fenda; no momento de captura, trocar para olho `cup` mantendo a tinta preta fosca; após o item desaparecer, usar uma expressão satisfeita e mastigação; depois recolher mãos e corpo. Isso é um aperfeiçoamento semântico do estado já entregue.
3. Não copiar a barra de upload/progresso nem a pergunta sobre o conteúdo até existir uma operação real que justifique essas fases. Aguardar/capturar o arquivo no Bolso não representa upload.
4. Usar `finished`, `thinking` e `error` só quando ações reais do Edge tiverem começo, espera e conclusão/falha visíveis; os outros estados podem permanecer sem uso até existir funcionalidade que os torne verdadeiros.
5. Avaliar separadamente o custo/benefício da respiração contínua e do RAF em idle. Ela é escolha estética do Edge, não algo que o Coucou principal faz por padrão.
6. A saudação longa, os efeitos sonoros e estados novos são melhorias opcionais do produto, não lacunas que impeçam o Mochi atual de ter os comportamentos essenciais.

## Arquivos tocados

- Criado apenas este snapshot em `docs/context/`.
- Nenhum arquivo de código, interface ou configuração foi alterado.

## Validações

- Revisão estática do código Windows atual do Coucou e do motor local `src/pet-motion.ts`, `src/anim.ts` e dos gatilhos de `src/main.ts`.
- Não foram executados build, testes ou inspeção visual; a tarefa foi de análise.

## Problemas conhecidos e próximos passos

- Se o usuário aprovar uma etapa de implementação, aplicar primeiro as melhorias semanticamente corretas para o Bolso: transição de olhos durante captura/ingestão e validação visual do estado da boca/slot no WebView2.
- Tratar a saudação longa, redução de RAF idle e conexão dos estados sem gatilho como decisões separadas para preservar o ritmo e a identidade próprios do Edge Mochi.
- Referências upstream: [README Windows](https://github.com/Louis-CFM/coucou/blob/main/windows/README.md), [motor do Mochi](https://github.com/Louis-CFM/coucou/blob/main/windows/src/mochi/engine.ts), [saudação longa](https://github.com/Louis-CFM/coucou/blob/main/windows/src/mochi/greeting.ts), [coreografia de arquivo](https://github.com/Louis-CFM/coucou/blob/main/windows/src/upload/sequence.ts), [layout da ilha](https://github.com/Louis-CFM/coucou/blob/main/windows/src/core/layout.ts), [motor geral de animação](https://github.com/Louis-CFM/coucou/blob/main/windows/src/core/anim.ts).
