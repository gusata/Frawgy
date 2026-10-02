# Contexto da tarefa — tela minimalista do Mochi e hover durante arrasto

Data: 2026-10-02  
Identificador: edge-mochi-pet-hover

## Objetivo

Dar prioridade visual ao Mochi na aba Pet, adicionar uma animação autônoma de squish e fazer a barra responder ao hover quando o usuário estiver arrastando um arquivo com o botão esquerdo pressionado. Preservar a animação geométrica existente do notch.

## Alterações realizadas

- A aba Pet agora mostra o personagem centralizado, o nome e dois botões discretos para abrir Bolso e personalização. Os cards de informações saíram da tela principal; continuam disponíveis nos painéis auxiliares.
- Toda a área do personagem funciona como zona de soltura de texto. Durante o drag nativo, a tela do Mochi troca para a frente e mostra o prompt de soltar.
- O polling nativo detecta o botão esquerdo pressionado e amplia temporariamente a margem do hitbox de 14 para 56 pixels. Assim a janela transparente deixa de ignorar eventos perto da barrinha durante um arrasto; o hitbox de hover normal permanece em 14 pixels.
- O payload de posição do cursor inclui o estado de hover calculado pelo backend, compartilhado com o frontend.
- A animação de respiração do Mochi agora inclui um squish mais visível e volta ao formato original em ciclo contínuo. As animações de comer, piscar e interagir permanecem.
- A geometria e a animação do notch não foram alteradas.

## Arquivos tocados

- `src/main.ts`
- `src/style.css`
- `src-tauri/src/lib.rs`
- `AGENTS.md`
- `docs/context/2026-10-02-edge-mochi-pet-hover.md`

## Validações

- Revisão estática do fluxo entre polling nativo, payload de hover e estado expandido do frontend.
- Revisão estática de abertura/fechamento dos painéis do pet e dos pontos de entrada para o Bolso.
- Build, testes e inspeção em runtime não foram executados nesta tarefa.

## Problemas conhecidos

- O hover durante drag depende da leitura global de `VK_LBUTTON`; deve ser confirmado com arrasto do Explorer sobre a barra no Windows.
- O layout dos painéis auxiliares e o ritmo do squish ainda precisam de inspeção visual em execução.

## Próximos passos

- Abrir com `npm run tauri dev`, testar arrasto de arquivos sobre a barrinha e conferir a aba Pet nas orientações vertical e horizontal.
