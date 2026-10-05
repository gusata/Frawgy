# Contexto da tarefa — olhos Grok e repertório de animações do Coucou

Data: 2026-10-05  
Identificador: edge-mochi-grok-coucou-animacoes

## Objetivo

Remover os reflexos dos olhos do Mochi, aproximar o desenho padrão das cápsulas pretas do Grok Bot e adaptar ao Edge Mochi o repertório de estados, expressões e gestos do Mochi do Coucou.

## Alterações realizadas

- Os olhos padrão agora são cápsulas verticais sólidas em preto quase puro, sem pontos, linhas ou reflexos claros desenhados por cima.
- As expressões temporárias incluem cápsula larga, ponto, traço, arco feliz, olho fechado, cápsula girando, coração, estrela, olhar cansado, piscadela e forma em U durante a ingestão.
- O motor Canvas ganhou os estados `idle`, `working`, `thinking`, `searching`, `approval`, `question`, `error`, `finished`, `ratelimit`, `sleeping` e `dizzy`, com movimentos e indicadores próprios.
- Foram adicionados os emotes `love`, `surprised`, `proud`, `wink`, `yawn`, `happy` e `annoyed`; também há squash, respiração, piscadas, olhar suavizado, rotação, celebração, partículas e gestos das mãos.
- A saudação levanta uma das mãos e acena; a ingestão estende as mãos, transforma brevemente o corpo em uma forma mais quadrada e anima as mordidas.
- O estado `working` acompanha o temporizador de foco. Ao concluir o ciclo, o Mochi salta, gira e solta partículas.
- O hover aumenta levemente os olhos e pisca. As animações respeitam `prefers-reduced-motion`.
- `AGENTS.md` registra a nova decisão visual e o repertório disponível.

## Arquivos tocados

- `src/pet-motion.ts`
- `src/main.ts`
- `AGENTS.md`
- `docs/context/2026-10-05-edge-mochi-grok-coucou-animacoes.md`

## Validações

- Revisão estática do mapeamento de estados, gestos e expressões no renderer Canvas.
- Build, testes e inspeção visual do WebView2 não foram executados nesta tarefa.

## Problemas conhecidos

- O tamanho das cápsulas, a leitura da piscadela/aceno e os indicadores de estado ainda precisam de inspeção visual nos tamanhos compacto e grande.
- O repertório está disponível no motor; fora do foco, do hover, do bolso e dos gestos do pet, estados como aprovação, pergunta e erro ainda não têm um evento da interface que os acione.

## Próximos passos

- Abrir o app no Windows e ajustar proporções dos olhos e mãos após ver a renderização real.
- Confirmar a transformação de ingestão, a celebração de foco e a redução de movimento no WebView2.
- Conectar estados adicionais a eventos reais da interface caso esses fluxos sejam introduzidos.

## Referências consultadas

- [Motor Canvas do Coucou para Windows](https://github.com/Louis-CFM/coucou/blob/main/windows/src/mochi/engine.ts)
- [Estados e emotes do Mochi](https://github.com/Louis-CFM/coucou/blob/main/windows/src/core/layout.ts)
- [Especificação visual de cápsulas pretas do Grok Bot](https://x.ai/bot/marketplace/bots/pfp-bot)
