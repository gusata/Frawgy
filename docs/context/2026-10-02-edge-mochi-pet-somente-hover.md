# Contexto da tarefa — tela do Mochi e hover durante arrasto

Data: 2026-10-02  
Identificador: edge-mochi-pet-somente-hover

## Objetivo

Simplificar a aba Pet para dar destaque ao Mochi, adicionar um squish autônomo e fazer o hover abrir a barra enquanto um arquivo é arrastado com o botão esquerdo pressionado. Preservar a animação geométrica do notch.

## Alterações realizadas

- A aba Pet mostra o Mochi centralizado e seu nome, com dois botões discretos para abrir o Bolso ou a personalização em painéis auxiliares.
- O palco inteiro do pet aceita texto solto. Ao detectar um drag nativo, a aba Pet é trazida à frente e mostra uma mensagem de soltura.
- O polling nativo usa uma margem de 56 px enquanto o botão esquerdo está pressionado; o hover normal continua usando 14 px. Isso permite que a janela transparente receba o hover durante o arrasto sem alargar o hover cotidiano.
- O evento nativo de cursor agora carrega a decisão de hitbox do backend, incluindo o estado de arrasto.
- O ciclo contínuo de respiração do pet agora tem um squish visível. As animações de piscar, comer e interação continuam disponíveis.
- A animação e a geometria do notch não foram alteradas.

## Arquivos tocados

- `src/main.ts`
- `src/style.css`
- `src-tauri/src/lib.rs`
- `AGENTS.md`
- `docs/context/2026-10-02-edge-mochi-pet-somente-hover.md`

## Validações

- Revisão estática das rotas de abertura dos painéis, das zonas de soltura e do fluxo entre o polling nativo e o frontend.
- Build, testes e inspeção visual em runtime não foram executados nesta tarefa.

## Problemas conhecidos

- O hitbox de arrasto depende da leitura global de `VK_LBUTTON`; confirmar com um arquivo arrastado do Explorer sobre a barrinha.
- O ritmo do squish e os painéis auxiliares precisam de inspeção visual em runtime, especialmente no layout horizontal.

## Próximos passos

- Abrir com `npm run tauri dev`, testar o hover com o botão esquerdo pressionado e revisar visualmente o Mochi nos layouts vertical e horizontal.
