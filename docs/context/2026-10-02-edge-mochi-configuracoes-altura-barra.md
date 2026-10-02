# Contexto da tarefa — configuração da altura da barrinha

Data: 2026-10-02
Identificador: edge-mochi-configuracoes-altura-barra

## Objetivo

Adicionar ao menu Edge Mochi uma tela de configurações com controle para escolher a altura da barrinha recolhida, mantendo as curvas do gradiente alinhadas às pontas.

## Alterações realizadas

- Adicionado botão de engrenagem no cabeçalho e tela de configurações com botão de retorno.
- Adicionado slider de 48 a 240 px, em passos de 2 px, com a altura exibida em tempo real.
- A escolha é salva em `localStorage` e carregada ao iniciar o frontend.
- A altura inicial no CSS e o alvo recolhido da animação usam o mesmo valor configurável.
- O offset de cada orelha é calculado como metade da altura da barrinha mais o raio fixo de 14 px, tanto no início quanto durante a mudança pelo slider.
- Mantida a janela nativa recolhida em 18 px de largura; a mudança afeta apenas a haste visual.

## Arquivos tocados

- `src/main.ts`
- `src/style.css`
- `docs/context/2026-10-02-edge-mochi-configuracoes-altura-barra.md`

## Validações

- `npm run build` passou (`tsc` e Vite).
- Tela aberta e inspecionada no app Tauri em execução; slider e valor atual apareceram corretamente.
- Slider alterado de 104 para 140 px e restaurado a 104 px; o valor existente do usuário foi preservado.
- App deixado recolhido após a inspeção.

## Problemas conhecidos e próximos passos

- Limites do slider atualmente fixos entre 48 e 240 px.
- Compilação Rust/Tauri não refeita; a mudança está no frontend.
