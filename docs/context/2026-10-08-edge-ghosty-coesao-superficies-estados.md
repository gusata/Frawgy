# Coesão visual e estados da Home

## Objetivo

Aplicar as recomendações da auditoria visual do Coucou ao Edge Ghosty: aproximar a linguagem das superfícies da ilha, Home, Pet, Atalhos e popups; deixar o estado prioritário da Home evidente; e usar cor com significado consistente.

## Alterações

- `src/style.css` define tokens comuns para superfícies, bordas, raios, texto e estados neutro, atividade, sucesso, atenção e erro.
- Home, painéis de integração e Pet passaram a compartilhar a mesma superfície base e hierarquia de texto. Atalhos, configurações e controles usam os mesmos níveis de superfície. O popup preserva o fundo opaco e o chat transparente.
- A Home agora comunica quando o Codex está trabalhando, aguarda aprovação, está livre ou quando atualizações de integrações estão pausadas. O status aparece no início do cartão.
- Integrações mostram conexão, atualização, pausa ou erro com indicador de estado. Eventos recentes do Codex, CI, progresso de Foco, aprovações, conclusão e humor do Pet usam cores semânticas consistentes.
- A disposição horizontal compacta a lista do GitHub para manter uma linha visível; o cabeçalho já tem o controle de atualizar, então o rodapé duplicado fica oculto nessa orientação. O estado recente de maior prioridade da Home fica no topo do cartão.
- A mensagem de aprovação foi encurtada para evitar muitas quebras na coluna vertical.

## Arquivos tocados

- `src/main.ts`
- `src/style.css`
- `docs/context/2026-10-08-edge-ghosty-coesao-superficies-estados.md`

## Validação

- `npm run build` passou: TypeScript e Vite concluíram a compilação.
- `git diff --check` não apontou problemas de whitespace.
- Prévia local com a folha de estilos real foi inspecionada para Home em repouso na borda esquerda, aprovação pendente, Home ativa na borda superior, Pet e popup de Foco. A captura horizontal mostrou a lista de integrações colapsando; a regra compacta foi ajustada e a captura confirmou uma linha visível.
- As prévias, capturas e perfis temporários foram removidos após a inspeção.
- Nenhum teste foi executado.

## Limitações e próximos passos

- O Orca estava rodando, mas seu runtime permaneceu em `starting` e inacessível; por isso não foi possível capturar a janela Tauri ao vivo. As prévias conferem CSS e hierarquia, mas não validam geometria nativa, click-through, canvas real do Ghosty nem ingestão por drag-and-drop.
- Quando a sessão gráfica estiver acessível, revisar a Home nas bordas esquerda e superior, o popup real, a aprovação pendente e a ingestão de arquivo na janela Tauri.
