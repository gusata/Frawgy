# Contexto: acompanhar o Ghosty durante o encaixe

- Data: 2026-10-09
- Objetivo: eliminar a pausa em preto antes do Ghosty chegar ao cartão do onboarding e evitar que o destino se desloque enquanto a ilha expande.
- Alterações: o encaixe passou a começar imediatamente após a introdução, acompanhar a posição atual do cartão em cada quadro e reduzir gradualmente o personagem até o tamanho do cartão; as opções aparecem logo após a chegada.
- Arquivos tocados: `src/main.ts`, `src/style.css` e este snapshot em `docs/context/`.
- Validações: revisão estática da animação e `git diff --check`; sem execução de build ou testes.
- Problemas conhecidos: falta confirmar a transição visual no WebView do app.
- Próximos passos: repetir a introdução e verificar que o Ghosty cruza diretamente até o cartão, sem pausa, e que as opções surgem depois.
