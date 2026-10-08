# Home em telas focadas inspiradas no Coucou

Data: 2026-10-08  
Identificador: edge-ghosty-telas-focadas-coucou

## Objetivo

Separar a Home ampla do Edge Ghosty em telas contextuais, seguindo de perto a organização do Coucou e evitando mostrar mídia, integrações, atividade e atalhos simultaneamente.

## Alterações

- A Home agora tem quatro vistas internas: **Agora**, **Integrações**, **Codex** e **Mídia**.
- **Agora** destaca o estado atual do Ghosty e oferece atalhos para atividade do Codex e Atalhos.
- Integrações GitHub/Vercel, eventos e métricas do Codex, e reprodução/volume ficam em vistas separadas.
- Foco, Bolso e Prancheta continuam em uma faixa compacta de ações rápidas.
- O subtítulo do cabeçalho acompanha a vista ativa. A navegação principal Home/Pet/Atalhos e a geometria de borda foram preservadas.
- O histórico operacional do projeto registra essa organização como decisão de interface.

## Arquivos alterados

- `src/main.ts`
- `src/style.css`
- `AGENTS.md`
- Este snapshot em `docs/context/`.

## Validações

- `node .\node_modules\typescript\bin\tsc --noEmit`: passou.
- `git diff --check`: passou.
- `npm run build`: o TypeScript terminou, mas o Vite não conseguiu iniciar o serviço do esbuild (`spawn EPERM`) neste ambiente.
- A inspeção visual no runtime Tauri/Windows não foi feita nesta sessão.

## Problemas conhecidos e próximos passos

- Conferir a composição das quatro vistas no runtime Windows nas bordas esquerda e horizontal, especialmente em janelas de pouca altura.
- Repetir o build Vite em um ambiente que permita o processo auxiliar do esbuild.
