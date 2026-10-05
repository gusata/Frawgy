# Repaginação dos menus do Edge Mochi

## Objetivo

Aplicar a repaginação visual proposta para Home, Atalhos e Configurações, preservando a ilha e todas as animações e movimentos existentes.

## Alterações realizadas

- Reorganizei a Home em seções mais claras para mídia e volume, foco, lançador, Bolso, prancheta e resumo do Mochi.
- O Bolso agora abre o painel já existente na aba Pet. A prancheta fica recolhida e pode ser aberta sob demanda.
- Agrupei a busca e os aplicativos frequentes na tela Atalhos e refinei a hierarquia dos atalhos personalizados.
- Unifiquei superfícies escuras, contraste, espaçamentos e ícones estáticos de navegação e controles.
- Ajustei os manipuladores da prancheta para atualizar somente seus itens e contadores, sem reconstruir a página ativa.
- Mantive intactas a geometria e o comportamento da ilha, o motor de animação e as regras de movimento do Mochi.

## Arquivos tocados

- `src/main.ts`
- `src/style.css`
- `docs/context/2026-10-05-edge-mochi-repaginação-menus-implementada.md`

## Validações

- Revisei estaticamente os templates, os seletores de ação e os estilos adicionados.
- Inspecionei o app de desenvolvimento já aberto no Windows: Home horizontal, Atalhos e Configurações.
- A inspeção mostrou os controles principais da Home junto com o acesso ao Bolso, à prancheta e ao resumo do Mochi; os menus roláveis exibem uma barra fina de posição.
- Não executei build nem testes.

## Problemas conhecidos

- A busca expandida da Home, a abertura da prancheta e as ações do painel do Bolso não foram exercitadas nesta inspeção visual.
- O runtime foi inspecionado no layout horizontal; a apresentação no layout vertical ainda precisa de inspeção manual.

## Próximos passos

- Inspecionar o layout vertical e interações da prancheta e do Bolso.
- Compilar no Developer PowerShell do Visual Studio quando for necessário validar a integração nativa.
- Ajustar apenas apresentação estática do conteúdo se a inspeção revelar problemas; preservar a ilha e as animações.
