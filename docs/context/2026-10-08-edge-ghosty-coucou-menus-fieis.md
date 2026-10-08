# Contexto: menus do Ghosty próximos ao Coucou

Data: 2026-10-08  
Identificador: edge-ghosty-coucou-menus-fieis

## Objetivo

Refazer a análise minuciosa dos menus do Coucou no clone local em Documents e aproximar os menus do Edge Ghosty da composição, medidas, cores, tipografia, superfícies e comportamento efetivos do port Windows. Preservar a geometria e a animação da ilha, o hitbox/click-through, o modelo e o motor Canvas do Ghosty.

## Alterações realizadas

- Registrada uma referência detalhada e verificável do Coucou Windows em `docs/design/coucou-menus-2026-10-08.md`, usando o commit local `0aae11b`, o código de views/CSS/settings e as capturas `overview`, `approval`, `drop`, `chat` e `settings`.
- Substituída a Home de quatro abas horizontais por um cartão principal e quatro pílulas em grade 2 × 2. As cinco posições possíveis são Agora, Codex, GitHub, Vercel e Mídia; a posição focada ocupa o cartão e sai temporariamente da grade. As integrações continuam com estados e dados reais, e o resumo Codex continua abrindo o popup detalhado.
- Retirados o bloco textual de marca/subtítulo do cabeçalho e o rodapé da ilha expandida. Os três ícones principais, Configurações e Fechar permanecem, agora nas proporções e cores dos controles do Coucou.
- Aplicados os tokens do Coucou Windows aos menus: shell preto, cartões `#141518`, área plana `#0E0F11`, seleção `#1D1F23`, texto `#F5F6F8`, cartões de raio 20, bordas discretas, ações em cápsula e estados por acentos localizados.
- Atalhos usa superfícies/pílulas mais compactas; Pet conserva personagem e interações, mas usa cartões escuros e borda tracejada durante arrasto; Configurações usa seções independentes de raio 14. Popups utilitários e a superfície de aprovação receberam a mesma linguagem de cartões. O chat separado e seu layout solicitado anteriormente permanecem.
- Removidos renderizadores antigos da Home que ficaram sem uso e atualizado `AGENTS.md` com a decisão estrutural que substitui o item 61.

## Arquivos tocados nesta tarefa

- `src/main.ts`
- `src/style.css`
- `AGENTS.md`
- `docs/design/coucou-menus-2026-10-08.md`
- Este snapshot novo em `docs/context/`

O repositório já tinha alterações não commitadas e snapshots anteriores antes da tarefa; não foram descartados nem sobrescritos.

## Validações

- `npm run build` passou após a reconstrução do frontend (TypeScript e Vite).
- `git diff --check` não encontrou erros de whitespace.
- A árvore de acessibilidade do app Windows em execução confirmou que as pílulas trocam o cartão entre GitHub, Vercel, Mídia e Codex; os dados e controles correspondentes aparecem. Também confirmou acesso a Pet, Atalhos e Configurações.
- Os screenshots de referência do Coucou foram abertos visualmente. O clone local não foi modificado.
- Nenhum teste foi adicionado ou executado. Não houve mudança em `src/anim.ts`, `src/pet-motion.ts`, no backend de geometria nem no fluxo de autenticação/aprovação.

## Problemas conhecidos

- A captura do app Ghosty no Windows não permitiu comparação visual final: o provedor devolveu uma imagem do ambiente/Widgets sobre a janela transparente e depois `screenshot_failed`. A inspeção funcional foi feita pela árvore de acessibilidade; a aparência após este ajuste precisa ser vista com a sessão gráfica plenamente disponível.
- A ilha existente é maior, pode estar em bordas diferentes e tem silhueta própria. A composição e os componentes foram aproximados do Coucou, mas as medidas externas não podem ser idênticas sem contrariar a restrição do usuário.
- O Coucou tem telas e integrações que não correspondem ao produto do Ghosty. O Bolso guarda referências sem upload; o chat permanece em popup independente. Esses fluxos conservaram sua semântica.

## Próximos passos

- Com o desktop desbloqueado e capturável, comparar visualmente Home nos estados Agora, Codex, GitHub, Vercel e Mídia, além de Pet, Atalhos e Configurações, nas bordas usadas pelo usuário.
- Ajustar apenas microespaçamento e recortes que a comparação visual evidenciar, sem alterar a ilha nem o modelo do Ghosty.
