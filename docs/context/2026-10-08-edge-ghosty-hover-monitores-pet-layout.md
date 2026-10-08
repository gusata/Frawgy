# Snapshot: hover, monitores, atalhos e tela do Pet

## Objetivo

Corrigir o travamento ao ajustar dimensões nas Configurações, o abre/fecha intermitente após sair da ilha, a seleção de vários monitores, o layout dos atalhos e a altura excessiva da tela do Pet.

## Alterações realizadas

- O frontend publica separadamente o retângulo animado da ilha e a área fixa de hover ao redor da barrinha recolhida. A margem de 14 px abre o menu sem tirar o click-through dessa área.
- Os sliders de tamanho e de recolhimento não reaplicam o layout nativo a cada evento `input`; a geometria atual é publicada sem mover ou recriar a janela.
- A tela de monitor usa seleção única por rádio. Preferências legadas com todos os monitores selecionados migram para o monitor principal. O backend limita a seleção a um monitor e deixou de criar janelas `display-*`.
- As linhas dos atalhos têm altura automática e deixam de herdar `height: 100%`, evitando cartões altos e sobrepostos.
- A vista Pet usa a mesma altura da Home: 210 px nas bordas horizontais e 480 px na esquerda, com composição interna compactada.

## Arquivos tocados

- `src/main.ts`
- `src/style.css`
- `src-tauri/src/lib.rs`
- `AGENTS.md`
- `docs/context/2026-10-08-edge-ghosty-hover-monitores-pet-layout.md`

## Validações

- Revisão estática dos trechos alterados e do diff.
- `git diff --check` sem erros.
- Build e testes não foram executados.

## Problemas conhecidos

- O comportamento visual e do cursor ainda precisa de validação em execução no Windows, especialmente ao mover o slider com o ponteiro sobre a ilha e ao trocar entre monitores com DPI diferente.

## Próximos passos

- Reabrir o app no Windows e conferir os cinco cenários relatados, incluindo seleção de monitor secundário e retorno à Home após abrir Pet e Atalhos.
